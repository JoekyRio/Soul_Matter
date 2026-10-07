import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getOwnEntry } from "@/lib/entries.server";
import EntryForm from "../../_components/entry-form";
import EntryNotFound from "../../_components/EntryNotFound";

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await getOwnEntry(id);
  if (!entry) return <EntryNotFound />;

  const t = await getTranslations("entries");

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <Link href={`/entries/${id}`} className="text-sm text-slate-500 hover:text-slate-900">
        {t("backToDetail")}
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">{t("editTitle")}</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <EntryForm mode="edit" entry={entry} />
      </div>
    </div>
  );
}
