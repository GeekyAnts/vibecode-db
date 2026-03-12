import type { AuthAdapter } from '../adapters/types';

export class AuthClient {
  private adapter: AuthAdapter;

  constructor(adapter: AuthAdapter) {
    this.adapter = adapter;
  }

  signUp(credentials: { email?: string; phone?: string; password: string }) {
    return this.adapter.signUp(credentials);
  }

  signInWithPassword(credentials: { email?: string; phone?: string; password: string }) {
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
