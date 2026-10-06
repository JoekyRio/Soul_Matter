'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type AppLocale } from '@/i18n/routing';

const LABELS: Record<AppLocale, string> = { zh: '中文', en: 'EN' };

export default function LocaleSwitcher() {
  const t = useTranslations('header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(next: AppLocale) {
    startTransition(() => {
      // pathname 不含语言前缀（例如 /entries/123），换语言时停留在同一页面
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div role="group" aria-label={t('language')} className="flex items-center gap-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLocale(l)}
          disabled={isPending || locale === l}
          aria-pressed={locale === l}
          className={`rounded px-2 py-1 text-xs ${
            locale === l
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
