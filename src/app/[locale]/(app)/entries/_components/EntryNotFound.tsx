import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function EntryNotFound() {
  const t = await getTranslations("entries");
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center">
      <p className="text-slate-500">{t("notFound")}</p>
      <Link href="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
        {t("backHome")}
      </Link>
    </div>
  );
}
