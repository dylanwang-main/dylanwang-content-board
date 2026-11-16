-- Fixes from the Supabase security advisor after 0001_init.
-- 1. Pin the trigger function's search_path so it can't be hijacked by a same-named object.
alter function public.touch_updated_date() set search_path = '';

-- 2. handle_new_user only runs from the auth.users trigger; nobody should call it over the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
