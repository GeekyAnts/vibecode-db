-- 00003_rls_policies.sql
-- Row Level Security for all tables

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.drivers enable row level security;
alter table public.saved_places enable row level security;
alter table public.rides enable row level security;
alter table public.ride_ratings enable row level security;
alter table public.payment_methods enable row level security;

-- ─── PROFILES ───
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── DRIVERS ───
create policy "drivers_select_public"
  on public.drivers for select
  using (true);

-- ─── SAVED PLACES ───
create policy "saved_places_select_own"
  on public.saved_places for select
  using (auth.uid() = user_id);

create policy "saved_places_insert_own"
  on public.saved_places for insert
  with check (auth.uid() = user_id);

create policy "saved_places_update_own"
  on public.saved_places for update
  using (auth.uid() = user_id);

create policy "saved_places_delete_own"
  on public.saved_places for delete
  using (auth.uid() = user_id);

-- ─── RIDES ───
create policy "rides_select_own"
  on public.rides for select
  using (auth.uid() = user_id);

create policy "rides_insert_own"
  on public.rides for insert
  with check (auth.uid() = user_id);

create policy "rides_update_own"
  on public.rides for update
  using (auth.uid() = user_id);

create policy "rides_delete_own"
  on public.rides for delete
  using (auth.uid() = user_id);

-- ─── RIDE RATINGS ───
create policy "ride_ratings_select_public"
  on public.ride_ratings for select
  using (true);

create policy "ride_ratings_insert_own"
  on public.ride_ratings for insert
  with check (auth.uid() = user_id);

-- ─── PAYMENT METHODS ───
create policy "payment_methods_select_own"
  on public.payment_methods for select
  using (auth.uid() = user_id);

create policy "payment_methods_insert_own"
  on public.payment_methods for insert
  with check (auth.uid() = user_id);

create policy "payment_methods_update_own"
  on public.payment_methods for update
  using (auth.uid() = user_id);

create policy "payment_methods_delete_own"
  on public.payment_methods for delete
  using (auth.uid() = user_id);
