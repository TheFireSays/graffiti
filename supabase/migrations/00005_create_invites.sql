-- Invites: crew invite codes for controlled membership
-- Crew join is validated against an active invite in an Edge Function.
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  code text unique not null default substr(md5(random()::text), 1, 8),
  created_by uuid not null references public.users(id) on delete cascade,
  max_uses integer not null default 1,
  use_count integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint invites_use_count_check check (use_count <= max_uses)
);

-- Index for invite code lookup (fast validation by code)
create index idx_invites_code on public.invites (code);

-- Index for crew's active invites
create index idx_invites_crew_id on public.invites (crew_id)
  where use_count < max_uses;

comment on table public.invites is 'Crew invite codes — crew join requires a valid unused invite';
