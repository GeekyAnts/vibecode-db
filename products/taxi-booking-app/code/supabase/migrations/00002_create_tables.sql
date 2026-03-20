-- 00002_create_tables.sql
-- Taxi Booking App Tables

-- ─────────────────────────────────────────
-- PROFILES (linked to auth.users)
-- ─────────────────────────────────────────
create table public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  email        text unique not null,
  full_name    text,
  username     text unique,
  avatar_url   text,
  phone        text,
  bio          text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- DRIVERS
-- ─────────────────────────────────────────
create table public.drivers (
  id              uuid default uuid_generate_v4() primary key,
  full_name       text not null,
  email           text,
  phone           text,
  avatar_url      text,
  rating          numeric(3,2) default 5.0,
  total_trips     integer default 0,
  car_model       text not null,
  car_color       text,
  plate_number    text not null,
  license_number  text,
  is_available    boolean default true,
  current_lat     numeric(10,7),
  current_lng     numeric(10,7),
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

create trigger drivers_updated_at
  before update on public.drivers
  for each row execute procedure public.handle_updated_at();

-- ─────────────────────────────────────────
-- SAVED PLACES
-- ─────────────────────────────────────────
create table public.saved_places (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  name        text not null,
  address     text not null,
  icon        text default '📍',
  lat         numeric(10,7),
  lng         numeric(10,7),
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create trigger saved_places_updated_at
  before update on public.saved_places
  for each row execute procedure public.handle_updated_at();

-- ─────────────────────────────────────────
-- RIDES
-- ─────────────────────────────────────────
create table public.rides (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  driver_id       uuid references public.drivers(id) on delete set null,
  pickup_address  text not null,
  pickup_lat      numeric(10,7),
  pickup_lng      numeric(10,7),
  dropoff_address text not null,
  dropoff_lat     numeric(10,7),
  dropoff_lng     numeric(10,7),
  ride_type       text not null check (ride_type in ('economy', 'premium', 'suv')),
  status          text not null default 'pending' check (status in ('pending', 'finding', 'arriving', 'in_progress', 'completed', 'cancelled')),
  fare_amount     numeric(10,2),
  distance_km     numeric(10,2),
  duration_minutes integer,
  started_at      timestamptz,
  completed_at    timestamptz,
  cancelled_at    timestamptz,
  notes           text,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

create trigger rides_updated_at
  before update on public.rides
  for each row execute procedure public.handle_updated_at();

-- ─────────────────────────────────────────
-- RIDE RATINGS
-- ─────────────────────────────────────────
create table public.ride_ratings (
  id          uuid default uuid_generate_v4() primary key,
  ride_id     uuid references public.rides(id) on delete cascade not null unique,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  driver_id   uuid references public.drivers(id) on delete cascade not null,
  rating      integer not null check (rating >= 1 and rating <= 5),
  comment     text,
  created_at  timestamptz default now() not null
);

-- ─────────────────────────────────────────
-- PAYMENT METHODS
-- ─────────────────────────────────────────
create table public.payment_methods (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  type          text not null check (type in ('card', 'wallet', 'cash')),
  card_last4    text,
  card_brand    text,
  is_default    boolean default false,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create trigger payment_methods_updated_at
  before update on public.payment_methods
  for each row execute procedure public.handle_updated_at();
