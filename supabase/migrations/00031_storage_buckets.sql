-- Create storage buckets for tag images and user avatars

-- Tag images bucket: public read, admin write
insert into storage.buckets (id, name, public)
values ('tag-images', 'tag-images', true);

-- Avatars bucket: public read, authenticated users can upload their own
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Policy: anyone can read tag images
create policy "Public read tag images"
  on storage.objects for select
  using (bucket_id = 'tag-images');

-- Policy: anyone can read avatars
create policy "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Policy: authenticated users can upload their own avatar
-- File path must be: avatars/<user_id>/<filename>
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: authenticated users can update their own avatar
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: authenticated users can delete their own avatar
create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
