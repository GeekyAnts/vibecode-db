-- ============================================================
-- Enable RLS on all tables
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.courses         enable row level security;
alter table public.lessons         enable row level security;
alter table public.enrollments     enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.notes           enable row level security;
alter table public.certificates    enable row level security;
alter table public.bookmarks       enable row level security;

-- ============================================================
-- profiles
-- ============================================================
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- courses
-- ============================================================
create policy "courses_select_published"
  on public.courses for select
  using (is_published = true);

create policy "courses_insert_authenticated"
  on public.courses for insert
  to authenticated
  with check (true);

create policy "courses_update_authenticated"
  on public.courses for update
  to authenticated
  using (true)
  with check (true);

create policy "courses_delete_authenticated"
  on public.courses for delete
  to authenticated
  using (true);

-- ============================================================
-- lessons
-- ============================================================
create policy "lessons_select_published_course"
  on public.lessons for select
  using (
    exists (
      select 1 from public.courses
      where courses.id = lessons.course_id
        and courses.is_published = true
    )
  );

create policy "lessons_insert_authenticated"
  on public.lessons for insert
  to authenticated
  with check (true);

create policy "lessons_update_authenticated"
  on public.lessons for update
  to authenticated
  using (true)
  with check (true);

create policy "lessons_delete_authenticated"
  on public.lessons for delete
  to authenticated
  using (true);

-- ============================================================
-- enrollments
-- ============================================================
create policy "enrollments_select_own"
  on public.enrollments for select
  using (auth.uid() = user_id);

create policy "enrollments_insert_own"
  on public.enrollments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "enrollments_update_own"
  on public.enrollments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "enrollments_delete_own"
  on public.enrollments for delete
  using (auth.uid() = user_id);

-- ============================================================
-- lesson_progress
-- ============================================================
create policy "lesson_progress_select_own"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "lesson_progress_insert_own"
  on public.lesson_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "lesson_progress_update_own"
  on public.lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "lesson_progress_delete_own"
  on public.lesson_progress for delete
  using (auth.uid() = user_id);

-- ============================================================
-- notes
-- ============================================================
create policy "notes_select_own"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "notes_insert_own"
  on public.notes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "notes_update_own"
  on public.notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notes_delete_own"
  on public.notes for delete
  using (auth.uid() = user_id);

-- ============================================================
-- certificates
-- ============================================================
create policy "certificates_select_own"
  on public.certificates for select
  using (auth.uid() = user_id);

-- Insert is trigger-only; no direct insert policy for users.

-- ============================================================
-- bookmarks
-- ============================================================
create policy "bookmarks_select_public"
  on public.bookmarks for select
  using (true);

create policy "bookmarks_insert_own"
  on public.bookmarks for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "bookmarks_delete_own"
  on public.bookmarks for delete
  using (auth.uid() = user_id);
