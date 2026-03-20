# Taxi Booking App

> A modern taxi booking app with ride options, real-time tracking, and driver management.

## Tech Stack

- **Frontend**: React Native + Expo + NativeWind v4 + Lucide Icons
- **Data Layer**: vibecode-db (adapter-based — Mock / Supabase / PocketBase)
- **Auth**: vibecode-db AuthClient (wraps Supabase Auth)
- **Storage**: vibecode-db StorageClient (wraps Supabase Storage)
- **State**: React Query + AsyncStorage persistence
- **Navigation**: Expo Router (file-based)
- **Language**: TypeScript

## Project Structure

```
products/taxi-booking-app/code/
  app/
    (onboarding)/        Splash, Login, OTP, ForgotPassword, ProfileSetup
    (auth)/              SignIn, SignUp (Gluestack-based)
    (app)/               Main tab screens
  lib/
    client.ts            vibecode-db client with adapter config
    context.tsx           React context provider
    queryClient.ts       React Query setup
    database.types.ts    TypeScript types from DB schema
  hooks/
    useAuth.ts           Auth hook (signIn, signUp, signOut)
    useOffline.ts        Offline detection
  src/
    db/                  Database client & schema (existing app compat)
    hooks/               Hooks (existing app compat)
    providers/           ThemeProvider, AppProviders
  components/            Reusable UI components
  supabase/
    migrations/          SQL migration files (run in order)
    seed/                Test data
    types/               Generated TypeScript types
```

## Screens

### Onboarding
- **Splash** — Animated car logo, gradient background, auto-redirect
- **Login/Signup** — Email + password with toggle, Google + Facebook social login
- **OTP Verification** — 6-digit code input with resend timer
- **Forgot Password** — Email input for reset link
- **Profile Setup** — Name, phone, avatar with skip option

### Main App (4 Tabs)
- **Home** — Pickup/dropoff search, saved places, recent rides
- **Services** — Ride, Package, Rentals, Intercity services with promo banner
- **History** — Ride history with stats, ratings, driver info
- **Profile** — User card, stats, theme selector, account settings

### Hidden Screens
- **Ride Options** — Economy/Premium/SUV selection with pricing
- **Ride Tracking** — Live tracking with driver info, animated states
- **Edit Profile** — Form fields for personal info

## Backend

### Database Tables
- `profiles` — User profiles (linked to auth.users)
- `drivers` — Driver info (rating, trips, car details)
- `saved_places` — User saved locations
- `rides` — Ride bookings (pickup, dropoff, fare, status)
- `ride_ratings` — Ratings and reviews
- `payment_methods` — Cards and wallets

### Migrations
Run in order in Supabase SQL Editor:
1. `00001_init_auth.sql` — Extensions, triggers
2. `00002_create_tables.sql` — All 6 tables
3. `00003_rls_policies.sql` — Row Level Security
4. `00004_storage_buckets.sql` — avatars, content, private
5. `00005_seed_data.sql` — Test data

## Getting Started

### 1. Start immediately (mock adapter — no setup needed)

```bash
cd products/taxi-booking-app/code
npm install && npm run start
```

### 2. Switch to Supabase (when ready for production)

```bash
cp .env.example .env
# Set EXPO_PUBLIC_ADAPTER_TYPE=supabase
# Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
# Run migrations in Supabase SQL Editor
# Seed test data
npm run start
```

## Test Accounts (mock adapter)

| Email | Password |
|---|---|
| alice@example.com | password123 |
| bob@example.com | password123 |
