import type { z } from 'zod'
import type {
  CreateClientOptions,
  UnifiedAdapter,
  TablesFromSchema,
} from '../core/types'
import { QueryBuilder } from './queryBuilder'
import { createAuthProxy, type VibecodeAuthClient } from '../auth/authClient'

/**
 * Strongly-typed client bound to your Zod DB schema.
 *
 * Use `from(<table>)` to start a query, chain filters/order/limits,
 * then finalize with `.select()` (executes) or call `.insert/.update/.delete`.
 *
 * Use `.auth` to access authentication methods (signIn, signUp, etc.)
 *
 * @typeParam S - Zod raw shape from your `z.object({ ...tables })`.
 *
 * @example
 * ```ts
 * const client = createClient({
 *   dbSpec,
 *   adapter: supabaseAdapter({ url, key, auth: { storage: AsyncStorage } })
 * })
 *
 * // Database operations
 * const { data, error } = await client.from('users').select('*')
 *
 * // Auth operations
 * await client.auth.signIn({ email, password })
 * ```
 */
export type VibecodeClient<S extends z.ZodRawShape> = {
  from<TName extends TablesFromSchema<S>>(table: TName): QueryBuilder<S, TName>
  /**
   * Authentication operations.
   * Throws helpful error if auth was not configured in adapter options.
   */
  auth: VibecodeAuthClient
}

/**
 * Create a vibecode client.
 *
 * @public
 * @param opts - `{ dbSpec, adapter }` where adapter is a factory function.
 * The adapter factory receives your DBSpec (schema + optional seed/meta)
 * and returns a UnifiedAdapter with database and optional auth capabilities.
 *
 * @returns A client exposing:
 *   - `.from(<table>)` → chain filters/order → finalize with `.select()`, or call `.insert/.update/.delete`
 *   - `.auth` → authentication methods (signIn, signUp, etc.) - throws if not configured
 *
 * @example
 * ```ts
 * const client = createClient({
 *   dbSpec: { schema: DBSchema, seed },
 *   adapter: supabaseAdapter({ url, key, auth: { storage } })
 * })
 *
 * // Database operations
 * const { data } = await client.from('users').select('*')
 *
 * // Auth operations
 * const { data: session } = await client.auth.signIn({ email, password })
 * ```
 */
export function createClient<S extends z.ZodRawShape>(opts: CreateClientOptions<S>): VibecodeClient<S> {
  const adapter: UnifiedAdapter = opts.adapter(opts.dbSpec)

  // Create auth proxy (throws helpful error if auth not configured)
  const authProxy = createAuthProxy(adapter.auth)

  return {
    from<TName extends TablesFromSchema<S>>(table: TName) {
      const ref = adapter.from(table as string)
      const tableSchema = (opts.dbSpec.schema.shape as any)[table] as z.ZodObject<any>
      return new QueryBuilder<S, TName>(table, ref, tableSchema)
    },
    auth: authProxy
  }
}
