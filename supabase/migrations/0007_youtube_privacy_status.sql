-- Visibility of each synced YouTube video. Only known when the owner connects
-- their Google account; an API-key sync can only see public videos.
alter table public.youtube_videos
  add column if not exists privacy_status text
  check (privacy_status in ('public', 'unlisted', 'private'));
