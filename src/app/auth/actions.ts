"use server";

import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

// 登录/注册失败时跳回表单页，并带上错误代码，由页面翻译成对应语言的提示
const KNOWN_AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: "invalidCredentials",
  email_not_confirmed: "emailNotConfirmed",
  user_already_exists: "userAlreadyExists",
  email_exists: "userAlreadyExists",
  weak_password: "weakPassword",
  over_request_rate_limit: "rateLimited",
  over_email_send_rate_limit: "rateLimited",
};

function toErrorCode(error: { code?: string; message: string }) {
  const known = error.code ? KNOWN_AUTH_ERRORS[error.code] : undefined;
  if (!known) console.error("Supabase auth error:", error.code, error.message);
  return known ?? "generic";
}

function readCredentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  return {
    email: typeof email === "string" ? email.trim() : "",
    password: typeof password === "string" ? password : "",
  };
}

// 注册
export async function signUp(formData: FormData) {
  const locale = await getLocale();
  const { email, password } = readCredentials(formData);

  if (!email || !password) {
    redirect({ href: { pathname: "/register", query: { error: "missingFields" } }, locale });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    redirect({ href: { pathname: "/register", query: { error: toErrorCode(error) } }, locale });
  }

  revalidatePath("/", "layout");
  // 未开启邮箱确认时 Supabase 会直接返回登录状态，直接进首页；否则提示去邮箱确认
  if (data.session) {
    redirect({ href: "/", locale });
  }
  redirect({ href: { pathname: "/login", query: { info: "checkEmail" } }, locale });
}

// 登录
export async function signIn(formData: FormData) {
  const locale = await getLocale();
  const { email, password } = readCredentials(formData);

  if (!email || !password) {
    redirect({ href: { pathname: "/login", query: { error: "missingFields" } }, locale });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect({ href: { pathname: "/login", query: { error: toErrorCode(error) } }, locale });
  }

  revalidatePath("/", "layout");
  redirect({ href: "/", locale });
}

// 登出
export async function signOut() {
  const locale = await getLocale();
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect({ href: "/login", locale });
}
