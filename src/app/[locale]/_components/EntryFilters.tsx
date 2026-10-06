'use client';

import { useState } from 'react';
import { MOODS, MOOD_LABELS, type Mood } from '@/types/database';

interface Tag {
  id: string;
  name: string;
}

interface EntryFiltersProps {
  tags: Tag[];
  onFilterChange: (filters: {
    search: string;
    moods: Mood[];
    tagIds: string[];
  }) => void;
}

export default function EntryFilters({ tags, onFilterChange }: EntryFiltersProps) {
  const [search, setSearch] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value, moods: selectedMoods, tagIds: selectedTagIds });
  };

  const toggleMood = (mood: Mood) => {
    const newMoods = selectedMoods.includes(mood)
      ? selectedMoods.filter(m => m !== mood)
      : [...selectedMoods, mood];
    setSelectedMoods(newMoods);
    onFilterChange({ search, moods: newMoods, tagIds: selectedTagIds });
  };

  const toggleTag = (tagId: string) => {
    const newTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    setSelectedTagIds(newTagIds);
    onFilterChange({ search, moods: selectedMoods, tagIds: newTagIds });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedMoods([]);
    setSelectedTagIds([]);
    onFilterChange({ search: '', moods: [], tagIds: [] });
  };

  const hasFilters = search || selectedMoods.length > 0 || selectedTagIds.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      {/* 搜索框 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索心事..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 情绪筛选 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">按情绪筛选</span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:underline"
            >
              清除筛选
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(mood => (
            <button
              key={mood}
              onClick={() => toggleMood(mood)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedMoods.includes(mood)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {MOOD_LABELS[mood]}
            </button>
          ))}
        </div>
      </div>

      {/* 标签筛选 */}
      {tags.length > 0 && (
        <div>
          <span className="text-sm font-medium text-gray-700 mb-2 block">按标签筛选</span>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedTagIds.includes(tag.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
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
