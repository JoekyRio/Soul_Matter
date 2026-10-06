import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MOOD_LABELS, type Mood, type EntryRow } from "@/types/database";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EntriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/zh/login");
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
    .order("created_at", { ascending: false });

  const entries = ((data || []) as unknown as EntryRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    mood: row.mood as Mood | null,
    created_at: row.created_at,
    tags: row.entry_tags?.map((et) => et.tags).filter(Boolean) || [],
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">我的心事</h1>
        <Link
          href="/entries/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + 写心事
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-slate-500">还没有心事记录</p>
          <p className="mt-1 text-sm text-slate-400">
            点击右上角，写下第一条心事吧
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/entries/${entry.id}`}
              className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-slate-900">{entry.title}</h2>
                {entry.mood && (
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {MOOD_LABELS[entry.mood]}
                  </span>
                )}
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
                {entry.content}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {entry.tags.map((tag: { id: string; name: string }) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
                <time className="shrink-0 text-xs text-slate-400">
                  {new Date(entry.created_at).toLocaleDateString("zh-CN")}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
