-- Guests are short demo visits: clean them up after 24 hours instead of 7 days.
create or replace function public.delete_stale_guests() returns integer
language sql security definer set search_path = '' as $$
  with gone as (
    delete from auth.users
     where is_anonymous and created_at < now() - interval '24 hours'
    returning 1
  )
  select count(*)::integer from gone;
$$;
revoke execute on function public.delete_stale_guests() from public, anon, authenticated;
