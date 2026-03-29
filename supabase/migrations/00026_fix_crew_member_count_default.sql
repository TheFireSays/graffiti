-- FIX: crew member_count default from 1 to 0
-- The trigger on crew_members INSERT increments to 1 when founder is added.
-- Starting at 1 causes off-by-one (shows 2 after founder joins).

alter table public.crews alter column member_count set default 0;
