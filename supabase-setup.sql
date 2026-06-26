-- ============================================================
-- The Curated Corner — Database setup
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query → Run
-- It is safe to run again; everything uses "if not exists" / "drop if exists".
-- ============================================================

-- 1) BLOG POSTS TABLE -----------------------------------------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text unique not null,
  category    text not null default 'Lifestyle',
  excerpt     text,
  content     text,                       -- HTML body of the post
  cover_image text,                       -- public image URL
  read_time   int  default 5,            -- minutes
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- keep updated_at fresh on every edit
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

alter table public.posts enable row level security;

-- Public visitors may read ONLY published posts
drop policy if exists "public read published posts" on public.posts;
create policy "public read published posts"
  on public.posts for select
  using (published = true);

-- You (any logged-in admin account) may read everything + write
drop policy if exists "admin read all posts" on public.posts;
create policy "admin read all posts"
  on public.posts for select to authenticated using (true);

drop policy if exists "admin insert posts" on public.posts;
create policy "admin insert posts"
  on public.posts for insert to authenticated with check (true);

drop policy if exists "admin update posts" on public.posts;
create policy "admin update posts"
  on public.posts for update to authenticated using (true) with check (true);

drop policy if exists "admin delete posts" on public.posts;
create policy "admin delete posts"
  on public.posts for delete to authenticated using (true);


-- 2) IMAGE STORAGE BUCKET -------------------------------------
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Anyone can view images; only logged-in admin can upload/change/delete
drop policy if exists "public read blog images" on storage.objects;
create policy "public read blog images"
  on storage.objects for select
  using (bucket_id = 'blog-images');

drop policy if exists "admin upload blog images" on storage.objects;
create policy "admin upload blog images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'blog-images');

drop policy if exists "admin update blog images" on storage.objects;
create policy "admin update blog images"
  on storage.objects for update to authenticated
  using (bucket_id = 'blog-images');

drop policy if exists "admin delete blog images" on storage.objects;
create policy "admin delete blog images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'blog-images');


-- 3) NEWSLETTER + CONTACT (used by /api routes) ---------------
create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

-- These are written by the server (secret key) so RLS stays on with no
-- public policies — visitors can't read other people's data.
alter table public.subscribers      enable row level security;
alter table public.contact_messages enable row level security;

-- ============================================================
-- DONE. Next: create your admin login.
--   Authentication → Users → Add user
--   email: kklinsane@gmail.com   (your email)
--   password: (choose a strong one)   ✅ tick "Auto Confirm User"
-- Then visit /admin.html on your site and log in.
-- ============================================================
