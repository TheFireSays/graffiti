-- Mission System Schema
-- Adds missions table and per-user progress tracking

-- Missions table
create table public.missions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  type text not null check (type in ('daily', 'weekly', 'special')),
  requirements jsonb not null,
  reward_xp integer default 0,
  reward_spray integer default 0,
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  season_id uuid references public.seasons(id),
  created_at timestamptz default now()
);

-- Mission progress per user
create table public.mission_progress (
  user_id uuid references public.users(id) on delete cascade,
  mission_id uuid references public.missions(id) on delete cascade,
  progress integer default 0,
  completed boolean default false,
  completed_at timestamptz,
  claimed boolean default false,
  primary key (user_id, mission_id)
);

-- RLS
alter table public.missions enable row level security;
alter table public.mission_progress enable row level security;

-- Anyone authenticated can read missions
create policy "missions_select" on public.missions
  for select to authenticated using (true);

-- Users can read their own progress
create policy "mission_progress_select" on public.mission_progress
  for select to authenticated using (auth.uid() = user_id);

-- Users can insert their own progress
create policy "mission_progress_insert" on public.mission_progress
  for insert to authenticated with check (auth.uid() = user_id);

-- Users can update their own progress
create policy "mission_progress_update" on public.mission_progress
  for update to authenticated using (auth.uid() = user_id);

-- Enable realtime on mission_progress
alter publication supabase_realtime add table public.mission_progress;
