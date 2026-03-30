-- Moderation RPCs
-- Admin/moderator tools for managing reports and bans

-- Get pending reports with details (admin/mod only)
create or replace function public.get_pending_reports()
returns table (
  report_id uuid,
  tag_id uuid,
  reporter_username text,
  reason text,
  details text,
  status text,
  created_at timestamptz,
  tag_user_username text,
  tag_image_id uuid
)
language sql
security definer
as $$
  select
    r.id as report_id,
    r.tag_id,
    reporter.username as reporter_username,
    r.reason,
    r.details,
    r.status,
    r.created_at,
    tag_owner.username as tag_user_username,
    t.tag_image_id
  from public.reports r
  join public.users reporter on reporter.id = r.reporter_id
  join public.tags t on t.id = r.tag_id
  join public.users tag_owner on tag_owner.id = t.user_id
  where r.status = 'pending'
    and public.is_moderator()
  order by r.created_at asc;
$$;

-- Moderate a report with extended actions
create or replace function public.moderate_report(
  p_report_id uuid,
  p_action text -- 'dismiss', 'warn', 'remove_tag', 'ban_user'
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_report record;
  v_tag record;
begin
  -- Must be moderator or admin
  if not public.is_moderator() then
    return jsonb_build_object('error', 'Unauthorized');
  end if;

  -- Validate action
  if p_action not in ('dismiss', 'warn', 'remove_tag', 'ban_user') then
    return jsonb_build_object('error', 'Invalid action');
  end if;

  -- Get report
  select * into v_report from public.reports where id = p_report_id;
  if not found then
    return jsonb_build_object('error', 'Report not found');
  end if;

  if v_report.status != 'pending' then
    return jsonb_build_object('error', 'Report already reviewed');
  end if;

  -- Get associated tag
  select * into v_tag from public.tags where id = v_report.tag_id;

  -- Apply action
  case p_action
    when 'dismiss' then
      update public.reports
        set status = 'resolved', resolution = 'dismissed',
            reviewed_by = auth.uid(), reviewed_at = now()
        where id = p_report_id;

    when 'warn' then
      update public.reports
        set status = 'resolved', resolution = 'dismissed',
            reviewed_by = auth.uid(), reviewed_at = now()
        where id = p_report_id;
      -- Log warning as suspicious activity
      perform public.flag_suspicious_activity(v_tag.user_id, 'moderator_warning',
        jsonb_build_object('report_id', p_report_id, 'reason', v_report.reason));

    when 'remove_tag' then
      update public.reports
        set status = 'resolved', resolution = 'removed',
            reviewed_by = auth.uid(), reviewed_at = now()
        where id = p_report_id;
      -- Archive the tag
      update public.tags set status = 'archived' where id = v_report.tag_id;

    when 'ban_user' then
      update public.reports
        set status = 'resolved', resolution = 'removed',
            reviewed_by = auth.uid(), reviewed_at = now()
        where id = p_report_id;
      -- Ban user for 7 days
      update public.users
        set is_banned = true,
            banned_until = now() + interval '7 days',
            ban_reason = 'Moderation action: ' || v_report.reason
        where id = v_tag.user_id;
      -- Archive the tag
      update public.tags set status = 'archived' where id = v_report.tag_id;
      -- Log ban
      perform public.flag_suspicious_activity(v_tag.user_id, 'moderator_ban',
        jsonb_build_object('report_id', p_report_id, 'duration_days', 7));
  end case;

  return jsonb_build_object('success', true, 'action', p_action);
end;
$$;

-- Ban a user (admin only)
create or replace function public.ban_user(
  p_user_id uuid,
  p_reason text,
  p_duration_days integer default 7
)
returns jsonb
language plpgsql
security definer
as $$
begin
  if not public.is_admin() then
    return jsonb_build_object('error', 'Unauthorized — admin only');
  end if;

  update public.users
    set is_banned = true,
        banned_until = now() + (p_duration_days || ' days')::interval,
        ban_reason = p_reason
    where id = p_user_id;

  if not found then
    return jsonb_build_object('error', 'User not found');
  end if;

  perform public.flag_suspicious_activity(p_user_id, 'admin_ban',
    jsonb_build_object('reason', p_reason, 'duration_days', p_duration_days));

  return jsonb_build_object('success', true);
end;
$$;

-- Unban a user (admin only)
create or replace function public.unban_user(p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
begin
  if not public.is_admin() then
    return jsonb_build_object('error', 'Unauthorized — admin only');
  end if;

  update public.users
    set is_banned = false, banned_until = null, ban_reason = null
    where id = p_user_id;

  if not found then
    return jsonb_build_object('error', 'User not found');
  end if;

  return jsonb_build_object('success', true);
end;
$$;
