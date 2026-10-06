import { notFound } from "next/navigation";

// 匹配所有不存在的地址，交给 [locale]/not-found.tsx 显示带语言的 404 页面
export default function CatchAllPage() {
  notFound();
}
