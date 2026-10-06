-- Phase 2 M1: 数据库增量迁移
-- 在 Supabase SQL Editor 中执行此脚本（针对线上已有数据库）

-- 1. entries 表加 type 字段（已有记录自动填充为 'manual'）
ALTER TABLE entries ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'manual';

-- 2. 新表 panel_contents
CREATE TABLE IF NOT EXISTS public.panel_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. panel_contents 触发器
DROP TRIGGER IF EXISTS panel_contents_updated_at ON public.panel_contents;
CREATE TRIGGER panel_contents_updated_at
  BEFORE UPDATE ON public.panel_contents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 4. 启用 RLS
ALTER TABLE public.panel_contents ENABLE ROW LEVEL SECURITY;

-- 5. panel_contents RLS 策略
DROP POLICY IF EXISTS "panel_contents_select_own" ON public.panel_contents;
CREATE POLICY "panel_contents_select_own"
  ON public.panel_contents FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "panel_contents_insert_own" ON public.panel_contents;
CREATE POLICY "panel_contents_insert_own"
  ON public.panel_contents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "panel_contents_update_own" ON public.panel_contents;
CREATE POLICY "panel_contents_update_own"
  ON public.panel_contents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "panel_contents_delete_own" ON public.panel_contents;
CREATE POLICY "panel_contents_delete_own"
  ON public.panel_contents FOR DELETE
  USING (auth.uid() = user_id);
