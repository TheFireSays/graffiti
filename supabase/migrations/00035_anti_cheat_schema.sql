-- ============================================================
-- SUSPICIOUS ACTIVITY TABLE
-- ============================================================
create table public.suspicious_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  reason text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  reviewed boolean not null default false
);

create index idx_suspicious_activity_user on public.suspicious_activity (user_id, created_at desc);
create index idx_suspicious_activity_unreviewed on public.suspicious_activity (created_at)
  where reviewed = false;

alter table public.suspicious_activity enable row level security;
-- Only service role reads suspicious activity (admin/moderation)
-- No client-side policies needed

comment on table public.suspicious_activity is 'Log of suspicious behavior for moderation review';

-- ============================================================
-- FLAG SUSPICIOUS ACTIVITY RPC
-- ============================================================
create or replace function flag_suspicious_activity(
  p_user_id uuid,
  p_reason text,
  p_metadata jsonb default '{}'
) returns void language plpgsql security definer as $$
begin
  insert into public.suspicious_activity (user_id, reason, metadata)
  values (p_user_id, p_reason, p_metadata);
end;
$$;

-- ============================================================
-- DEVICE FINGERPRINT ON PUSH_TOKENS
-- ============================================================
alter table public.push_tokens add column if not exists device_fingerprint text;

-- ============================================================
-- ANTI-CHEAT GAME CONSTANTS
-- ============================================================
insert into public.game_constants (key, value, description) values
  ('max_movement_speed_kmh', 150, 'Maximum movement speed in km/h — rejects faster-than-driving'),
  ('min_tag_distance_meters', 5,  'Minimum distance between consecutive tags in meters'),
  ('max_tags_per_day', 200, 'Maximum tags a user can place in 24 hours')
on conflict (key) do update set value = excluded.value, description = excluded.description;
