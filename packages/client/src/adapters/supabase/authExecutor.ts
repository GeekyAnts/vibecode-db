import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthExecutor } from '../../core/types'
import type {
  SignUpCredentials,
  SignInCredentials,
  ResetPasswordRequest,
  ResetPasswordConfirm,
  ChangePasswordRequest,
  UpdateUserProfile,
  Session,
  User,
} from '../../auth/types'

/**
 * Supabase auth executor - handles all authentication operations via Supabase Auth
 */
export class SupabaseAuthExecutor implements AuthExecutor {
  constructor(private sb: SupabaseClient) {}

  async signUp(credentials: SignUpCredentials): Promise<{ data: Session | null; error: Error | null }> {
    try {
      const { data, error } = await this.sb.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            ...credentials.metadata,
          },
        },
      })

      if (error) {
        return { data: null, error }
      }

      if (!data.user) {
        return { data: null, error: new Error('Sign up failed') }
      }

      // When email confirmation is enabled, session is null until user verifies email
      if (!data.session) {
        return {
          data: {
            user: this.mapSupabaseUser(data.user),
            accessToken: '',
          },
          error: null,
        }
      }

      return {
        data: {
          user: this.mapSupabaseUser(data.user),
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token ?? undefined,
          expiresAt: new Date(data.session.expires_at! * 1000),
          expiresIn: data.session.expires_in,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async signIn(credentials: SignInCredentials): Promise<{ data: Session | null; error: Error | null }> {
    try {
      const { data, error } = await this.sb.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { data: null, error }
      }

      if (!data.session || !data.user) {
        return { data: null, error: new Error('Sign in failed') }
      }

      return {
        data: {
          user: this.mapSupabaseUser(data.user),
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token ?? undefined,
          expiresAt: new Date(data.session.expires_at! * 1000),
          expiresIn: data.session.expires_in,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async signOut(): Promise<{ data: void | null; error: Error | null }> {
    try {
      const { error } = await this.sb.auth.signOut()
      if (error) {
        return { data: null, error }
      }
      return { data: undefined, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async getSession(): Promise<{ data: Session | null; error: Error | null }> {
    try {
      const { data, error } = await this.sb.auth.getSession()
      if (error) {
        return { data: null, error }
      }

      if (!data.session || !data.session.user) {
        return { data: null, error: null }
      }

      return {
        data: {
          user: this.mapSupabaseUser(data.session.user),
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token ?? undefined,
          expiresAt: new Date(data.session.expires_at! * 1000),
          expiresIn: data.session.expires_in,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async refreshSession(_refreshToken?: string): Promise<{ data: Session | null; error: Error | null }> {
    try {
      const { data, error } = await this.sb.auth.refreshSession()
      if (error) {
        return { data: null, error }
      }

      if (!data.session || !data.session.user) {
        return { data: null, error: new Error('Refresh failed') }
      }

      return {
        data: {
          user: this.mapSupabaseUser(data.session.user),
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token ?? undefined,
          expiresAt: new Date(data.session.expires_at! * 1000),
          expiresIn: data.session.expires_in,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async resetPassword(request: ResetPasswordRequest): Promise<{ data: void | null; error: Error | null }> {
    try {
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : 'http://localhost:3000/reset-password'

      const { error } = await this.sb.auth.resetPasswordForEmail(request.email, {
        redirectTo,
      })

      if (error) {
        return { data: null, error }
      }

      return { data: undefined, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async resetPasswordConfirm(confirm: ResetPasswordConfirm): Promise<{ data: Session | null; error: Error | null }> {
    try {
      const { data: sessionData } = await this.sb.auth.getSession()
      if (!sessionData.session) {
        return { data: null, error: new Error('No active session') }
      }

      const { error } = await this.sb.auth.updateUser({
        password: confirm.password,
      })

      if (error) {
        return { data: null, error }
      }

      return await this.getSession()
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async changePassword(request: ChangePasswordRequest): Promise<{ data: void | null; error: Error | null }> {
    try {
      const { error } = await this.sb.auth.updateUser({
        password: request.newPassword,
      })

      if (error) {
        return { data: null, error }
      }

      return { data: undefined, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async updateUser(updates: UpdateUserProfile): Promise<{ data: User | null; error: Error | null }> {
    try {
      const { data, error } = await this.sb.auth.updateUser({
        data: {
          name: updates.name,
          avatar_url: updates.avatarUrl,
          ...updates.metadata,
        },
      })

      if (error) {
        return { data: null, error }
      }

      if (!data.user) {
        return { data: null, error: new Error('Update failed') }
      }

      return {
        data: this.mapSupabaseUser(data.user),
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async getUser(): Promise<{ data: User | null; error: Error | null }> {
    try {
      const { data, error } = await this.sb.auth.getUser()
      if (error) {
        return { data: null, error }
      }

      if (!data.user) {
        return { data: null, error: null }
      }

      return {
        data: this.mapSupabaseUser(data.user),
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  private mapSupabaseUser(user: any): User {
    return {
      id: user.id,
      email: user.email ?? '',
      emailVerified: user.email_confirmed_at !== null,
      name: user.user_metadata?.name ?? undefined,
      avatarUrl: user.user_metadata?.avatar_url ?? undefined,
      createdAt: user.created_at ? new Date(user.created_at) : undefined,
      updatedAt: user.updated_at ? new Date(user.updated_at) : undefined,
      metadata: user.user_metadata ?? undefined,
    }
  }
}
