// Chat the Day 的数据类型（前后端共用）

// AI 规则版本：a = prompts/chat-guide.md，b = prompts/chat-guide-b.md
export type PromptVariantId = "a" | "b";

export interface ChatMessageRow {
  id: string;
  role: "user" | "assistant";
  content: string;
  feedback: -1 | 1 | null;
  created_at: string;
}

// /api/chat 以"每行一个 JSON"（NDJSON）的形式流式返回这些事件
export type ChatStreamEvent =
  | {
      type: "meta";
      conversationId: string;
      promptVariant: PromptVariantId;
      userMessageId: string;
      assistantMessageId: string;
    }
  | { type: "safety" }
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; code: string };

export interface ApiError {
  error: { code: string; message: string };
}
