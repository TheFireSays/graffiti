-- Tag images: the curated library of tag artwork
create table public.tag_images (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text not null,
  category text not null check (category in ('tag', 'throwup', 'piece')),
  tier integer not null default 1,
  is_premium boolean not null default false,
  is_brand boolean not null default false,
  customizable_colors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Index for filtering by category and tier (tag library browsing)
create index idx_tag_images_category_tier on public.tag_images (category, tier);

comment on table public.tag_images is 'Curated library of tag artwork available to users';
