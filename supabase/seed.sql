-- ============================================================
-- SEED DATA: "Active City" profile
-- Centered on downtown Austin, TX (30.2672, -97.7431)
-- ============================================================

-- Create test auth users (this fires the signup trigger which creates basic profiles)
insert into auth.users (id, email, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  ('a1000000-0000-0000-0000-000000000001', 'krush@test.com', now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('a1000000-0000-0000-0000-000000000002', 'venom@test.com', now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('a1000000-0000-0000-0000-000000000003', 'blaze@test.com', now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('a1000000-0000-0000-0000-000000000004', 'nova@test.com', now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('a1000000-0000-0000-0000-000000000005', 'solo_rider@test.com', now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('a1000000-0000-0000-0000-000000000006', 'phantom@test.com', now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated');

-- Override trigger-created profiles with full test data
-- (signup trigger creates basic rows; we need custom usernames, levels, etc.)
insert into public.users (id, username, display_name, level, xp, spray_cans) values
  ('a1000000-0000-0000-0000-000000000001', 'KRUSH', 'Krush',  12, 2400, 45),
  ('a1000000-0000-0000-0000-000000000002', 'VENOM', 'Venom',   8, 1200, 30),
  ('a1000000-0000-0000-0000-000000000003', 'BLAZE', 'Blaze',  15, 3800, 60),
  ('a1000000-0000-0000-0000-000000000004', 'NOVA',  'Nova',    5,  600, 20),
  ('a1000000-0000-0000-0000-000000000005', 'SOLO_RIDER', 'Solo Rider', 3, 200, 12),
  ('a1000000-0000-0000-0000-000000000006', 'PHANTOM', 'Phantom', 6, 800, 25)
on conflict (id) do update set
  username = excluded.username,
  display_name = excluded.display_name,
  level = excluded.level,
  xp = excluded.xp,
  spray_cans = excluded.spray_cans;

-- Create crews
insert into public.crews (id, name, abbreviation, color, founder_id, member_count, total_xp, zones_controlled) values
  ('c1000000-0000-0000-0000-000000000001', 'Urban Kings', 'UKG', '#ff3333', 'a1000000-0000-0000-0000-000000000001', 2, 3600, 2),
  ('c1000000-0000-0000-0000-000000000002', 'Shadow Writers', 'SHW', '#3366ff', 'a1000000-0000-0000-0000-000000000003', 2, 4400, 1);

-- Solo crew
insert into public.crews (id, name, abbreviation, color, founder_id, member_count, total_xp, zones_controlled) values
  ('c1000000-0000-0000-0000-000000000003', 'SOLO_RIDER', 'SLR', '#00cc88', 'a1000000-0000-0000-0000-000000000005', 1, 200, 0);

-- Update users with crew_id
update public.users set crew_id = 'c1000000-0000-0000-0000-000000000001' where id in ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002');
update public.users set crew_id = 'c1000000-0000-0000-0000-000000000002' where id in ('a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004');
update public.users set crew_id = 'c1000000-0000-0000-0000-000000000003' where id = 'a1000000-0000-0000-0000-000000000005';

-- Crew members
insert into public.crew_members (crew_id, user_id, role) values
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'og'),
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'member'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'og'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 'member'),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005', 'og');

-- Tag images (curated library)
-- IDs use prefix b1 (b = valid hex) to distinguish from users (a1) and crews (c1)
insert into public.tag_images (id, name, image_url, category, tier, customizable_colors) values
  ('b1000000-0000-0000-0000-000000000001', 'Basic Tag 1',    '/tags/basic-tag-1.png',    'tag',     1, '[{"slot": "primary", "default": "#ff3333"}, {"slot": "outline", "default": "#000000"}]'),
  ('b1000000-0000-0000-0000-000000000002', 'Basic Tag 2',    '/tags/basic-tag-2.png',    'tag',     1, '[{"slot": "primary", "default": "#3366ff"}, {"slot": "outline", "default": "#000000"}]'),
  ('b1000000-0000-0000-0000-000000000003', 'Sharp Tag',      '/tags/sharp-tag.png',      'tag',     3, '[{"slot": "primary", "default": "#ffcc00"}, {"slot": "outline", "default": "#333333"}]'),
  ('b1000000-0000-0000-0000-000000000004', 'Bubble Throwup', '/tags/bubble-throwup.png', 'throwup', 5, '[{"slot": "fill", "default": "#ff6600"}, {"slot": "outline", "default": "#000000"}, {"slot": "highlight", "default": "#ffffff"}]'),
  ('b1000000-0000-0000-0000-000000000005', 'Block Throwup',  '/tags/block-throwup.png',  'throwup', 5, '[{"slot": "fill", "default": "#cc00ff"}, {"slot": "outline", "default": "#000000"}, {"slot": "highlight", "default": "#ffffff"}]'),
  ('b1000000-0000-0000-0000-000000000006', 'Wildstyle Piece', '/tags/wildstyle.png',     'piece',  15, '[{"slot": "primary", "default": "#ff0000"}, {"slot": "secondary", "default": "#ffcc00"}, {"slot": "outline", "default": "#000000"}, {"slot": "background", "default": "#1a1a2e"}]');

-- Zones: 4 zones in a grid over downtown Austin (~200m x 200m each)
insert into public.zones (id, name, boundary, controlling_crew_id, tag_counts, last_flipped_at) values
  ('d1000000-0000-0000-0000-000000000001', '6th Street',
    ST_GeogFromText('POLYGON((-97.7450 30.2680, -97.7430 30.2680, -97.7430 30.2660, -97.7450 30.2660, -97.7450 30.2680))'),
    'c1000000-0000-0000-0000-000000000001',
    '{"c1000000-0000-0000-0000-000000000001": 5, "c1000000-0000-0000-0000-000000000002": 2}'::jsonb,
    now() - interval '2 days'),
  ('d1000000-0000-0000-0000-000000000002', 'Congress Ave',
    ST_GeogFromText('POLYGON((-97.7430 30.2680, -97.7410 30.2680, -97.7410 30.2660, -97.7430 30.2660, -97.7430 30.2680))'),
    'c1000000-0000-0000-0000-000000000001',
    '{"c1000000-0000-0000-0000-000000000001": 3}'::jsonb,
    now() - interval '5 days'),
  ('d1000000-0000-0000-0000-000000000003', 'Rainey Street',
    ST_GeogFromText('POLYGON((-97.7410 30.2660, -97.7390 30.2660, -97.7390 30.2640, -97.7410 30.2640, -97.7410 30.2660))'),
    'c1000000-0000-0000-0000-000000000002',
    '{"c1000000-0000-0000-0000-000000000002": 4, "c1000000-0000-0000-0000-000000000001": 1}'::jsonb,
    now() - interval '1 day'),
  ('d1000000-0000-0000-0000-000000000004', 'East Side',
    ST_GeogFromText('POLYGON((-97.7390 30.2680, -97.7370 30.2680, -97.7370 30.2660, -97.7390 30.2660, -97.7390 30.2680))'),
    null,
    '{}'::jsonb,
    null);

-- Tags: spread across zones
insert into public.tags (user_id, crew_id, tag_image_id, custom_colors, location, compass_heading, zone_id, status) values
  ('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '{"primary": "#ff3333"}', ST_GeogFromText('POINT(-97.7440 30.2670)'), 180.0, 'd1000000-0000-0000-0000-000000000001', 'active'),
  ('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', '{"primary": "#ff3333"}', ST_GeogFromText('POINT(-97.7442 30.2672)'), 90.0, 'd1000000-0000-0000-0000-000000000001', 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '{"primary": "#ff6600"}', ST_GeogFromText('POINT(-97.7438 30.2668)'), 270.0, 'd1000000-0000-0000-0000-000000000001', 'active'),
  ('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', '{"primary": "#ffcc00"}', ST_GeogFromText('POINT(-97.7445 30.2675)'), 0.0, 'd1000000-0000-0000-0000-000000000001', 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '{"primary": "#ff3333"}', ST_GeogFromText('POINT(-97.7435 30.2665)'), 45.0, 'd1000000-0000-0000-0000-000000000001', 'active'),
  ('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', '{"fill": "#3366ff"}', ST_GeogFromText('POINT(-97.7436 30.2674)'), 135.0, 'd1000000-0000-0000-0000-000000000001', 'active'),
  ('a1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '{"primary": "#3366ff"}', ST_GeogFromText('POINT(-97.7443 30.2667)'), 315.0, 'd1000000-0000-0000-0000-000000000001', 'active'),
  ('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '{"primary": "#ff3333"}', ST_GeogFromText('POINT(-97.7420 30.2670)'), 180.0, 'd1000000-0000-0000-0000-000000000002', 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', '{"primary": "#ff3333"}', ST_GeogFromText('POINT(-97.7425 30.2675)'), 90.0, 'd1000000-0000-0000-0000-000000000002', 'active'),
  ('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '{"primary": "#ff3333"}', ST_GeogFromText('POINT(-97.7418 30.2665)'), 0.0, 'd1000000-0000-0000-0000-000000000002', 'active'),
  ('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000005', '{"fill": "#cc00ff"}', ST_GeogFromText('POINT(-97.7400 30.2650)'), 180.0, 'd1000000-0000-0000-0000-000000000003', 'active'),
  ('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', '{"fill": "#3366ff"}', ST_GeogFromText('POINT(-97.7405 30.2655)'), 270.0, 'd1000000-0000-0000-0000-000000000003', 'active'),
  ('a1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '{"primary": "#3366ff"}', ST_GeogFromText('POINT(-97.7395 30.2645)'), 90.0, 'd1000000-0000-0000-0000-000000000003', 'active'),
  ('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '{"primary": "#3366ff"}', ST_GeogFromText('POINT(-97.7402 30.2648)'), 45.0, 'd1000000-0000-0000-0000-000000000003', 'active'),
  ('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '{"primary": "#ff3333"}', ST_GeogFromText('POINT(-97.7398 30.2652)'), 180.0, 'd1000000-0000-0000-0000-000000000003', 'active'),
  ('a1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '{"primary": "#3366ff"}', ST_GeogFromText('POINT(-97.7440 30.2670)'), 180.0, 'd1000000-0000-0000-0000-000000000001', 'archived');

-- Restricted zone: a school near downtown Austin
insert into public.restricted_zones (name, category, boundary, source) values
  ('Austin High School', 'school',
    ST_GeogFromText('POLYGON((-97.7640 30.2740, -97.7610 30.2740, -97.7610 30.2720, -97.7640 30.2720, -97.7640 30.2740))'),
    'osm');

-- Activity feed: recent events
insert into public.activity_feed (event_type, actor_id, crew_id, zone_id, location, metadata) values
  ('tag_placed', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', ST_GeogFromText('POINT(-97.7440 30.2670)'), '{"tag_category": "tag"}'::jsonb),
  ('tag_placed', 'a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000003', ST_GeogFromText('POINT(-97.7400 30.2650)'), '{"tag_category": "throwup"}'::jsonb),
  ('zone_flipped', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', ST_GeogFromText('POINT(-97.7440 30.2670)'), '{"from_crew": null, "to_crew": "c1000000-0000-0000-0000-000000000001"}'::jsonb),
  ('tag_gone_over', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', ST_GeogFromText('POINT(-97.7440 30.2670)'), '{"original_user": "a1000000-0000-0000-0000-000000000004", "original_crew": "c1000000-0000-0000-0000-000000000002"}'::jsonb),
  ('crew_joined', 'a1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', null, null, '{"crew_name": "Shadow Writers"}'::jsonb),
  ('level_up', 'a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', null, null, '{"new_level": 15}'::jsonb);
