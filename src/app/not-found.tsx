import Link from "next/link";

// 极少数没有经过语言路由的请求会落到这里（例如不存在的静态文件），
// 根布局是透传的，所以这里需要自己渲染 <html>/<body>
export default function GlobalNotFound() {
  return (
    <html lang="zh-CN">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "4rem 1rem" }}>
        <h1>404</h1>
        <p>页面不存在 · Page not found</p>
        <Link href="/">返回首页 · Home</Link>
      </body>
    </html>
  );
}
