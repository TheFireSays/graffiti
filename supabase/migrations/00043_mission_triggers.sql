-- Mission Triggers
-- Auto-check mission progress after tag placement and zone flips

-- Trigger function: check place_tags missions after tag insert
create or replace function public.check_tag_missions()
returns trigger
language plpgsql
security definer
as $$
begin
  perform public.check_mission_progress(NEW.user_id, 'place_tags', NEW.zone_id);
  return NEW;
end;
$$;

create trigger trg_check_tag_missions
  after insert on public.tags
  for each row
  execute function public.check_tag_missions();

-- Trigger function: check zone_flip missions after zone control changes
create or replace function public.check_zone_missions()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only fire when controlling_crew_id changes (a flip happened)
  if NEW.controlling_crew_id is distinct from OLD.controlling_crew_id
     and NEW.controlling_crew_id is not null then
    -- Find a user from the new controlling crew to credit
    perform public.check_mission_progress(
      (select user_id from public.tags
       where zone_id = NEW.id
       order by created_at desc limit 1),
      'zone_flip',
      NEW.id
    );
  end if;
  return NEW;
end;
$$;

create trigger trg_check_zone_missions
  after update on public.zones
  for each row
  execute function public.check_zone_missions();
