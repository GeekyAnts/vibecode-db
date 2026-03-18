create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid not null,
  role text default 'member',
  joined_at timestamptz default now(),

  constraint fk_member_user
    foreign key (user_id)
    references public.users(id)
    on delete cascade,

  constraint fk_member_project
    foreign key (project_id)
    references public.projects(id)
    on delete cascade,

  constraint unique_membership
    unique (user_id, project_id)
);