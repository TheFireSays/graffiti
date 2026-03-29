-- Users table: extends Supabase Auth with app-specific profile data
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null default '',
  avatar_url text,
  level integer not null default 1,
  xp integer not null default 0,
  spray_cans integer not null default 10,
  crew_id uuid,  -- FK added after crews table exists
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index for username lookups
create index idx_users_username on public.users (username);

-- Index for crew membership lookups
create index idx_users_crew_id on public.users (crew_id) where crew_id is not null;

comment on table public.users is 'App user profiles linked to Supabase Auth';
