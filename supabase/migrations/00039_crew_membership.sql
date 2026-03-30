-- Crew membership: join requests, direct invites, OG eligibility, tag image grants
-- ============================================================

-- ============================================================
-- 1. New Tables
-- ============================================================

-- Join requests: users request to join a crew
create table public.crew_join_requests (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  message text check (char_length(message) <= 200),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined', 'cancelled')),
  reviewed_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_join_requests_pending
  on public.crew_join_requests (user_id, crew_id)
  where status = 'pending';

create index idx_crew_join_requests_crew_pending
  on public.crew_join_requests (crew_id, created_at desc)
  where status = 'pending';

-- Direct invites: OG members invite users by username
create table public.crew_direct_invites (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  invited_by uuid not null references public.users(id) on delete cascade,
  target_user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_direct_invites_pending
  on public.crew_direct_invites (target_user_id, crew_id)
  where status = 'pending';

create index idx_crew_direct_invites_target_pending
  on public.crew_direct_invites (target_user_id, created_at desc)
  where status = 'pending';

-- User tag image grants: tracks crew-exclusive tag images granted to users
create table public.user_tag_image_grants (
  user_id uuid not null references public.users(id) on delete cascade,
  tag_image_id uuid not null references public.tag_images(id) on delete cascade,
  crew_id uuid not null references public.crews(id) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key (user_id, tag_image_id)
);

create index idx_user_tag_image_grants_user
  on public.user_tag_image_grants (user_id);

-- Alter tag_images to add crew_id column (nullable — null means public)
alter table public.tag_images
  add column crew_id uuid references public.crews(id) on delete set null;

create index idx_tag_images_crew on public.tag_images (crew_id) where crew_id is not null;

-- ============================================================
-- 2. RLS Policies
-- ============================================================

alter table public.crew_join_requests enable row level security;
alter table public.crew_direct_invites enable row level security;
alter table public.user_tag_image_grants enable row level security;

-- crew_join_requests: users read own requests
create policy "Users can read own join requests"
  on public.crew_join_requests for select
  using (auth.uid() = user_id);

-- crew_join_requests: crew members can read their crew's requests
create policy "Crew members can read crew join requests"
  on public.crew_join_requests for select
  using (
    exists (
      select 1 from public.crew_members
      where crew_members.crew_id = crew_join_requests.crew_id
        and crew_members.user_id = auth.uid()
    )
  );

-- crew_direct_invites: inviter reads own
create policy "Inviters can read own invites"
  on public.crew_direct_invites for select
  using (auth.uid() = invited_by);

-- crew_direct_invites: target reads theirs
create policy "Targets can read own invites"
  on public.crew_direct_invites for select
  using (auth.uid() = target_user_id);

-- user_tag_image_grants: users read own
create policy "Users can read own tag image grants"
  on public.user_tag_image_grants for select
  using (auth.uid() = user_id);

-- tag_images: public images (no crew_id) visible to all, crew-exclusive visible to granted users
drop policy if exists "Tag images are publicly readable" on public.tag_images;
create policy "Tag images visible to eligible users"
  on public.tag_images for select
  using (
    crew_id is null
    or exists (
      select 1 from public.user_tag_image_grants
      where user_tag_image_grants.tag_image_id = tag_images.id
        and user_tag_image_grants.user_id = auth.uid()
    )
  );

-- ============================================================
-- 3. RPCs
-- ============================================================

-- get_og_eligible_members: compute OG eligibility from 14-day activity
create or replace function get_og_eligible_members(p_crew_id uuid)
returns setof uuid language plpgsql security definer as $$
declare
  v_member_count integer;
  v_top_n integer;
  v_threshold numeric;
  v_rec record;
begin
  -- Count total crew members
  select count(*) into v_member_count
  from public.crew_members
  where crew_id = p_crew_id;

  -- Compute composite scores for all members
  -- Score = total XP (proxy for 14-day XP; no xp_events table yet) + (tags placed last 14 days * 10)
  -- TODO: Replace u.xp with delta from xp_events table when available for true 14-day scoring
  -- We use a temp result set with scores
  if v_member_count < 3 then
    -- All members eligible
    return query
      select cm.user_id
      from public.crew_members cm
      where cm.crew_id = p_crew_id;
    return;
  end if;

  -- Determine how many to return
  if v_member_count <= 10 then
    v_top_n := 3;
  else
    v_top_n := ceil(v_member_count * 0.2)::integer;
  end if;

  -- Return top N by composite score, ties included
  return query
    with scored as (
      select
        cm.user_id,
        coalesce(u.xp, 0) + coalesce(tag_counts.cnt, 0) * 10 as score
      from public.crew_members cm
      join public.users u on u.id = cm.user_id
      left join (
        select t.user_id, count(*) as cnt
        from public.tags t
        where t.crew_id = p_crew_id
          and t.created_at >= now() - interval '14 days'
        group by t.user_id
      ) tag_counts on tag_counts.user_id = cm.user_id
      where cm.crew_id = p_crew_id
    ),
    ranked as (
      select user_id, score,
        dense_rank() over (order by score desc) as rnk
      from scored
    ),
    cutoff as (
      select max(rnk) as max_rnk
      from (
        select rnk, row_number() over (order by rnk) as rn
        from (select distinct rnk from ranked order by rnk) sub
      ) sub2
      where sub2.rn <= v_top_n
    )
    select ranked.user_id
    from ranked, cutoff
    where ranked.rnk <= cutoff.max_rnk;
end;
$$;

-- request_join_crew: user requests to join a crew
create or replace function request_join_crew(p_crew_id uuid, p_message text default null)
returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid;
  v_user record;
  v_crew record;
  v_existing record;
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

  -- Check for duplicate pending request
  select * into v_existing
  from public.crew_join_requests
  where crew_id = p_crew_id and user_id = v_uid and status = 'pending';
  if v_existing is not null then
    return jsonb_build_object('success', false, 'error', 'You already have a pending request for this crew');
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

-- cancel_join_request: user cancels own pending request
create or replace function cancel_join_request(p_request_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid;
  v_request record;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select * into v_request from public.crew_join_requests where id = p_request_id;
  if v_request is null then
    return jsonb_build_object('success', false, 'error', 'Request not found');
  end if;
  if v_request.user_id != v_uid then
    return jsonb_build_object('success', false, 'error', 'Not your request');
  end if;
  if v_request.status != 'pending' then
    return jsonb_build_object('success', false, 'error', 'Request is not pending');
  end if;

  update public.crew_join_requests
  set status = 'cancelled', updated_at = now()
  where id = p_request_id;

  return jsonb_build_object('success', true);
end;
$$;

-- review_join_request: OG-eligible member approves or declines
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

  -- Check reviewer is OG-eligible for this crew
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

-- send_direct_invite: OG-eligible member invites a user by username
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

  -- Check caller is OG-eligible
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

  -- Insert invite
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

-- respond_direct_invite: target user accepts or declines
create or replace function respond_direct_invite(p_invite_id uuid, p_accepted boolean)
returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid;
  v_invite record;
  v_crew record;
  v_user record;
  v_grant_image record;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select * into v_invite from public.crew_direct_invites where id = p_invite_id;
  if v_invite is null then
    return jsonb_build_object('success', false, 'error', 'Invite not found');
  end if;
  if v_invite.target_user_id != v_uid then
    return jsonb_build_object('success', false, 'error', 'Not your invite');
  end if;
  if v_invite.status != 'pending' then
    return jsonb_build_object('success', false, 'error', 'Invite is not pending');
  end if;

  -- Check expiry
  if v_invite.expires_at < now() then
    update public.crew_direct_invites
    set status = 'expired', updated_at = now()
    where id = p_invite_id;
    return jsonb_build_object('success', false, 'error', 'Invite has expired');
  end if;

  select * into v_crew from public.crews where id = v_invite.crew_id;
  select * into v_user from public.users where id = v_uid;

  if p_accepted then
    -- Verify caller is still crewless (race condition guard)
    if v_user.crew_id is not null then
      return jsonb_build_object('success', false, 'error', 'Already in a crew');
    end if;

    -- Add to crew_members
    insert into public.crew_members (crew_id, user_id, role)
    values (v_invite.crew_id, v_uid, 'member')
    on conflict do nothing;

    -- Update user's crew_id
    update public.users set crew_id = v_invite.crew_id where id = v_uid;

    -- Grant crew-exclusive tag images
    for v_grant_image in
      select id from public.tag_images where crew_id = v_invite.crew_id
    loop
      insert into public.user_tag_image_grants (user_id, tag_image_id, crew_id)
      values (v_uid, v_grant_image.id, v_invite.crew_id)
      on conflict do nothing;
    end loop;

    -- Cancel other pending requests/invites
    update public.crew_join_requests
    set status = 'cancelled', updated_at = now()
    where user_id = v_uid and status = 'pending';

    update public.crew_direct_invites
    set status = 'cancelled', updated_at = now()
    where target_user_id = v_uid and status = 'pending' and id != p_invite_id;

    -- Mark accepted
    update public.crew_direct_invites
    set status = 'accepted', updated_at = now()
    where id = p_invite_id;

    -- Notify inviter
    insert into public.notification_queue (user_id, event_type, title, body, metadata)
    values (
      v_invite.invited_by,
      'crew_invite_accepted',
      v_user.username || ' accepted your invite to ' || v_crew.name,
      v_user.username || ' accepted your invite to ' || v_crew.name,
      jsonb_build_object('crew_id', v_invite.crew_id, 'target_user_id', v_uid)
    );
  else
    -- Decline
    update public.crew_direct_invites
    set status = 'declined', updated_at = now()
    where id = p_invite_id;

    -- Notify inviter
    insert into public.notification_queue (user_id, event_type, title, body, metadata)
    values (
      v_invite.invited_by,
      'crew_invite_declined',
      v_user.username || ' declined your invite to ' || v_crew.name,
      v_user.username || ' declined your invite to ' || v_crew.name,
      jsonb_build_object('crew_id', v_invite.crew_id, 'target_user_id', v_uid)
    );
  end if;

  return jsonb_build_object('success', true);
end;
$$;

-- Extend leave_crew: also revoke tag image grants
create or replace function leave_crew()
returns jsonb language plpgsql security definer as $$
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
  if v_user.crew_id is null then
    return jsonb_build_object('success', false, 'error', 'Not in a crew');
  end if;

  v_crew_id := v_user.crew_id;

  -- Founders cannot leave — must transfer or disband
  if exists (select 1 from public.crews where id = v_crew_id and founder_id = v_uid) then
    return jsonb_build_object('success', false, 'error', 'Founders cannot leave — transfer ownership or disband first');
  end if;

  -- Remove from crew_members
  delete from public.crew_members where crew_id = v_crew_id and user_id = v_uid;

  -- Clear user's crew_id
  update public.users set crew_id = null where id = v_uid;

  -- Revoke crew-exclusive tag image grants
  delete from public.user_tag_image_grants where user_id = v_uid and crew_id = v_crew_id;

  return jsonb_build_object('success', true);
end;
$$;
