-- Map query functions: extract coordinates from PostGIS columns

-- Get zones with boundary as GeoJSON + crew info
create or replace function get_zones_for_map()
returns table (
  id uuid,
  name text,
  boundary_geojson text,
  controlling_crew_id uuid,
  crew_color text,
  crew_abbreviation text,
  tag_counts jsonb
) language sql stable security definer as $$
  select
    z.id,
    z.name,
    ST_AsGeoJSON(z.boundary::geometry) as boundary_geojson,
    z.controlling_crew_id,
    c.color as crew_color,
    c.abbreviation as crew_abbreviation,
    z.tag_counts
  from public.zones z
  left join public.crews c on z.controlling_crew_id = c.id;
$$;

-- Get active tags with lat/lng + crew and tag image info
create or replace function get_tags_for_map()
returns table (
  id uuid,
  lat double precision,
  lng double precision,
  compass_heading double precision,
  status text,
  crew_id uuid,
  crew_color text,
  crew_abbreviation text,
  user_id uuid,
  username text,
  tag_image_name text,
  tag_category text,
  created_at timestamptz
) language sql stable security definer as $$
  select
    t.id,
    ST_Y(t.location::geometry) as lat,
    ST_X(t.location::geometry) as lng,
    t.compass_heading,
    t.status,
    t.crew_id,
    c.color as crew_color,
    c.abbreviation as crew_abbreviation,
    t.user_id,
    u.username,
    ti.name as tag_image_name,
    ti.category as tag_category,
    t.created_at
  from public.tags t
  left join public.crews c on t.crew_id = c.id
  left join public.users u on t.user_id = u.id
  left join public.tag_images ti on t.tag_image_id = ti.id
  where t.status = 'active';
$$;
