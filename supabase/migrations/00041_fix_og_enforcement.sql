-- Fix OG enforcement and add rate limiting to crew membership RPCs
-- ============================================================
-- Issues addressed:
-- 1. request_join_crew: no rate limit — user can spam unlimited pending
--    requests across different crews. Fix: max 3 pending requests per user.
-- 2. review_join_request: OG check already present (lines 307-313 of 00039),
--    but re-create with explicit comment for auditability.
-- 3. send_direct_invite: OG check already present (lines 405-411 of 00039),
--    but re-create with explicit comment for auditability.
-- 4. get_og_eligible_members: correctly implemented in 00039, no changes needed.
-- ============================================================

-- ============================================================
-- 1. Patch request_join_crew: add rate limit (max 3 pending requests)
-- ============================================================
create or replace function request_join_crew(p_crew_id uuid, p_message text default null)
returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid;
  v_user record;
  v_crew record;
  v_existing record;
  v_pending_count integer;
  v_request_id uuid;
  v_og_member uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select * into v_user from public.users where id = v_uid;
  if v_user is null then
    return jsonb_build_object('success', false, 'error', 'User not found');
  end if;
  if v_user.crew_id is not null then
    return jsonb_build_object('success', false, 'error', 'Already in a crew');
  end if;

  -- Check crew exists
  select * into v_crew from public.crews where id = p_crew_id;
  if v_crew is null then
    return jsonb_build_object('success', false, 'error', 'Crew not found');
  end if;

  -- Check for duplicate pending request to this specific crew
  select * into v_existing
  from public.crew_join_requests
  where crew_id = p_crew_id and user_id = v_uid and status = 'pending';
  if v_existing is not null then
    return jsonb_build_object('success', false, 'error', 'You already have a pending request for this crew');
  end if;

  -- SECURITY: Rate limit — max 3 pending requests across all crews
  select count(*) into v_pending_count
  from public.crew_join_requests
  where user_id = v_uid and status = 'pending';
  if v_pending_count >= 3 then
    return jsonb_build_object('success', false, 'error', 'Too many pending requests (max 3)');
  end if;

  -- Insert request
  insert into public.crew_join_requests (crew_id, user_id, message)
  values (p_crew_id, v_uid, p_message)
  returning id into v_request_id;

  -- Notify OG-eligible members
  for v_og_member in select get_og_eligible_members(p_crew_id)
  loop
    insert into public.notification_queue (user_id, event_type, title, body, metadata)
    values (
      v_og_member,
      'crew_join_request',
      v_user.username || ' wants to join ' || v_crew.name,
      v_user.username || ' wants to join ' || v_crew.name,
      jsonb_build_object('request_id', v_request_id, 'crew_id', p_crew_id, 'requester_id', v_uid)
    );
  end loop;

  return jsonb_build_object('success', true, 'request_id', v_request_id);
end;
$$;

