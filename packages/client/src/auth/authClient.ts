import type { AuthExecutor } from '../core/types'
import type {
  Session,
  User,
  SignUpCredentials,
  SignInCredentials,
  ResetPasswordRequest,
  ResetPasswordConfirm,
  ChangePasswordRequest,
  UpdateUserProfile,
} from './types'

/**
 * Auth client interface - public API for authentication operations
 */
export interface VibecodeAuthClient {
  signUp(credentials: SignUpCredentials): Promise<{ data: Session | null; error: Error | null }>
  signIn(credentials: SignInCredentials): Promise<{ data: Session | null; error: Error | null }>
  signOut(): Promise<{ data: void | null; error: Error | null }>
  getSession(): Promise<{ data: Session | null; error: Error | null }>
  refreshSession(refreshToken?: string): Promise<{ data: Session | null; error: Error | null }>
  resetPassword(request: ResetPasswordRequest): Promise<{ data: void | null; error: Error | null }>
  resetPasswordConfirm(confirm: ResetPasswordConfirm): Promise<{ data: Session | null; error: Error | null }>
  changePassword(request: ChangePasswordRequest): Promise<{ data: void | null; error: Error | null }>
  updateUser(updates: UpdateUserProfile): Promise<{ data: User | null; error: Error | null }>
  getUser(): Promise<{ data: User | null; error: Error | null }>
}

export const AUTH_NOT_CONFIGURED_ERROR = `Auth is not configured. To enable auth, pass auth options to your adapter:

For Supabase:
  supabaseAdapter({ url, key, auth: { storage: AsyncStorage } })

For SQLite Web:
  sqliteWebAdapter({ wasmUrl, auth: { jwtSecret: 'your-secret' } })

For SQLite Expo:
  sqliteExpoAdapter({ dbName, auth: { jwtSecret: 'your-secret' } })
`

/**
 * Creates a proxy for auth that throws helpful error if auth not configured
 */
export function createAuthProxy(authExecutor: AuthExecutor | undefined): VibecodeAuthClient {
  if (!authExecutor) {
    // Return proxy that throws on any method call
    return new Proxy({} as VibecodeAuthClient, {
      get(_target, prop) {
        // Allow checking if auth exists
        if (prop === 'then') return undefined
        return () => {
          throw new Error(AUTH_NOT_CONFIGURED_ERROR)
        }
      }
    })
  }

  // Wrap auth executor methods
  return {
    signUp: (credentials) => authExecutor.signUp(credentials),
    signIn: (credentials) => authExecutor.signIn(credentials),
    signOut: () => authExecutor.signOut(),
    getSession: () => authExecutor.getSession(),
    refreshSession: (token) => authExecutor.refreshSession(token),
    resetPassword: (request) => authExecutor.resetPassword(request),
    resetPasswordConfirm: (confirm) => authExecutor.resetPasswordConfirm(confirm),
    changePassword: (request) => authExecutor.changePassword(request),
    updateUser: (updates) => authExecutor.updateUser(updates),
    getUser: () => authExecutor.getUser(),
  }
}
