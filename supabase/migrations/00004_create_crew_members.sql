-- Crew members junction table with roles
create table public.crew_members (
  crew_id uuid not null references public.crews(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('og', 'core', 'member')),
  joined_at timestamptz not null default now(),
  primary key (crew_id, user_id)
);

-- Index for looking up a user's crew membership
create index idx_crew_members_user_id on public.crew_members (user_id);

comment on table public.crew_members is 'Many-to-many relationship between users and crews with role info';
