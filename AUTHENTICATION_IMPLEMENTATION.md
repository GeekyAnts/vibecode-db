# Vibecode-DB Authentication System

## Overview

The authentication system for vibecode-db provides a unified, modular approach to authentication with two main backends:

1. **SQLite** - Simplified auth for prototyping (browser/mobile)
2. **Supabase** - Production-ready auth with full features

Both share the same API through the adapter pattern.

## Architecture

### Package Structure

```
┌────────────────────────────────────────────────────────────────────┐
│                         @vibecode-db/client                         │
│  ┌──────────────────┐  ┌─────────────────────────────────────────┐ │
│  │ createAuthClient │  │         SupabaseAuthAdapter             │ │
│  │ (unified API)    │  │  - Full auth features                   │ │
│  │                  │  │  - Email verification                   │ │
│  │ AuthAdapter      │  │  - Password reset                       │ │
│  │ interface        │  │  - Session management                   │ │
│  └──────────────────┘  └─────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼────────────────────────────────┐
│                      @vibecode-db/sqlite-core                       │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ BaseSQLiteAuthAdapter (simplified prototyping auth)            ││
│  │  - Only auth_users table                                       ││
│  │  - In-memory sessions (no DB persistence)                      ││
│  │  - Simple JWT tokens (no expiry)                               ││
│  │  - No refresh tokens, no password reset                        ││
│  └────────────────────────────────────────────────────────────────┘│
│  ┌────────────────────┐  ┌───────────────────┐  ┌────────────────┐│
│  │ SQLiteAuthExecutor │  │ Auth Schema/Migrations │  │ Utils      ││
│  │ (DB operations)    │  │ (auth_users table)     │  │ (hash,JWT) ││
│  └────────────────────┘  └───────────────────┘  └────────────────┘│
└────────────────────────────────────────────────────────────────────┘
                    │                           │
     ┌──────────────┴──────────┐    ┌──────────┴───────────┐
     │                         │    │                      │
┌────▼─────────────────────┐  ┌─────▼────────────────────┐
│ @vibecode-db/sqlite-web  │  │ @vibecode-db/sqlite-expo │
│ ┌──────────────────────┐ │  │ ┌──────────────────────┐ │
│ │ SQLiteWebAuthAdapter │ │  │ │SQLiteExpoAuthAdapter │ │
│ │ (extends Base)       │ │  │ │ (extends Base)       │ │
│ └──────────────────────┘ │  │ └──────────────────────┘ │
└──────────────────────────┘  └──────────────────────────┘
```

### Design Principles

1. **Simplified SQLite Auth** - For prototyping only, minimal complexity
2. **Adapter Pattern** - Swap backends without changing app code
3. **Platform-Specific Adapters** - Web and Expo have dedicated adapters
4. **Direct Wiring** - Auth adapter receives DB adapter directly (no globals)
5. **In-Memory Sessions** - SQLite sessions live in memory, not database

## SQLite Auth (Prototyping)

### What's Included

| Feature | SQLite Auth | Notes |
|---------|-------------|-------|
| Sign Up | ✅ | Creates user, returns JWT |
| Sign In | ✅ | Verifies password, returns JWT |
| Sign Out | ✅ | Clears in-memory session |
| Get Session | ✅ | Returns in-memory session |
| Get User | ✅ | Returns current user |
| Refresh Session | ⚠️ | Returns current session (no-op) |
| Reset Password | ❌ | Not supported |
| Change Password | ❌ | Not supported |
| Update User | ❌ | Not supported |

### Database Schema

**Only one table** - `auth_users`:

```sql
CREATE TABLE IF NOT EXISTS "auth_users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
)
```

**No session tables** - Sessions are stored in memory on the adapter instance.

### How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SIGN UP FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User calls auth.signUp({ email, password, name })               │
│                          │                                           │
│                          ▼                                           │
│  2. Check if email exists in auth_users                             │
│                          │                                           │
│                          ▼                                           │
│  3. Hash password (SHA-256)                                         │
│                          │                                           │
│                          ▼                                           │
│  4. Insert user into auth_users table                               │
│                          │                                           │
│                          ▼                                           │
│  5. Generate JWT token (no expiry for prototyping)                  │
│                          │                                           │
│                          ▼                                           │
│  6. Store session in memory (adapter.currentSession)                │
│                          │                                           │
│                          ▼                                           │
│  7. Return { user, accessToken }                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          SIGN IN FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User calls auth.signIn({ email, password })                     │
│                          │                                           │
│                          ▼                                           │
│  2. Find user by email in auth_users                                │
│                          │                                           │
│                          ▼                                           │
│  3. Verify password hash                                            │
│                          │                                           │
│                          ▼                                           │
│  4. Generate JWT token                                              │
│                          │                                           │
│                          ▼                                           │
│  5. Store session in memory                                         │
│                          │                                           │
│                          ▼                                           │
│  6. Return { user, accessToken }                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Code Locations

