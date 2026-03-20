-- 00005_seed_data.sql
-- Seed data for taxi-booking-app

-- Test profiles
insert into public.profiles (id, email, full_name, username, phone, avatar_url) values
  ('00000000-0000-0000-0000-000000000001', 'alice@test.com', 'Alice Johnson', 'alice_j', '+1 555-0101', 'https://i.pravatar.cc/150?u=alice'),
  ('00000000-0000-0000-0000-000000000002', 'bob@test.com', 'Bob Smith', 'bob_s', '+1 555-0102', 'https://i.pravatar.cc/150?u=bob'),
  ('00000000-0000-0000-0000-000000000003', 'carol@test.com', 'Carol White', 'carol_w', '+1 555-0103', 'https://i.pravatar.cc/150?u=carol');

-- Drivers
insert into public.drivers (id, full_name, email, phone, rating, total_trips, car_model, car_color, plate_number, is_available) values
  ('00000000-0000-0000-0000-000000000010', 'Michael Johnson', 'michael@drivers.com', '+1 555-1001', 4.9, 2847, 'Toyota Camry', 'Black', 'ABC 1234', true),
  ('00000000-0000-0000-0000-000000000011', 'Sarah Lee', 'sarah@drivers.com', '+1 555-1002', 4.8, 1523, 'Honda Accord', 'Silver', 'DEF 5678', true),
  ('00000000-0000-0000-0000-000000000012', 'James Rodriguez', 'james@drivers.com', '+1 555-1003', 4.7, 3102, 'Ford Explorer', 'White', 'GHI 9012', true),
  ('00000000-0000-0000-0000-000000000013', 'Emily Davis', 'emily@drivers.com', '+1 555-1004', 4.95, 4210, 'BMW 5 Series', 'Black', 'JKL 3456', true),
  ('00000000-0000-0000-0000-000000000014', 'David Kim', 'david@drivers.com', '+1 555-1005', 4.6, 987, 'Hyundai Sonata', 'Blue', 'MNO 7890', true),
  ('00000000-0000-0000-0000-000000000015', 'Lisa Wong', 'lisa@drivers.com', '+1 555-1006', 4.85, 2156, 'Chevrolet Suburban', 'Black', 'PQR 1357', true);

-- Saved places for Alice
insert into public.saved_places (user_id, name, address, icon) values
  ('00000000-0000-0000-0000-000000000001', 'Home', '123 Main Street, Downtown', '🏠'),
  ('00000000-0000-0000-0000-000000000001', 'Work', '456 Business Ave, Financial District', '💼'),
  ('00000000-0000-0000-0000-000000000001', 'Gym', '789 Fitness Blvd', '🏋️');

-- Rides for Alice
insert into public.rides (user_id, driver_id, pickup_address, dropoff_address, ride_type, status, fare_amount, distance_km, duration_minutes, started_at, completed_at) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', '123 Main Street', 'Airport Terminal 2', 'premium', 'completed', 24.50, 18.5, 35, now() - interval '1 day', now() - interval '1 day' + interval '35 minutes'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'Central Mall', '456 Oak Avenue', 'economy', 'completed', 12.00, 8.2, 20, now() - interval '2 days', now() - interval '2 days' + interval '20 minutes'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', 'City Hospital', '123 Main Street', 'economy', 'completed', 18.75, 14.0, 28, now() - interval '5 days', now() - interval '5 days' + interval '28 minutes'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000013', 'Grand Hotel', 'Convention Center', 'economy', 'completed', 8.50, 5.1, 15, now() - interval '7 days', now() - interval '7 days' + interval '15 minutes'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000014', 'Tech Park', 'Downtown Station', 'premium', 'cancelled', 15.00, 10.0, null, null, null),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000015', '123 Main Street', 'City Park', 'suv', 'completed', 22.00, 16.0, 30, now() - interval '10 days', now() - interval '10 days' + interval '30 minutes'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', '789 Elm Street', 'Shopping District', 'economy', 'completed', 10.50, 7.3, 18, now() - interval '3 days', now() - interval '3 days' + interval '18 minutes'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000013', 'University Campus', 'Bob Home', 'premium', 'completed', 28.00, 22.0, 40, now() - interval '4 days', now() - interval '4 days' + interval '40 minutes');

-- Payment methods for Alice
insert into public.payment_methods (user_id, type, card_last4, card_brand, is_default) values
  ('00000000-0000-0000-0000-000000000001', 'card', '4242', 'Visa', true),
  ('00000000-0000-0000-0000-000000000001', 'card', '5555', 'Mastercard', false),
  ('00000000-0000-0000-0000-000000000001', 'wallet', null, null, false);
