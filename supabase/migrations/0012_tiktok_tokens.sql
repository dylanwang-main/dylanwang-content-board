-- TikTok OAuth tokens. RLS on with no policies: only the tiktok edge function
-- (service role) can read or write them.
create table if not exists public.tiktok_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  open_id text,
  scope text,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  refresh_expires_at timestamptz,
  updated_at timestamptz default now()
);
alter table public.tiktok_tokens enable row level security;
revoke all on public.tiktok_tokens from anon, authenticated;

alter table public.profiles add column if not exists tiktok_connected_at timestamptz;
