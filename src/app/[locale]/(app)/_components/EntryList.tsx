'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { Entry, TagSummary } from '@/types/database';
import EntryFilters, { EMPTY_FILTERS, hasActiveFilters, type Filters } from './EntryFilters';

function matches(entry: Entry, filters: Filters) {
  const query = filters.search.trim().toLowerCase();
  if (
    query &&
    !entry.title.toLowerCase().includes(query) &&
    !entry.content.toLowerCase().includes(query)
  ) {
    return false;
  }
  if (filters.moods.length && (!entry.mood || !filters.moods.includes(entry.mood))) {
    return false;
  }
  if (filters.tagIds.length) {
    const ids = entry.tags?.map((tag) => tag.id) ?? [];
    if (!filters.tagIds.some((id) => ids.includes(id))) return false;
  }
  return true;
}

export default function EntryList({ entries }: { entries: Entry[] }) {
  const t = useTranslations();
  const format = useFormatter();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  // 筛选器只显示正在使用的标签
  const tags = useMemo(() => {
    const byId = new Map<string, TagSummary>();
    entries.forEach((entry) => entry.tags?.forEach((tag) => byId.set(tag.id, tag)));
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [entries]);

  const visible = useMemo(
    () => entries.filter((entry) => matches(entry, filters)),
    [entries, filters],
  );

  return (
    <>
      <EntryFilters tags={tags} filters={filters} onChange={setFilters} />
      {visible.length > 0 ? (
        <ul className="space-y-4">
          {visible.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/entries/${entry.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="font-medium text-slate-900">{entry.title}</h3>
                  {entry.mood && (
                    <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {t(`moods.${entry.mood}`)}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 text-sm text-slate-600">{entry.content}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <time dateTime={entry.created_at}>
                    {format.dateTime(new Date(entry.created_at), { dateStyle: 'medium' })}
                  </time>
                  {entry.tags?.slice(0, 3).map((tag) => (
                    <span key={tag.id} className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-600">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white py-10 text-center">
          <p className="text-slate-500">
            {hasActiveFilters(filters) ? t('entries.noMatch') : t('entries.empty')}
          </p>
          {!hasActiveFilters(filters) && (
            <p className="mt-1 text-sm text-slate-400">{t('entries.emptyHint')}</p>
          )}
        </div>
      )}
    </>
  );
}
