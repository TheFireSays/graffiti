-- Zones: geographic territories that crews compete to control
create table public.zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  boundary geography(Polygon, 4326) not null,
  controlling_crew_id uuid references public.crews(id) on delete set null,
  tag_counts jsonb not null default '{}'::jsonb,
  last_flipped_at timestamptz,
  created_at timestamptz not null default now()
);

-- Spatial index for point-in-polygon zone lookups
create index idx_zones_boundary on public.zones using gist (boundary);

-- Index for leaderboard queries (zones per crew)
create index idx_zones_controlling_crew on public.zones (controlling_crew_id)
  where controlling_crew_id is not null;

comment on table public.zones is 'Geographic territories that crews compete to control';
