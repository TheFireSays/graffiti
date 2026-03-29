-- Enable RLS on all public tables
alter table public.users enable row level security;
alter table public.crews enable row level security;
alter table public.crew_members enable row level security;
alter table public.invites enable row level security;
alter table public.tag_images enable row level security;
alter table public.zones enable row level security;
alter table public.tags enable row level security;
alter table public.restricted_zones enable row level security;
alter table public.reports enable row level security;
alter table public.activity_feed enable row level security;

-- ============================================================
-- USERS
-- ============================================================
create policy "Users are publicly readable"
  on public.users for select using (true);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);

-- ============================================================
-- CREWS
-- ============================================================
create policy "Crews are publicly readable"
  on public.crews for select using (true);

create policy "Authenticated users can create crews"
  on public.crews for insert with check (auth.uid() = founder_id);

create policy "Founders can update their crew"
  on public.crews for update
  using (auth.uid() = founder_id) with check (auth.uid() = founder_id);

-- ============================================================
-- CREW MEMBERS
-- ============================================================
create policy "Crew members are publicly readable"
  on public.crew_members for select using (true);

create policy "Users can join crews"
  on public.crew_members for insert with check (auth.uid() = user_id);

create policy "Users can leave crews"
  on public.crew_members for delete using (auth.uid() = user_id);

-- ============================================================
-- INVITES
-- ============================================================
create policy "Crew members can read their crew invites"
  on public.invites for select
  using (
    exists (
      select 1 from public.crew_members
      where crew_members.crew_id = invites.crew_id
        and crew_members.user_id = auth.uid()
    )
  );

create policy "Crew founders and core can create invites"
  on public.invites for insert
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from public.crew_members
      where crew_members.crew_id = invites.crew_id
        and crew_members.user_id = auth.uid()
        and crew_members.role in ('og', 'core')
    )
  );

-- ============================================================
-- TAG IMAGES
-- ============================================================
create policy "Tag images are publicly readable"
  on public.tag_images for select using (true);

-- ============================================================
-- ZONES
-- ============================================================
create policy "Zones are publicly readable"
  on public.zones for select using (true);

-- ============================================================
-- TAGS
-- ============================================================
create policy "Tags are publicly readable"
  on public.tags for select using (true);

create policy "Authenticated users can create tags"
  on public.tags for insert with check (auth.uid() = user_id);

-- ============================================================
-- RESTRICTED ZONES
-- ============================================================
create policy "Restricted zones are publicly readable"
  on public.restricted_zones for select using (true);

-- ============================================================
-- REPORTS
-- ============================================================
create policy "Users can read own reports"
  on public.reports for select using (auth.uid() = reporter_id);

create policy "Authenticated users can create reports"
  on public.reports for insert with check (auth.uid() = reporter_id);

-- ============================================================
-- ACTIVITY FEED
-- ============================================================
create policy "Activity feed is publicly readable"
  on public.activity_feed for select using (true);
