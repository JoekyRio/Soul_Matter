// 心事数据类型定义

export type Mood =
  | "calm"      // 平静
  | "happy"     // 开心
  | "anxious"   // 焦虑
  | "angry"     // 愤怒
  | "sad"       // 悲伤
  | "tired"     // 疲惫
  | "confused"  // 困惑
  | "lonely";   // 孤独

export type EntryType = "manual" | "chat";

// 情绪的显示文字在 messages/*.json 的 "moods" 中
export const MOODS: Mood[] = [
  "calm",
  "happy",
  "anxious",
  "angry",
  "sad",
  "tired",
  "confused",
  "lonely",
];

export interface Entry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: Mood | null;
  type: EntryType;
  created_at: string;
  updated_at: string;
  tags?: TagSummary[];
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

// 心事条目中嵌套的标签摘要（不含 user_id/created_at）
export interface TagSummary {
  id: string;
  name: string;
  color: string | null;
}

export interface EntryInput {
  title: string;
  content: string;
  mood: Mood | null;
  type?: EntryType;
  tagNames: string[];
}

// Supabase 查询返回的原始行结构（含嵌套标签）
export interface EntryRow {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  type: string;
  created_at: string;
  updated_at: string;
  entry_tags: { tags: { id: string; name: string; color: string | null } }[] | null;
}

// Panel 内容
export interface PanelContent {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}
