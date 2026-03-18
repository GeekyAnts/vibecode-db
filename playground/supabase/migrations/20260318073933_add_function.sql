-- supabase/migrations/20260318123456_add_function.sql

create or replace function public.add(a integer, b integer)
returns integer
language sql
as $$
  select a + b;
$$;