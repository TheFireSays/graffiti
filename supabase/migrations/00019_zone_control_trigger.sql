-- Recalculate controlling_crew_id whenever tag_counts changes
create or replace function update_zone_control()
returns trigger language plpgsql security definer as $$
declare
  v_old_controller uuid;
  v_new_controller uuid;
  v_max_count integer := 0;
  v_crew_id text;
  v_count integer;
begin
  v_old_controller := OLD.controlling_crew_id;

  -- Find crew with most active tags from tag_counts jsonb
  for v_crew_id, v_count in
    select key, (value)::integer
    from jsonb_each_text(NEW.tag_counts)
  loop
    if v_count > v_max_count then
      v_max_count := v_count;
      v_new_controller := v_crew_id::uuid;
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

    -- Activity feed: zone flipped
    insert into public.activity_feed (event_type, actor_id, crew_id, zone_id, metadata)
    values (
      'zone_flipped',
      coalesce(
        (select user_id from public.tags where zone_id = NEW.id and status = 'active' order by created_at desc limit 1),
        '00000000-0000-0000-0000-000000000000'::uuid
      ),
      v_new_controller,
      NEW.id,
      jsonb_build_object('from_crew', v_old_controller, 'to_crew', v_new_controller)
    );
  end if;

  return null;
end;
$$;

create trigger trg_zone_control
  after update of tag_counts on public.zones
  for each row execute function update_zone_control();