-- ============================================================
-- 2. Re-create review_join_request with explicit OG enforcement comment
--    (functionally identical to 00039 — this is for auditability)
-- ============================================================
create or replace function review_join_request(p_request_id uuid, p_approved boolean)
returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid;
  v_request record;
  v_crew record;
  v_requester record;
  v_is_og boolean;
  v_grant_image record;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select * into v_request from public.crew_join_requests where id = p_request_id;
  if v_request is null then
    return jsonb_build_object('success', false, 'error', 'Request not found');
  end if;
  if v_request.status != 'pending' then
    return jsonb_build_object('success', false, 'error', 'Request is not pending');
  end if;

  -- SECURITY: Server-side OG eligibility check — prevents bypass via direct RPC call
  -- Caller must be in the top 20% most active crew members (by XP + tags in 14 days)
  select exists(
    select 1 from get_og_eligible_members(v_request.crew_id) as oid where oid = v_uid
  ) into v_is_og;
  if not v_is_og then
    return jsonb_build_object('success', false, 'error', 'Not authorized to review requests');
  end if;

  select * into v_crew from public.crews where id = v_request.crew_id;
  select * into v_requester from public.users where id = v_request.user_id;

  if p_approved then
    -- Add to crew_members
    insert into public.crew_members (crew_id, user_id, role)
    values (v_request.crew_id, v_request.user_id, 'member')
    on conflict do nothing;

    -- Update user's crew_id
    update public.users set crew_id = v_request.crew_id where id = v_request.user_id;

    -- Grant crew-exclusive tag images
    for v_grant_image in
      select id from public.tag_images where crew_id = v_request.crew_id
    loop
      insert into public.user_tag_image_grants (user_id, tag_image_id, crew_id)
      values (v_request.user_id, v_grant_image.id, v_request.crew_id)
      on conflict do nothing;
    end loop;

    -- Cancel other pending requests from this user
    update public.crew_join_requests
    set status = 'cancelled', updated_at = now()
    where user_id = v_request.user_id and status = 'pending' and id != p_request_id;

    -- Cancel pending direct invites for this user
    update public.crew_direct_invites
    set status = 'cancelled', updated_at = now()
    where target_user_id = v_request.user_id and status = 'pending';

    -- Mark this request approved
    update public.crew_join_requests
    set status = 'approved', reviewed_by = v_uid, updated_at = now()
    where id = p_request_id;

    -- Notify requester
    insert into public.notification_queue (user_id, event_type, title, body, metadata)
    values (
      v_request.user_id,
      'crew_join_approved',
      'Your request to join ' || v_crew.name || ' was approved!',
      'Your request to join ' || v_crew.name || ' was approved!',
      jsonb_build_object('crew_id', v_request.crew_id)
    );
  else
    -- Decline
    update public.crew_join_requests
    set status = 'declined', reviewed_by = v_uid, updated_at = now()
    where id = p_request_id;

    -- Notify requester
    insert into public.notification_queue (user_id, event_type, title, body, metadata)
    values (
      v_request.user_id,
      'crew_join_declined',
      'Your request to join ' || v_crew.name || ' was declined',
      'Your request to join ' || v_crew.name || ' was declined',
      jsonb_build_object('crew_id', v_request.crew_id)
    );
  end if;

  return jsonb_build_object('success', true);
end;
$$;

-- ============================================================
-- 3. Re-create send_direct_invite with explicit OG enforcement comment
--    (functionally identical to 00039 — this is for auditability)
-- ============================================================
create or replace function send_direct_invite(p_target_username text)
returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid;
  v_user record;
  v_target record;
  v_crew record;
  v_is_og boolean;
  v_invite_id uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select * into v_user from public.users where id = v_uid;
  if v_user is null then
    return jsonb_build_object('success', false, 'error', 'User not found');
  end if;
  if v_user.crew_id is null then
    return jsonb_build_object('success', false, 'error', 'You are not in a crew');
  end if;

  -- SECURITY: Server-side OG eligibility check — prevents bypass via direct RPC call
  -- Caller must be in the top 20% most active crew members (by XP + tags in 14 days)
  select exists(
    select 1 from get_og_eligible_members(v_user.crew_id) as oid where oid = v_uid
  ) into v_is_og;
  if not v_is_og then
    return jsonb_build_object('success', false, 'error', 'Not authorized to send invites');
  end if;

  -- Find target user
  select * into v_target from public.users where lower(username) = lower(p_target_username);
  if v_target is null then
    return jsonb_build_object('success', false, 'error', 'User not found');
  end if;
  if v_target.crew_id is not null then
    return jsonb_build_object('success', false, 'error', 'User is already in a crew');
  end if;

  select * into v_crew from public.crews where id = v_user.crew_id;

  -- Insert invite (unique partial index prevents duplicate pending)
  begin
    insert into public.crew_direct_invites (crew_id, invited_by, target_user_id)
    values (v_user.crew_id, v_uid, v_target.id)
    returning id into v_invite_id;
  exception when unique_violation then
    return jsonb_build_object('success', false, 'error', 'An invite to this user is already pending');
  end;

  -- Notify target
  insert into public.notification_queue (user_id, event_type, title, body, metadata)
  values (
    v_target.id,
    'crew_direct_invite',
    v_crew.name || ' invited you to join',
    v_crew.name || ' invited you to join',
    jsonb_build_object('invite_id', v_invite_id, 'crew_id', v_user.crew_id, 'invited_by', v_uid)
  );

  return jsonb_build_object('success', true, 'invite_id', v_invite_id);
end;
$$;
