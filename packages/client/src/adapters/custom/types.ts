import type { QueryState, SelectResult, MutateResult } from '../../core/types'

/**
 * Context object passed to custom handler functions.
 * Provides access to the table name and query state built by the QueryBuilder.
 */
export interface CustomAdapterContext {
  /** The table name being queried */
  table: string
  /** The query state containing filters, order, limit, range, projection, etc. */
  state: QueryState
}

/**
 * Handler for SELECT operations.
 * Receives the projection string and context with query state.
 * Should return data matching the projection.
 *
 * @example
 * ```ts
 * const selectHandler: SelectHandler = async (projection, ctx) => {
 *   let url = `${baseUrl}/${ctx.table}?`
 *
 *   // Add filters
 *   url += ctx.state.filters.map(f => `${f.column}=${f.value}`).join('&')
 *
 *   // Add ordering
 *   if (ctx.state.order) {
 *     url += `&order=${ctx.state.order.column}:${ctx.state.order.ascending ? 'asc' : 'desc'}`
 *   }
 *
 *   // Add limit/range
 *   if (ctx.state.limit) url += `&limit=${ctx.state.limit}`
 *
 *   const response = await fetch(url)
 *   const data = await response.json()
 *   return { data, error: null }
 * }
 * ```
 */
export type SelectHandler = (
  projection: string | undefined,
  ctx: CustomAdapterContext
) => SelectResult<any>

/**
 * Handler for INSERT operations.
 * Receives the values to insert and table context.
 * Should return the inserted data.
 *
 * @example
 * ```ts
 * const insertHandler: InsertHandler = async (values, ctx) => {
 *   const response = await fetch(`${baseUrl}/${ctx.table}`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(values)
 *   })
 *   const data = await response.json()
 *   return { data, error: null }
 * }
 * ```
 */
export type InsertHandler = (
  values: any | any[],
  ctx: Omit<CustomAdapterContext, 'state'>
) => MutateResult<any>

/**
 * Handler for UPDATE operations.
 * Receives the patch object and context with query state (for filtering which rows to update).
 * Should return the updated data.
 *
 * @example
 * ```ts
 * const updateHandler: UpdateHandler = async (patch, ctx) => {
 *   let url = `${baseUrl}/${ctx.table}?`
 *   url += ctx.state.filters.map(f => `${f.column}=${f.value}`).join('&')
 *
 *   const response = await fetch(url, {
 *     method: 'PATCH',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(patch)
 *   })
 *   const data = await response.json()
 *   return { data, error: null }
 * }
 * ```
 */
export type UpdateHandler = (
  patch: Record<string, unknown>,
  ctx: CustomAdapterContext
) => MutateResult<any>

/**
 * Handler for DELETE operations.
 * Receives context with query state (for filtering which rows to delete).
 * Should return null data on success.
 *
 * @example
 * ```ts
 * const deleteHandler: DeleteHandler = async (ctx) => {
 *   let url = `${baseUrl}/${ctx.table}?`
 *   url += ctx.state.filters.map(f => `${f.column}=${f.value}`).join('&')
 *
 *   await fetch(url, { method: 'DELETE' })
 *   return { data: null, error: null }
 * }
 * ```
 */
export type DeleteHandler = (
  ctx: CustomAdapterContext
) => MutateResult<null>

/**
 * Collection of CRUD operation handlers for the CustomAdapter.
 * All handlers are required.
 */
export interface CustomAdapterHandlers {
  /** Handler for SELECT queries */
  select: SelectHandler
  /** Handler for INSERT operations */
  insert: InsertHandler
  /** Handler for UPDATE operations */
  update: UpdateHandler
  /** Handler for DELETE operations */
  delete: DeleteHandler
}

/**
 * Options for creating a CustomAdapter.
 */
export interface CustomAdapterOptions {
  /** CRUD operation handlers */
  handlers: CustomAdapterHandlers
  /**
   * Optional initialization function called once when the adapter is created.
   * Useful for setting up connections, authentication, etc.
   * The adapter will wait for this to resolve before executing any operations.
   */
  onInit?: () => Promise<void> | void
}
