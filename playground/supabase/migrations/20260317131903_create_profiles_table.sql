create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),

  constraint fk_user
    foreign key (user_id)
    references public.users(id)
    on delete cascade
);