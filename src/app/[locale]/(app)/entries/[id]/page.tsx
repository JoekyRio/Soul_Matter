import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getOwnEntry } from "@/lib/entries.server";
import DeleteButton from "../_components/delete-button";
import EntryNotFound from "../_components/EntryNotFound";

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await getOwnEntry(id);
  if (!entry) return <EntryNotFound />;

  const t = await getTranslations();
  const format = await getFormatter();

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          {t("entries.backHome")}
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/entries/${entry.id}/edit`}
            className="rounded-lg bg-white px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            {t("entries.edit")}
          </Link>
          <DeleteButton entryId={entry.id} />
        </div>
      </div>

      <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">{entry.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {entry.mood && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
              {t(`moods.${entry.mood}`)}
            </span>
          )}
          {entry.tags?.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700"
            >
              {tag.name}
            </span>
          ))}
        </div>
        <time dateTime={entry.created_at} className="mt-3 block text-xs text-slate-400">
          {t("entries.createdAt", {
            date: format.dateTime(new Date(entry.created_at), {
              dateStyle: "medium",
              timeStyle: "short",
            }),
          })}
        </time>
        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {entry.content}
        </div>
      </article>
    </div>
  );
}
