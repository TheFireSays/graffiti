-- RPC: report a tag
create or replace function report_tag(
  p_tag_id uuid,
  p_reason text,
  p_details text default null
) returns jsonb language plpgsql security definer as $$
declare
  v_user_id uuid := auth.uid();
  v_tag record;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  if p_reason not in ('inappropriate_location', 'offensive', 'spam', 'other') then
    return jsonb_build_object('success', false, 'error', 'Invalid reason');
  end if;

  -- Verify tag exists
  select * into v_tag from public.tags where id = p_tag_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Tag not found');
  end if;

  -- Don't allow reporting your own tags
  if v_tag.user_id = v_user_id then
    return jsonb_build_object('success', false, 'error', 'Cannot report your own tag');
  end if;

  -- Check for duplicate report
  if exists (
    select 1 from public.reports
    where tag_id = p_tag_id and reporter_id = v_user_id and status = 'pending'
  ) then
    return jsonb_build_object('success', false, 'error', 'Already reported');
  end if;

  -- Insert report
  insert into public.reports (tag_id, reporter_id, reason, details, status)
  values (p_tag_id, v_user_id, p_reason, p_details, 'pending');

  -- Flag the tag (hidden until reviewed)
  update public.tags set status = 'flagged' where id = p_tag_id;

  return jsonb_build_object('success', true);
end;
$$;

-- RPC: review a report (moderation action)
create or replace function review_report(
  p_report_id uuid,
  p_action text
) returns jsonb language plpgsql security definer as $$
declare
  v_user_id uuid := auth.uid();
  v_report record;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  if p_action not in ('approve', 'remove') then
    return jsonb_build_object('success', false, 'error', 'Invalid action — use approve or remove');
  end if;

  select * into v_report from public.reports where id = p_report_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Report not found');
  end if;

  if v_report.status != 'pending' then
    return jsonb_build_object('success', false, 'error', 'Report already reviewed');
  end if;

  if p_action = 'approve' then
    -- Dismiss the report, restore the tag
    update public.reports
    set status = 'resolved', resolution = 'dismissed', reviewed_by = v_user_id, reviewed_at = now()
    where id = p_report_id;

    update public.tags set status = 'active' where id = v_report.tag_id;
  else
    -- Remove the tag
    update public.reports
    set status = 'resolved', resolution = 'removed', reviewed_by = v_user_id, reviewed_at = now()
    where id = p_report_id;

    update public.tags set status = 'removed' where id = v_report.tag_id;
  end if;

  return jsonb_build_object('success', true);
end;
$$;
