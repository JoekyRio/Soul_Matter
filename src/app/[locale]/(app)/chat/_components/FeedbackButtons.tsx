'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

type Value = 1 | -1 | null;

// 每条 AI 回复下面的 👍 / 👎，用于迭代 prompt
export default function FeedbackButtons({ messageId, initial }: { messageId: string; initial: Value }) {
  const t = useTranslations('chat.feedback');
  const [value, setValue] = useState<Value>(initial);
  const [askReason, setAskReason] = useState(false);
  const [reason, setReason] = useState('');
  const [thanked, setThanked] = useState(false);

  async function save(next: Value, why?: string) {
    const previous = value;
    setValue(next);
    const res = await fetch(`/api/messages/${messageId}/feedback`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: next, reason: why ?? null }),
    }).catch(() => null);
    if (!res?.ok) setValue(previous);
    return Boolean(res?.ok);
  }

  async function toggle(next: 1 | -1) {
    const target = value === next ? null : next;
    const ok = await save(target);
    setAskReason(ok && target === -1);
    setThanked(ok && target === 1);
  }

  const button = (active: boolean) =>
    `rounded-full px-2 py-0.5 text-sm transition-colors ${
      active ? 'bg-slate-200 text-slate-900' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
    }`;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      <button type="button" aria-label={t('helpful')} aria-pressed={value === 1} onClick={() => toggle(1)} className={button(value === 1)}>
        👍
      </button>
      <button type="button" aria-label={t('notHelpful')} aria-pressed={value === -1} onClick={() => toggle(-1)} className={button(value === -1)}>
        👎
      </button>
      {thanked && <span className="text-xs text-slate-400">{t('thanks')}</span>}
      {askReason && (
        <form
          className="flex w-full max-w-sm gap-2 pt-1"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await save(-1, reason)) {
              setAskReason(false);
              setThanked(true);
            }
          }}
        >
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('reasonPlaceholder')}
            aria-label={t('reasonPlaceholder')}
            className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
          />
          <button type="submit" className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200">
            {t('submit')}
          </button>
        </form>
      )}
    </div>
  );
}
