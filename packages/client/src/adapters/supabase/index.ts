import type { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getOrCreateClient, getSupabaseStorageKey } from './clientRegistry'
import { SupabaseAuthExecutor } from './authExecutor'

// Export helper for getting storage key
export { getSupabaseStorageKey }

import type {
  AdapterTableExecutor,
  UnifiedAdapter,
  QueryState,
  DBSpec,
  AuthExecutor,
  UnifiedAdapterFactory,
} from '../../core/types'

class SupabaseTableExecutor implements AdapterTableExecutor {
  constructor(
    private table: string,
    private sb: SupabaseClient,
    private ready: Promise<void>
  ) {}

  private applyFilters(query: any, state: QueryState) {
    for (const f of state.filters) {
      switch (f.type) {
        case 'eq': query = query.eq(f.column, f.value as any); break
        case 'ne': query = query.neq(f.column, f.value as any); break
        case 'gt': query = query.gt(f.column, f.value as any); break
        case 'gte': query = query.gte(f.column, f.value as any); break
        case 'lt': query = query.lt(f.column, f.value as any); break
        case 'lte': query = query.lte(f.column, f.value as any); break
        case 'in': query = query.in(f.column, f.value as any[]); break
        case 'like': query = query.like(f.column, f.value as string); break
      }
    }
    if (state.order) {
      const { column, ascending = true, nullsFirst } = state.order
      query = query.order(column, { ascending, nullsFirst })
    }
    if (typeof state.limit === 'number') {
      query = query.limit(state.limit)
    }
    if (state.range) {
      const { from, to } = state.range
      query = query.range(from, to)
    }
    return query
  }

  async select(select?: string, state?: QueryState) {
    await this.ready
    let q = this.sb.from(this.table).select(select ?? '*')
    if (state) q = this.applyFilters(q, state)
    const { data, error } = await q
    return { data: (data as any) ?? null, error: (error as any) ?? null }
  }

  async insert(values: any | any[]) {
    await this.ready
    const { data, error } = await this.sb.from(this.table).insert(values).select('*')
    return { data: (data as any) ?? null, error: (error as any) ?? null }
  }

  async update(patch: Record<string, unknown>, state?: QueryState) {
    await this.ready
    let q = this.sb.from(this.table).update(patch).select('*')
    if (state) q = this.applyFilters(q, state)
    const { data, error } = await q
    return { data: (data as any) ?? null, error: (error as any) ?? null }
  }

  async delete(state?: QueryState) {
    await this.ready
    let q = this.sb.from(this.table).delete().select('*')
    if (state) q = this.applyFilters(q, state)
    const { data, error } = await q
    return { data: (data as any) ?? null, error: (error as any) ?? null }
  }
}

/**
 * Supabase adapter options
 */
export type SupabaseAdapterOptions = {
  /** Supabase project URL */
  url: string
  /** Supabase anon/public key */
  key: string
  /**
   * Optional auth configuration.
   * If provided, client.auth will be available.
   * If omitted, client.auth will throw helpful error.
   */
  auth?: {
    /** Storage for session persistence (e.g., AsyncStorage for React Native) */
    storage?: any
  }
} | {
  /** Existing SupabaseClient instance */
  client: SupabaseClient
  /** Enable auth on the client */
  auth?: { enabled: true }
}

/**
 * SupabaseAdapter — unified adapter for Supabase (database + auth).
 *
 * @public
 * @param dbSpec - Your DBSpec (schema + optional seed/meta). Seed rows are validated and upserted once at startup.
 * @param opts - Supabase project URL/key OR an existing SupabaseClient instance.
 *
 * @remarks
 * The adapter uses a client registry to share the same SupabaseClient instance
 * for both database and auth operations, ensuring session sharing automatically.
 *
 * @example
 * ```ts
 * const client = createClient({
 *   dbSpec,
 *   adapter: supabaseAdapter({
 *     url: SUPABASE_URL,
 *     key: SUPABASE_KEY,
 *     auth: { storage: AsyncStorage } // Optional: for React Native
 *   })
 * })
 *
 * // Database operations
 * const { data } = await client.from('users').select('*')
 *
 * // Auth operations
 * await client.auth.signIn({ email, password })
 * ```
 */
export class SupabaseAdapter implements UnifiedAdapter {
  private sb: SupabaseClient
  private ready: Promise<void>
  private _auth: SupabaseAuthExecutor | undefined

  constructor(
    private dbSpec: DBSpec<any>,
    private opts: SupabaseAdapterOptions
  ) {
    // Use provided client or get/create from registry
    if ('client' in opts) {
      this.sb = opts.client
      // If auth is enabled with existing client
      if (opts.auth?.enabled) {
        this._auth = new SupabaseAuthExecutor(this.sb)
      }
    } else {
      // Use registry to ensure session sharing
      const storage = opts.auth?.storage
      this.sb = getOrCreateClient(opts.url, opts.key, storage)
      // Enable auth if auth config is provided
      if (opts.auth) {
        this._auth = new SupabaseAuthExecutor(this.sb)
      }
    }

    // Kick off seeding immediately; table operations await this.ready
    this.ready = this.seedIfAny().catch((e) => {
      throw e
    })
  }

  from(table: string): AdapterTableExecutor {
    const ts = (this.dbSpec.schema.shape as any)[table]
    if (!ts) throw new Error(`Table "${table}" not found in schema`)
    return new SupabaseTableExecutor(table, this.sb, this.ready)
  }

  /**
   * Auth executor (undefined if auth not configured)
   */
  get auth(): AuthExecutor | undefined {
    return this._auth
  }

  /**
   * Validate and insert seed rows per table once.
   * Uses upsert to avoid conflicts on reruns (assumes primary keys exist).
   */
  private async seedIfAny(): Promise<void> {
    const seed = this.dbSpec.seed
    if (!seed) return

    for (const table of Object.keys(seed)) {
      const rows = (seed as Record<string, any[]>)[table]
      if (!Array.isArray(rows) || rows.length === 0) continue

      const ts = (this.dbSpec.schema.shape as any)[table]
      if (!ts) throw new Error(`Seed provided for unknown table "${table}"`)

      // Validate all rows against the Zod table schema
      ts.array().parse(rows)

      // Insert (upsert to avoid duplicate key errors on repeated runs)
      const { error } = await this.sb.from(table).upsert(rows).select('*')
      if (error) throw error
    }
  }
}

/**
 * Factory function for creating Supabase adapter.
 *
 * @param opts - Supabase configuration options
 * @returns Adapter factory function for use with createClient
 *
 * @example
 * ```ts
 * const client = createClient({
 *   dbSpec,
 *   adapter: supabaseAdapter({
 *     url: SUPABASE_URL,
 *     key: SUPABASE_KEY,
 *     auth: { storage: AsyncStorage }
 *   })
 * })
 * ```
 */
export function supabaseAdapter(opts: SupabaseAdapterOptions): UnifiedAdapterFactory<any> {
  return <S extends z.ZodRawShape>(dbSpec: DBSpec<S>): UnifiedAdapter => {
    return new SupabaseAdapter(dbSpec, opts)
  }
}
