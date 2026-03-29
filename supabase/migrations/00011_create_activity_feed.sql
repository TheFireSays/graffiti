-- Activity feed: real-time event log for nearby activity and crew feeds
create table public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in (
    'tag_placed', 'tag_gone_over', 'zone_flipped', 'crew_joined', 'level_up'
  )),
  actor_id uuid not null references public.users(id) on delete cascade,
  crew_id uuid references public.crews(id) on delete set null,
  zone_id uuid references public.zones(id) on delete set null,
  tag_id uuid references public.tags(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  location geography(Point, 4326),
  created_at timestamptz not null default now()
);

-- Composite index for proximity + recency feed queries
create index idx_activity_feed_location_time on public.activity_feed
  using gist (location);
create index idx_activity_feed_created_at on public.activity_feed (created_at desc);

-- Index for crew-specific feed
create index idx_activity_feed_crew on public.activity_feed (crew_id, created_at desc)
  where crew_id is not null;

comment on table public.activity_feed is 'Event log powering the real-time nearby and crew activity feeds';
