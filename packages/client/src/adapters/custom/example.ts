/**
 * Example: Using CustomAdapter with a REST API
 *
 * This example demonstrates how to connect vibecode-db to a custom REST API backend.
 * We'll use JSONPlaceholder (a fake REST API) as an example.
 */

import { z } from 'zod'
import { createClient } from '../../client/createClient'
import { CustomAdapter, createRESTHandlers } from './index'
import type { FilterOp } from '../../core/types'

// ============================================================================
// 1. Define your schema
// ============================================================================

const DBSchema = z.object({
  users: z.object({
    id: z.number(),
    name: z.string(),
    username: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    website: z.string().optional(),
  }),
  posts: z.object({
    id: z.number(),
    userId: z.number(),
    title: z.string(),
    body: z.string(),
  }),
  comments: z.object({
    id: z.number(),
    postId: z.number(),
    name: z.string(),
    email: z.string(),
    body: z.string(),
  }),
})

// ============================================================================
// 2. Example 1: Manual handler implementation
// ============================================================================

export function createManualExample() {
  const API_BASE = 'https://jsonplaceholder.typicode.com'

  const db = createClient({
    dbSpec: { schema: DBSchema },
    adapter: (dbSpec) => new CustomAdapter(dbSpec, {
      handlers: {
        select: async (projection, ctx) => {
          try {
            // Build URL with filters
            let url = `${API_BASE}/${ctx.table}`

            // JSONPlaceholder supports simple query params
            const params = new URLSearchParams()

            for (const filter of ctx.state.filters) {
              if (filter.type === 'eq') {
                params.append(filter.column, String(filter.value))
              }
              // Note: JSONPlaceholder only supports exact matches
              // In a real API, you'd handle gt, lt, in, like, etc.
            }

            const queryString = params.toString()
            if (queryString) url += `?${queryString}`

            // Add pagination
            if (ctx.state.limit) {
              params.append('_limit', String(ctx.state.limit))
            }
            if (ctx.state.range) {
              params.append('_start', String(ctx.state.range.from))
              params.append('_end', String(ctx.state.range.to + 1))
            }

            console.log('Fetching:', url)
            const response = await fetch(url)

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()

            // Apply client-side filtering for unsupported operations
            let filtered = data
            for (const filter of ctx.state.filters) {
              if (filter.type === 'gt') {
                filtered = filtered.filter((row: any) => row[filter.column] > filter.value)
              } else if (filter.type === 'lt') {
                filtered = filtered.filter((row: any) => row[filter.column] < filter.value)
              } else if (filter.type === 'in') {
                filtered = filtered.filter((row: any) =>
                  (filter.value as unknown[]).includes(row[filter.column])
                )
              }
            }

            // Apply ordering
            if (ctx.state.order) {
              const { column, ascending = true } = ctx.state.order
              filtered.sort((a: any, b: any) => {
                if (a[column] < b[column]) return ascending ? -1 : 1
                if (a[column] > b[column]) return ascending ? 1 : -1
                return 0
              })
            }

            return { data: filtered, error: null }
          } catch (error) {
            console.error('Select error:', error)
            return { data: null, error: error as Error }
          }
        },

        insert: async (values, ctx) => {
          try {
            const url = `${API_BASE}/${ctx.table}`
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(values),
            })

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            console.log('Inserted:', data)
            return { data, error: null }
          } catch (error) {
            console.error('Insert error:', error)
            return { data: null, error: error as Error }
          }
        },

        update: async (patch, ctx) => {
          try {
            // JSONPlaceholder requires ID in the URL
            // In practice, you'd extract it from filters
            const idFilter = ctx.state.filters.find(f => f.column === 'id' && f.type === 'eq')
            if (!idFilter) {
              throw new Error('Update requires id filter')
            }

            const url = `${API_BASE}/${ctx.table}/${idFilter.value}`
            const response = await fetch(url, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(patch),
            })

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            console.log('Updated:', data)
            return { data: [data], error: null }
          } catch (error) {
            console.error('Update error:', error)
            return { data: null, error: error as Error }
          }
        },

        delete: async (ctx) => {
          try {
            // JSONPlaceholder requires ID in the URL
            const idFilter = ctx.state.filters.find(f => f.column === 'id' && f.type === 'eq')
            if (!idFilter) {
              throw new Error('Delete requires id filter')
            }

            const url = `${API_BASE}/${ctx.table}/${idFilter.value}`
            const response = await fetch(url, { method: 'DELETE' })

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            console.log('Deleted successfully')
            return { data: null, error: null }
          } catch (error) {
            console.error('Delete error:', error)
            return { data: null, error: error as Error }
          }
        },
      },

      onInit: async () => {
        console.log('CustomAdapter initialized for JSONPlaceholder API')
      },
    })
  })

  return db
}

