import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type EntryRow, type Mood } from "@/types/database";
import EntryForm from "../../_components/entry-form";

export const dynamic = "force-dynamic";

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="py-12 text-center text-slate-500">请先登录</div>;
  }

  const { data } = await supabase
    .from("entries")
    .select(
      `
      id, title, content, mood, created_at, updated_at,
      entry_tags (
        tags (id, name, color)
      )
    `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">这条心事不存在</p>
        <Link
          href="/entries"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          返回列表
        </Link>
      </div>
    );
  }

  const row = data as unknown as EntryRow;
  const entry = {
    id: row.id,
    user_id: user.id,
    title: row.title,
    content: row.content,
    mood: row.mood as Mood | null,
    type: row.type as 'manual' | 'chat',
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: row.entry_tags?.map((et) => et.tags).filter(Boolean) || [],
  };

  return (
    <div className="space-y-4">
      <Link
        href={`/entries/${id}`}
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← 返回详情
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">编辑心事</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <EntryForm mode="edit" entry={entry} />
      </div>
    </div>
  );
}
