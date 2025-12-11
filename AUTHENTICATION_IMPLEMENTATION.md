# Vibecode-DB Authentication System - Implementation Guide

## Overview

The authentication system for vibecode-db follows the same architectural patterns as the database system, providing a unified, scalable, and modular approach to authentication. It supports multiple backends (SQLite for development, Supabase for production) through a consistent adapter pattern.

## Architecture

### Core Principles

1. **Adapter Pattern**: Similar to database adapters, auth adapters abstract the underlying authentication implementation
2. **Unified API**: All adapters implement the same `AuthAdapter` interface, providing consistent methods
3. **Type Safety**: Full TypeScript support with Zod schema validation
4. **Modularity**: Each adapter is self-contained and can be swapped without changing application code

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  (App.tsx - uses auth.signUp(), auth.signIn(), etc.)       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Auth Client (createAuthClient)                  │
│  - Provides unified API: signUp, signIn, signOut, etc.      │
│  - Delegates to AuthAdapter                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────────┐    ┌─────────▼──────────┐
│ SQLiteAuthAdapter│    │SupabaseAuthAdapter │
│  - Manual impl   │    │  - Uses Supabase   │
│  - Password hash │    │    auth library    │
│  - JWT tokens    │    │                    │
│  - Sessions      │    │                    │
└──────────────────┘    └────────────────────┘
```

## Implementation Details

### 1. Auth Schema

The authentication system defines its own schema with the following tables:

- **auth_users**: Stores user accounts with email, password hash, and profile information
- **auth_sessions**: Tracks active user sessions with access tokens
- **auth_refresh_tokens**: Manages refresh tokens for session renewal
- **auth_password_reset_tokens**: Handles password reset flows

**Location**: `packages/client/src/auth/schema.ts`

```typescript
export const authUsers = vibecodeTable('auth_users', {
  id: col.uuid().primaryKey(),
  email: col.varchar().unique().notNull(),
  emailVerified: col.boolean().default(false).notNull(),
  passwordHash: col.varchar().notNull(),
  name: col.varchar(),
  // ... other fields
})
```

### 2. Auth Types and Interfaces

**Location**: `packages/client/src/auth/types.ts`

#### Core Types

- **`AuthAdapter`**: Interface that all auth adapters must implement
- **`AuthSpec`**: Configuration for auth (similar to `DBSpec` for database)
- **`Session`**: Contains user info, access token, refresh token, expiration
- **`User`**: User profile information
- **`SignUpCredentials`**, **`SignInCredentials`**: Input types for auth operations

#### AuthAdapter Interface

```typescript
interface AuthAdapter {
  signUp(credentials: SignUpCredentials): AuthResult<Session>
  signIn(credentials: SignInCredentials): AuthResult<Session>
  signOut(): AuthResult<void>
  getSession(): AuthResult<Session | null>
  refreshSession(refreshToken?: string): AuthResult<Session>
  resetPassword(request: ResetPasswordRequest): AuthResult<void>
  resetPasswordConfirm(confirm: ResetPasswordConfirm): AuthResult<Session>
  changePassword(request: ChangePasswordRequest): AuthResult<void>
  updateUser(updates: UpdateUserProfile): AuthResult<User>
  getUser(): AuthResult<User | null>
}
```

### 3. SQLite Auth Adapter

**Location**: `packages/client/src/auth/adapters/sqlite/`

The SQLite adapter implements all authentication operations manually, making it suitable for development and testing.

#### Components

1. **`SQLiteAuthAdapter`** (`adapter.ts`): Main adapter class
2. **`SQLiteAuthExecutor`** (`executor.ts`): Implements all auth operations
3. **`utils.ts`**: Helper functions for password hashing, JWT, migrations

#### Key Features

- **Password Hashing**: Uses Web Crypto API (SHA-256) for browser compatibility
  - Note: For production, use bcrypt or argon2
- **JWT Generation**: Simplified JWT implementation for development
  - Note: For production, use a proper JWT library
- **Session Management**: Stores sessions in SQLite with expiration tracking
- **Driver Sharing**: Uses the same SQLite driver as the database adapter

#### Implementation Flow

```typescript
// 1. User signs up
signUp() → hashPassword() → insert into auth_users → createSession() → return Session

