-- Calculate user level from XP
create or replace function calculate_level(p_xp integer)
returns integer language sql stable security definer as $$
  select case
    when p_xp >= get_constant('level_20_xp') then 20
    when p_xp >= get_constant('level_15_xp') then 15
    when p_xp >= get_constant('level_10_xp') then 10
    when p_xp >= get_constant('level_5_xp')  then 5
    when p_xp >= get_constant('level_4_xp')  then 4
    when p_xp >= get_constant('level_3_xp')  then 3
    when p_xp >= get_constant('level_2_xp')  then 2
    else 1
  end;
$$;

-- Main scored tag placement function
create or replace function place_tag_scored(
  p_user_id uuid,
  p_tag_image_id uuid,
  p_custom_colors jsonb,
  p_lng double precision,
  p_lat double precision,
  p_compass_heading double precision,
  p_go_over_tag_id uuid default null
) returns jsonb language plpgsql security definer as $$
declare
  v_user record;
  v_tag_image record;
  v_zone_id uuid;
  v_restricted record;
  v_go_over_tag record;
  v_spray_cost integer := 0;
  v_xp_earned integer;
  v_spray_earned integer;
  v_new_xp integer;
  v_new_level integer;
  v_old_level integer;
  v_new_spray integer;
  v_new_tag_id uuid;
  v_is_new_zone boolean := false;
  v_is_contested boolean := false;
  v_location geography;
begin
  -- Build location
  v_location := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;

  -- 1. Get user
  select * into v_user from public.users where id = p_user_id;
  if v_user is null then
    return jsonb_build_object('success', false, 'error', 'User not found');
  end if;
  if v_user.is_banned then
    return jsonb_build_object('success', false, 'error', 'Account is banned');
  end if;

  -- 2. Get tag image and check level
  select * into v_tag_image from public.tag_images where id = p_tag_image_id;
  if v_tag_image is null then
    return jsonb_build_object('success', false, 'error', 'Tag not found');
  end if;
  if v_user.level < v_tag_image.tier then
    return jsonb_build_object('success', false, 'error',
      format('Need level %s to use this tag (current: %s)', v_tag_image.tier, v_user.level));
  end if;

  -- 3. Geo-fence check
  select name, category into v_restricted
  from public.restricted_zones
  where ST_DWithin(boundary, v_location, 0)
  limit 1;

  if v_restricted is not null then
    return jsonb_build_object('success', false, 'error',
      format('Cannot tag near %s (%s)', v_restricted.name, v_restricted.category));
  end if;

  -- 4. Find zone
  select id into v_zone_id
  from public.zones
  where ST_Covers(boundary, v_location)
  limit 1;

  -- 5. Handle go-over
  if p_go_over_tag_id is not null then
    select t.*, ti.category as img_category
    into v_go_over_tag
    from public.tags t
    join public.tag_images ti on t.tag_image_id = ti.id
    where t.id = p_go_over_tag_id and t.status = 'active';

    if v_go_over_tag is null then
      return jsonb_build_object('success', false, 'error', 'Tag to go over not found or already archived');
    end if;

    -- Cannot go over own crew's tags
    if v_go_over_tag.crew_id is not null and v_go_over_tag.crew_id = v_user.crew_id then
      return jsonb_build_object('success', false, 'error', 'Cannot go over your own crew''s tags');
    end if;

    -- Calculate spray cost based on tag category
    v_spray_cost := case v_go_over_tag.img_category
      when 'piece' then get_constant('spray_cost_go_over_piece')
      when 'throwup' then get_constant('spray_cost_go_over_throwup')
      else get_constant('spray_cost_go_over_tag')
    end;

    if v_user.spray_cans < v_spray_cost then
      return jsonb_build_object('success', false, 'error',
        format('Need %s spray cans (have %s)', v_spray_cost, v_user.spray_cans));
    end if;

    -- Archive the old tag
    update public.tags set status = 'archived', gone_over_by = null
    where id = p_go_over_tag_id;
  end if;

  -- 6. Check if this is a new zone for the user (first tag in this zone)
  if v_zone_id is not null then
    select not exists(
      select 1 from public.tags
      where user_id = p_user_id and zone_id = v_zone_id and status = 'active'
    ) into v_is_new_zone;

    -- Check if zone is contested (controlled by a different crew)
    select (controlling_crew_id is not null and controlling_crew_id is distinct from v_user.crew_id)
    into v_is_contested
    from public.zones where id = v_zone_id;
  end if;

  -- 7. Insert the tag
  insert into public.tags (user_id, crew_id, tag_image_id, custom_colors, location, compass_heading, zone_id, status)
  values (p_user_id, v_user.crew_id, p_tag_image_id, p_custom_colors, v_location, p_compass_heading, v_zone_id, 'active')
  returning id into v_new_tag_id;

  -- Update gone_over_by on archived tag
  if p_go_over_tag_id is not null then
    update public.tags set gone_over_by = v_new_tag_id where id = p_go_over_tag_id;
  end if;

  -- 8. Calculate XP
  v_xp_earned := get_constant('xp_tag_placed');
  if v_is_new_zone then v_xp_earned := v_xp_earned + get_constant('xp_new_zone_bonus'); end if;
  if v_is_contested then v_xp_earned := v_xp_earned + get_constant('xp_contested_bonus'); end if;
  if p_go_over_tag_id is not null then v_xp_earned := v_xp_earned + get_constant('xp_go_over_bonus'); end if;

  -- 9. Calculate spray cans (earn minus cost)
  v_spray_earned := get_constant('spray_earn_per_tag');

  -- 10. Update user stats
  v_old_level := v_user.level;
  v_new_xp := v_user.xp + v_xp_earned;
  v_new_level := calculate_level(v_new_xp);
  v_new_spray := v_user.spray_cans - v_spray_cost + v_spray_earned;

  -- Bonus spray cans on level up
  if v_new_level > v_old_level then
    v_new_spray := v_new_spray + get_constant('spray_earn_level_up');
  end if;

  update public.users
  set xp = v_new_xp, level = v_new_level, spray_cans = v_new_spray
  where id = p_user_id;

  -- 11. Activity feed events
  insert into public.activity_feed (event_type, actor_id, crew_id, zone_id, tag_id, location, metadata)
  values ('tag_placed', p_user_id, v_user.crew_id, v_zone_id, v_new_tag_id, v_location,
    jsonb_build_object('tag_category', v_tag_image.category, 'xp_earned', v_xp_earned));

  if p_go_over_tag_id is not null then
    insert into public.activity_feed (event_type, actor_id, crew_id, zone_id, tag_id, location, metadata)
    values ('tag_gone_over', p_user_id, v_user.crew_id, v_zone_id, v_new_tag_id, v_location,
      jsonb_build_object('original_tag_id', p_go_over_tag_id));
  end if;

  if v_new_level > v_old_level then
    insert into public.activity_feed (event_type, actor_id, crew_id, location, metadata)
    values ('level_up', p_user_id, v_user.crew_id, v_location,
      jsonb_build_object('new_level', v_new_level, 'old_level', v_old_level));
  end if;

  -- Return result
  return jsonb_build_object(
    'success', true,
    'tag_id', v_new_tag_id,
    'xp_earned', v_xp_earned,
    'spray_cost', v_spray_cost,
    'spray_earned', v_spray_earned,
    'new_xp', v_new_xp,
    'new_level', v_new_level,
    'new_spray_cans', v_new_spray,
    'leveled_up', v_new_level > v_old_level,
    'zone_id', v_zone_id,
    'is_new_zone', v_is_new_zone,
    'is_contested', v_is_contested
  );
end;
$$;
