import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MOODS, type Entry, type EntryInput, type EntryRow, type Mood } from "@/types/database";

// GET /api/entries — 获取当前用户的心事列表
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("entries")
    .select(
      `
      id, title, content, mood, created_at, updated_at,
      entry_tags (
        tags (id, name, color)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries: Entry[] = ((data || []) as unknown as EntryRow[]).map((row) => ({
    id: row.id,
    user_id: user.id,
    title: row.title,
    content: row.content,
    mood: row.mood as Mood | null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: row.entry_tags?.map((et) => et.tags).filter(Boolean) || [],
  }));

  return NextResponse.json({ entries });
}

// POST /api/entries — 创建心事
export async function POST(request: Request) {
  let body: EntryInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { title, content, mood, tagNames } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 });
  }

  if (mood && !MOODS.includes(mood as Mood)) {
    return NextResponse.json({ error: "情绪值不合法" }, { status: 400 });
  }

  const tags = Array.isArray(tagNames) ? tagNames : [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  // 创建心事
  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      mood: mood || null,
    })
    .select()
    .single();

  if (entryError) {
    return NextResponse.json({ error: entryError.message }, { status: 500 });
  }

  // 处理标签
  if (tags.length > 0) {
    for (const name of tags) {
      const trimmed = typeof name === "string" ? name.trim() : "";
      if (!trimmed) continue;

      // 查找或创建标签
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
            { entry_id: entry.id, tag_id: tagId },
            { onConflict: "entry_id,tag_id" },
          );
      }
    }
  }

  return NextResponse.json({ entry }, { status: 201 });
}

