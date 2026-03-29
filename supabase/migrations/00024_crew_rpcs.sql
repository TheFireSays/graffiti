-- SECURITY FIX: Replace client-orchestrated crew mutations with atomic RPCs.
-- All three RPCs derive identity from auth.uid().

-- ============================================================
-- create_crew(p_name, p_abbreviation, p_color)
-- ============================================================
create or replace function create_crew(
  p_name text,
  p_abbreviation text,
  p_color text
) returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid;
  v_user record;
  v_crew_id uuid;
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

  -- Create the crew
  insert into public.crews (name, abbreviation, color, founder_id)
  values (p_name, upper(p_abbreviation), p_color, v_uid)
  returning id into v_crew_id;

  -- Add founder as OG member
  insert into public.crew_members (crew_id, user_id, role)
  values (v_crew_id, v_uid, 'og');

  -- Update user's crew_id
  update public.users set crew_id = v_crew_id where id = v_uid;

  return jsonb_build_object('success', true, 'crew_id', v_crew_id);
end;
$$;

-- ============================================================
-- join_crew(p_invite_code)
-- ============================================================
create or replace function join_crew(
  p_invite_code text
) returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid;
  v_user record;
  v_invite record;
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

  -- Find and validate invite
  select * into v_invite from public.invites where code = trim(p_invite_code);
  if v_invite is null then
    return jsonb_build_object('success', false, 'error', 'Invalid invite code');
  end if;
  if v_invite.use_count >= v_invite.max_uses then
    return jsonb_build_object('success', false, 'error', 'This invite has been fully used');
  end if;
  if v_invite.expires_at is not null and v_invite.expires_at < now() then
    return jsonb_build_object('success', false, 'error', 'This invite has expired');
  end if;

  -- Add user as member
  begin
    insert into public.crew_members (crew_id, user_id, role)
    values (v_invite.crew_id, v_uid, 'member');
  exception when unique_violation then
    return jsonb_build_object('success', false, 'error', 'You are already in this crew');
  end;

  -- Update user's crew_id
  update public.users set crew_id = v_invite.crew_id where id = v_uid;

  -- Increment invite use_count
  update public.invites set use_count = use_count + 1 where id = v_invite.id;

  return jsonb_build_object('success', true, 'crew_id', v_invite.crew_id);
end;
$$;

-- ============================================================
-- leave_crew()
-- ============================================================
create or replace function leave_crew()
returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid;
  v_user record;
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
    return jsonb_build_object('success', false, 'error', 'Not in a crew');
  end if;

  -- Founders cannot leave — must transfer or disband
  if exists (select 1 from public.crews where id = v_user.crew_id and founder_id = v_uid) then
    return jsonb_build_object('success', false, 'error', 'Founders cannot leave — transfer ownership or disband first');
  end if;

  -- Remove from crew_members
  delete from public.crew_members where crew_id = v_user.crew_id and user_id = v_uid;

  -- Clear user's crew_id
  update public.users set crew_id = null where id = v_uid;

  return jsonb_build_object('success', true);
end;
$$;

-- ============================================================
-- Lock down direct client writes — all crew mutations via RPC
-- ============================================================
drop policy if exists "Users can join crews" on public.crew_members;
drop policy if exists "Users can leave crews" on public.crew_members;

-- Revoke direct INSERT on invites use_count updates
-- Keep invite creation policy (OG/core only) since createInvite still uses direct insert
-- and that's fine — it's a single insert with proper RLS checks.
