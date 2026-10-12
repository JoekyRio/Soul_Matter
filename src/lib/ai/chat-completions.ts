// OpenAI 兼容的对话接口（DeepSeek、硅基流动等），流式返回
import type { ServerEnv } from "@/lib/env";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatUsage = { promptTokens: number; completionTokens: number };

export class AIError extends Error {
  constructor(
    public code: "upstream_error" | "timeout" | "aborted",
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

const FIRST_BYTE_TIMEOUT_MS = 30_000;

async function connect(
  env: ServerEnv,
  body: unknown,
  signal: AbortSignal,
): Promise<Response> {
  const timeout = AbortSignal.timeout(FIRST_BYTE_TIMEOUT_MS);
  const res = await fetch(`${env.AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.AI_API_KEY}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.any([signal, timeout]),
  }).catch((err: unknown) => {
    if (signal.aborted) throw new AIError("aborted", "用户已取消");
    if (timeout.aborted) throw new AIError("timeout", "AI 服务响应超时");
    throw new AIError("upstream_error", `无法连接 AI 服务：${String(err)}`);
  });
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new AIError("upstream_error", `AI 服务返回 ${res.status}：${detail.slice(0, 300)}`, res.status);
  }
  return res;
}

// 逐段产出 AI 回复的文字；结束时通过 onUsage 返回 token 用量
export async function* streamChat(
  env: ServerEnv,
  messages: ChatMessage[],
  options: { signal: AbortSignal; onUsage?: (usage: ChatUsage) => void },
): AsyncGenerator<string> {
  const body = {
    model: env.AI_MODEL,
    messages,
    stream: true,
    stream_options: { include_usage: true },
    temperature: 0.7,
    max_tokens: 800,
  };

  // 连接失败重试一次；用户取消则不重试。
  // 个别服务不支持 stream_options（返回 4xx），重试时去掉它（只是拿不到 token 用量）
  let res: Response;
  try {
    res = await connect(env, body, options.signal);
  } catch (err) {
    if (err instanceof AIError && err.code === "aborted") throw err;
    const rejected = err instanceof AIError && err.status !== undefined && err.status < 500;
    const { stream_options: _ignored, ...withoutUsage } = body;
    void _ignored;
    res = await connect(env, rejected ? withoutUsage : body, options.signal);
  }

  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const data = line.replace(/^data:\s*/, "").trim();
      if (!data || !line.startsWith("data:")) continue;
      if (data === "[DONE]") return;
      const chunk = JSON.parse(data);
      const delta: string | undefined = chunk.choices?.[0]?.delta?.content;
      if (delta) yield delta;
      if (chunk.usage) {
        options.onUsage?.({
          promptTokens: chunk.usage.prompt_tokens ?? 0,
          completionTokens: chunk.usage.completion_tokens ?? 0,
        });
      }
    }
  }
}
