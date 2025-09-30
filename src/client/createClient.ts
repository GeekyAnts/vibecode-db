import type { z } from 'zod'
import type { CreateClientOptions, DatabaseAdapter, DBSpec, TablesFromSchema } from '../core/types'
import { QueryBuilder } from './queryBuilder'

/**
 * Strongly-typed client bound to your Zod DB schema.
 *
 * Use `from(<table>)` to start a query, chain filters/order/limits,
 * then finalize with `.select()` (executes) or call `.insert/.update/.delete`.
 *
 * @typeParam S - Zod raw shape from your `z.object({ ...tables })`.
 *
 * @example
 * ```ts
 * const db = createClient({ dbSpec, adapter: (ctx) => new FakeAdapter(ctx) })
 * const { data, error } = await db.from('users').order('created_at', { ascending: false }).select('*')
 * ```
 */
export type VibecodeClient<S extends z.ZodRawShape> = {
  from<TName extends TablesFromSchema<S>>(table: TName): QueryBuilder<S, TName>
}


/**
 * Create a vibecode client.
 *
 * @public
 * @param opts - Either `{ dbSpec, adapter }` (preferred) or `{ schema, adapter }` (back-compat).
 * The adapter is a factory that receives your DBSpec (schema + optional seed/meta).
 * @returns A client exposing `.from(<table>)` → chain filters/order → finalize with `.select()`, or call `.insert/.update/.delete`.
 *
 * @example
 * ```ts
 * const vibecode = createClient({
 *   dbSpec: { schema: DBSchema, seed },
 *   adapter: (ctx) => new FakeAdapter(ctx)
 * })
 * const { data } = await vibecode.from('users').order('created_at', { ascending: false }).select('*')
 * ```
 *
 * @remarks
 * In v0.1, `.select()` executes immediately. Chain filters/order **before** calling `select()`.
 */
export function createClient<S extends z.ZodRawShape>(opts: CreateClientOptions<S>): VibecodeClient<S> {
  const adapter: DatabaseAdapter = opts.adapter(opts.dbSpec)

  return {
    from(table) {
      const ref = adapter.from(table as string)  // adapter hook
      return new QueryBuilder<S, typeof table>(table, ref) // creates fluent API wrapper
    }
  }
}
