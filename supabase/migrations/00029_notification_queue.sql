-- Notification queue: outbox for pending notifications
-- Populated by a trigger on activity_feed inserts.
-- Client polls this table to show notifications.
create table public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  event_type text not null,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notification_queue_user_unread
  on public.notification_queue (user_id, created_at desc)
  where not is_read;

-- RLS: users see only their own notifications
alter table public.notification_queue enable row level security;

create policy "Users can read own notifications"
  on public.notification_queue for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notification_queue for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RPC: mark notifications as read
create or replace function mark_notifications_read(
  p_notification_ids uuid[]
) returns jsonb language plpgsql security definer as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  update public.notification_queue
  set is_read = true
  where id = any(p_notification_ids) and user_id = v_user_id;

  return jsonb_build_object('success', true);
end;
$$;

-- RPC: get unread notification count
create or replace function get_unread_notification_count()
returns integer language plpgsql security definer as $$
declare
  v_user_id uuid := auth.uid();
  v_count integer;
begin
  if v_user_id is null then
    return 0;
  end if;

  select count(*) into v_count
  from public.notification_queue
  where user_id = v_user_id and not is_read;

  return v_count;
end;
$$;

-- Trigger function: on activity_feed insert, create notification_queue entries
-- for affected users based on event type.
create or replace function notify_on_activity()
returns trigger language plpgsql security definer as $$
declare
  v_target_ids uuid[];
  v_title text;
  v_body text;
  v_zone_name text;
  v_actor_username text;
  v_crew_name text;
  v_target_id uuid;
begin
  -- Get actor username for message formatting
  select username into v_actor_username
  from public.users where id = NEW.actor_id;

  if v_actor_username is null then
    v_actor_username := 'Someone';
  end if;

  case NEW.event_type

    -- Zone flipped: notify all members of the LOSING crew
    when 'zone_flipped' then
      declare
        v_losing_crew_id uuid;
      begin
        v_losing_crew_id := (NEW.metadata->>'from_crew')::uuid;
        if v_losing_crew_id is null then
          return NEW;
        end if;

        select name into v_zone_name
        from public.zones where id = NEW.zone_id;

        select name into v_crew_name
        from public.crews where id = v_losing_crew_id;

        v_title := 'Zone Lost!';
        v_body := coalesce(v_zone_name, 'A zone') || ' was taken from ' || coalesce(v_crew_name, 'your crew');

        select array_agg(user_id) into v_target_ids
        from public.crew_members
        where crew_id = v_losing_crew_id;
      end;

    -- Tag gone over: notify the original tagger
    when 'tag_gone_over' then
      declare
        v_original_tagger uuid;
      begin
        v_original_tagger := (NEW.metadata->>'original_tagger_id')::uuid;
        if v_original_tagger is null then
          return NEW;
        end if;

        -- Don't notify yourself
        if v_original_tagger = NEW.actor_id then
          return NEW;
        end if;

        v_title := 'Tag Gone Over!';
        v_body := v_actor_username || ' went over your tag';
        v_target_ids := array[v_original_tagger];
      end;

    -- Crew joined: notify OG and core members of the crew
    when 'crew_joined' then
      if NEW.crew_id is null then
        return NEW;
      end if;

      select name into v_crew_name
      from public.crews where id = NEW.crew_id;

      v_title := 'New Crew Member!';
      v_body := v_actor_username || ' joined ' || coalesce(v_crew_name, 'your crew');

      select array_agg(user_id) into v_target_ids
      from public.crew_members
      where crew_id = NEW.crew_id
        and role in ('og', 'core')
        and user_id != NEW.actor_id;

    else
      -- No notification for other event types
      return NEW;
  end case;

  -- Insert notification for each target user
  if v_target_ids is not null then
    foreach v_target_id in array v_target_ids
    loop
      insert into public.notification_queue (user_id, event_type, title, body, metadata)
      values (
        v_target_id,
        NEW.event_type,
        v_title,
        v_body,
        jsonb_build_object(
          'activity_feed_id', NEW.id,
          'zone_id', NEW.zone_id,
          'crew_id', NEW.crew_id,
          'tag_id', NEW.tag_id
        )
      );
    end loop;
  end if;

  return NEW;
end;
$$;

create trigger trg_notify_on_activity
  after insert on public.activity_feed
  for each row execute function notify_on_activity();
