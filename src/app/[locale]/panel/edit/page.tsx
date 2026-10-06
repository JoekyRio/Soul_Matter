'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';

export default function PanelEditPage() {
  const t = useTranslations('panel');
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 加载现有 Panel 内容
    fetch('/api/panel')
      .then(res => res.json())
      .then(data => {
        if (data.panel) {
          setContent(data.panel.content);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load panel:', err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/panel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error('Failed to save panel');
      }

      router.push('/');
    } catch (err) {
      console.error('Failed to save panel:', err);
      alert(t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('editPanel')}</h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={saving}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 编辑区 */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">
            {t('editMode')}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('placeholder')}
            className="flex-1 min-h-[500px] p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 预览区 */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">
            {t('previewMode')}
          </label>
          <div className="flex-1 min-h-[500px] p-4 border border-gray-300 rounded-lg overflow-auto bg-white">
            {content ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-gray-400 italic">{t('previewPlaceholder')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
