-- ============================================================
-- CREW INACTIVITY DISSOLUTION
-- ============================================================

alter table public.crews
  add column last_tagged_at timestamptz,
  add column inactivity_warned_at timestamptz;

create index idx_crews_last_tagged_at on public.crews (last_tagged_at)
  where last_tagged_at is not null;

comment on column public.crews.last_tagged_at is
  'Timestamp of most recent tag placed by any crew member; drives inactivity dissolution';
comment on column public.crews.inactivity_warned_at is
  'Set when 25-day inactivity warning is sent; cleared when crew places a new tag';

-- TRIGGER: update crews.last_tagged_at on tag insert
create or replace function trg_crew_last_tagged_at()
returns trigger language plpgsql security definer as $$
begin
  if NEW.crew_id is not null then
    update public.crews
    set last_tagged_at    = now(),
        inactivity_warned_at = null
    where id = NEW.crew_id;
  end if;
  return null;
end;
$$;

create trigger trg_crew_last_tagged_at
  after insert on public.tags
  for each row execute function trg_crew_last_tagged_at();

-- FUNCTION: process_crew_inactivity()
create or replace function process_crew_inactivity()
returns void language plpgsql security definer as $$
declare
  v_crew       record;
  v_member_ids uuid[];
  v_user_id    uuid;
begin
  -- Pass 1: Warn (25 days inactive, warning not yet sent)
  for v_crew in
    select id, name
    from public.crews
    where (
            last_tagged_at < now() - interval '25 days'
            or (last_tagged_at is null and created_at < now() - interval '25 days')
          )
      and inactivity_warned_at is null
      and not (
            last_tagged_at < now() - interval '30 days'
            or (last_tagged_at is null and created_at < now() - interval '30 days')
          )
  loop
    update public.crews
    set inactivity_warned_at = now()
    where id = v_crew.id;

    insert into public.notification_queue
      (user_id, event_type, title, body, metadata)
    select
      cm.user_id,
      'crew_inactivity_warning',
      'Crew Inactivity Warning',
      v_crew.name || ' hasn''t tagged in 25 days — tag something in the next 5 days or the crew will be dissolved.',
      jsonb_build_object('crew_id', v_crew.id, 'crew_name', v_crew.name)
    from public.crew_members cm
    where cm.crew_id = v_crew.id;
  end loop;

  -- Pass 2: Dissolve (30+ days inactive)
  for v_crew in
    select id, name
    from public.crews
    where last_tagged_at < now() - interval '30 days'
       or (last_tagged_at is null and created_at < now() - interval '30 days')
  loop
    select array_agg(user_id) into v_member_ids
    from public.crew_members
    where crew_id = v_crew.id;

    update public.tags
    set crew_id = null
    where crew_id = v_crew.id;

    update public.users
    set crew_id = null
    where crew_id = v_crew.id;

    delete from public.crews where id = v_crew.id;

    if v_member_ids is not null then
      foreach v_user_id in array v_member_ids loop
        insert into public.notification_queue
          (user_id, event_type, title, body, metadata)
        values (
          v_user_id,
          'crew_dissolved',
          'Crew Dissolved',
          'Your crew ' || v_crew.name || ' has been dissolved due to inactivity.',
          jsonb_build_object('crew_name', v_crew.name)
        );
      end loop;
    end if;
  end loop;
end;
$$;

-- pg_cron: run daily at 06:00 UTC
-- Wrapped in DO block to gracefully skip if pg_cron is not loaded (local dev without shared_preload_libraries)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'crew-inactivity-check',
      '0 6 * * *',
      'select process_crew_inactivity()'
    );
  end if;
end;
$$;
