-- Crews table: teams of users who compete for territory
create table public.crews (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  abbreviation text unique not null check (char_length(abbreviation) = 3),
  color text not null default '#ff3333',
  founder_id uuid not null references public.users(id) on delete restrict,
  member_count integer not null default 1,
  total_xp bigint not null default 0,
  zones_controlled integer not null default 0,
  created_at timestamptz not null default now()
);

-- Enforce uppercase abbreviations
alter table public.crews add constraint crews_abbreviation_upper
  check (abbreviation = upper(abbreviation));

-- Add the FK from users.crew_id -> crews.id now that crews table exists
alter table public.users
  add constraint fk_users_crew_id
  foreign key (crew_id) references public.crews(id) on delete set null;

comment on table public.crews is 'Graffiti crews (teams) that compete for zone control';
