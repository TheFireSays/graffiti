-- Season Management RPCs (admin only)

-- Create a new season
create or replace function public.create_season(
  p_name text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_config jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_season_id uuid;
begin
  if not public.is_admin() then
    return jsonb_build_object('error', 'Unauthorized — admin only');
  end if;

  if p_ends_at <= p_starts_at then
    return jsonb_build_object('error', 'End date must be after start date');
  end if;

  insert into public.seasons (name, starts_at, ends_at, config, status)
  values (p_name, p_starts_at, p_ends_at, p_config,
    case when p_starts_at <= now() then 'active' else 'upcoming' end)
  returning id into v_season_id;

  return jsonb_build_object('success', true, 'season_id', v_season_id);
end;
$$;

-- End a season and finalize leaderboard
create or replace function public.end_season(p_season_id uuid)
returns jsonb
language plpgsql
security definer
as $$
begin
  if not public.is_admin() then
    return jsonb_build_object('error', 'Unauthorized — admin only');
  end if;

  update public.seasons
    set status = 'ended', ends_at = now()
    where id = p_season_id and status = 'active';

  if not found then
    return jsonb_build_object('error', 'Season not found or not active');
  end if;

  -- Assign final ranks
  update public.season_leaderboard sl
    set rank = sub.rn
    from (
      select id, row_number() over (order by total_xp desc) as rn
      from public.season_leaderboard
      where season_id = p_season_id
    ) sub
    where sl.id = sub.id;

  return jsonb_build_object('success', true);
end;
$$;

-- Generate daily missions from templates
create or replace function public.seed_daily_missions()
returns jsonb
language plpgsql
security definer
as $$
declare
  v_count integer := 0;
  v_season_id uuid;
begin
  if not public.is_admin() then
    return jsonb_build_object('error', 'Unauthorized — admin only');
  end if;

  -- Get active season
  select id into v_season_id from public.seasons where status = 'active' limit 1;

  -- Insert daily missions
  insert into public.missions (title, description, type, requirements, reward_xp, reward_spray, starts_at, expires_at, season_id)
  values
    ('Tag 3 Spots', 'Place 3 tags anywhere in the city.', 'daily',
      '{"action": "place_tags", "count": 3}'::jsonb, 50, 0,
      date_trunc('day', now()), date_trunc('day', now()) + interval '1 day', v_season_id),
    ('Zone Raider', 'Flip 2 zones to your crew''s control.', 'daily',
      '{"action": "zone_flip", "count": 2}'::jsonb, 75, 1,
      date_trunc('day', now()), date_trunc('day', now()) + interval '1 day', v_season_id),
    ('Tag Blitz', 'Drop 10 tags in a single day.', 'daily',
      '{"action": "place_tags", "count": 10}'::jsonb, 150, 2,
      date_trunc('day', now()), date_trunc('day', now()) + interval '1 day', v_season_id);

  get diagnostics v_count = row_count;

  return jsonb_build_object('success', true, 'missions_created', v_count);
end;
$$;
