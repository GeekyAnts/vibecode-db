# Authentication Example

This example demonstrates how to use the vibecode-db authentication system with both SQLite and Supabase adapters.

## Setup

### For SQLite (Development)

1. The SQLite auth adapter requires a shared driver instance with your database adapter.
2. After creating your database adapter, you need to share the driver:

```typescript
import { SQLiteWebAdapter } from '@vibecode-db/sqlite-web'
import { setSharedDriver } from './auth/client'

// Create your database adapter
const dbAdapter = new SQLiteWebAdapter(dbSpec, sqliteOpts)

// Share the driver with auth (after adapter is ready)
await dbAdapter.ready
// Note: You'll need to access the driver from the adapter
// For now, create a shared driver instance separately
```

### For Supabase (Production)

Simply provide your Supabase URL and anon key:

```typescript
const auth = createAuthClient({
  authSpec: {},
  adapter: (spec) => new SupabaseAuthAdapter(spec, {
    url: 'your-supabase-url',
    key: 'your-supabase-anon-key',
  })
})
```

## Usage

```typescript
import { auth } from './auth/client'

// Sign up
const { data: signUpData, error: signUpError } = await auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
})

// Sign in
const { data: signInData, error: signInError } = await auth.signIn({
  email: 'user@example.com',
  password: 'password123',
})

// Get current session
const { data: session, error: sessionError } = await auth.getSession()

// Sign out
await auth.signOut()

// Refresh session
const { data: refreshedSession } = await auth.refreshSession(refreshToken)

// Reset password
await auth.resetPassword({ email: 'user@example.com' })

// Update user profile
await auth.updateUser({ name: 'New Name' })
```

