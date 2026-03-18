create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  task_id uuid not null,
  parent_comment_id uuid,
  content text not null,
  created_at timestamptz default now(),

  constraint fk_comment_user
    foreign key (user_id)
    references public.users(id)
    on delete cascade,

  constraint fk_comment_task
    foreign key (task_id)
    references public.tasks(id)
    on delete cascade,

  constraint fk_parent_comment
    foreign key (parent_comment_id)
    references public.comments(id)
    on delete cascade
);