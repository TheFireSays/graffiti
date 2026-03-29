-- Helper: upsert a crew's season leaderboard entry
create or replace function update_season_stats(
  p_crew_id uuid,
  p_xp_delta integer default 0,
  p_tags_delta integer default 0,
  p_go_over_delta integer default 0,
  p_zones_delta integer default 0
) returns void language plpgsql security definer as $$
declare
  v_season_id uuid;
begin
  -- Find active season
  select id into v_season_id
  from public.seasons
  where status = 'active'
  limit 1;

  if v_season_id is null or p_crew_id is null then
    return;
  end if;

  insert into public.season_leaderboard (season_id, crew_id, total_xp, tags_placed, tags_gone_over, zones_held)
  values (v_season_id, p_crew_id, greatest(0, p_xp_delta), greatest(0, p_tags_delta), greatest(0, p_go_over_delta), greatest(0, p_zones_delta))
  on conflict (season_id, crew_id) do update set
    total_xp = season_leaderboard.total_xp + p_xp_delta,
    tags_placed = season_leaderboard.tags_placed + p_tags_delta,
    tags_gone_over = season_leaderboard.tags_gone_over + p_go_over_delta,
    zones_held = greatest(0, season_leaderboard.zones_held + p_zones_delta);
end;
$$;

-- Patch place_tag_scored: add season stats tracking after XP calculation
-- We do this by adding a call to update_season_stats at the end of the function.
-- Since the function is already defined in 00036, we CREATE OR REPLACE it with the season addition.

-- Rather than duplicating the entire huge function, we add a trigger-based approach:
-- After a tag is placed (insert into tags), a trigger calls update_season_stats.

create or replace function trg_season_tag_placed()
returns trigger language plpgsql security definer as $$
begin
  if NEW.status = 'active' and NEW.crew_id is not null then
    perform update_season_stats(
      NEW.crew_id,
      p_xp_delta := get_constant('xp_tag_placed'),
      p_tags_delta := 1
    );
  end if;
  return null;
end;
$$;

create trigger trg_season_on_tag_insert
  after insert on public.tags
  for each row execute function trg_season_tag_placed();

-- Track go-overs: when a tag status changes to 'archived' and gone_over_by is set
create or replace function trg_season_tag_gone_over()
returns trigger language plpgsql security definer as $$
declare
  v_new_crew_id uuid;
begin
  if OLD.status = 'active' and NEW.status = 'archived' and NEW.gone_over_by is not null then
    -- The crew that went over gets credit (look up from the new tag)
    select crew_id into v_new_crew_id from public.tags where id = NEW.gone_over_by;
    if v_new_crew_id is not null then
      perform update_season_stats(v_new_crew_id, p_go_over_delta := 1);
    end if;
  end if;
  return null;
end;
$$;

create trigger trg_season_on_tag_archive
  after update of status on public.tags
  for each row execute function trg_season_tag_gone_over();

-- Update zone control trigger to also track season zones_held
-- The existing trg_zone_control fires on zones.tag_counts update.
-- We add a separate trigger on zones.controlling_crew_id changes.

create or replace function trg_season_zone_flip()
returns trigger language plpgsql security definer as $$
begin
  if OLD.controlling_crew_id is distinct from NEW.controlling_crew_id then
    -- Old controller loses a zone
    if OLD.controlling_crew_id is not null then
      perform update_season_stats(OLD.controlling_crew_id, p_zones_delta := -1);
    end if;
    -- New controller gains a zone
    if NEW.controlling_crew_id is not null then
      perform update_season_stats(NEW.controlling_crew_id, p_zones_delta := 1);
    end if;
  end if;
  return null;
end;
$$;

create trigger trg_season_zone_flip
  after update of controlling_crew_id on public.zones
  for each row execute function trg_season_zone_flip();
