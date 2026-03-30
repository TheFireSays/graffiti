-- Admin Role System
-- Adds role column, ban metadata, and helper functions

-- Add role column to users
alter table public.users
  add column role text default 'user'
  check (role in ('user', 'moderator', 'admin'));

-- Add ban metadata (supplements existing is_banned boolean)
alter table public.users
  add column banned_until timestamptz,
  add column ban_reason text;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: check if current user is moderator or admin
create or replace function public.is_moderator()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role in ('moderator', 'admin')
  );
$$;

-- Admins/moderators can read all reports
create policy "reports_admin_select" on public.reports
  for select to authenticated
  using (public.is_moderator());

-- Admins/moderators can update reports
create policy "reports_admin_update" on public.reports
  for update to authenticated
  using (public.is_moderator());
