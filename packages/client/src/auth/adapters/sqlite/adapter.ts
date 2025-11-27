import type { AuthAdapter, AuthSpec } from '../../types'
import type { SQLiteAuthAdapterOptions } from './types'
import type { SqlDriver } from '@vibecode-db/sqlite-core'
import { SQLiteAuthExecutor } from './executor'
import { applyAuthMigrations, seedAuthDatabase } from './utils'

/**
 * SQLite auth adapter - implements auth operations for SQLite
 */
export class SQLiteAuthAdapter implements AuthAdapter {
  private executor: SQLiteAuthExecutor
  private ready: Promise<void>

  constructor(
    private authSpec: AuthSpec,
    private options: SQLiteAuthAdapterOptions
  ) {
    this.executor = new SQLiteAuthExecutor(options.getDriver, options)
    this.ready = this.init()
  }

  private get driver(): SqlDriver {
    return this.options.getDriver()
  }

  private async init(): Promise<void> {
    // Wait for driver to be ready if provided
    if (this.options.ready) {
      await this.options.ready
    }

    // Apply migrations
    await applyAuthMigrations(this.driver)

    // Seed database if seed data provided
    await seedAuthDatabase(
      this.driver,
      this.authSpec,
      this.options.seedBehavior ?? 'upsert'
    )
  }

  private async ensureReady(): Promise<void> {
    await this.ready
  }

  async signUp(credentials) {
    await this.ensureReady()
    return this.executor.signUp(credentials)
  }

  async signIn(credentials) {
    await this.ensureReady()
    return this.executor.signIn(credentials)
  }

  async signOut() {
    await this.ensureReady()
    return this.executor.signOut()
  }

  async getSession() {
    await this.ensureReady()
    return this.executor.getSession()
  }

  async refreshSession(refreshToken?) {
    await this.ensureReady()
    return this.executor.refreshSession(refreshToken)
  }

  async resetPassword(request) {
    await this.ensureReady()
    return this.executor.resetPassword(request)
  }

  async resetPasswordConfirm(confirm) {
    await this.ensureReady()
    return this.executor.resetPasswordConfirm(confirm)
  }

  async changePassword(request) {
    await this.ensureReady()
    return this.executor.changePassword(request)
  }

  async updateUser(updates) {
    await this.ensureReady()
    return this.executor.updateUser(updates)
  }

  async getUser() {
    await this.ensureReady()
    return this.executor.getUser()
  }
}

