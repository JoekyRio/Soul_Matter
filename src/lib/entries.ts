// 心事查询的公共部分：首页、详情页、编辑页和 /api/entries 共用
import type { Entry, EntryRow, EntryType, Mood } from "@/types/database";

export const ENTRY_SELECT = `
  id, title, content, mood, type, created_at, updated_at,
  entry_tags (
    tags (id, name, color)
  )
`;

export function toEntry(row: EntryRow, userId: string): Entry {
  return {
    id: row.id,
    user_id: userId,
    title: row.title,
    content: row.content,
    mood: row.mood as Mood | null,
    type: row.type as EntryType,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: row.entry_tags?.map((et) => et.tags).filter(Boolean) || [],
  };
}
