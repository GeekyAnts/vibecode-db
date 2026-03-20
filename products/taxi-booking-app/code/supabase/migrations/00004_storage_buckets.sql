-- 00004_storage_buckets.sql

-- Avatars bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- App content bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content',
  'content',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Private uploads bucket (authenticated only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'private',
  'private',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'application/pdf']
);

-- Storage RLS Policies
create policy "avatars_select_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_update_own"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "content_select_public"
  on storage.objects for select
  using (bucket_id = 'content');

create policy "content_insert_authenticated"
  on storage.objects for insert
  with check (
    bucket_id = 'content'
    and auth.role() = 'authenticated'
  );

create policy "private_owner_only"
  on storage.objects for all
  using (
    bucket_id = 'private'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
