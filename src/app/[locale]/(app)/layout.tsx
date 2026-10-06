import { getLocale } from "next-intl/server";
import AppHeader from "@/components/AppHeader";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

// 登录后页面的公共布局。proxy 已经做了登录拦截，这里再检查一次作为兜底
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale: await getLocale() });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader email={user?.email} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
