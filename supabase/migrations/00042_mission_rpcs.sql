-- Mission RPCs
-- get_active_missions, check_mission_progress, claim_mission_reward

-- Get active missions with user's progress
create or replace function public.get_active_missions(p_user_id uuid)
returns table (
  id uuid,
  title text,
  description text,
  type text,
  requirements jsonb,
  reward_xp integer,
  reward_spray integer,
  starts_at timestamptz,
  expires_at timestamptz,
  progress integer,
  completed boolean,
  claimed boolean
)
language sql
security definer
as $$
  select
    m.id,
    m.title,
    m.description,
    m.type,
    m.requirements,
    m.reward_xp,
    m.reward_spray,
    m.starts_at,
    m.expires_at,
    coalesce(mp.progress, 0) as progress,
    coalesce(mp.completed, false) as completed,
    coalesce(mp.claimed, false) as claimed
  from public.missions m
  left join public.mission_progress mp
    on mp.mission_id = m.id and mp.user_id = p_user_id
  where m.starts_at <= now()
    and m.expires_at > now()
  order by m.type, m.expires_at;
$$;

-- Check and increment mission progress after an action
create or replace function public.check_mission_progress(
  p_user_id uuid,
  p_action text,
  p_zone_id uuid default null
)
returns void
language plpgsql
security definer
as $$
declare
  v_mission record;
  v_required integer;
begin
  -- Find matching active missions
  for v_mission in
    select m.id, m.requirements
    from public.missions m
    where m.starts_at <= now()
      and m.expires_at > now()
      and m.requirements->>'action' = p_action
      and (
        p_zone_id is null
        or m.requirements->>'zone_id' is null
        or (m.requirements->>'zone_id')::uuid = p_zone_id
      )
  loop
    v_required := (v_mission.requirements->>'count')::integer;

    -- Upsert progress
    insert into public.mission_progress (user_id, mission_id, progress, completed, completed_at)
    values (p_user_id, v_mission.id, 1, (1 >= v_required), case when 1 >= v_required then now() else null end)
    on conflict (user_id, mission_id)
    do update set
      progress = case
        when mission_progress.completed then mission_progress.progress
        else mission_progress.progress + 1
      end,
      completed = case
        when mission_progress.completed then true
        else (mission_progress.progress + 1) >= v_required
      end,
      completed_at = case
        when mission_progress.completed then mission_progress.completed_at
        when (mission_progress.progress + 1) >= v_required then now()
        else null
      end;
  end loop;
end;
$$;

-- Claim mission reward (awards XP and spray)
create or replace function public.claim_mission_reward(
  p_user_id uuid,
  p_mission_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_mission record;
  v_progress record;
begin
  -- Get mission
  select * into v_mission from public.missions where id = p_mission_id;
  if not found then
    return jsonb_build_object('error', 'Mission not found');
  end if;

  -- Get progress
  select * into v_progress from public.mission_progress
    where user_id = p_user_id and mission_id = p_mission_id;

  if not found or not v_progress.completed then
    return jsonb_build_object('error', 'Mission not completed');
  end if;

  if v_progress.claimed then
    return jsonb_build_object('error', 'Reward already claimed');
  end if;

  -- Mark as claimed
  update public.mission_progress
    set claimed = true
    where user_id = p_user_id and mission_id = p_mission_id;

  -- Award XP and spray
  update public.users
    set xp = xp + v_mission.reward_xp,
        spray_cans = spray_cans + v_mission.reward_spray
    where id = p_user_id;

  return jsonb_build_object(
    'success', true,
    'xp_awarded', v_mission.reward_xp,
    'spray_awarded', v_mission.reward_spray
  );
end;
$$;
