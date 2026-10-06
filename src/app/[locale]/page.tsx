import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import EntryList from './_components/EntryList';

export default async function HomePage() {
  const t = await getTranslations('home');
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 获取心事列表
  const { data: entries } = await supabase
    .from('entries')
    .select('*, tags(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  // 获取 Panel 内容
  const { data: panel } = await supabase
    .from('panel_contents')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // 获取所有标签
  const { data: allTags } = await supabase
    .from('tags')
    .select('id, name')
    .eq('user_id', user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部 Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">心事</h1>
            <p className="text-sm text-gray-500">记录心事，认识自己，与世界和解</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            {/* 语言切换器 */}
            <div className="flex gap-2">
              <Link href="/zh" className="px-3 py-1 text-sm rounded hover:bg-gray-100">中文</Link>
              <Link href="/en" className="px-3 py-1 text-sm rounded hover:bg-gray-100">EN</Link>
            </div>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                退出
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧：时间线 + 卡片流 */}
          <div className="lg:col-span-5">
            <h2 className="text-xl font-semibold mb-4">最近的心事</h2>
            
            {/* 搜索和筛选 */}
            {entries && allTags && (
              <EntryList 
                initialEntries={entries} 
                allTags={allTags} 
              />
            )}
          </div>

          {/* 右侧 */}
          <div className="lg:col-span-7 space-y-6">
            {/* 右上：双入口文案 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-700 mb-4">
                Do you wanna{' '}
                <span className="text-gray-400 cursor-not-allowed" title="M2 阶段开放">
                  Chat the Day
                </span>
                {' '}or, Maybe{' '}
                <span className="text-gray-400 cursor-not-allowed" title="暂缓开发">
                  Look back
                </span>{' '}
                your changes recently
              </p>
            </div>

            {/* 右下：Panel 展示区 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">我的 Panel</h2>
                <Link
                  href="/zh/panel/edit"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Design your panel
                </Link>
              </div>
              {panel && panel.content ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{panel.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  还没有自定义 Panel
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
