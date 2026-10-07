import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";

const ERROR_CODES = [
  "missingFields",
  "invalidCredentials",
  "emailNotConfirmed",
  "userAlreadyExists",
  "weakPassword",
  "rateLimited",
  "callbackFailed",
  "generic",
] as const;
type ErrorCode = (typeof ERROR_CODES)[number];

function isErrorCode(value: string | undefined): value is ErrorCode {
  return ERROR_CODES.includes(value as ErrorCode);
}

type Props = {
  mode: "login" | "register";
  action: (formData: FormData) => Promise<void>;
  error?: string;
  info?: string;
};

// 登录页和注册页共用的卡片
export default async function AuthCard({ mode, action, error, info }: Props) {
  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");
  const isLogin = mode === "login";
  const errorText = error ? t(`errors.${isErrorCode(error) ? error : "generic"}`) : null;
  const infoText = info === "checkEmail" ? t("info.checkEmail") : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">{tCommon("appName")}</h1>
          <p className="mt-2 text-slate-500">
            {isLogin ? t("loginSubtitle") : t("registerSubtitle")}
          </p>
        </div>
        {errorText && (
          <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorText}
          </div>
        )}
        {infoText && (
          <div role="status" className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {infoText}
          </div>
        )}
        <form
          action={action}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("password")}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              minLength={isLogin ? undefined : 6}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder={t("passwordPlaceholder")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            {isLogin ? t("login") : t("register")}
          </button>
          {!isLogin && <p className="text-xs text-slate-400">{t("confirmHint")}</p>}
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          {isLogin ? t("noAccount") : t("hasAccount")}{" "}
          <Link
            href={isLogin ? "/register" : "/login"}
            className="font-medium text-blue-600 hover:underline"
          >
            {isLogin ? t("register") : t("login")}
          </Link>
        </p>
        <div className="mt-6 flex justify-center">
          <LocaleSwitcher />
        </div>
      </div>
    </div>
  );
}
