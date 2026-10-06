// 真正的 <html>/<body> 在 [locale]/layout.tsx 中渲染（需要知道当前语言）。
// 这里保留一个透传的根布局，供根目录的 not-found.tsx 使用。
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
