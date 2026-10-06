import { getTranslations } from "next-intl/server";
import { signOut } from "@/app/auth/actions";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";

// 登录后所有页面共用的顶栏：LOGO、写心事、语言切换、账户、退出
export default async function AppHeader({ email }: { email?: string }) {
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-baseline gap-3">
          <span className="text-lg font-bold text-slate-900">{t("common.appName")}</span>
          <span className="hidden truncate text-sm text-slate-500 md:inline">
            {t("common.appSlogan")}
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/entries/new"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            {t("header.writeEntry")}
          </Link>
          <LocaleSwitcher />
          {email && (
            <span className="hidden max-w-[12rem] truncate text-sm text-slate-500 lg:inline">
              {email}
            </span>
          )}
          <form action={signOut}>
            <button type="submit" className="text-sm text-slate-500 hover:text-slate-900">
              {t("header.signOut")}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
