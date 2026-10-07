'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

// 页面渲染出错时显示友好提示，而不是白屏
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-slate-900">{t('errors.title')}</h1>
      <p className="text-sm text-slate-500">{t('errors.description')}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        {t('common.retry')}
      </button>
    </div>
  );
}
