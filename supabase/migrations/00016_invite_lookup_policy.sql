-- Allow authenticated users to look up invites by code (needed for joining)
create policy "Authenticated users can look up invites by code"
  on public.invites for select
  using (auth.uid() is not null);

-- Allow the invite use_count to be updated by the joining user
create policy "Authenticated users can update invite use_count"
  on public.invites for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
