-- Add last_tagged_at column for rate-limiting tag placement
alter table public.users add column last_tagged_at timestamptz;

-- Index for rate-limit lookups
create index idx_users_last_tagged_at on public.users (last_tagged_at)
  where last_tagged_at is not null;

comment on column public.users.last_tagged_at is 'Timestamp of last tag placement, used for rate limiting';