// 2. User signs in
signIn() → find user by email → verifyPassword() → createSession() → return Session

// 3. Session management
getSession() → query auth_sessions → find valid session → return Session
refreshSession() → validate refresh token → createSession() → return Session
```

#### Driver Sharing Pattern

The SQLite auth adapter shares the database driver with the database adapter:

```typescript
// In auth/client.ts
const dbAdapter = window.__vcode_sqlite  // Access from global (set by db/client)

return new SQLiteAuthAdapter(authSpec, {
  getDriver: () => dbAdapter.getDriver(),  // Share the same driver
  ready: dbAdapter.getReady(),
  // ... other options
})
```

This ensures both adapters use the same SQLite database instance.

### 4. Supabase Auth Adapter

**Location**: `packages/client/src/auth/adapters/supabase/adapter.ts`

The Supabase adapter uses Supabase's built-in authentication library, providing production-ready features out of the box.

#### Key Features

- **Built-in Auth**: Leverages Supabase's authentication service
- **Email Verification**: Handled by Supabase
- **Password Reset**: Uses Supabase's email-based reset flow
- **Session Management**: Managed by Supabase client library

#### Implementation

```typescript
export class SupabaseAuthAdapter implements AuthAdapter {
  private sb: SupabaseClient

  async signUp(credentials) {
    const { data, error } = await this.sb.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    })
    // Map Supabase user to our User type
    return { data: mapSupabaseUser(data.user), error }
  }
  // ... other methods
}
```

### 5. Auth Client

**Location**: `packages/client/src/auth/createAuthClient.ts`

The auth client provides a unified API regardless of which adapter is used.

```typescript
export function createAuthClient(opts: CreateAuthClientOptions): VibecodeAuthClient {
  const adapter = opts.adapter(opts.authSpec ?? {})
  
  return {
    signUp: (credentials) => adapter.signUp(credentials),
    signIn: (credentials) => adapter.signIn(credentials),
    // ... other methods delegate to adapter
  }
}
```

## Integration with Todo App

### Setup

**Location**: `examples/vibecode-todo/src/auth/client.ts`

```typescript
export const auth = createAuthClient({
  authSpec: {},
  adapter: (authSpec) => {
    if (which === 'supabase') {
      return new SupabaseAuthAdapter(authSpec, {
        url: import.meta.env.VITE_SUPABASE_URL,
        key: import.meta.env.VITE_SUPABASE_ANON_KEY,
      })
    } else {
      // SQLite - access adapter from global
      const dbAdapter = window.__vcode_sqlite
      return new SQLiteAuthAdapter(authSpec, {
        getDriver: () => dbAdapter.getDriver(),
        ready: dbAdapter.getReady(),
        jwtSecret: 'dev-secret-key',
        // ... other options
      })
    }
  },
})
```

### Lazy Initialization

The auth client uses lazy initialization via Proxy pattern:

```typescript
export const auth = new Proxy({}, {
  get(_target, prop) {
    const client = getAuthClient()  // Creates adapter on first use
    const value = client[prop]
    return typeof value === 'function' ? value.bind(client) : value
  }
})
```

This ensures:
- Database adapter is initialized before auth adapter
- No module-level state variables needed
- Clean separation of concerns

### Usage in App

**Location**: `examples/vibecode-todo/src/App.tsx`

```typescript
// Sign up
const { data, error } = await auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
})

// Sign in
const { data, error } = await auth.signIn({
  email: 'user@example.com',
  password: 'password123'
})

// Get current session
const { data: session } = await auth.getSession()

// Sign out
await auth.signOut()
```

## Database Integration

### User Table Sync

The app maintains a `users` table in the main database that syncs with auth users:

```typescript
// When user signs in, find or create user in users table
const { data: usersData } = await vibecode
  .from('users')
  .eq('email', user.email)
  .select('id')

