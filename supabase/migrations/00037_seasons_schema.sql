-- ============================================================
-- SEASONS TABLE
-- ============================================================
create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'ended')),
  config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  constraint seasons_dates_valid check (ends_at > starts_at)
);

create index idx_seasons_status on public.seasons (status);

alter table public.seasons enable row level security;
create policy "Seasons are publicly readable"
  on public.seasons for select using (true);

comment on table public.seasons is 'Time-limited competitive seasons for crew leaderboards';

-- ============================================================
-- SEASON LEADERBOARD TABLE
-- ============================================================
create table public.season_leaderboard (
  season_id uuid not null references public.seasons(id) on delete cascade,
  crew_id uuid not null references public.crews(id) on delete cascade,
  zones_held integer not null default 0,
  tags_placed integer not null default 0,
  tags_gone_over integer not null default 0,
  total_xp integer not null default 0,
  rank integer,
  primary key (season_id, crew_id)
);

create index idx_season_leaderboard_ranking on public.season_leaderboard (season_id, total_xp desc);

alter table public.season_leaderboard enable row level security;
create policy "Season leaderboard is publicly readable"
  on public.season_leaderboard for select using (true);

comment on table public.season_leaderboard is 'Per-season crew stats for competitive rankings';

-- ============================================================
-- RPCs
-- ============================================================

-- Get the currently active season (or null)
create or replace function get_active_season()
returns jsonb language sql stable security definer as $$
  select coalesce(
    (select jsonb_build_object(
      'id', id,
      'name', name,
      'starts_at', starts_at,
      'ends_at', ends_at,
      'status', status,
      'config', config
    )
    from public.seasons
    where status = 'active'
    limit 1),
    'null'::jsonb
  );
$$;

-- Get season leaderboard ranked by total_xp
create or replace function get_season_leaderboard(p_season_id uuid)
returns table (
  crew_id uuid,
  crew_name text,
  crew_abbreviation text,
  crew_color text,
  zones_held integer,
  tags_placed integer,
  tags_gone_over integer,
  total_xp integer,
  rank bigint
) language sql stable security definer as $$
  select
    sl.crew_id,
    c.name as crew_name,
    c.abbreviation as crew_abbreviation,
    c.color as crew_color,
    sl.zones_held,
    sl.tags_placed,
    sl.tags_gone_over,
    sl.total_xp,
    row_number() over (order by sl.total_xp desc) as rank
  from public.season_leaderboard sl
  join public.crews c on sl.crew_id = c.id
  where sl.season_id = p_season_id
  order by sl.total_xp desc;
$$;

-- Seed a test season (active now through 30 days from now)
-- This is useful for development; production seasons would be created via admin tooling.
insert into public.seasons (name, starts_at, ends_at, status)
values ('Spring 2026', now() - interval '1 day', now() + interval '30 days', 'active');
