-- Analytics Events — event tracking for usage analytics

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  event_name text not null,
  event_data jsonb default '{}',
  session_id text,
  created_at timestamptz default now()
);

create index idx_analytics_event_name on public.analytics_events (event_name, created_at);
create index idx_analytics_user on public.analytics_events (user_id, created_at);

-- RLS: users can insert their own events, admins can read all
alter table public.analytics_events enable row level security;

create policy "Users can insert own analytics events"
  on public.analytics_events for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Admins can read all analytics events"
  on public.analytics_events for select
  to authenticated
  using (public.is_admin());

-- ============================================================
-- Analytics RPCs (admin-only reads)
-- ============================================================

-- Daily active users count
create or replace function get_daily_active_users(p_date date)
returns integer language plpgsql security definer as $$
declare
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  select count(distinct user_id) into v_count
  from public.analytics_events
  where created_at >= p_date::timestamptz
    and created_at < (p_date + interval '1 day')::timestamptz;

  return v_count;
end;
$$;

-- Event counts over a time range
create or replace function get_event_counts(
  p_event_name text,
  p_start timestamptz,
  p_end timestamptz
) returns integer language plpgsql security definer as $$
declare
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  select count(*) into v_count
  from public.analytics_events
  where event_name = p_event_name
    and created_at >= p_start
    and created_at <= p_end;

  return v_count;
end;
$$;

-- Retention cohort: users who were active on day 0 and returned on D1/D7/D30
create or replace function get_retention_cohort(
  p_start date,
  p_end date
) returns jsonb language plpgsql security definer as $$
declare
  v_cohort_size integer;
  v_d1 integer;
  v_d7 integer;
  v_d30 integer;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  -- Users active on the start date
  select count(distinct user_id) into v_cohort_size
  from public.analytics_events
  where created_at >= p_start::timestamptz
    and created_at < (p_start + interval '1 day')::timestamptz;

  if v_cohort_size = 0 then
    return jsonb_build_object('cohort_size', 0, 'd1', 0, 'd7', 0, 'd30', 0);
  end if;

  -- D1 retention
  select count(distinct ae.user_id) into v_d1
  from public.analytics_events ae
  where ae.user_id in (
    select distinct user_id from public.analytics_events
    where created_at >= p_start::timestamptz
      and created_at < (p_start + interval '1 day')::timestamptz
  )
  and ae.created_at >= (p_start + interval '1 day')::timestamptz
  and ae.created_at < (p_start + interval '2 days')::timestamptz;

  -- D7 retention
  select count(distinct ae.user_id) into v_d7
  from public.analytics_events ae
  where ae.user_id in (
    select distinct user_id from public.analytics_events
    where created_at >= p_start::timestamptz
      and created_at < (p_start + interval '1 day')::timestamptz
  )
  and ae.created_at >= (p_start + interval '7 days')::timestamptz
  and ae.created_at < (p_start + interval '8 days')::timestamptz;

  -- D30 retention
  select count(distinct ae.user_id) into v_d30
  from public.analytics_events ae
  where ae.user_id in (
    select distinct user_id from public.analytics_events
    where created_at >= p_start::timestamptz
      and created_at < (p_start + interval '1 day')::timestamptz
  )
  and ae.created_at >= (p_start + interval '30 days')::timestamptz
  and ae.created_at < (p_start + interval '31 days')::timestamptz;

  return jsonb_build_object(
    'cohort_size', v_cohort_size,
    'd1', v_d1,
    'd7', v_d7,
    'd30', v_d30
  );
end;
$$;
