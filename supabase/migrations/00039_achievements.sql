-- Achievements & Badges System
-- Tables, seed data, and RPCs for achievement tracking

-- ============================================================
-- achievements table — catalog of all possible achievements
-- ============================================================
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  icon text not null,
  category text not null,
  requirement_type text not null,
  requirement_value integer not null,
  reward_xp integer default 0,
  reward_spray integer default 0,
  rarity text default 'common',
  created_at timestamptz default now()
);

-- ============================================================
-- user_achievements — junction tracking which users unlocked what
-- ============================================================
create table public.user_achievements (
  user_id uuid references public.users(id) on delete cascade,
  achievement_id uuid references public.achievements(id) on delete cascade,
  unlocked_at timestamptz default now(),
  primary key (user_id, achievement_id)
);

create index idx_user_achievements_user on public.user_achievements (user_id);

-- ============================================================
-- RLS
-- ============================================================
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

create policy "Achievements are readable by all authenticated users"
  on public.achievements for select
  to authenticated
  using (true);

create policy "Users can read own achievements"
  on public.user_achievements for select
  to authenticated
  using (user_id = auth.uid());

-- user_achievements inserts happen via RPC (security definer), no direct insert policy needed

-- ============================================================
-- Seed achievements
-- ============================================================
insert into public.achievements (name, description, icon, category, requirement_type, requirement_value, reward_xp, reward_spray, rarity) values
  ('First Tag',      'Place your first tag',                    '🎨', 'tagging',     'tags_placed',        1,    50,  5,  'common'),
  ('Street Artist',  'Place 25 tags',                           '🖌️', 'tagging',     'tags_placed',        25,   200, 10, 'common'),
  ('Vandal',         'Place 100 tags',                          '💥', 'tagging',     'tags_placed',        100,  500, 25, 'rare'),
  ('Legend',         'Place 500 tags',                           '👑', 'tagging',     'tags_placed',        500,  2000,50, 'epic'),
  ('Crew Up',        'Join a crew',                             '🤝', 'crew',        'crew_members',       1,    100, 5,  'common'),
  ('Crew Leader',    'Create a crew',                           '⭐', 'crew',        'crew_created',       1,    150, 10, 'common'),
  ('Gang',           'Be in a crew with 5+ members',            '👥', 'crew',        'crew_size',          5,    300, 15, 'rare'),
  ('Takeover',       'Control a zone',                          '🏴', 'exploration', 'zones_controlled',   1,    100, 5,  'common'),
  ('Domination',     'Control 10 zones',                        '🔥', 'exploration', 'zones_controlled',   10,   500, 25, 'rare'),
  ('Empire',         'Control 25 zones',                        '🏰', 'exploration', 'zones_controlled',   25,   1500,50, 'epic'),
  ('Go Over',        'Go over someone''s tag',                  '❌', 'tagging',     'go_overs',           1,    50,  5,  'common'),
  ('Rival',          'Go over 50 tags',                         '⚔️', 'tagging',     'go_overs',           50,   500, 25, 'rare'),
  ('Explorer',       'Place tags in 10 different zones',        '🗺️', 'exploration', 'zones_tagged',       10,   400, 20, 'rare'),
  ('Mission Runner', 'Complete 10 missions',                    '🎯', 'mastery',     'missions_completed', 10,   300, 15, 'common'),
  ('Elite',          'Reach level 10',                          '💎', 'mastery',     'level_reached',      10,   500, 25, 'rare'),
  ('OG',             'Reach level 25',                          '🏆', 'mastery',     'level_reached',      25,   2000,50, 'epic');

