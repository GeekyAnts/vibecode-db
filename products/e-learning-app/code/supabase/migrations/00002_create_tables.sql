-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  email      text unique not null,
  full_name  text not null default '',
  username   text unique,
  avatar_url text not null default '',
  bio        text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- courses
-- ============================================================
create table public.courses (
  id                uuid primary key default uuid_generate_v4(),
  title             text not null,
  description       text not null default '',
  instructor_name   text not null default '',
  instructor_avatar text not null default '',
  category          text not null check (category in ('programming', 'design', 'business', 'marketing', 'data-science', 'ai-ml')),
  difficulty        text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  duration_hours    numeric not null default 0,
  image_url         text not null default '',
  rating            numeric(2,1) not null default 0,
  enrolled_count    int not null default 0,
  lessons_count     int not null default 0,
  price             numeric not null default 0,
  is_published      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger courses_updated_at
  before update on public.courses
  for each row execute function public.handle_updated_at();

-- ============================================================
-- lessons
-- ============================================================
create table public.lessons (
  id               uuid primary key default uuid_generate_v4(),
  course_id        uuid not null references public.courses on delete cascade,
  title            text not null,
  description      text not null default '',
  content          text not null default '',
  duration_minutes int not null default 0,
  order_index      int not null default 0,
  video_url        text not null default '',
  is_free          boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger lessons_updated_at
  before update on public.lessons
  for each row execute function public.handle_updated_at();

-- ============================================================
-- enrollments
-- ============================================================
create table public.enrollments (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.profiles on delete cascade,
  course_id             uuid not null references public.courses on delete cascade,
  progress_percentage   numeric not null default 0,
  started_at            timestamptz not null default now(),
  completed_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (user_id, course_id)
);

create trigger enrollments_updated_at
  before update on public.enrollments
  for each row execute function public.handle_updated_at();

-- ============================================================
-- lesson_progress
-- ============================================================
create table public.lesson_progress (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  lesson_id       uuid not null references public.lessons on delete cascade,
  is_completed    boolean not null default false,
  watched_seconds int not null default 0,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create trigger lesson_progress_updated_at
  before update on public.lesson_progress
  for each row execute function public.handle_updated_at();

-- ============================================================
-- notes
-- ============================================================
create table public.notes (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles on delete cascade,
  lesson_id         uuid not null references public.lessons on delete cascade,
  content           text not null,
  timestamp_seconds int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.handle_updated_at();

-- ============================================================
-- certificates
-- ============================================================
create table public.certificates (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles on delete cascade,
  course_id  uuid not null references public.courses on delete cascade,
  issued_at  timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ============================================================
-- bookmarks
-- ============================================================
create table public.bookmarks (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles on delete cascade,
  course_id  uuid not null references public.courses on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ============================================================
-- Auth trigger: auto-create profile on signup
-- ============================================================
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
