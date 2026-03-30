import type { AuthAdapter } from '../adapters/types';
import type { ClientConfig } from '../types';

export class AuthClient {
  private adapter: AuthAdapter;
  private config: ClientConfig;

  constructor(adapter: AuthAdapter, config?: ClientConfig) {
    this.adapter = adapter;
    this.config = config || {};
  }

  signUp(credentials: { email?: string; phone?: string; password: string }, options?: { overrideAuthDisabled?: boolean }) {
    if (this.config.authDisabled && !options?.overrideAuthDisabled) {
      return Promise.reject({
        message: 'Auth is disabled. Use { overrideAuthDisabled: true } to override.',
      });
    }
    return this.adapter.signUp(credentials);
  }

  signInWithPassword(credentials: { email?: string; phone?: string; password: string }, options?: { overrideAuthDisabled?: boolean }) {
    if (this.config.authDisabled && !options?.overrideAuthDisabled) {
      return Promise.reject({
        message: 'Auth is disabled. Use { overrideAuthDisabled: true } to override.',
      });
    }
    return this.adapter.signInWithPassword(credentials);
  }

  signOut() {
    return this.adapter.signOut();
  }

  getUser() {
    return this.adapter.getUser();
  }

  getSession() {
    return this.adapter.getSession();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.adapter.onAuthStateChange(callback);
  }

  updateUser(attributes: { email?: string; password?: string; data?: Record<string, any> }) {
    return this.adapter.updateUser(attributes);
  }

  resetPasswordForEmail(email: string) {
    return this.adapter.resetPasswordForEmail(email);
  }
}
