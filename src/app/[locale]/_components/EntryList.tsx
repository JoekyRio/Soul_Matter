'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MOOD_LABELS, type Mood } from '@/types/database';
import EntryFilters from './EntryFilters';

interface Tag {
  id: string;
  name: string;
}

interface Entry {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  created_at: string;
  tags?: Tag[];
}

interface EntryListProps {
  initialEntries: Entry[];
  allTags: Tag[];
}

export default function EntryList({ initialEntries, allTags }: EntryListProps) {
  const [filters, setFilters] = useState({
    search: '',
    moods: [] as Mood[],
    tagIds: [] as string[],
  });

  const filteredEntries = useMemo(() => {
    return initialEntries.filter((entry) => {
      // 搜索过滤
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          entry.title.toLowerCase().includes(searchLower) ||
          entry.content.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // 情绪过滤
      if (filters.moods.length > 0) {
        if (!entry.mood || !filters.moods.includes(entry.mood as Mood)) {
          return false;
        }
      }

      // 标签过滤
      if (filters.tagIds.length > 0) {
        const entryTagIds = entry.tags?.map((t) => t.id) || [];
        const hasMatchingTag = filters.tagIds.some((tagId) =>
          entryTagIds.includes(tagId)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [initialEntries, filters]);

  return (
    <>
      <EntryFilters tags={allTags} onFilterChange={setFilters} />
      <div className="space-y-4">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <Link
              key={entry.id}
              href={`/entries/${entry.id}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{entry.title}</h3>
                {entry.mood && (
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {MOOD_LABELS[entry.mood as Mood]}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{entry.content}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                {entry.tags && entry.tags.length > 0 && (
                  <>
                    <span>·</span>
                    <div className="flex gap-1">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            {filters.search || filters.moods.length > 0 || filters.tagIds.length > 0
              ? '没有找到匹配的心事'
              : '还没有心事记录'}
          </p>
        )}
      </div>
    </>
  );
}
