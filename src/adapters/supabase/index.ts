import type { z } from 'zod'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import type {
  AdapterTableRef,
  DatabaseAdapter,
  FilterOp,
  OrderSpec,
  QueryState,
  DBSpec
} from '../../core/types'

class SupabaseTable implements AdapterTableRef {
  _state: QueryState = { filters: [] }
  private tableSchema: z.ZodObject<any>

  constructor(
    private table: string,
    tableSchema: z.ZodObject<any>,
    private sb: SupabaseClient,
    private ready: Promise<void>
  ) {
    this.tableSchema = tableSchema
  }

  private ensureValidFilters() {
    const shape = this.tableSchema.shape as Record<string, unknown>
    for (const f of this._state.filters) {
      if (!(f.column in shape)) {
        throw new Error(`Unknown column "${f.column}" for table "${this.table}"`)
      }
      if (f.type === 'in' && !Array.isArray(f.value)) {
        throw new Error(`Filter "in" expects an array for column "${f.column}"`)
      }
    }
  }

  private validateInsert(values: any | any[]) {
    if (Array.isArray(values)) this.tableSchema.array().parse(values)
    else this.tableSchema.parse(values)
  }

  private validateUpdate(patch: Record<string, unknown>) {
    this.tableSchema.partial().parse(patch)
  }

  private applyFilters(query: any) {
    for (const f of this._state.filters) {
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
    if (this._state.order) {
      const { column, ascending = true, nullsFirst } = this._state.order
      query = query.order(column, { ascending, nullsFirst })
    }
    if (typeof this._state.limit === 'number') {
      query = query.limit(this._state.limit)
    }
    if (this._state.range) {
      const { from, to } = this._state.range
      query = query.range(from, to)
    }
    return query
  }

  async select(select?: string) {
    await this.ready
    this.ensureValidFilters()
    let q = this.sb.from(this.table).select(select ?? '*')
    q = this.applyFilters(q)
    const { data, error } = await q
    return { data: (data as any) ?? null, error: (error as any) ?? null }
  }

  async insert(values: any | any[]) {
    await this.ready
    this.validateInsert(values)
    const { data, error } = await this.sb.from(this.table).insert(values).select('*')
    return { data: (data as any) ?? null, error: (error as any) ?? null }
  }

  async update(patch: Record<string, unknown>) {
    await this.ready
    this.validateUpdate(patch)
    let q = this.sb.from(this.table).update(patch).select('*')
    q = this.applyFilters(q)
    const { data, error } = await q
    return { data: (data as any) ?? null, error: (error as any) ?? null }
  }

  async delete() {
    await this.ready
    this.ensureValidFilters()
    let q = this.sb.from(this.table).delete().select('*')
    q = this.applyFilters(q)
    const { data, error } = await q
    return { data: (data as any) ?? null, error: (error as any) ?? null }
  }

  order(by: OrderSpec) { this._state.order = by }
  where(op: FilterOp) { this._state.filters.push(op) }
  setLimit(n: number) { this._state.limit = n }
  setRange(from: number, to: number) { this._state.range = { from, to } }
}

export type SupabaseAdapterOptions = { url: string; key: string }

/**
 * SupabaseAdapter — production-ready adapter for Supabase/PostgREST.
 *
 * @public
 * @param dbSpec - Your DBSpec (schema + optional seed/meta). Seed rows are validated and upserted once at startup.
 * @param opts - Supabase project URL and anon/public key.
 *
 * @example
 * ```ts
 * const vibecode = createClient({
 *   dbSpec: { schema: DBSchema },
 *   adapter: (ctx) => new SupabaseAdapter(ctx, { url: SUPABASE_URL, key: SUPABASE_ANON })
 * })
 * const { data } = await vibecode.from('posts').eq('published', true).order('created_at', { ascending: false }).select('*')
 * ```
 */
export class SupabaseAdapter implements DatabaseAdapter {
  private sb: SupabaseClient
  private ready: Promise<void>

  constructor(
    private dbSpec: DBSpec<any>,            // <-- use DBSpec (schema + seed + meta)
    opts: SupabaseAdapterOptions
  ) {
    this.sb = createSupabaseClient(opts.url, opts.key)
    // Kick off seeding immediately; table operations await this.ready
    this.ready = this.seedIfAny().catch((e) => {
      // Surface seeding errors later when operations await `ready`
      throw e
    })
  }

  from(table: string): AdapterTableRef {
    const ts = (this.dbSpec.schema.shape as any)[table]
    if (!ts) throw new Error(`Table "${table}" not found in schema`)
    return new SupabaseTable(table, ts, this.sb, this.ready)
  }

  /**
   * Validate and insert seed rows per table once.
   * Uses upsert to avoid conflicts on reruns (assumes primary keys exist).
   */
  private async seedIfAny(): Promise<void> {
    const seed = this.dbSpec.seed
    if (!seed) return

    // Iterate seed tables deterministically
    for (const table of Object.keys(seed)) {
      const rows = (seed as Record<string, any[]>)[table]
      if (!Array.isArray(rows) || rows.length === 0) continue

      const ts = (this.dbSpec.schema.shape as any)[table]
      if (!ts) throw new Error(`Seed provided for unknown table "${table}"`)

      // Validate all rows against the Zod table schema
      ts.array().parse(rows)

      // Insert (upsert to avoid duplicate key errors on repeated runs)
      // Note: Upsert infers conflict target from primary key.
      const { error } = await this.sb.from(table).upsert(rows).select('*')
      if (error) throw error
    }
  }
}
