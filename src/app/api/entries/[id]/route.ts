import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ENTRY_SELECT, toEntry } from "@/lib/entries";
import { MOODS, type EntryInput, type EntryRow, type Mood } from "@/types/database";

// GET /api/entries/[id] — 获取单条心事
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("entries")
    .select(ENTRY_SELECT)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "心事不存在" }, { status: 404 });
  }

  const entry = toEntry(data as unknown as EntryRow, user.id);

  return NextResponse.json({ entry });
}

// PATCH /api/entries/[id] — 更新心事
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: Partial<EntryInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { title, content, mood, tagNames } = body;

  // 非空校验（与 POST 保持一致）
  if (title !== undefined && !title.trim()) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }
  if (content !== undefined && !content.trim()) {
    return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }
  if (mood !== undefined && mood !== null && !MOODS.includes(mood as Mood)) {
    return NextResponse.json({ error: "情绪值不合法" }, { status: 400 });
  }

  const tags = tagNames !== undefined ? (Array.isArray(tagNames) ? tagNames : []) : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  // 更新心事
  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title.trim();
  if (content !== undefined) updateData.content = content.trim();
  if (mood !== undefined) updateData.mood = mood;

  const { error: updateError } = await supabase
    .from("entries")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 更新标签：先删除旧关联，再重建
  if (tags !== undefined) {
    await supabase.from("entry_tags").delete().eq("entry_id", id);

    for (const name of tags) {
      const trimmed = typeof name === "string" ? name.trim() : "";
      if (!trimmed) continue;

      const { data: existingTag } = await supabase
        .from("tags")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", trimmed)
        .single();

      let tagId = existingTag?.id;
      if (!tagId) {
        const { data: newTag } = await supabase
          .from("tags")
          .insert({ user_id: user.id, name: trimmed })
          .select("id")
          .single();
        tagId = newTag?.id;
      }

      if (tagId) {
        await supabase
          .from("entry_tags")
          .upsert(
            { entry_id: id, tag_id: tagId },
            { onConflict: "entry_id,tag_id" },
          );
      }
    }
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/entries/[id] — 删除心事
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

