-- USERS
insert into public.users (id, email, name) values
('11111111-1111-1111-1111-111111111111','alice@test.com','Alice'),
('22222222-2222-2222-2222-222222222222','bob@test.com','Bob'),
('33333333-3333-3333-3333-333333333333','charlie@test.com','Charlie'),
('44444444-4444-4444-4444-444444444444','david@test.com','David'),
('55555555-5555-5555-5555-555555555555','emma@test.com','Emma'),
('66666666-6666-6666-6666-666666666666','frank@test.com','Frank');



-- PROFILES (remove id)
insert into public.profiles (user_id, avatar_url, bio) values
('11111111-1111-1111-1111-111111111111','https://i.pravatar.cc/150?img=1','Fitness enthusiast'),
('22222222-2222-2222-2222-222222222222','https://i.pravatar.cc/150?img=2','Backend developer'),
('33333333-3333-3333-3333-333333333333','https://i.pravatar.cc/150?img=3','UI Designer'),
('44444444-4444-4444-4444-444444444444','https://i.pravatar.cc/150?img=4','Mobile dev'),
('55555555-5555-5555-5555-555555555555','https://i.pravatar.cc/150?img=5','Product manager'),
('66666666-6666-6666-6666-666666666666','https://i.pravatar.cc/150?img=6','DevOps engineer');



-- PROJECTS
insert into public.projects (owner_id, name, description) values
('11111111-1111-1111-1111-111111111111','Fitness App','Track workouts'),
('22222222-2222-2222-2222-222222222222','AI Chatbot','Conversational AI'),
('33333333-3333-3333-3333-333333333333','Design System','Reusable UI components'),
('44444444-4444-4444-4444-444444444444','Travel Planner','Plan trips'),
('55555555-5555-5555-5555-555555555555','Project Manager','Team collaboration'),
('66666666-6666-6666-6666-666666666666','DevOps Toolkit','Automation tools');



-- TASKS
insert into public.tasks (project_id, title, status)
select id,'Create database schema','todo'
from public.projects limit 1;



-- COMMENTS
insert into public.comments (user_id, task_id, content)
select
'11111111-1111-1111-1111-111111111111',
id,
'Start with database design'
from public.tasks limit 1;



-- ACTIVITY LOGS
insert into public.activity_logs (user_id, entity_type, entity_id, action)
select
'11111111-1111-1111-1111-111111111111',
'project',
id,
'created'
from public.projects limit 1;

-- Owners
insert into public.project_members (user_id, project_id, role)
select owner_id, id, 'owner'
from public.projects;

-- Members
insert into public.project_members (user_id, project_id, role)
select 
  u.id,
  p.id,
  'member'
from public.users u
cross join public.projects p
where u.id != p.owner_id
limit 10;