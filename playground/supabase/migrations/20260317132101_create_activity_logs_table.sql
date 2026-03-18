create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  created_at timestamptz default now(),

  constraint fk_activity_user
    foreign key (user_id)
    references public.users(id)
    on delete cascade
);