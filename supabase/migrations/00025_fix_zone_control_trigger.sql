-- FIX: Zone control trigger
-- Bug 1: FK crash on fallback actor_id ('00000000-...') — skip activity feed if no valid actor
-- Bug 2: No tie-break by recency — when counts are equal, crew with most recent tag wins

create or replace function update_zone_control()
returns trigger language plpgsql security definer as $$
declare
  v_old_controller uuid;
  v_new_controller uuid;
  v_max_count integer := 0;
  v_crew_id text;
  v_count integer;
  v_actor_id uuid;
begin
  v_old_controller := OLD.controlling_crew_id;

  -- Find crew with most active tags from tag_counts jsonb
  -- On tie, pick the crew whose most recent tag in this zone is newest
  for v_crew_id, v_count in
    select key, (value)::integer
    from jsonb_each_text(NEW.tag_counts)
    order by (value)::integer desc
  loop
    if v_count > v_max_count then
      v_max_count := v_count;
      v_new_controller := v_crew_id::uuid;
    elsif v_count = v_max_count and v_new_controller is not null then
      -- Tie-break: compare most recent tag timestamps
      declare
        v_current_latest timestamptz;
        v_challenger_latest timestamptz;
      begin
        select max(created_at) into v_current_latest
        from public.tags
        where zone_id = NEW.id and crew_id = v_new_controller and status = 'active';

        select max(created_at) into v_challenger_latest
        from public.tags
        where zone_id = NEW.id and crew_id = v_crew_id::uuid and status = 'active';

        if v_challenger_latest > v_current_latest then
          v_new_controller := v_crew_id::uuid;
        end if;
      end;
    end if;
  end loop;

  -- If no tags, no controller
  if v_max_count = 0 then
    v_new_controller := null;
  end if;

  -- Update controlling crew if changed
  if v_new_controller is distinct from v_old_controller then
    update public.zones
    set controlling_crew_id = v_new_controller,
        last_flipped_at = now()
    where id = NEW.id;

    -- Update zones_controlled counters on crews
    if v_old_controller is not null then
      update public.crews
      set zones_controlled = greatest(0, zones_controlled - 1)
      where id = v_old_controller;
    end if;
    if v_new_controller is not null then
      update public.crews
      set zones_controlled = zones_controlled + 1
      where id = v_new_controller;
    end if;

    -- Activity feed: zone flipped (skip if no valid actor — avoids FK crash)
    select user_id into v_actor_id
    from public.tags
    where zone_id = NEW.id and status = 'active'
    order by created_at desc
    limit 1;

    if v_actor_id is not null then
      insert into public.activity_feed (event_type, actor_id, crew_id, zone_id, metadata)
      values (
        'zone_flipped',
        v_actor_id,
        v_new_controller,
        NEW.id,
        jsonb_build_object('from_crew', v_old_controller, 'to_crew', v_new_controller)
      );
    end if;
  end if;

  return null;
end;
$$;
