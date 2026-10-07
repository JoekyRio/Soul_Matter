'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import { useRouter } from '@/i18n/navigation';

export default function PanelEditPage() {
  const t = useTranslations('panel');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 加载现有 Panel 内容
    fetch('/api/panel')
      .then((res) => {
        if (!res.ok) throw new Error(`GET /api/panel failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.panel) setContent(data.panel.content);
      })
      .catch((err) => {
        console.error(err);
        setError(t('loadError'));
      })
      .finally(() => setLoading(false));
  }, [t]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/panel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error(`PUT /api/panel failed: ${res.status}`);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(t('saveError'));
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500" aria-busy="true">
        {tCommon('loading')}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('editPanel')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('markdownHelp')}</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-slate-600 hover:text-slate-900"
            disabled={saving}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-slate-900 px-6 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col">
          <label htmlFor="panel-content" className="mb-2 font-medium text-slate-700">
            {t('editMode')}
          </label>
          <textarea
            id="panel-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('placeholder')}
            className="min-h-[320px] flex-1 resize-y rounded-lg border border-slate-300 bg-white p-4 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:min-h-[500px]"
          />
        </div>

        <div className="flex flex-col">
          <span className="mb-2 font-medium text-slate-700">{t('previewMode')}</span>
          <div
            data-testid="panel-preview"
            className="min-h-[320px] flex-1 overflow-auto rounded-lg border border-slate-300 bg-white p-4 lg:min-h-[500px]"
          >
            {content ? (
              <div className="prose prose-slate prose-sm max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <div className="italic text-slate-400">{t('previewPlaceholder')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
