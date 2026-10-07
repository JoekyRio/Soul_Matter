// 心事详情/编辑/新建页加载中时的骨架屏
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-4 px-4 py-6" aria-busy="true">
      <div className="h-5 w-24 rounded bg-slate-200" />
      <div className="h-64 rounded-2xl bg-slate-200" />
    </div>
  );
}
