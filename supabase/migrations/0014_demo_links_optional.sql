-- Demo posts have no real Instagram/TikTok link.
alter table public.instagram_media alter column permalink drop not null;
alter table public.tiktok_media alter column share_url drop not null;
