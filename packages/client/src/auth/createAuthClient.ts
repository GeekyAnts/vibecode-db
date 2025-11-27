import type { AuthAdapter, CreateAuthClientOptions, AuthSpec, SignUpCredentials, SignInCredentials, ResetPasswordRequest, ResetPasswordConfirm, ChangePasswordRequest, UpdateUserProfile, Session, User } from './types'

/**
 * Auth client interface - provides authentication operations
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

/**
 * Create an authentication client.
 *
 * @public
 * @param opts - Configuration including authSpec and adapter factory
 * @returns An auth client exposing authentication operations
 *
 * @example
 * ```ts
 * const auth = createAuthClient({
 *   authSpec: {},
 *   adapter: (spec) => new SQLiteAuthAdapter(spec, {
 *     driver: sqliteDriver,
 *     jwtSecret: 'your-secret-key',
 *   })
 * })
 *
 * const { data, error } = await auth.signUp({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   name: 'John Doe'
 * })
 * ```
 */
export function createAuthClient(opts: CreateAuthClientOptions): VibecodeAuthClient {
  const authSpec: AuthSpec = opts.authSpec ?? {}
  const adapter: AuthAdapter = opts.adapter(authSpec)

  return {
    signUp: (credentials) => adapter.signUp(credentials),
    signIn: (credentials) => adapter.signIn(credentials),
    signOut: () => adapter.signOut(),
    getSession: () => adapter.getSession(),
    refreshSession: (refreshToken) => adapter.refreshSession(refreshToken),
    resetPassword: (request) => adapter.resetPassword(request),
    resetPasswordConfirm: (confirm) => adapter.resetPasswordConfirm(confirm),
    changePassword: (request) => adapter.changePassword(request),
    updateUser: (updates) => adapter.updateUser(updates),
    getUser: () => adapter.getUser(),
  }
}

