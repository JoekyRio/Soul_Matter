import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import Link from "next/link";

export default async function Navbar() {
  let user = null;
  try {
    const supabase = await createClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    user = u;
  } catch {
    // Supabase 未配置时不渲染导航栏
  }

  if (!user) return null;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/entries" className="text-lg font-bold text-slate-900">
          心事
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/entries/new"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            写心事
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              退出
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
