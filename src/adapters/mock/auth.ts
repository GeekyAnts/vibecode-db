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

// ─── Session Storage ────────────────────────────────────────────────

const SESSION_KEY = 'vibecode-mock-session';

export interface MockSessionStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

/** Web: uses localStorage (matches Supabase default) */
function getDefaultStorage(): MockSessionStorage | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {}
  return null;
}

export interface MockAuthOptions {
  /** Enable session persistence across page refreshes / app restarts. Default: true (matches Supabase) */
  persistSession?: boolean;
  /** Custom storage backend. Defaults to localStorage on web. For React Native, pass AsyncStorage. */
  storage?: MockSessionStorage;
}

export class MockAuthAdapter implements AuthAdapter {
  private users: Map<string, { user: AuthUser; password: string }> = new Map();
  currentSession: AuthSession | null = null;
  private listeners: Array<(event: string, session: AuthSession | null) => void> = [];
  private persistSession: boolean;
  private storage: MockSessionStorage | null;

  constructor(options?: MockAuthOptions) {
    this.persistSession = options?.persistSession ?? true;
    this.storage = this.persistSession
      ? (options?.storage ?? getDefaultStorage())
      : null;
  }

  private async saveSession(session: AuthSession | null) {
    if (!this.storage) return;
    try {
      if (session) {
        await this.storage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        await this.storage.removeItem(SESSION_KEY);
      }
    } catch {}
  }

  private async loadSession(): Promise<AuthSession | null> {
    if (!this.storage) return null;
    try {
      const raw = await this.storage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

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
    await this.saveSession(session);
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
    await this.saveSession(session);
    this.notifyListeners('SIGNED_IN', session);

    return { data: { user: entry.user, session }, error: null };
  }

  async signOut() {
    this.currentSession = null;
    await this.saveSession(null);
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
    // Restore from storage if no in-memory session
    if (!this.currentSession && this.storage) {
      this.currentSession = await this.loadSession();
    }
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

    await this.saveSession(this.currentSession);
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
    if (this.storage) {
      this.saveSession(null);
    }
  }
}
