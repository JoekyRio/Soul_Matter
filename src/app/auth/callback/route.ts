// 认证回调：处理 Supabase Auth 的 OAuth / 邮箱确认回调
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/entries";
  // 防止开放重定向：只允许站内相对路径
  const next =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/entries";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const forwardedProto = request.headers.get("x-forwarded-proto");
      if (forwardedHost && forwardedProto) {
        const redirectUrl = `${forwardedProto}://${forwardedHost}${next}`;
        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 出错则返回登录页
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
