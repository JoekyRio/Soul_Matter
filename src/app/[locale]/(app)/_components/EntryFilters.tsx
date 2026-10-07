'use client';

import { useTranslations } from 'next-intl';
import { MOODS, type Mood, type TagSummary } from '@/types/database';

export interface Filters {
  search: string;
  moods: Mood[];
  tagIds: string[];
}

export const EMPTY_FILTERS: Filters = { search: '', moods: [], tagIds: [] };

export function hasActiveFilters(filters: Filters) {
  return Boolean(filters.search || filters.moods.length || filters.tagIds.length);
}

interface EntryFiltersProps {
  tags: TagSummary[];
  filters: Filters;
  onChange: (filters: Filters) => void;
}

function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

const chipClass = (active: boolean) =>
  `rounded-full px-3 py-1 text-sm transition-colors ${
    active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
  }`;

export default function EntryFilters({ tags, filters, onChange }: EntryFiltersProps) {
  const t = useTranslations();

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <input
        type="search"
        aria-label={t('entries.searchPlaceholder')}
        placeholder={t('entries.searchPlaceholder')}
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{t('entries.filterByMood')}</span>
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="text-xs text-blue-600 hover:underline"
          >
            {t('entries.clearFilters')}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood}
            type="button"
            aria-pressed={filters.moods.includes(mood)}
            onClick={() => onChange({ ...filters, moods: toggle(filters.moods, mood) })}
            className={chipClass(filters.moods.includes(mood))}
          >
            {t(`moods.${mood}`)}
          </button>
        ))}
      </div>

      {tags.length > 0 && (
        <div className="mt-4">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            {t('entries.filterByTag')}
          </span>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                aria-pressed={filters.tagIds.includes(tag.id)}
                onClick={() => onChange({ ...filters, tagIds: toggle(filters.tagIds, tag.id) })}
                className={chipClass(filters.tagIds.includes(tag.id))}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