| Component | Location |
|-----------|----------|
| Base Adapter | `packages/sqlite-core/src/auth/base-adapter.ts` |
| Executor | `packages/sqlite-core/src/auth/executor.ts` |
| Schema/Migrations | `packages/sqlite-core/src/auth/schema.ts` |
| Utils (hash, JWT) | `packages/sqlite-core/src/auth/utils.ts` |
| Types | `packages/sqlite-core/src/auth/types.ts` |
| Web Adapter | `packages/sqlite-web/src/auth-adapter.ts` |
| Expo Adapter | `packages/sqlite-expo/src/auth-adapter.ts` |

### Usage Example (Web)

```typescript
import { createClient, createAuthClient } from '@vibecode-db/client'
import { SQLiteWebAdapter, SQLiteWebAuthAdapter } from '@vibecode-db/sqlite-web'

// 1. Create database adapter
const dbAdapter = new SQLiteWebAdapter(dbSpec, {
  wasmUrl: '/sql-wasm.wasm',
  migrations: db.migrations,
})

// 2. Create auth adapter - pass DB adapter directly!
const authAdapter = new SQLiteWebAuthAdapter(dbAdapter, {
  jwtSecret: 'your-secret-key',
})

// 3. Create clients
export const vibecode = createClient({ dbSpec, adapter: () => dbAdapter })
export const auth = createAuthClient({ authSpec: {}, adapter: () => authAdapter })
```

### Usage Example (Expo)

```typescript
import { SQLiteExpoAdapter, SQLiteExpoAuthAdapter } from '@vibecode-db/sqlite-expo'

const dbAdapter = new SQLiteExpoAdapter(dbSpec, { dbName: 'myapp.db' })
const authAdapter = new SQLiteExpoAuthAdapter(dbAdapter, {
  jwtSecret: 'your-secret-key',
})
```

## Supabase Auth (Production)

### What's Included

| Feature | Supabase Auth | Notes |
|---------|---------------|-------|
| Sign Up | ✅ | With optional email verification |
| Sign In | ✅ | Full session management |
| Sign Out | ✅ | Clears Supabase session |
| Get Session | ✅ | From Supabase |
| Get User | ✅ | From Supabase |
| Refresh Session | ✅ | Automatic token refresh |
| Reset Password | ✅ | Email-based reset |
| Change Password | ✅ | For logged-in users |
| Update User | ✅ | Profile updates |
| OAuth | ✅ | Google, GitHub, etc. |
| MFA | ✅ | Multi-factor auth |

### Code Location

`packages/client/src/auth/adapters/supabase/adapter.ts`

### Usage Example

```typescript
import { createAuthClient, SupabaseAuthAdapter } from '@vibecode-db/client'

const auth = createAuthClient({
  authSpec: {},
  adapter: () => new SupabaseAuthAdapter({}, {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
  }),
})
```

### Email Confirmation

By default, Supabase requires email verification:

```typescript
const { data, error } = await auth.signUp({ email, password, name })

if (data && !data.accessToken) {
  // Email confirmation required
  alert('Please check your email to verify your account')
  return
}

// User is logged in
setUser(data.user)
```

To disable email confirmation (for prototyping):
1. Supabase Dashboard → Authentication → Providers → Email
2. Toggle OFF "Confirm email"

## Auth Client API

### Interface

```typescript
interface VibecodeAuthClient {
  signUp(credentials: SignUpCredentials): Promise<{ data: Session | null; error: Error | null }>
  signIn(credentials: SignInCredentials): Promise<{ data: Session | null; error: Error | null }>
  signOut(): Promise<{ data: void | null; error: Error | null }>
  getSession(): Promise<{ data: Session | null; error: Error | null }>
  getUser(): Promise<{ data: User | null; error: Error | null }>
  refreshSession(refreshToken?: string): Promise<{ data: Session | null; error: Error | null }>
  resetPassword(request: ResetPasswordRequest): Promise<{ data: void | null; error: Error | null }>
  resetPasswordConfirm(confirm: ResetPasswordConfirm): Promise<{ data: Session | null; error: Error | null }>
  changePassword(request: ChangePasswordRequest): Promise<{ data: void | null; error: Error | null }>
  updateUser(updates: UpdateUserProfile): Promise<{ data: User | null; error: Error | null }>
}
```

### Types

```typescript
interface Session {
  user: User
  accessToken: string
  refreshToken?: string    // Only with Supabase
  expiresAt?: Date         // Only with Supabase
  expiresIn?: number       // Only with Supabase
}

interface User {
  id: string
  email: string
  name?: string
  createdAt?: Date
  updatedAt?: Date
}

interface SignUpCredentials {
  email: string
  password: string
  name?: string
}

interface SignInCredentials {
  email: string
  password: string
}
```

## App Integration Example

### Complete Setup (vibecode-todo)

