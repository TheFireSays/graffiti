-- Check if a point is inside any restricted zone
create or replace function check_restricted_zone(
  p_lng double precision,
  p_lat double precision
) returns table (
  zone_name text,
  zone_category text
) language sql stable security definer as $$
  select name, category
  from public.restricted_zones
  where ST_DWithin(
    boundary,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    0
  )
  limit 1;
$$;

-- Find which zone a point falls in
create or replace function find_zone_for_point(
  p_lng double precision,
  p_lat double precision
) returns uuid language sql stable security definer as $$
  select id
  from public.zones
  where ST_Covers(
    boundary,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
  )
  limit 1;
$$;
