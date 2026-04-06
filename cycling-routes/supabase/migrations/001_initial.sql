-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── Routes ──────────────────────────────────────────────────────────────────
create table public.routes (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  user_id       uuid references auth.users(id) on delete set null,
  name          text not null,
  description   text,
  distance_km   numeric,
  elevation_gain int,
  difficulty    text check (difficulty in ('easy', 'moderate', 'hard', 'expert')),
  gpx_path      text not null,
  share_token   text not null unique,
  is_public     boolean not null default true
);

-- ─── Reviews ─────────────────────────────────────────────────────────────────
create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  route_id   uuid not null references public.routes(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete set null,
  rating     int not null check (rating between 1 and 5),
  comment    text
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index routes_share_token_idx on public.routes (share_token);
create index reviews_route_id_idx on public.reviews (route_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.routes  enable row level security;
alter table public.reviews enable row level security;

-- Routes: anyone can read public routes
create policy "Public routes are readable by all"
  on public.routes for select
  using (is_public = true);

-- Routes: authenticated users can insert their own routes
create policy "Authenticated users can insert routes"
  on public.routes for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Routes: owners can update their own routes
create policy "Owners can update their routes"
  on public.routes for update
  to authenticated
  using (auth.uid() = user_id);

-- Routes: owners can delete their own routes
create policy "Owners can delete their routes"
  on public.routes for delete
  to authenticated
  using (auth.uid() = user_id);

-- Reviews: anyone can read reviews
create policy "Reviews are readable by all"
  on public.reviews for select
  using (true);

-- Reviews: authenticated users can insert
create policy "Authenticated users can insert reviews"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Reviews: authors can update their own reviews
create policy "Authors can update their reviews"
  on public.reviews for update
  to authenticated
  using (auth.uid() = user_id);

-- Reviews: authors can delete their own reviews
create policy "Authors can delete their reviews"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = user_id);

-- ─── Storage bucket ──────────────────────────────────────────────────────────
-- Run this in Supabase Dashboard → Storage → New bucket:
-- Name: gpx-files
-- Public: true
--
-- Then add storage policies:
-- Allow authenticated uploads:
--   (bucket_id = 'gpx-files' AND auth.role() = 'authenticated')
-- Allow public downloads:
--   (bucket_id = 'gpx-files')
