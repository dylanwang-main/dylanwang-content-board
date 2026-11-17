-- Reverts 0007: YouTube sync stays public-only, so visibility isn't tracked.
alter table public.youtube_videos drop column if exists privacy_status;
