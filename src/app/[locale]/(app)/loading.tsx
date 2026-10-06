// 页面数据加载中时显示的骨架屏
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-6" aria-busy="true">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="order-2 space-y-4 lg:order-1 lg:col-span-5">
          <div className="h-6 w-32 rounded bg-slate-200" />
          <div className="h-28 rounded-lg bg-slate-200" />
          <div className="h-24 rounded-lg bg-slate-200" />
          <div className="h-24 rounded-lg bg-slate-200" />
        </div>
        <div className="order-1 flex flex-col gap-6 lg:order-2 lg:col-span-7">
          <div className="order-2 h-20 rounded-lg bg-slate-200 lg:order-1" />
          <div className="order-1 h-48 rounded-lg bg-slate-200 lg:order-2" />
        </div>
      </div>
    </div>
  );
}
