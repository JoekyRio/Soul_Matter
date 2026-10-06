'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(newLocale: string) {
    // 从当前路径中移除旧的语言前缀
    const segments = pathname.split('/').filter(Boolean);
    const validLocales = ['zh', 'en'];
    if (validLocales.includes(segments[0])) {
      segments.shift();
    }
    
    // 构建新路径
    const newPath = `/${newLocale}${segments.length > 0 ? '/' + segments.join('/') : ''}`;
    
    startTransition(() => {
      router.replace(newPath);
    });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => switchLocale('zh')}
        disabled={isPending || locale === 'zh'}
        className={`px-2 py-1 text-xs rounded ${
          locale === 'zh'
            ? 'bg-slate-900 text-white'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        中文
      </button>
      <button
        onClick={() => switchLocale('en')}
        disabled={isPending || locale === 'en'}
        className={`px-2 py-1 text-xs rounded ${
          locale === 'en'
            ? 'bg-slate-900 text-white'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        EN
      </button>
    </div>
  );
}
