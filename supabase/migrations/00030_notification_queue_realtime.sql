-- Enable realtime on notification_queue so clients receive live updates
alter publication supabase_realtime add table public.notification_queue;
