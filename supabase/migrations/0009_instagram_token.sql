-- Instagram access token for the owner's own account (generated in the Meta
-- developer dashboard). profiles rows are readable only by their owner (RLS).
alter table public.profiles
  add column if not exists instagram_token text,
  add column if not exists instagram_token_refreshed_at timestamptz;
