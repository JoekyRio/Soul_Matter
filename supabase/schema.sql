-- 心事 (Soul Matter) 数据库 Schema
-- 在 Supabase 控制台 -> SQL Editor 中执行此脚本

-- 启用 UUID 扩展
create extension if not exists "pgcrypto";

-- profiles 表：扩展用户信息
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- entries 表：心事条目
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  mood text,
  type text not null default 'manual', -- 'manual' | 'chat'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entries_user_id_idx on public.entries(user_id);
create index if not exists entries_created_at_idx on public.entries(created_at desc);

-- tags 表：标签
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

-- entry_tags 表：心事与标签的多对多关系
create table if not exists public.entry_tags (
  entry_id uuid not null references public.entries(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (entry_id, tag_id)
);

-- panel_contents 表：用户自定义 Panel 内容（Markdown）
create table if not exists public.panel_contents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id) -- 每个用户只有一条 Panel 记录（upsert 模式）
);

-- updated_at 自动更新触发器函数
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists entries_updated_at on public.entries;
create trigger entries_updated_at
  before update on public.entries
  for each row execute function public.update_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

drop trigger if exists panel_contents_updated_at on public.panel_contents;
create trigger panel_contents_updated_at
  before update on public.panel_contents
  for each row execute function public.update_updated_at();

-- 注册新用户时自动创建 profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 启用行级安全 (RLS)
alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.tags enable row level security;
alter table public.entry_tags enable row level security;
alter table public.panel_contents enable row level security;

-- profiles 策略：用户只能查看和修改自己的 profile
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- entries 策略：用户只能 CRUD 自己的心事
create policy "entries_select_own"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "entries_insert_own"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "entries_update_own"
  on public.entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "entries_delete_own"
  on public.entries for delete
  using (auth.uid() = user_id);

-- tags 策略：用户只能 CRUD 自己的标签
create policy "tags_select_own"
  on public.tags for select
  using (auth.uid() = user_id);

create policy "tags_insert_own"
  on public.tags for insert
  with check (auth.uid() = user_id);

create policy "tags_update_own"
  on public.tags for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tags_delete_own"
  on public.tags for delete
  using (auth.uid() = user_id);

-- entry_tags 策略：通过关联的 entry 权限控制
create policy "entry_tags_select_own"
  on public.entry_tags for select
  using (
    exists (
      select 1 from public.entries e
      where e.id = entry_tags.entry_id and e.user_id = auth.uid()
    )
  );

create policy "entry_tags_insert_own"
  on public.entry_tags for insert
  with check (
    exists (
      select 1 from public.entries e
      where e.id = entry_tags.entry_id and e.user_id = auth.uid()
    )
  );

create policy "entry_tags_delete_own"
  on public.entry_tags for delete
  using (
    exists (
      select 1 from public.entries e
      where e.id = entry_tags.entry_id and e.user_id = auth.uid()
    )
  );

-- panel_contents 策略：用户只能 CRUD 自己的 Panel
create policy "panel_contents_select_own"
  on public.panel_contents for select
  using (auth.uid() = user_id);

create policy "panel_contents_insert_own"
  on public.panel_contents for insert
  with check (auth.uid() = user_id);

create policy "panel_contents_update_own"
  on public.panel_contents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "panel_contents_delete_own"
  on public.panel_contents for delete
  using (auth.uid() = user_id);
