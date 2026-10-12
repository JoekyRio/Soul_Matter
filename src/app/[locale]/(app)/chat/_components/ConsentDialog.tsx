'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'soul-matter.chat-consent.v1';

// 第一次使用 Chat the Day 时的说明。点"我知道了"后在这台设备上不再显示
export default function ConsentDialog() {
  const t = useTranslations('chat.consent');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let accepted = false;
    try {
      accepted = localStorage.getItem(STORAGE_KEY) === 'yes';
    } catch {
      // 隐私模式等情况下读不到，就每次都显示
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 只能在浏览器端读取 localStorage
    if (!accepted) setOpen(true);
  }, []);

  if (!open) return null;

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'yes');
    } catch {
      // 忽略
    }
    setOpen(false);
  };

  const items = t.raw('items') as string[];
  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="consent-title" className="text-lg font-semibold text-slate-900">
          {t('title')}
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={accept}
          className="mt-5 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          {t('accept')}
        </button>
      </div>
    </div>
  );
}
