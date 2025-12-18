// Client
export * from './client/createClient'
export * from './core/types'
export * from './schema'
export * from './core/projectionUtil'

// DDL Generation
export * from './ddl/generateDDL'

// Adapters
export * from './adapters/supabase'
export * from './adapters/custom'

// Auth types (for use with client.auth)
export * from './auth'
export type {
  Session,
  User,
  SignUpCredentials,
  SignInCredentials,
  ResetPasswordRequest,
  ResetPasswordConfirm,
  ChangePasswordRequest,
  UpdateUserProfile,
  AuthResult,
} from './auth/types'
