-- Enable Supabase Realtime on tables that need live updates
alter publication supabase_realtime add table public.activity_feed;
alter publication supabase_realtime add table public.tags;
alter publication supabase_realtime add table public.zones;
