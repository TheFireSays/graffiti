-- Reports: user-submitted content flags
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid not null references public.tags(id) on delete cascade,
  reporter_id uuid not null references public.users(id) on delete cascade,
  reason text not null check (reason in ('inappropriate_location', 'offensive', 'spam', 'other')),
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved')),
  resolution text check (resolution in ('removed', 'dismissed', 'zone_added')),
  reviewed_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- Index for moderation queue (pending reports first)
create index idx_reports_status on public.reports (status, created_at)
  where status = 'pending';

comment on table public.reports is 'User-submitted content reports for moderation review';
