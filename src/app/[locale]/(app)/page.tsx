import { getTranslations } from 'next-intl/server';
import ReactMarkdown from 'react-markdown';
import { Link } from '@/i18n/navigation';
import { ENTRY_SELECT, toEntry } from '@/lib/entries';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import type { EntryRow } from '@/types/database';
import EntryList from './_components/EntryList';

export default async function HomePage() {
  const t = await getTranslations();
  const user = await getCurrentUser();
  if (!user) return null; // (app)/layout.tsx 已经处理未登录跳转

  const supabase = await createClient();
  const [entriesResult, panelResult] = await Promise.all([
    // 加载全部心事，搜索和筛选在浏览器端进行（个人使用的数据量很小）
    supabase
      .from('entries')
      .select(ENTRY_SELECT)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('panel_contents')
      .select('content')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  const entries = ((entriesResult.data || []) as unknown as EntryRow[]).map((row) =>
    toEntry(row, user.id),
  );
  const panelContent = panelResult.data?.content?.trim();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 左：卡片流（手机上排在最后） */}
        <section className="order-2 lg:order-1 lg:col-span-5">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            {t('home.recentEntries')}
          </h2>
          {entriesResult.error ? (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {t('home.loadError')}
            </p>
          ) : (
            <EntryList entries={entries} />
          )}
        </section>

        {/* 右：入口 + Panel（手机上 Panel 在最上面） */}
        <div className="order-1 flex flex-col gap-6 lg:order-2 lg:col-span-7">
          <section className="order-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:order-1">
            <p className="text-lg leading-relaxed text-slate-700">
              {t('home.promptBefore')}{' '}
              <Link href="/chat" className="font-semibold text-blue-600 hover:underline">
                [{t('home.chatTheDay')}]
              </Link>{' '}
              {t('home.promptMiddle')}{' '}
              <span
                className="cursor-not-allowed font-semibold text-slate-400"
                title={t('home.comingSoon')}
              >
                [{t('home.lookBack')}]
              </span>{' '}
              {t('home.promptAfter')}
            </p>
          </section>

          <section
            aria-labelledby="panel-title"
            data-testid="panel"
            className="order-1 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:order-2"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="panel-title" className="text-lg font-semibold text-slate-900">
                {t('panel.title')}
              </h2>
              <Link
                href="/panel/edit"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                {t('panel.designYours')}
              </Link>
            </div>
            {panelContent ? (
              <div className="prose prose-slate prose-sm max-w-none">
                <ReactMarkdown>{panelContent}</ReactMarkdown>
              </div>
            ) : panelResult.error ? (
              <p role="alert" className="text-sm text-red-700">
                {t('panel.loadError')}
              </p>
            ) : (
              <div className="py-6 text-center">
                <p className="text-slate-500">{t('panel.empty')}</p>
                <p className="mt-1 text-sm text-slate-400">{t('panel.emptyHint')}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
