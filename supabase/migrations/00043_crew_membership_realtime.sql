-- Enable Supabase Realtime on crew membership tables for live UI updates
alter publication supabase_realtime add table public.crew_join_requests;
alter publication supabase_realtime add table public.crew_direct_invites;
alter publication supabase_realtime add table public.crew_members;
