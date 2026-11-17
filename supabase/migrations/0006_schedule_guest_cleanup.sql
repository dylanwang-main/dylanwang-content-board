-- Run delete_stale_guests() nightly at 03:17 UTC so guest demo accounts
-- (and their sandbox data) are removed once they're older than 24 hours.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('delete-stale-guests', '17 3 * * *', $$select public.delete_stale_guests()$$);
