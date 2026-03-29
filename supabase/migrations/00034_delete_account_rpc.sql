-- Soft delete: set is_banned, clear PII, unregister push tokens
create or replace function delete_account()
returns jsonb language plpgsql security definer as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Clear PII and ban the account
  update public.users
  set is_banned = true,
      username = 'deleted_' || substr(v_user_id::text, 1, 8),
      display_name = 'Deleted User',
      avatar_url = null,
      crew_id = null
  where id = v_user_id;

  -- Remove crew membership
  delete from public.crew_members where user_id = v_user_id;

  -- Remove push tokens
  delete from public.push_tokens where user_id = v_user_id;

  return jsonb_build_object('success', true);
end;
$$;
