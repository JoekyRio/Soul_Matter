// Proxy（Next.js 16 起由 middleware 更名而来）：每个页面请求到达前先经过这里
// 1. next-intl：处理语言前缀（/ → 中文，/en/... → 英文）
// 2. Supabase：刷新登录状态的 cookie
// 3. 登录保护：未登录只能访问登录/注册页；已登录访问登录/注册页则回首页
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

// 不需要登录就能访问的页面（不含语言前缀）
const PUBLIC_PATHS = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);

  // next-intl 决定重定向（例如 /zh/entries → /entries）时，先让浏览器跳过去
  if (response.headers.has("location")) {
    return response;
  }

  const user = await getUser(request, response);
  const { locale, path } = splitLocale(request.nextUrl.pathname);
  const isPublic = PUBLIC_PATHS.includes(path);

  if (!user && !isPublic) {
    return redirectKeepingCookies(request, response, localize(locale, "/login"));
  }
  if (user && isPublic) {
    return redirectKeepingCookies(request, response, localize(locale, "/"));
  }
  return response;
}

async function getUser(request: NextRequest, response: NextResponse) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet, headers) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
            Object.entries(headers ?? {}).forEach(([key, value]) =>
              response.headers.set(key, value),
            );
          },
        },
      },
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    // Supabase 未配置或网络错误时按未登录处理
    return null;
  }
}

// "/en/entries/1" → { locale: "en", path: "/entries/1" }；"/entries/1" → 默认语言
function splitLocale(pathname: string) {
  const [, first, ...rest] = pathname.split("/");
  const locale = routing.locales.find((l) => l === first);
  if (!locale) {
    return { locale: routing.defaultLocale, path: pathname };
  }
  return { locale, path: rest.length ? `/${rest.join("/")}` : "/" };
}

// 默认语言不加前缀（与 localePrefix: "as-needed" 一致）
function localize(locale: string, path: string) {
  if (locale === routing.defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

// 重定向时带上 Supabase 刚刷新的 cookie 和防缓存响应头，否则会丢失登录状态
function redirectKeepingCookies(
  request: NextRequest,
  response: NextResponse,
  target: string,
) {
  const redirect = NextResponse.redirect(new URL(target, request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  ["cache-control", "expires", "pragma"].forEach((header) => {
    const value = response.headers.get(header);
    if (value) redirect.headers.set(header, value);
  });
  return redirect;
}

export const config = {
  // 跳过接口（/api）、认证回调（/auth）、Next.js 内部文件和带扩展名的静态文件
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
