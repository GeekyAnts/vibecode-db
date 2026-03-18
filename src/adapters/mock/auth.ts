import type { AuthAdapter } from '../types';
import type { AuthUser, AuthSession } from '../../types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function createSession(user: AuthUser): AuthSession {
  return {
    access_token: `mock-token-${generateId()}`,
    refresh_token: `mock-refresh-${generateId()}`,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
  };
}

export class MockAuthAdapter implements AuthAdapter {
  private users: Map<string, { user: AuthUser; password: string }> = new Map();
  private currentSession: AuthSession | null = null;
  private listeners: Array<(event: string, session: AuthSession | null) => void> = [];

  async signUp(credentials: { email?: string; phone?: string; password: string }) {
    const key = credentials.email || credentials.phone;
    if (!key) {
      return { data: { user: null, session: null }, error: { message: 'Email or phone required' } };
    }

    if (this.users.has(key)) {
      return { data: { user: null, session: null }, error: { message: 'User already registered' } };
    }

    const user: AuthUser = {
      id: generateId(),
      email: credentials.email,
      phone: credentials.phone,
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
    };

    this.users.set(key, { user, password: credentials.password });
    const session = createSession(user);
    this.currentSession = session;
    this.notifyListeners('SIGNED_IN', session);

    return { data: { user, session }, error: null };
  }

  async signInWithPassword(credentials: { email?: string; phone?: string; password: string }) {
    const key = credentials.email || credentials.phone;
    if (!key) {
      return { data: { user: null, session: null }, error: { message: 'Email or phone required' } };
    }

    const entry = this.users.get(key);
    if (!entry || entry.password !== credentials.password) {
      return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
    }

    const session = createSession(entry.user);
    this.currentSession = session;
    this.notifyListeners('SIGNED_IN', session);

    return { data: { user: entry.user, session }, error: null };
  }

  async signOut() {
    this.currentSession = null;
    this.notifyListeners('SIGNED_OUT', null);
    return { error: null };
  }

  async getUser() {
    if (!this.currentSession) {
      return { data: { user: null }, error: { message: 'Not authenticated' } };
    }
    return { data: { user: this.currentSession.user }, error: null };
  }

  async getSession() {
    return { data: { session: this.currentSession }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
    this.listeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const idx = this.listeners.indexOf(callback);
            if (idx >= 0) this.listeners.splice(idx, 1);
          },
        },
      },
    };
  }

  async updateUser(attributes: { email?: string; password?: string; data?: Record<string, any> }) {
    if (!this.currentSession) {
      return { data: { user: null, session: null }, error: { message: 'Not authenticated' } };
    }

    const user = this.currentSession.user;
    if (attributes.data) {
      user.user_metadata = { ...user.user_metadata, ...attributes.data };
    }
    if (attributes.email) {
      user.email = attributes.email;
    }

    // Update password in store
    if (attributes.password) {
      const key = user.email || user.phone;
      if (key) {
        const entry = this.users.get(key);
        if (entry) {
          entry.password = attributes.password;
        }
      }
    }

    return { data: { user, session: this.currentSession }, error: null };
  }

  async resetPasswordForEmail(_email: string) {
    return { data: {}, error: null };
  }

  private notifyListeners(event: string, session: AuthSession | null) {
    for (const listener of this.listeners) {
      listener(event, session);
    }
  }

  /** Seed a user into the store without setting session or firing listeners */
  seedUser(email: string, password: string, options?: { id?: string; user_metadata?: Record<string, any> }): AuthUser {
    const user: AuthUser = {
      id: options?.id || generateId(),
      email,
      app_metadata: {},
      user_metadata: options?.user_metadata || {},
      created_at: new Date().toISOString(),
    };
    this.users.set(email, { user, password });
    return user;
  }

  /** Reset all auth state - useful for tests */
  reset() {
    this.users.clear();
    this.currentSession = null;
    this.listeners = [];
  }
}