// ============================================================================
// 3. Example 2: Using the REST helper (PostgREST-style)
// ============================================================================

export function createRESTHelperExample() {
  const db = createClient({
    dbSpec: { schema: DBSchema },
    adapter: (dbSpec) => new CustomAdapter(dbSpec, {
      handlers: createRESTHandlers({
        baseUrl: 'https://your-postgrest-api.com',

        // Custom filter formatting for your API
        formatFilter: (filter: FilterOp) => {
          switch (filter.type) {
            case 'eq': return `${filter.column}=eq.${filter.value}`
            case 'ne': return `${filter.column}=neq.${filter.value}`
            case 'gt': return `${filter.column}=gt.${filter.value}`
            case 'gte': return `${filter.column}=gte.${filter.value}`
            case 'lt': return `${filter.column}=lt.${filter.value}`
            case 'lte': return `${filter.column}=lte.${filter.value}`
            case 'in': return `${filter.column}=in.(${filter.value.join(',')})`
            case 'like': return `${filter.column}=like.${filter.value}`
            default: return ''
          }
        },

        // Add authentication headers
        headers: async () => {
          // In a real app, you might fetch this from localStorage or a token manager
          const token = 'your-auth-token'
          return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        },

        // Custom error handling
        handleError: async (response) => {
          try {
            const body = await response.json()
            return new Error(`API Error ${response.status}: ${body.message || body.error}`)
          } catch {
            return new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
        },
      }),

      onInit: async () => {
        console.log('REST adapter initialized')
        // Optionally verify connection or authenticate here
      },
    })
  })

  return db
}

// ============================================================================
// 4. Usage examples
// ============================================================================

export async function runExamples() {
  // Example 1: Manual implementation
  console.log('\\n=== Example 1: Manual Implementation ===\\n')
  const db1 = createManualExample()

  // Select with filters
  const { data: users, error: usersError } = await db1
    .from('users')
    .eq('id', 1)
    .select('id, name, email, username')

  console.log('Users:', users)
  if (usersError) console.error('Error:', usersError)

  // Select posts with limit and ordering
  const { data: posts, error: postsError } = await db1
    .from('posts')
    .eq('userId', 1)
    .limit(5)
    .select('id, title, body')

  console.log('\\nPosts:', posts)
  if (postsError) console.error('Error:', postsError)

  // Insert a new post (will return fake ID from JSONPlaceholder)
  const { data: newPost, error: insertError } = await db1
    .from('posts')
    .insert({
      userId: 1,
      title: 'My New Post',
      body: 'This is a test post created via CustomAdapter',
    })

  console.log('\\nNew Post:', newPost)
  if (insertError) console.error('Error:', insertError)

  // Update a post
  const { data: updated, error: updateError } = await db1
    .from('posts')
    .eq('id', 1)
    .update({ title: 'Updated Title' })

  console.log('\\nUpdated Post:', updated)
  if (updateError) console.error('Error:', updateError)

  // Delete a post
  const { data: deleted, error: deleteError } = await db1
    .from('posts')
    .eq('id', 1)
    .delete()

  console.log('\\nDeleted:', deleted)
  if (deleteError) console.error('Error:', deleteError)

  // Advanced filtering
  const { data: filtered, error: filterError } = await db1
    .from('posts')
    .in('userId', [1, 2, 3])
    .limit(10)
    .select('*')

  console.log('\\nFiltered Posts:', filtered)
  if (filterError) console.error('Error:', filterError)
}

// Uncomment to run examples:
// runExamples().catch(console.error)
