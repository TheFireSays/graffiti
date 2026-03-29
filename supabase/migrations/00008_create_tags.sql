-- Tags: GPS-anchored graffiti placed by users
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  crew_id uuid references public.crews(id) on delete set null,
  tag_image_id uuid not null references public.tag_images(id) on delete restrict,
  custom_colors jsonb not null default '{}'::jsonb,
  location geography(Point, 4326) not null,
  compass_heading float not null check (compass_heading >= 0 and compass_heading < 360),
  zone_id uuid references public.zones(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'archived', 'flagged', 'removed')),
  gone_over_by uuid references public.tags(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Spatial index for nearby tag queries
create index idx_tags_location on public.tags using gist (location);

-- Index for zone control calculations (active tags per zone per crew)
create index idx_tags_zone_status on public.tags (zone_id, status) where status = 'active';

-- Index for user's tag history
create index idx_tags_user_id on public.tags (user_id, created_at desc);

comment on table public.tags is 'GPS-anchored graffiti tags placed by users in the real world';
