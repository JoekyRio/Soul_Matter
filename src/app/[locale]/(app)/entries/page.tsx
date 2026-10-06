import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

// 旧的心事列表页已合并到首页；保留这个地址以兼容旧书签
export default async function EntriesPage() {
  redirect({ href: "/", locale: await getLocale() });
}
