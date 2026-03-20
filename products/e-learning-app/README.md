# E-Learning App

> A comprehensive e-learning platform for online courses, lessons, and skill development.

## Tech Stack

- **Frontend**: React Native + Expo + NativeWind v4 + Tailwind CSS
- **Data Layer**: vibecode-db (adapter-based — SQLite / Supabase / RapidBase)
- **Auth**: vibecode-db AuthClient (wraps Supabase Auth)
- **Storage**: vibecode-db StorageClient (wraps Supabase Storage)
- **State**: React Query + AsyncStorage persistence
- **Navigation**: Expo Router (file-based)
- **Language**: TypeScript

## Project Structure

```
products/e-learning-app/
  code/
    app/
      (onboarding)/     ← Splash, Login, OTP, ForgotPassword, ProfileSetup
      (auth)/           ← Standalone SignIn, SignUp
      (app)/            ← Main tab screens (Home, Courses, My Learning, Progress, Profile)
    src/
      db/
        client.ts       ← vibecode-db client with adapter config
        schema.ts       ← Database schema definition
      hooks/
        useAuth.ts      ← Auth hook (signIn, signUp, signOut)
        useOffline.ts   ← Network monitoring
      lib/
        queryClient.ts  ← React Query setup
      providers/
        AppProviders.tsx    ← Root provider composition
        ThemeProvider.tsx   ← Theme management with persistence
    components/         ← Reusable UI components
    assets/images/      ← Placeholder images
    supabase/
      migrations/       ← SQL migration files (run in order)
      seed/             ← Test data
      types/            ← Generated TypeScript types
```

## Screens

### Onboarding (5 screens)
- **Splash** — Animated indigo gradient with GraduationCap logo
- **Login/Signup** — Toggle between login and signup, email + password auth
- **OTP Verification** — 6-digit code with auto-focus and resend timer
- **Forgot Password** — Email-based password reset
- **Profile Setup** — Avatar, name, username with skip option

### Main App (6 screens)
- **Home** — Learning dashboard with daily goals, study stats, course cards
- **Courses** — Course catalog with search, category filters, difficulty badges
- **My Learning** — Progress overview, skills breakdown, bookmarks, recent notes
- **Progress** — Stats, weekly activity chart, achievements
- **Profile** — User info, learning preferences, theme selector, settings
- **Edit Profile** — Full profile editor with learning interests

## Backend

### Database Tables (8)
- `profiles` — User profiles (linked to auth.users)
- `courses` — Course catalog with categories and difficulty levels
- `lessons` — Lessons within courses with ordering
- `enrollments` — User-course enrollment with progress tracking
- `lesson_progress` — Per-lesson completion tracking
- `notes` — User notes on lessons with video timestamps
- `certificates` — Course completion certificates
- `bookmarks` — Bookmarked courses

### Migrations
```
supabase/migrations/
  00001_init_auth.sql         — Extensions, triggers, auto-profile creation
  00002_create_tables.sql     — All 8 tables with relationships
  00003_rls_policies.sql      — Row Level Security per table
  00004_storage_buckets.sql   — Buckets: avatars, content, private
  00005_seed_data.sql         — Realistic test data
```

## Getting Started

### 1. Start immediately (no setup needed)
```bash
cd products/e-learning-app/code
npm install
npm run start
```

### 2. Switch to Supabase (when ready for production)
1. Create a project at https://supabase.com
2. Copy credentials:
   ```bash
   cp .env .env.local
   # Set EXPO_PUBLIC_ADAPTER=supabase
   # Set EXPO_PUBLIC_SUPABASE_URL=...
   # Set EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Run migrations in Supabase SQL Editor (in order):
   - `supabase/migrations/00001_init_auth.sql`
   - `supabase/migrations/00002_create_tables.sql`
   - `supabase/migrations/00003_rls_policies.sql`
   - `supabase/migrations/00004_storage_buckets.sql`
4. Seed test data: `supabase/migrations/00005_seed_data.sql`
5. Restart the app: `npm run start`

## Test Accounts (when using seeded data)

| Email | Password |
|---|---|
| alice@test.com | password123 |
| bob@test.com | password123 |
| carol@test.com | password123 |
