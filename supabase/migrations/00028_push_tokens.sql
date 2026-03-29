-- Push tokens table: stores Expo push tokens per user/device
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('ios', 'android', 'web')),
  created_at timestamptz not null default now(),
  unique (user_id, token)
);

-- RLS: users can only see/manage their own tokens
alter table public.push_tokens enable row level security;

create policy "Users can read own tokens"
  on public.push_tokens for select
  using (auth.uid() = user_id);

create policy "Users can insert own tokens"
  on public.push_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own tokens"
  on public.push_tokens for delete
  using (auth.uid() = user_id);

-- RPC: register push token (upsert — idempotent)
create or replace function register_push_token(
  p_token text,
  p_platform text
) returns jsonb language plpgsql security definer as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  if p_platform not in ('ios', 'android', 'web') then
    return jsonb_build_object('success', false, 'error', 'Invalid platform');
  end if;

  insert into public.push_tokens (user_id, token, platform)
  values (v_user_id, p_token, p_platform)
  on conflict (user_id, token) do nothing;

  return jsonb_build_object('success', true);
end;
$$;

-- RPC: unregister push token (for sign-out cleanup)
create or replace function unregister_push_token(
  p_token text
) returns jsonb language plpgsql security definer as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  delete from public.push_tokens
  where user_id = v_user_id and token = p_token;

  return jsonb_build_object('success', true);
end;
$$;
