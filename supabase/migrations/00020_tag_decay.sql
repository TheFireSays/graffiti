-- Archive tags older than tag_decay_days and recalculate affected zones
create or replace function decay_expired_tags()
returns jsonb language plpgsql security definer as $$
declare
  v_decay_days integer;
  v_cutoff timestamptz;
  v_archived_count integer;
  v_affected_zones uuid[];
begin
  v_decay_days := get_constant('tag_decay_days');
  v_cutoff := now() - (v_decay_days || ' days')::interval;

  -- Find zones that will be affected
  select array_agg(distinct zone_id) into v_affected_zones
  from public.tags
  where status = 'active' and created_at < v_cutoff and zone_id is not null;

  -- Archive expired tags
  update public.tags
  set status = 'archived'
  where status = 'active' and created_at < v_cutoff;

  get diagnostics v_archived_count = row_count;

  -- The existing trg_zone_tag_counts trigger fires on tag updates,
  -- which recalculates tag_counts, which triggers trg_zone_control.
  -- So zone control is automatically recalculated.

  return jsonb_build_object(
    'archived_count', v_archived_count,
    'affected_zones', to_jsonb(coalesce(v_affected_zones, array[]::uuid[])),
    'cutoff', v_cutoff
  );
end;
$$;
