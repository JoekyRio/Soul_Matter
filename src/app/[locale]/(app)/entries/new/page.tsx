import { getTranslations } from "next-intl/server";
import EntryForm from "../_components/entry-form";

export default async function NewEntryPage() {
  const t = await getTranslations("entries");
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900">{t("newTitle")}</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <EntryForm mode="create" />
      </div>
    </div>
  );
}
