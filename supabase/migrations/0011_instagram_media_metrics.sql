alter table public.instagram_media
  add column if not exists media_product_type text,
  add column if not exists is_shared_to_feed boolean,
  add column if not exists view_count double precision,
  add column if not exists shares_count double precision,
  add column if not exists saved_count double precision;
