-- Restricted zones: geo-fenced areas where tagging is blocked
create table public.restricted_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('school', 'worship', 'hospital', 'government', 'memorial', 'cemetery')),
  boundary geography(Polygon, 4326) not null,
  source text not null default 'manual' check (source in ('osm', 'google_places', 'manual')),
  created_at timestamptz not null default now()
);

-- Spatial index for geo-fence validation
create index idx_restricted_zones_boundary on public.restricted_zones using gist (boundary);

comment on table public.restricted_zones is 'Geo-fenced locations where tag placement is blocked';
