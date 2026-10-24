-- Run this script in Supabase Dashboard -> SQL Editor -> New query.
-- Public can read posts/comments. Only authenticated users can create content.
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text check (title is null or char_length(title) <= 120),
  body text not null check (char_length(body) between 1 and 5000),
  tool_name text,
  created_at timestamptz not null default now()
);
create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 3000),
  created_at timestamptz not null default now()
);
create table if not exists public.tool_comments (
  id uuid primary key default gen_random_uuid(),
  tool_name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 3000),
  created_at timestamptz not null default now()
);
create index if not exists community_posts_created_at_idx on public.community_posts(created_at desc);
create index if not exists community_posts_tool_name_idx on public.community_posts(tool_name);
create index if not exists community_comments_post_id_idx on public.community_comments(post_id, created_at);
create index if not exists tool_comments_tool_name_idx on public.tool_comments(tool_name, created_at);
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.tool_comments enable row level security;
drop policy if exists "Anyone can read community posts" on public.community_posts;
create policy "Anyone can read community posts" on public.community_posts for select using (true);
drop policy if exists "Signed-in users can create own posts" on public.community_posts;
create policy "Signed-in users can create own posts" on public.community_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Authors can delete own posts" on public.community_posts;
create policy "Authors can delete own posts" on public.community_posts for delete to authenticated using (auth.uid() = user_id);
drop policy if exists "Anyone can read community comments" on public.community_comments;
create policy "Anyone can read community comments" on public.community_comments for select using (true);
drop policy if exists "Signed-in users can create own community comments" on public.community_comments;
create policy "Signed-in users can create own community comments" on public.community_comments for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Authors can delete own community comments" on public.community_comments;
create policy "Authors can delete own community comments" on public.community_comments for delete to authenticated using (auth.uid() = user_id);
drop policy if exists "Anyone can read tool comments" on public.tool_comments;
create policy "Anyone can read tool comments" on public.tool_comments for select using (true);
drop policy if exists "Signed-in users can create own tool comments" on public.tool_comments;
create policy "Signed-in users can create own tool comments" on public.tool_comments for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Authors can delete own tool comments" on public.tool_comments;
create policy "Authors can delete own tool comments" on public.tool_comments for delete to authenticated using (auth.uid() = user_id);
