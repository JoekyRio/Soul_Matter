import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MOOD_LABELS, type Mood, type EntryRow } from "@/types/database";
import DeleteButton from "../_components/delete-button";

export const dynamic = "force-dynamic";

export default async function EntryDetailPage({
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
        <p className="text-slate-500">这条心事不存在或不属于你</p>
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
    title: row.title,
    content: row.content,
    mood: row.mood as Mood | null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: row.entry_tags?.map((et) => et.tags).filter(Boolean) || [],
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/entries"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← 返回列表
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/entries/${entry.id}/edit`}
            className="rounded-lg bg-white px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            编辑
          </Link>
          <DeleteButton entryId={entry.id} />
        </div>
      </div>

      <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">{entry.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {entry.mood && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
              {MOOD_LABELS[entry.mood]}
            </span>
          )}
          {entry.tags.map((tag: { id: string; name: string }) => (
            <span
              key={tag.id}
              className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700"
            >
              {tag.name}
            </span>
          ))}
        </div>
        <time className="mt-3 block text-xs text-slate-400">
          创建于 {new Date(entry.created_at).toLocaleString("zh-CN")}
        </time>
        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {entry.content}
        </div>
      </article>
    </div>
  );
}
