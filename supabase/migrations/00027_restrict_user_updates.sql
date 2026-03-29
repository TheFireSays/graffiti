-- SECURITY FIX: Remove wide-open UPDATE policy on users.
-- Replace with an RPC that only touches safe profile fields.
-- Game stats (xp, level, spray_cans) can only be modified by security definer RPCs.

drop policy if exists "Users can update own profile" on public.users;

-- Safe profile update RPC
create or replace function update_profile(
  p_username text default null,
  p_display_name text default null,
  p_avatar_url text default null
) returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  update public.users
  set
    username = coalesce(p_username, username),
    display_name = coalesce(p_display_name, display_name),
    avatar_url = coalesce(p_avatar_url, avatar_url)
  where id = v_uid;

  return jsonb_build_object('success', true);
end;
$$;
