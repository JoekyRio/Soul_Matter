-- M2 · Chat the Day：对话、消息、AI 调用日志
-- 在 Supabase SQL Editor 中执行此脚本（针对线上已有数据库）。可重复执行。

-- 1. 对话
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS conversations_user_updated_idx
  ON public.conversations(user_id, updated_at DESC);

-- 2. 消息（冗余 user_id，简化权限策略）
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  feedback smallint CHECK (feedback IN (-1, 1)),
  feedback_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_conversation_created_idx
  ON public.messages(conversation_id, created_at);

-- 3. AI 调用日志（含完整请求与回复，用于调试；保留 30 天）
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  endpoint text NOT NULL,
  model text NOT NULL,
  prompt_version text,
  request jsonb NOT NULL,
  response text,
  prompt_tokens integer,
  completion_tokens integer,
  duration_ms integer,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_logs_user_created_idx
  ON public.ai_logs(user_id, created_at DESC);

-- 4. updated_at 触发器（函数在 schema.sql 中已定义）
DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5. 行级安全：只能访问自己的数据
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_select_own" ON public.conversations;
CREATE POLICY "conversations_select_own" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "conversations_insert_own" ON public.conversations;
CREATE POLICY "conversations_insert_own" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "conversations_update_own" ON public.conversations;
CREATE POLICY "conversations_update_own" ON public.conversations
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "conversations_delete_own" ON public.conversations;
CREATE POLICY "conversations_delete_own" ON public.conversations
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "messages_update_own" ON public.messages;
CREATE POLICY "messages_update_own" ON public.messages
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;
CREATE POLICY "messages_delete_own" ON public.messages
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_logs_select_own" ON public.ai_logs;
CREATE POLICY "ai_logs_select_own" ON public.ai_logs
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "ai_logs_insert_own" ON public.ai_logs;
CREATE POLICY "ai_logs_insert_own" ON public.ai_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "ai_logs_delete_own" ON public.ai_logs;
CREATE POLICY "ai_logs_delete_own" ON public.ai_logs
  FOR DELETE USING (auth.uid() = user_id);
