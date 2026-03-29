-- Game balance constants — tunable without code changes
create table public.game_constants (
  key text primary key,
  value integer not null,
  description text
);

-- Disable RLS (constants are public read, admin write)
alter table public.game_constants enable row level security;
create policy "Game constants are publicly readable"
  on public.game_constants for select using (true);

-- XP awards
insert into public.game_constants (key, value, description) values
  ('xp_tag_placed',       10,  'Base XP for placing a tag'),
  ('xp_new_zone_bonus',   20,  'Bonus XP for first tag in a zone'),
  ('xp_contested_bonus',  15,  'Bonus XP for tagging in a contested zone'),
  ('xp_go_over_bonus',    25,  'Bonus XP for going over a rival tag');

-- Spray can economy
insert into public.game_constants (key, value, description) values
  ('spray_earn_per_tag',    2,  'Spray cans earned per tag placed'),
  ('spray_earn_level_up',   5,  'Spray cans earned on level up'),
  ('spray_cost_go_over_tag',     5,  'Cost to go over a basic tag'),
  ('spray_cost_go_over_throwup', 10, 'Cost to go over a throw-up'),
  ('spray_cost_go_over_piece',   20, 'Cost to go over a piece');

-- Level thresholds (XP needed to reach each level)
insert into public.game_constants (key, value, description) values
  ('level_2_xp',    50,   'XP to reach level 2'),
  ('level_3_xp',    150,  'XP to reach level 3'),
  ('level_4_xp',    300,  'XP to reach level 4'),
  ('level_5_xp',    500,  'XP to reach level 5 (unlocks throw-ups)'),
  ('level_10_xp',   2000, 'XP to reach level 10'),
  ('level_15_xp',   5000, 'XP to reach level 15 (unlocks pieces)'),
  ('level_20_xp',   10000,'XP to reach level 20');

-- Tag decay
insert into public.game_constants (key, value, description) values
  ('tag_decay_days', 7, 'Days before active tags expire');

-- Helper function to read a constant
create or replace function get_constant(p_key text)
returns integer language sql stable security definer as $$
  select value from public.game_constants where key = p_key;
$$;