**`src/db/client.ts`**
```typescript
import { vibecodeTable, col, references, defineSchema, createClient } from '@vibecode-db/client'
import { SQLiteWebAdapter } from '@vibecode-db/sqlite-web'

// Define schema
export const users = vibecodeTable('users', {
  id: col.integer().primaryKey().autoIncrement(),
  name: col.varchar().notNull(),
  email: col.varchar().unique().notNull(),
})

export const todos = vibecodeTable('todos', {
  id: col.varchar().primaryKey(),
  title: col.varchar().notNull(),
  completed: col.boolean().default(false).notNull(),
  user_id: references(col.integer('user_id').notNull(), () => users.id),
})

export const db = defineSchema({ users, todos })

// Store adapter for auth to use
export let dbAdapter: SQLiteWebAdapter | null = null

export const vibecode = createClient({
  dbSpec: { schema: db.zodBundle, relations: db.relations },
  adapter: (ctx) => {
    dbAdapter = new SQLiteWebAdapter(ctx, {
      wasmUrl: '/sql-wasm.wasm',
      migrations: db.migrations,
    })
    return dbAdapter
  },
})
```

**`src/auth/client.ts`**
```typescript
import { createAuthClient, SupabaseAuthAdapter } from '@vibecode-db/client'
import { SQLiteWebAuthAdapter } from '@vibecode-db/sqlite-web'
import { dbAdapter } from '../db/client'

const which = import.meta.env.VITE_VIBECODE_ADAPTER as 'sqlite' | 'supabase'

export const auth = createAuthClient({
  authSpec: {},
  adapter: () => {
    if (which === 'supabase') {
      return new SupabaseAuthAdapter({}, {
        url: import.meta.env.VITE_SUPABASE_URL,
        key: import.meta.env.VITE_SUPABASE_ANON_KEY,
      })
    } else {
      // SQLite for prototyping
      return new SQLiteWebAuthAdapter(dbAdapter!, {
        jwtSecret: import.meta.env.VITE_JWT_SECRET || 'dev-secret',
      })
    }
  },
})
```

**`src/App.tsx`**
```typescript
import { auth } from './auth/client'
import { vibecode } from './db/client'

function App() {
  const [user, setUser] = useState<User | null>(null)

  // Check session on mount
  useEffect(() => {
    auth.getSession().then(({ data }) => {
      if (data) setUser(data.user)
    })
  }, [])

  async function handleSignUp() {
    const { data, error } = await auth.signUp({ email, password, name })
    if (error) {
      alert(error.message)
      return
    }
    if (data && !data.accessToken) {
      // Supabase: email confirmation required
      alert('Check your email to verify your account')
      return
    }
    setUser(data.user)
  }

  async function handleSignIn() {
    const { data, error } = await auth.signIn({ email, password })
    if (error) {
      alert(error.message)
      return
    }
    setUser(data.user)
  }

  async function handleSignOut() {
    await auth.signOut()
    setUser(null)
  }
}
```

## Utilities

### Password Hashing

```typescript
// packages/sqlite-core/src/auth/utils.ts

// Browser-compatible SHA-256 hash (for prototyping only!)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}
```

### JWT Generation

```typescript
// Simplified JWT for prototyping (no expiry)
export function generateJWT(payload: Record<string, any>, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const tokenPayload = { ...payload, iat: Math.floor(Date.now() / 1000) }
  
  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(tokenPayload))
  const signature = base64urlEncode(secret)
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}
```

## Security Notes

### SQLite Auth (Prototyping Only)

⚠️ **Not for production!**

- SHA-256 password hashing (use bcrypt/argon2 in production)
- Simplified JWT without proper signing
- No expiry on tokens
- Sessions in memory (lost on page refresh)
- No rate limiting
- No email verification

### Supabase Auth (Production Ready)

✅ **Recommended for production**

- Industry-standard password hashing
- Proper JWT with RS256 signing
- Automatic token refresh
- Secure session management
- Rate limiting
- Email verification
- OAuth support
- MFA support

## Environment Variables

```env
# Choose adapter
VITE_VIBECODE_ADAPTER=sqlite  # or 'supabase'

# SQLite auth
VITE_JWT_SECRET=your-secret-key-change-in-production

# Supabase auth
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Comparison

| Aspect | SQLite Auth | Supabase Auth |
|--------|-------------|---------------|
| Use Case | Prototyping | Production |
| Setup | Zero config | Requires Supabase project |
| Database | Local SQLite | Supabase cloud |
| Sessions | In-memory | Persistent |
| Password Reset | ❌ | ✅ |
| Email Verification | ❌ | ✅ |
| OAuth | ❌ | ✅ |
| MFA | ❌ | ✅ |
| Security | Basic | Production-grade |
| Offline | ✅ | ❌ |

## Migration Path

When moving from SQLite (prototyping) to Supabase (production):

1. Create Supabase project
2. Change `VITE_VIBECODE_ADAPTER` to `'supabase'`
3. Add Supabase credentials
4. Existing users need to re-register (different auth systems)

The app code stays the same - only configuration changes!
