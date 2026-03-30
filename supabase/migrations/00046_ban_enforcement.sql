-- Ban Enforcement
-- Add ban checks to crew RPCs and auto-unban expired bans

-- Helper: check if user is banned (with auto-unban for expired bans)
create or replace function public.check_ban_status(p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user record;
begin
  select is_banned, banned_until, ban_reason into v_user
    from public.users where id = p_user_id;

  if not found then
    return jsonb_build_object('banned', false);
  end if;

  -- Auto-unban if ban expired
  if v_user.is_banned and v_user.banned_until is not null and v_user.banned_until < now() then
    update public.users
      set is_banned = false, banned_until = null, ban_reason = null
      where id = p_user_id;
    return jsonb_build_object('banned', false);
  end if;

  if v_user.is_banned then
    return jsonb_build_object(
      'banned', true,
      'message', 'Your account is suspended until ' ||
        coalesce(to_char(v_user.banned_until, 'YYYY-MM-DD'), 'further notice') ||
        ': ' || coalesce(v_user.ban_reason, 'policy violation')
    );
  end if;

  return jsonb_build_object('banned', false);
end;
$$;

-- Replace create_crew with ban check
create or replace function create_crew(
  p_name text,
  p_abbreviation text,
  p_color text
) returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid;
  v_user record;
  v_crew_id uuid;
  v_ban jsonb;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Check ban status
  v_ban := public.check_ban_status(v_uid);
  if (v_ban->>'banned')::boolean then
    return jsonb_build_object('success', false, 'error', v_ban->>'message');
  end if;

  select * into v_user from public.users where id = v_uid;
  if v_user is null then
    return jsonb_build_object('success', false, 'error', 'User not found');
  end if;
  if v_user.crew_id is not null then
    return jsonb_build_object('success', false, 'error', 'Already in a crew');
  end if;

  insert into public.crews (name, abbreviation, color, founder_id)
  values (p_name, upper(p_abbreviation), p_color, v_uid)
  returning id into v_crew_id;

  insert into public.crew_members (crew_id, user_id, role)
  values (v_crew_id, v_uid, 'og');

  update public.users set crew_id = v_crew_id where id = v_uid;

  return jsonb_build_object('success', true, 'crew_id', v_crew_id);
end;
$$;

-- Replace join_crew with ban check
create or replace function join_crew(p_invite_code text)
returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid;
  v_user record;
  v_invite record;
  v_ban jsonb;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Check ban status
  v_ban := public.check_ban_status(v_uid);
  if (v_ban->>'banned')::boolean then
    return jsonb_build_object('success', false, 'error', v_ban->>'message');
  end if;

  select * into v_user from public.users where id = v_uid;
  if v_user is null then
    return jsonb_build_object('success', false, 'error', 'User not found');
  end if;
  if v_user.crew_id is not null then
    return jsonb_build_object('success', false, 'error', 'Already in a crew');
  end if;

  select * into v_invite from public.invites
    where code = p_invite_code
      and expires_at > now()
      and (max_uses is null or use_count < max_uses);
  if not found then
    return jsonb_build_object('success', false, 'error', 'Invalid or expired invite');
  end if;

  insert into public.crew_members (crew_id, user_id, role)
  values (v_invite.crew_id, v_uid, 'member');

  update public.users set crew_id = v_invite.crew_id where id = v_uid;
  update public.invites set use_count = use_count + 1 where id = v_invite.id;

  return jsonb_build_object('success', true, 'crew_id', v_invite.crew_id);
end;
$$;
