import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  value: z.union([z.literal(1), z.literal(-1), z.null()]),
  reason: z.string().trim().max(500).nullish(),
});

// PUT /api/messages/[id]/feedback — 对 AI 回复点 👍 / 👎（value 为 null 表示取消）
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: { code: "unauthorized", message: "未登录" } }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "bad_request", message: "反馈内容不合法" } }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .update({
      feedback: parsed.data.value,
      feedback_reason: parsed.data.value === -1 ? parsed.data.reason || null : null,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("role", "assistant")
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: { code: "db_error", message: error.message } }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: { code: "not_found", message: "消息不存在" } }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