-- ============================================================
-- check_achievements(p_user_id) — scan stats and unlock earned achievements
-- Returns: array of newly unlocked achievement records
-- ============================================================
create or replace function check_achievements(p_user_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_user record;
  v_stat_tags_placed integer;
  v_stat_go_overs integer;
  v_stat_zones_controlled integer;
  v_stat_zones_tagged integer;
  v_stat_crew_members integer;
  v_stat_crew_created integer;
  v_stat_crew_size integer;
  v_newly_unlocked jsonb := '[]'::jsonb;
  v_achievement record;
  v_stat_value integer;
begin
  -- Get user
  select * into v_user from public.users where id = p_user_id;
  if v_user is null then
    return '[]'::jsonb;
  end if;

  -- Compute stats
  select count(*) into v_stat_tags_placed
  from public.tags where user_id = p_user_id and status = 'active';

  select count(*) into v_stat_go_overs
  from public.tags t
  where t.user_id = p_user_id and t.status = 'active'
    and exists (
      select 1 from public.tags archived
      where archived.gone_over_by = t.id
    );

  select count(*) into v_stat_zones_controlled
  from public.zones where controlling_crew_id = v_user.crew_id
    and v_user.crew_id is not null;

  select count(distinct zone_id) into v_stat_zones_tagged
  from public.tags where user_id = p_user_id and zone_id is not null and status = 'active';

  -- Crew stats
  if v_user.crew_id is not null then
    v_stat_crew_members := 1; -- user is in a crew
    select member_count into v_stat_crew_size
    from public.crews where id = v_user.crew_id;
  else
    v_stat_crew_members := 0;
    v_stat_crew_size := 0;
  end if;

  select count(*) into v_stat_crew_created
  from public.crews where founder_id = p_user_id;

  -- Check each un-earned achievement
  for v_achievement in
    select a.*
    from public.achievements a
    where not exists (
      select 1 from public.user_achievements ua
      where ua.user_id = p_user_id and ua.achievement_id = a.id
    )
  loop
    v_stat_value := case v_achievement.requirement_type
      when 'tags_placed' then v_stat_tags_placed
      when 'go_overs' then v_stat_go_overs
      when 'zones_controlled' then v_stat_zones_controlled
      when 'zones_tagged' then v_stat_zones_tagged
      when 'crew_members' then v_stat_crew_members
      when 'crew_created' then v_stat_crew_created
      when 'crew_size' then v_stat_crew_size
      when 'level_reached' then v_user.level
      when 'missions_completed' then 0 -- missions not yet implemented
      else 0
    end;

    if v_stat_value >= v_achievement.requirement_value then
      -- Unlock it
      insert into public.user_achievements (user_id, achievement_id)
      values (p_user_id, v_achievement.id)
      on conflict do nothing;

      -- Grant rewards
      if v_achievement.reward_xp > 0 or v_achievement.reward_spray > 0 then
        update public.users
        set xp = xp + v_achievement.reward_xp,
            spray_cans = spray_cans + v_achievement.reward_spray
        where id = p_user_id;
      end if;

      v_newly_unlocked := v_newly_unlocked || jsonb_build_object(
        'id', v_achievement.id,
        'name', v_achievement.name,
        'description', v_achievement.description,
        'icon', v_achievement.icon,
        'rarity', v_achievement.rarity,
        'reward_xp', v_achievement.reward_xp,
        'reward_spray', v_achievement.reward_spray
      );
    end if;
  end loop;

  return v_newly_unlocked;
end;
$$;

-- ============================================================
-- get_user_achievements(p_user_id) — all achievements with unlock status
-- ============================================================
create or replace function get_user_achievements(p_user_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_result jsonb;
begin
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', a.id,
      'name', a.name,
      'description', a.description,
      'icon', a.icon,
      'category', a.category,
      'requirement_type', a.requirement_type,
      'requirement_value', a.requirement_value,
      'reward_xp', a.reward_xp,
      'reward_spray', a.reward_spray,
      'rarity', a.rarity,
      'unlocked', ua.unlocked_at is not null,
      'unlocked_at', ua.unlocked_at
    ) order by a.category, a.requirement_value
  ), '[]'::jsonb) into v_result
  from public.achievements a
  left join public.user_achievements ua
    on ua.achievement_id = a.id and ua.user_id = p_user_id;

  return v_result;
end;
$$;
