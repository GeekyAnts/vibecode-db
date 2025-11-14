import type { DatabaseAdapter, AdapterTableExecutor, DBSpec } from '../../core/types'
import { CustomTableExecutor } from './executor'
import type { CustomAdapterOptions } from './types'

/**
 * CustomAdapter — flexible adapter for connecting to custom backends via REST APIs or any other protocol.
 *
 * This adapter allows you to define your own CRUD operation handlers that receive the query state
 * built by vibecode-db's QueryBuilder. You can transform this state into REST API calls, GraphQL queries,
 * or any other backend communication protocol.
 *
 * @public
 * @param dbSpec - Your DBSpec (schema + optional seed/meta).
 * @param options - Configuration including CRUD handlers and optional initialization.
 *
 * @example
 * ```ts
 * import { createClient } from '@vibecode-db/client'
 * import { CustomAdapter } from '@vibecode-db/client/adapters/custom'
 *
 * const API_BASE_URL = 'https://api.example.com'
 *
 * const vibecode = createClient({
 *   dbSpec: { schema: DBSchema },
 *   adapter: (dbSpec) => new CustomAdapter(dbSpec, {
 *     handlers: {
 *       select: async (projection, ctx) => {
 *         // Build URL from query state
 *         let url = `${API_BASE_URL}/${ctx.table}?`
 *
 *         // Add filters
 *         const filters = ctx.state.filters.map(f => {
 *           switch (f.type) {
 *             case 'eq': return `${f.column}=eq.${f.value}`
 *             case 'gt': return `${f.column}=gt.${f.value}`
 *             case 'in': return `${f.column}=in.(${f.value.join(',')})`
 *             // ... handle other filter types
 *             default: return ''
 *           }
 *         }).filter(Boolean)
 *         if (filters.length) url += filters.join('&')
 *
 *         // Add ordering
 *         if (ctx.state.order) {
 *           url += `&order=${ctx.state.order.column}.${ctx.state.order.ascending ? 'asc' : 'desc'}`
 *         }
 *
 *         // Add limit
 *         if (ctx.state.limit) {
 *           url += `&limit=${ctx.state.limit}`
 *         }
 *
 *         // Add range
 *         if (ctx.state.range) {
 *           url += `&offset=${ctx.state.range.from}&limit=${ctx.state.range.to - ctx.state.range.from + 1}`
 *         }
 *
 *         try {
 *           const response = await fetch(url)
 *           const data = await response.json()
 *           return { data, error: null }
 *         } catch (error) {
 *           return { data: null, error: error as Error }
 *         }
 *       },
 *
 *       insert: async (values, ctx) => {
 *         try {
 *           const response = await fetch(`${API_BASE_URL}/${ctx.table}`, {
 *             method: 'POST',
 *             headers: { 'Content-Type': 'application/json' },
 *             body: JSON.stringify(values)
 *           })
 *           const data = await response.json()
 *           return { data, error: null }
 *         } catch (error) {
 *           return { data: null, error: error as Error }
 *         }
 *       },
 *
 *       update: async (patch, ctx) => {
 *         let url = `${API_BASE_URL}/${ctx.table}?`
 *         const filters = ctx.state.filters.map(f => `${f.column}=eq.${f.value}`).join('&')
 *         if (filters) url += filters
 *
 *         try {
 *           const response = await fetch(url, {
 *             method: 'PATCH',
 *             headers: { 'Content-Type': 'application/json' },
 *             body: JSON.stringify(patch)
 *           })
 *           const data = await response.json()
 *           return { data, error: null }
 *         } catch (error) {
 *           return { data: null, error: error as Error }
 *         }
 *       },
 *
 *       delete: async (ctx) => {
 *         let url = `${API_BASE_URL}/${ctx.table}?`
 *         const filters = ctx.state.filters.map(f => `${f.column}=eq.${f.value}`).join('&')
 *         if (filters) url += filters
 *
 *         try {
 *           await fetch(url, { method: 'DELETE' })
 *           return { data: null, error: null }
 *         } catch (error) {
 *           return { data: null, error: error as Error }
 *         }
 *       }
 *     },
 *     onInit: async () => {
 *       // Optional: perform any initialization (e.g., authenticate)
 *       console.log('Custom adapter initialized')
 *     }
 *   })
 * })
 *
 * // Now use the fluent API as usual:
 * const { data } = await vibecode
 *   .from('users')
 *   .eq('status', 'active')
 *   .gt('age', 18)
 *   .order('created_at', { ascending: false })
 *   .limit(10)
 *   .select('id, name, email')
 * ```
 */
export class CustomAdapter implements DatabaseAdapter {
  private ready: Promise<void>

  constructor(
    private dbSpec: DBSpec<any>,
    private options: CustomAdapterOptions
  ) {
    // Execute optional initialization
    this.ready = Promise.resolve(options.onInit?.()).then(() => {})
  }

  from(table: string): AdapterTableExecutor {
    // Validate table exists in schema
    const tableSchema = (this.dbSpec.schema.shape as any)[table]
    if (!tableSchema) {
      throw new Error(`Table "${table}" not found in schema`)
    }

    return new CustomTableExecutor(table, this.options.handlers, this.ready)
  }
}
