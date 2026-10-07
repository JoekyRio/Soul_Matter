import { createClient, getCurrentUser } from "@/lib/supabase/server";
import type { ChatMessageRow } from "@/types/chat";
import ChatRoom from "./_components/ChatRoom";

// 打开 Chat the Day 时，继续最近一次进行中的对话
export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let messages: ChatMessageRow[] = [];
  if (conversation) {
    const { data } = await supabase
      .from("messages")
      .select("id, role, content, feedback, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });
    messages = (data ?? []) as ChatMessageRow[];
  }

  return <ChatRoom initialConversationId={conversation?.id ?? null} initialMessages={messages} />;
}
