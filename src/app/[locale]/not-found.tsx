import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-bold text-slate-900">{t("errors.notFoundTitle")}</h1>
      <p className="text-slate-500">{t("errors.notFoundDescription")}</p>
      <Link href="/" className="mt-2 text-sm font-medium text-blue-600 hover:underline">
        {t("common.backHome")}
      </Link>
    </div>
  );
}
