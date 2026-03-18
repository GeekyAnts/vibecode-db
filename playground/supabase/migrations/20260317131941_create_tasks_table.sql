create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  title text not null,
  status text default 'todo',
  created_at timestamptz default now(),

  constraint fk_project
    foreign key (project_id)
    references public.projects(id)
    on delete cascade
);