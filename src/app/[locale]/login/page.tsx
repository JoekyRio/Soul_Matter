import { signIn } from "@/app/auth/actions";

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const { error: errorParam, info: infoParam } = await searchParams;
  const error = errorParam ? safeDecode(errorParam) : null;
  const info = infoParam ? safeDecode(infoParam) : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">心事</h1>
          <p className="mt-2 text-slate-500">Soul Matter · 登录</p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {info}
          </div>
        )}
        <form
          action={signIn}
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
              placeholder="至少 6 位"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            登录
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          还没有账号？{" "}
          <a href="/register" className="font-medium text-blue-600 hover:underline">
            注册
          </a>
        </p>
      </div>
    </div>
  );
}
