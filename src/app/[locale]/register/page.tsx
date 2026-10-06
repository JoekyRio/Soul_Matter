import { signUp } from "@/app/auth/actions";

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: errorParam } = await searchParams;
  const error = errorParam ? safeDecode(errorParam) : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">心事</h1>
          <p className="mt-2 text-slate-500">Soul Matter · 创建账号</p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <form
          action={signUp}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              邮箱
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              密码
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              placeholder="至少 6 位"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            注册
          </button>
          <p className="text-xs text-slate-400">
            注册后可能需要在邮箱中点击确认链接（取决于 Supabase 配置）。
          </p>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          已有账号？{" "}
          <a href="/login" className="font-medium text-blue-600 hover:underline">
            登录
          </a>
        </p>
      </div>
    </div>
  );
}
