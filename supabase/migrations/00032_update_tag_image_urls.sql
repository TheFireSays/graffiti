-- Update tag_images to use placeholder marker
-- These will be replaced with real Supabase Storage URLs once actual images are uploaded
-- For MVP, tag images render as colored boxes in the UI (already working)

update public.tag_images
set image_url = 'placeholder'
where image_url like '/tags/%';
