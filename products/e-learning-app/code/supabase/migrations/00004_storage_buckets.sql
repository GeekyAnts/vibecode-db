-- ============================================================
-- Storage buckets
-- ============================================================

-- avatars: public, 5 MB, images only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- content: public, 10 MB, images only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content',
  'content',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- private: owner-only, 10 MB, images + pdf
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'private',
  'private',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
);

-- ============================================================
-- Storage RLS policies
-- ============================================================

-- avatars: anyone can read, authenticated users can upload/update/delete their own
create policy "avatars_select_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_insert_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- content: anyone can read, authenticated users can upload/update/delete
create policy "content_select_public"
  on storage.objects for select
  using (bucket_id = 'content');

create policy "content_insert_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'content');

create policy "content_update_authenticated"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'content')
  with check (bucket_id = 'content');

create policy "content_delete_authenticated"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'content');

-- private: owner-only access
create policy "private_select_own"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'private' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "private_insert_own"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'private' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "private_update_own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'private' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'private' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "private_delete_own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'private' and (storage.foldername(name))[1] = auth.uid()::text);
