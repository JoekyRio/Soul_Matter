import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

// i18n middleware
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // 创建 Supabase 客户端以读取/刷新 session cookie
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 移除 locale 前缀
  const localeMatch = pathname.match(/^\/(zh|en)(\/.*)?$/);
  const locale = localeMatch?.[1] || "zh";
  const actualPath = localeMatch?.[2] || "/";

  // 受保护路由
  const protectedPaths = ["/", "/entries", "/panel"];
  const isProtected =
    actualPath === "/" ||
    protectedPaths.some((p) => actualPath.startsWith(p + "/") || actualPath === p);

  // 已登录用户访问登录/注册页
  const authPaths = ["/login", "/register"];
  const isAuthPath = authPaths.some((p) => actualPath === p);

  if (!user && isProtected) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (user && isAuthPath) {
    return NextResponse.redirect(new URL(`/${locale}/entries`, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
