create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  description text,
  created_at timestamptz default now(),

  constraint fk_project_owner
    foreign key (owner_id)
    references public.users(id)
    on delete cascade
);