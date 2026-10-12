import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({ status: z.literal("ended") });

// PATCH /api/conversations/[id] — 结束对话（对话和消息都会保留）
export async function PATCH(
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
    return NextResponse.json({ error: { code: "bad_request", message: "参数不合法" } }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("conversations")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: { code: "db_error", message: error.message } }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: { code: "not_found", message: "对话不存在" } }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
