import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PanelContent } from "@/types/database";

// GET /api/panel — 获取当前用户的 Panel 内容
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("panel_contents")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // 没有找到记录，返回空内容
      return NextResponse.json({ panel: null });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ panel: data as PanelContent });
}

// PUT /api/panel — 更新或创建 Panel 内容
export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  let body: { content: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { content } = body;

  if (typeof content !== "string") {
    return NextResponse.json({ error: "content 必须是字符串" }, { status: 400 });
  }

  // 检查是否已存在
  const { data: existing } = await supabase
    .from("panel_contents")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let result;
  if (existing) {
    // 更新
    const { data, error } = await supabase
      .from("panel_contents")
      .update({ content })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    result = data;
  } else {
    // 创建
    const { data, error } = await supabase
      .from("panel_contents")
      .insert({ user_id: user.id, content })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    result = data;
  }

  return NextResponse.json({ panel: result as PanelContent });
}
