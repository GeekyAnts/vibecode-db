import type { FilterOp } from '../../core/types'
import type { CustomAdapterHandlers, CustomAdapterContext } from './types'

/**
 * Configuration for REST API handler builder.
 */
export interface RESTHandlerConfig {
  /** Base URL for the API (e.g., 'https://api.example.com') */
  baseUrl: string
  /**
   * Optional function to transform filter operations into query parameters.
   * Default implementation creates PostgREST-style filters (column=eq.value).
   *
   * @example
   * ```ts
   * // Custom filter format
   * formatFilter: (filter) => {
   *   switch (filter.type) {
   *     case 'eq': return `${filter.column}=${filter.value}`
   *     case 'gt': return `${filter.column}_gt=${filter.value}`
   *     case 'in': return `${filter.column}_in=${filter.value.join(',')}`
   *   }
   * }
   * ```
   */
  formatFilter?: (filter: FilterOp) => string
  /**
   * Optional function to customize headers for all requests.
   * Useful for adding authentication tokens, content types, etc.
   *
   * @example
   * ```ts
   * headers: () => ({
   *   'Authorization': `Bearer ${token}`,
   *   'Content-Type': 'application/json'
   * })
   * ```
   */
  headers?: () => Record<string, string> | Promise<Record<string, string>>
  /**
   * Optional custom error handler.
   * Receives the Response object and should return an Error.
   * Default implementation creates an error with the status text.
   */
  handleError?: (response: Response) => Promise<Error>
}

/**
 * Default filter formatter using PostgREST-style query parameters.
 * Converts vibecode-db filter operations to URL query string format.
 *
 * @example
 * ```ts
 * { type: 'eq', column: 'status', value: 'active' } => 'status=eq.active'
 * { type: 'gt', column: 'age', value: 18 } => 'age=gt.18'
 * { type: 'in', column: 'id', value: [1,2,3] } => 'id=in.(1,2,3)'
 * ```
 */
export function defaultFormatFilter(filter: FilterOp): string {
  switch (filter.type) {
    case 'eq':
      return `${filter.column}=eq.${filter.value}`
    case 'ne':
      return `${filter.column}=neq.${filter.value}`
    case 'gt':
      return `${filter.column}=gt.${filter.value}`
    case 'gte':
      return `${filter.column}=gte.${filter.value}`
    case 'lt':
      return `${filter.column}=lt.${filter.value}`
    case 'lte':
      return `${filter.column}=lte.${filter.value}`
    case 'in':
      return `${filter.column}=in.(${filter.value.join(',')})`
    case 'like':
      return `${filter.column}=like.${filter.value}`
    default:
      return ''
  }
}

/**
 * Builds query string from CustomAdapterContext state.
 * Includes filters, ordering, limit, and range parameters.
 */
function buildQueryString(
  ctx: CustomAdapterContext,
  formatFilter: (filter: FilterOp) => string
): string {
  const params: string[] = []

  // Add filters
  for (const filter of ctx.state.filters) {
    const formatted = formatFilter(filter)
    if (formatted) params.push(formatted)
  }

  // Add ordering
  if (ctx.state.order) {
    const direction = ctx.state.order.ascending ? 'asc' : 'desc'
    params.push(`order=${ctx.state.order.column}.${direction}`)
    if (ctx.state.order.nullsFirst !== undefined) {
      params.push(`nullsfirst=${ctx.state.order.nullsFirst}`)
    }
  }

  // Add limit
  if (ctx.state.limit !== undefined) {
    params.push(`limit=${ctx.state.limit}`)
  }

  // Add range (converts to offset + limit if both exist)
  if (ctx.state.range) {
    const { from, to } = ctx.state.range
    params.push(`offset=${from}`)
    // If no explicit limit, use range to determine it
    if (ctx.state.limit === undefined) {
      params.push(`limit=${to - from + 1}`)
    }
  }

  return params.length > 0 ? '?' + params.join('&') : ''
}

/**
 * Creates a ready-to-use set of CRUD handlers for REST APIs.
 * Provides sensible defaults for common REST API patterns (PostgREST-style).
 *
 * @param config - Configuration for the REST API connection
 * @returns CustomAdapterHandlers ready to use with CustomAdapter
 *
 * @example
 * ```ts
 * import { createClient } from '@vibecode-db/client'
 * import { CustomAdapter, createRESTHandlers } from '@vibecode-db/client/adapters/custom'
 *
 * const vibecode = createClient({
 *   dbSpec: { schema: DBSchema },
 *   adapter: (dbSpec) => new CustomAdapter(dbSpec, {
 *     handlers: createRESTHandlers({
 *       baseUrl: 'https://api.example.com',
 *       headers: () => ({
 *         'Authorization': `Bearer ${getToken()}`,
 *         'Content-Type': 'application/json'
 *       })
 *     })
 *   })
 * })
 * ```
 */
export function createRESTHandlers(config: RESTHandlerConfig): CustomAdapterHandlers {
  const formatFilter = config.formatFilter ?? defaultFormatFilter
  const getHeaders = config.headers ?? (() => ({ 'Content-Type': 'application/json' }))
  const handleError = config.handleError ?? (async (response: Response) => {
    const text = await response.text()
    return new Error(`HTTP ${response.status}: ${text || response.statusText}`)
  })

  return {
    select: async (projection, ctx) => {
      try {
        const queryString = buildQueryString(ctx, formatFilter)
        const url = `${config.baseUrl}/${ctx.table}${queryString}`
        const baseHeaders = await getHeaders()

        // Add select projection to headers (PostgREST style) or params
        // This is a common pattern; adjust based on your API
        const headers: Record<string, string> = { ...baseHeaders }
        if (projection && projection !== '*') {
          headers['Prefer'] = `return=representation`
        }

        const response = await fetch(url, { headers })

        if (!response.ok) {
          const error = await handleError(response)
          return { data: null, error }
        }

        const data = await response.json()
        return { data, error: null }
      } catch (error) {
        return { data: null, error: error as Error }
      }
    },

    insert: async (values, ctx) => {
      try {
        const url = `${config.baseUrl}/${ctx.table}`
        const baseHeaders = await getHeaders()
        const headers: Record<string, string> = {
          ...baseHeaders,
          'Prefer': 'return=representation' // Request the inserted data back
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(values),
        })

        if (!response.ok) {
          const error = await handleError(response)
          return { data: null, error }
        }

        const data = await response.json()
        return { data, error: null }
      } catch (error) {
        return { data: null, error: error as Error }
      }
    },

    update: async (patch, ctx) => {
      try {
        const queryString = buildQueryString(ctx, formatFilter)
        const url = `${config.baseUrl}/${ctx.table}${queryString}`
        const baseHeaders = await getHeaders()
        const headers: Record<string, string> = {
          ...baseHeaders,
          'Prefer': 'return=representation' // Request the updated data back
        }

        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(patch),
        })

        if (!response.ok) {
          const error = await handleError(response)
          return { data: null, error }
        }

        const data = await response.json()
        return { data, error: null }
      } catch (error) {
        return { data: null, error: error as Error }
      }
    },

    delete: async (ctx) => {
      try {
        const queryString = buildQueryString(ctx, formatFilter)
        const url = `${config.baseUrl}/${ctx.table}${queryString}`
        const headers = await getHeaders()

        const response = await fetch(url, {
          method: 'DELETE',
          headers,
        })

        if (!response.ok) {
          const error = await handleError(response)
          return { data: null, error }
        }

        return { data: null, error: null }
      } catch (error) {
        return { data: null, error: error as Error }
      }
    },
  }
}
