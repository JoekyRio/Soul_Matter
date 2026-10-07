'use client';

import { useTranslations } from 'next-intl';

// 求助信息。热线号码由心理医生朋友审定后补充（见 docs/spec.md「安全与危机应对」）
export default function SafetyCard({ onClose }: { onClose: () => void }) {
  const t = useTranslations('chat.safety');
  return (
    <section
      role="region"
      aria-label={t('title')}
      data-testid="safety-card"
      className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold">{t('title')}</h2>
        <button type="button" onClick={onClose} className="text-rose-700 hover:underline">
          {t('close')}
        </button>
      </div>
      <p className="mt-2">{t('intro')}</p>
      <p className="mt-2 font-medium">{t('emergency')}</p>
      <p className="mt-2 text-rose-700">{t('hotlinePending')}</p>
      <p className="mt-2 text-xs text-rose-700">{t('aiNote')}</p>
    </section>
  );
}