if (!usersData || usersData.length === 0) {
  // Create user in users table
  await vibecode.from('users').insert({
    name: user.name || user.email,
    email: user.email,
  })
}
```

This allows:
- Todos to reference users via foreign keys
- User profile data in the main database
- Separation of auth data (auth_users) and app data (users)

## Security Considerations

### Development (SQLite)

- **Password Hashing**: SHA-256 (simple, for dev only)
- **JWT**: Simplified implementation
- **Sessions**: Stored in SQLite with expiration

### Production (Supabase)

- **Password Hashing**: Handled by Supabase (bcrypt/argon2)
- **JWT**: Properly signed and verified by Supabase
- **Sessions**: Managed by Supabase with secure storage
- **Email Verification**: Built-in
- **Rate Limiting**: Handled by Supabase

### Recommendations

1. **For Production**: Always use Supabase adapter or implement proper security:
   - Use bcrypt or argon2 for password hashing
   - Use a proper JWT library (jsonwebtoken)
   - Implement rate limiting
   - Add email verification
   - Use HTTPS only

2. **Environment Variables**: Store secrets in environment variables:
   ```env
   VITE_JWT_SECRET=your-secret-key-here
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-key
   ```

## Migration System

The auth schema uses the same migration system as the database:

```typescript
// Auth migrations are auto-generated from schema
const migrations = generateMigrations(authSchema, {
  ifNotExists: true,
  autoIndexForeignKeys: true,
  includeComments: true,
})
```

Migrations are applied automatically when the SQLite adapter initializes.

## Error Handling

All auth operations return a consistent error format:

```typescript
type AuthResult<T> = Promise<{ data: T | null; error: Error | null }>

// Usage
const { data, error } = await auth.signIn(credentials)
if (error) {
  console.error('Sign in failed:', error.message)
  return
}
// Use data...
```

## Testing

### SQLite Adapter (Development)

- In-memory database
- Fast setup/teardown
- No external dependencies
- Perfect for unit tests

### Supabase Adapter (Production)

- Real authentication service
- Email verification
- Production-ready security
- Requires Supabase project

## File Structure

```
packages/client/src/auth/
├── types.ts                    # Core types and interfaces
├── schema.ts                   # Auth schema definitions
├── createAuthClient.ts         # Auth client factory
├── index.ts                    # Exports
└── adapters/
    ├── sqlite/
    │   ├── adapter.ts          # SQLite auth adapter
    │   ├── executor.ts         # Auth operations implementation
    │   ├── utils.ts            # Password hashing, JWT, migrations
    │   ├── types.ts            # SQLite adapter options
    │   └── index.ts
    └── supabase/
        ├── adapter.ts          # Supabase auth adapter
        └── index.ts

examples/vibecode-todo/src/
├── db/
│   └── client.ts               # Database client setup
└── auth/
    └── client.ts               # Auth client setup
```

## Key Design Decisions

1. **Adapter Pattern**: Allows switching between SQLite and Supabase without code changes
2. **Lazy Initialization**: Ensures database adapter is ready before auth adapter
3. **Driver Sharing**: SQLite auth uses the same driver as database for consistency
4. **Unified API**: Same interface regardless of backend
5. **Type Safety**: Full TypeScript support with Zod validation
6. **Schema Separation**: Auth tables separate from app tables for clarity

## Future Enhancements

1. **OAuth Providers**: Add Google, GitHub, etc. support
2. **MFA**: Multi-factor authentication
3. **Session Management**: Better session refresh and revocation
4. **Password Policies**: Configurable password requirements
5. **Account Lockout**: Brute force protection
6. **Audit Logging**: Track authentication events

## Conclusion

The authentication system provides a clean, scalable, and maintainable solution that follows the same patterns as the database system. It supports both development (SQLite) and production (Supabase) use cases while maintaining a consistent API.

The implementation is modular, type-safe, and easy to extend with new adapters or features as needed.

