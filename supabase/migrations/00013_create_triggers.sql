-- ============================================================
-- SIGNUP TRIGGER: create public.users profile on auth signup
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, username, display_name)
  values (
    NEW.id,
    split_part(NEW.email, '@', 1),
    split_part(NEW.email, '@', 1)
  )
  on conflict (id) do nothing;
  return NEW;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- crews.member_count
-- ============================================================
create or replace function update_crew_member_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    update public.crews set member_count = member_count + 1 where id = NEW.crew_id;
  elsif TG_OP = 'DELETE' then
    update public.crews set member_count = greatest(0, member_count - 1) where id = OLD.crew_id;
  end if;
  return null;
end;
$$;

create trigger trg_crew_member_count
  after insert or delete on public.crew_members
  for each row execute function update_crew_member_count();

-- ============================================================
-- crews.total_xp
-- ============================================================
create or replace function update_crew_total_xp()
returns trigger language plpgsql security definer as $$
begin
  if OLD.xp is distinct from NEW.xp or OLD.crew_id is distinct from NEW.crew_id then
    if NEW.crew_id is not null then
      update public.crews
        set total_xp = (
          select coalesce(sum(xp), 0) from public.users where crew_id = NEW.crew_id
        )
        where id = NEW.crew_id;
    end if;
    if OLD.crew_id is not null and OLD.crew_id is distinct from NEW.crew_id then
      update public.crews
        set total_xp = (
          select coalesce(sum(xp), 0) from public.users where crew_id = OLD.crew_id
        )
        where id = OLD.crew_id;
    end if;
  end if;
  return null;
end;
$$;

create trigger trg_crew_total_xp
  after update on public.users
  for each row execute function update_crew_total_xp();

-- ============================================================
-- zones.tag_counts
-- ============================================================
create or replace function update_zone_tag_counts()
returns trigger language plpgsql security definer as $$
declare
  v_zone_id uuid;
begin
  v_zone_id := coalesce(NEW.zone_id, OLD.zone_id);
  if v_zone_id is null then
    return null;
  end if;

  update public.zones
    set tag_counts = (
      select coalesce(jsonb_object_agg(crew_id::text, cnt), '{}')
      from (
        select crew_id, count(*) as cnt
        from public.tags
        where zone_id = v_zone_id
          and status = 'active'
          and crew_id is not null
        group by crew_id
      ) sub
    )
    where id = v_zone_id;

  return null;
end;
$$;

create trigger trg_zone_tag_counts
  after insert or update or delete on public.tags
  for each row execute function update_zone_tag_counts();
