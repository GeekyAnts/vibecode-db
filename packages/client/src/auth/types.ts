import type { z } from 'zod'

/**
 * Authentication result types
 */
export type AuthResult<T> = Promise<{ data: T | null; error: Error | null }>

/**
 * User session information
 */
export interface Session {
  user: User
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  expiresIn?: number
}

/**
 * User information
 */
export interface User {
  id: string
  email: string
  emailVerified?: boolean
  name?: string
  avatarUrl?: string
  createdAt?: Date
  updatedAt?: Date
  metadata?: Record<string, unknown>
}

/**
 * Sign up credentials
 */
export interface SignUpCredentials {
  email: string
  password: string
  name?: string
  metadata?: Record<string, unknown>
}

/**
 * Sign in credentials
 */
export interface SignInCredentials {
  email: string
  password: string
}

/**
 * Password reset request
 */
export interface ResetPasswordRequest {
  email: string
}

/**
 * Password reset confirmation
 */
export interface ResetPasswordConfirm {
  token: string
  password: string
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

/**
 * Update user profile
 */
export interface UpdateUserProfile {
  name?: string
  avatarUrl?: string
  metadata?: Record<string, unknown>
}

/**
 * Auth adapter interface - similar to DatabaseAdapter
 */
export interface AuthAdapter {
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

/**
 * Auth adapter factory - similar to AdapterFactory
 */
export type AuthAdapterFactory = (authSpec: AuthSpec) => AuthAdapter

/**
 * Auth specification - similar to DBSpec
 */
export interface AuthSpec {
  /** Optional seed users for development/testing */
  seed?: {
    users?: Array<{
      id: string
      email: string
      password: string
      name?: string
      emailVerified?: boolean
    }>
  }
  /** Optional metadata */
  meta?: Record<string, unknown>
}

/**
 * Create auth client options
 */
export interface CreateAuthClientOptions {
  authSpec?: AuthSpec
  adapter: AuthAdapterFactory
}

