import { NextResponse } from "next/server";
import { z } from "zod";
import { AIError, streamChat, type ChatMessage, type ChatUsage } from "@/lib/ai/deepseek";
import { loadPrompt } from "@/lib/ai/prompts";
import { looksLikeCrisis, SAFETY_MARKER } from "@/lib/ai/safety";
import { getServerEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ChatStreamEvent } from "@/types/chat";

export const maxDuration = 60;

const HISTORY_LIMIT = 40; // 发给 AI 的最近消息条数（控制成本和上下文长度）
const LOG_RETENTION_DAYS = 30;

const bodySchema = z.object({
  conversationId: z.uuid().nullish(),
  message: z.string().trim().min(1).max(4000),
  // 重试上一次失败的回复：用户消息已经保存过，不再重复保存
  retryUserMessageId: z.uuid().nullish(),
});

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

// POST /api/chat — 发送一条消息，流式返回 AI 回复
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("unauthorized", "未登录", 401);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("bad_request", "消息内容不合法", 400);
  const { message } = parsed.data;

  let env;
  try {
    env = getServerEnv();
  } catch (err) {
    console.error(err);
    return apiError("config_error", "AI 服务未配置", 500);
  }

  // 找到或创建对话
  let conversationId = parsed.data.conversationId ?? null;
  if (conversationId) {
    const { data } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) return apiError("not_found", "对话不存在", 404);
  } else {
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: message.slice(0, 40) })
      .select("id")
      .single();
    if (error || !data) return apiError("db_error", "创建对话失败", 500);
    conversationId = data.id as string;
  }

  let userMessage: { id: string } | null = null;
  if (parsed.data.retryUserMessageId) {
    const { data } = await supabase
      .from("messages")
      .select("id")
      .eq("id", parsed.data.retryUserMessageId)
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .eq("role", "user")
      .maybeSingle();
    userMessage = data;
    if (!userMessage) return apiError("not_found", "要重试的消息不存在", 404);
  } else {
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, user_id: user.id, role: "user", content: message })
      .select("id")
      .single();
    if (error || !data) return apiError("db_error", "保存消息失败", 500);
    userMessage = data;
  }

  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);

  const prompt = loadPrompt("chat-guide");
  const aiMessages: ChatMessage[] = [
    { role: "system", content: prompt.text },
    ...((history ?? []).reverse() as ChatMessage[]),
  ];
  const assistantMessageId = crypto.randomUUID();
  const startedAt = Date.now();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      let clientGone = false;
      const send = (event: ChatStreamEvent) => {
        if (clientGone) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          clientGone = true;
        }
      };

      send({
        type: "meta",
        conversationId: conversationId!,
        userMessageId: userMessage!.id,
        assistantMessageId,
      });

      let safetySent = false;
      if (looksLikeCrisis(message)) {
        send({ type: "safety" });
        safetySent = true;
      }

      let fullText = "";
      let pending = ""; // 回复开头先攒几个字，判断是否带 [[SAFETY]] 标记
      let markerChecked = false;
      let usage: ChatUsage | undefined;
      let errorCode: string | null = null;
      let errorDetail: string | null = null;

      try {
        for await (const delta of streamChat(env, aiMessages, {
          signal: request.signal,
          onUsage: (u) => (usage = u),
        })) {
          if (markerChecked) {
            fullText += delta;
            send({ type: "delta", text: delta });
            continue;
          }
          pending += delta;
          const trimmed = pending.trimStart();
          if (trimmed.length < SAFETY_MARKER.length && SAFETY_MARKER.startsWith(trimmed)) {
            continue; // 还不能确定，继续攒
          }
          markerChecked = true;
          let text = pending;
          if (trimmed.startsWith(SAFETY_MARKER)) {
            text = trimmed.slice(SAFETY_MARKER.length).trimStart();
            if (!safetySent) send({ type: "safety" });
            safetySent = true;
          }
          fullText += text;
          if (text) send({ type: "delta", text });
        }
        if (!markerChecked && pending) {
          // 回复很短、全部还在缓冲中
          const trimmed = pending.trimStart();
          const isMarker = trimmed.startsWith(SAFETY_MARKER);
          const text = isMarker ? trimmed.slice(SAFETY_MARKER.length).trimStart() : pending;
          if (isMarker && !safetySent) send({ type: "safety" });
          fullText += text;
          if (text) send({ type: "delta", text });
        }
      } catch (err) {
        errorCode = err instanceof AIError ? err.code : "upstream_error";
        errorDetail = err instanceof Error ? err.message : String(err);
        console.error("AI chat error:", errorDetail);
      }

      // 保存 AI 回复（用户中途停止时保存已生成的部分）
      if (fullText.trim()) {
        await supabase.from("messages").insert({
          id: assistantMessageId,
          conversation_id: conversationId,
          user_id: user.id,
          role: "assistant",
          content: fullText,
        });
      }
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      // AI 调用日志 + 清理 30 天前的日志
      await supabase.from("ai_logs").insert({
        user_id: user.id,
        conversation_id: conversationId,
        endpoint: "/api/chat",
        model: env.DEEPSEEK_MODEL,
        prompt_version: prompt.version,
        request: { messages: aiMessages.slice(1), history_limit: HISTORY_LIMIT },
        response: fullText || null,
        prompt_tokens: usage?.promptTokens ?? null,
        completion_tokens: usage?.completionTokens ?? null,
        duration_ms: Date.now() - startedAt,
        error: errorDetail,
      });
      const cutoff = new Date(Date.now() - LOG_RETENTION_DAYS * 86_400_000).toISOString();
      await supabase.from("ai_logs").delete().eq("user_id", user.id).lt("created_at", cutoff);

      send(errorCode && errorCode !== "aborted" ? { type: "error", code: errorCode } : { type: "done" });
      if (!clientGone) controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
