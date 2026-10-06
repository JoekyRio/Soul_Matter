import { createClient, getCurrentUser } from "@/lib/supabase/server";
import type { Entry, EntryRow } from "@/types/database";
import { ENTRY_SELECT, toEntry } from "./entries";

// 读取当前用户的一条心事；不存在或不属于当前用户时返回 null
export async function getOwnEntry(id: string): Promise<Entry | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("entries")
    .select(ENTRY_SELECT)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  return data ? toEntry(data as unknown as EntryRow, user.id) : null;
}
