import type { AuthAdapter, AuthSpec, SignUpCredentials, SignInCredentials, ResetPasswordRequest, ResetPasswordConfirm, ChangePasswordRequest, UpdateUserProfile, Session, User } from '../../types'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase auth adapter options
 */
export interface SupabaseAuthAdapterOptions {
  url: string
  key: string
}

/**
 * Supabase auth adapter - uses Supabase's built-in auth
 */
export class SupabaseAuthAdapter implements AuthAdapter {
  private sb: SupabaseClient
  private ready: Promise<void>

  constructor(
    private authSpec: AuthSpec,
    options: SupabaseAuthAdapterOptions
  ) {
    this.sb = createSupabaseClient(options.url, options.key)
    this.ready = this.init()
  }

  private async init(): Promise<void> {
    // Supabase handles schema and migrations automatically
    // We can optionally seed users here if needed
    // For now, just ensure client is ready
    await Promise.resolve()
  }

  private async ensureReady(): Promise<void> {
    await this.ready
  }

  async signUp(credentials: SignUpCredentials): Promise<{ data: Session | null; error: Error | null }> {
    try {
      await this.ensureReady()

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

      if (!data.session || !data.user) {
        return { data: null, error: new Error('Sign up failed') }
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
      await this.ensureReady()

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
      await this.ensureReady()

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
      await this.ensureReady()

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

  async refreshSession(refreshToken?: string): Promise<{ data: Session | null; error: Error | null }> {
    try {
      await this.ensureReady()

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
      await this.ensureReady()

      // Get redirect URL - works in browser, fallback for Node.js
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
      await this.ensureReady()

      // Supabase handles password reset via email link
      // The token is embedded in the URL, so we need to extract it
      // For now, we'll use updateUser to change password
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

      // Get updated session
      return await this.getSession()
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async changePassword(request: ChangePasswordRequest): Promise<{ data: void | null; error: Error | null }> {
    try {
      await this.ensureReady()

      // Supabase doesn't require current password for change
      // It uses the session token for verification
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
      await this.ensureReady()

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
      await this.ensureReady()

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

