-- Public bucket for files that need a permanent URL (the logo / favicon).
-- Anyone can read; each signed-in user can only write inside their own folder.
insert into storage.buckets (id, name, public) values ('public-assets', 'public-assets', true)
  on conflict (id) do nothing;

create policy "public_assets_own_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'public-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "public_assets_own_update" on storage.objects for update to authenticated
  using (bucket_id = 'public-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "public_assets_own_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'public-assets' and (storage.foldername(name))[1] = auth.uid()::text);
