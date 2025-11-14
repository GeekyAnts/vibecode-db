# CustomAdapter

Connect vibecode-db to any backend service via custom CRUD handlers. Define your schema once, use vibecode-db's fluent query API, and implement your own data layer logic.

## Overview

The `CustomAdapter` allows you to:
- **Use any backend**: REST APIs, GraphQL, gRPC, or custom protocols
- **Access query state**: Get filters, ordering, pagination from the QueryBuilder
- **Transform freely**: Map vibecode-db operations to your API format
- **Type-safe**: Full TypeScript support with your schema types

## Quick Start

### Basic Usage

```typescript
import { createClient } from '@vibecode-db/client'
import { CustomAdapter } from '@vibecode-db/client/adapters/custom'
import { z } from 'zod'

// Define your schema
const DBSchema = z.object({
  users: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    age: z.number(),
    status: z.enum(['active', 'inactive'])
  }),
  posts: z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    content: z.string(),
    published: z.boolean()
  })
})

const API_BASE = 'https://api.example.com'

// Create client with CustomAdapter
const db = createClient({
  dbSpec: { schema: DBSchema },
  adapter: (dbSpec) => new CustomAdapter(dbSpec, {
    handlers: {
      // SELECT handler
      select: async (projection, ctx) => {
        let url = `${API_BASE}/${ctx.table}?`

        // Transform filters to query params
        const filters = ctx.state.filters.map(f => {
          switch (f.type) {
            case 'eq': return `${f.column}=${f.value}`
            case 'gt': return `${f.column}_gt=${f.value}`
            case 'lt': return `${f.column}_lt=${f.value}`
            case 'in': return `${f.column}_in=${f.value.join(',')}`
            // ... handle other filter types
          }
        }).filter(Boolean).join('&')

        if (filters) url += filters

        // Add ordering
        if (ctx.state.order) {
          url += `&sort=${ctx.state.order.column}`
          url += ctx.state.order.ascending ? '' : '&desc=true'
        }

        // Add limit
        if (ctx.state.limit) {
          url += `&limit=${ctx.state.limit}`
        }

        try {
          const res = await fetch(url)
          const data = await res.json()
          return { data, error: null }
        } catch (error) {
          return { data: null, error: error as Error }
        }
      },

      // INSERT handler
      insert: async (values, ctx) => {
        try {
          const res = await fetch(`${API_BASE}/${ctx.table}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values)
          })
          const data = await res.json()
          return { data, error: null }
        } catch (error) {
          return { data: null, error: error as Error }
        }
      },

      // UPDATE handler
      update: async (patch, ctx) => {
        let url = `${API_BASE}/${ctx.table}?`
        const filters = ctx.state.filters
          .map(f => `${f.column}=${f.value}`)
          .join('&')
        if (filters) url += filters

        try {
          const res = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch)
          })
          const data = await res.json()
          return { data, error: null }
        } catch (error) {
          return { data: null, error: error as Error }
        }
      },

      // DELETE handler
      delete: async (ctx) => {
        let url = `${API_BASE}/${ctx.table}?`
        const filters = ctx.state.filters
          .map(f => `${f.column}=${f.value}`)
          .join('&')
        if (filters) url += filters

        try {
          await fetch(url, { method: 'DELETE' })
          return { data: null, error: null }
        } catch (error) {
          return { data: null, error: error as Error }
        }
      }
    }
  })
})

// Use the fluent API as usual!
const { data: users } = await db
  .from('users')
  .eq('status', 'active')
  .gt('age', 18)
  .order('name', { ascending: true })
  .limit(10)
  .select('id, name, email')
```

### Using the REST Helper

For common REST API patterns (PostgREST-style), use the `createRESTHandlers` helper:

```typescript
import { CustomAdapter, createRESTHandlers } from '@vibecode-db/client/adapters/custom'

const db = createClient({
  dbSpec: { schema: DBSchema },
  adapter: (dbSpec) => new CustomAdapter(dbSpec, {
    handlers: createRESTHandlers({
      baseUrl: 'https://api.example.com',
      headers: async () => ({
        'Authorization': `Bearer ${await getAuthToken()}`,
        'Content-Type': 'application/json'
      })
    })
  })
})
```

## API Reference

### `CustomAdapter`

The main adapter class that implements `DatabaseAdapter`.

```typescript
new CustomAdapter(dbSpec: DBSpec<any>, options: CustomAdapterOptions)
```

### `CustomAdapterOptions`

```typescript
interface CustomAdapterOptions {
  handlers: CustomAdapterHandlers
  onInit?: () => Promise<void> | void
}
```

- **`handlers`**: Required CRUD operation handlers
- **`onInit`**: Optional initialization function (e.g., for authentication)

### `CustomAdapterHandlers`

```typescript
interface CustomAdapterHandlers {
  select: SelectHandler
  insert: InsertHandler
  update: UpdateHandler
  delete: DeleteHandler
}
```

### Handler Types

#### `SelectHandler`

```typescript
type SelectHandler = (
  projection: string | undefined,
  ctx: CustomAdapterContext
) => SelectResult<any>
```

Receives the projection string (e.g., `"id, name, email"`) and context with query state.

#### `InsertHandler`

```typescript
type InsertHandler = (
  values: any | any[],
  ctx: Omit<CustomAdapterContext, 'state'>
) => MutateResult<any>
```

Receives values to insert (single object or array).

#### `UpdateHandler`

```typescript
type UpdateHandler = (
  patch: Record<string, unknown>,
  ctx: CustomAdapterContext
) => MutateResult<any>
```

Receives partial object to update and context with filters.

#### `DeleteHandler`

```typescript
type DeleteHandler = (
  ctx: CustomAdapterContext
) => MutateResult<null>
```

Receives context with filters for determining which rows to delete.

### `CustomAdapterContext`

```typescript
interface CustomAdapterContext {
  table: string
  state: QueryState
}
```

- **`table`**: The table name being queried
- **`state`**: Query state built by QueryBuilder

### `QueryState`

```typescript
interface QueryState {
  filters: FilterOp[]
  order?: OrderSpec
  limit?: number
  range?: { from: number; to: number }
  projectionAst?: ProjectionNode
  rawProjection?: string
}
```

Contains all query modifiers:
- **`filters`**: Array of filter operations (eq, gt, in, like, etc.)
- **`order`**: Ordering specification
- **`limit`**: Row limit
- **`range`**: Range (from, to)
- **`projectionAst`**: Parsed projection tree
- **`rawProjection`**: Original projection string

### `FilterOp`

```typescript
type FilterOp =
  | { type: 'eq'; column: string; value: unknown }
  | { type: 'ne'; column: string; value: unknown }
  | { type: 'gt' | 'gte' | 'lt' | 'lte'; column: string; value: unknown }
  | { type: 'in'; column: string; value: unknown[] }
  | { type: 'like'; column: string; value: string }
```

## Advanced Examples

### Custom Authentication

```typescript
let authToken: string | null = null

const db = createClient({
  dbSpec: { schema: DBSchema },
  adapter: (dbSpec) => new CustomAdapter(dbSpec, {
    onInit: async () => {
      // Authenticate once on initialization
      const response = await fetch('https://api.example.com/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'user', password: 'pass' })
      })
      const { token } = await response.json()
      authToken = token
    },
    handlers: createRESTHandlers({
      baseUrl: 'https://api.example.com',
      headers: () => ({
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      })
    })
  })
})
```

### Custom Filter Formatting

```typescript
const db = createClient({
  dbSpec: { schema: DBSchema },
  adapter: (dbSpec) => new CustomAdapter(dbSpec, {
    handlers: createRESTHandlers({
      baseUrl: 'https://api.example.com',
      // Custom filter format: column_op=value
      formatFilter: (filter) => {
        switch (filter.type) {
          case 'eq': return `${filter.column}=${filter.value}`
          case 'ne': return `${filter.column}_ne=${filter.value}`
          case 'gt': return `${filter.column}_gt=${filter.value}`
          case 'gte': return `${filter.column}_gte=${filter.value}`
          case 'lt': return `${filter.column}_lt=${filter.value}`
          case 'lte': return `${filter.column}_lte=${filter.value}`
          case 'in': return `${filter.column}_in=${filter.value.join(',')}`
          case 'like': return `${filter.column}_like=${filter.value}`
          default: return ''
        }
      }
    })
  })
})
```

### GraphQL Backend

```typescript
const db = createClient({
  dbSpec: { schema: DBSchema },
  adapter: (dbSpec) => new CustomAdapter(dbSpec, {
    handlers: {
      select: async (projection, ctx) => {
        // Build GraphQL query from state
        const fields = projection?.split(',').map(f => f.trim()).join('\n  ') || 'id'
        const where = ctx.state.filters.map(f => {
          return `${f.column}: ${JSON.stringify(f.value)}`
        }).join(', ')

        const query = `
          query {
            ${ctx.table}(where: { ${where} }) {
              ${fields}
            }
          }
        `

        const res = await fetch('https://api.example.com/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        })

        const { data } = await res.json()
        return { data: data[ctx.table], error: null }
      },
      // ... other handlers
    }
  })
})
```

### Error Handling

```typescript
const db = createClient({
  dbSpec: { schema: DBSchema },
  adapter: (dbSpec) => new CustomAdapter(dbSpec, {
    handlers: createRESTHandlers({
      baseUrl: 'https://api.example.com',
      handleError: async (response) => {
        const body = await response.json()
        return new Error(`API Error: ${body.message || response.statusText}`)
      }
    })
  })
})

// Use with error handling
const { data, error } = await db.from('users').eq('id', '123').select('*')
if (error) {
  console.error('Query failed:', error.message)
} else {
  console.log('Users:', data)
}
```

## Use Cases

- **Internal APIs**: Connect to your company's REST APIs
- **Third-party services**: Integrate with external APIs (Airtable, Notion, etc.)
- **Custom protocols**: Use WebSockets, gRPC, or any other protocol
- **Proxy layer**: Add caching, rate limiting, or request transformation
- **Migration**: Gradually migrate from one backend to another
- **Testing**: Mock data layer for unit tests

## Best Practices

1. **Error handling**: Always wrap fetch calls in try-catch and return proper error objects
2. **Type safety**: Leverage TypeScript for type-safe handlers
3. **Validation**: Use the schema validation provided by vibecode-db
4. **Async init**: Use `onInit` for authentication or connection setup
5. **Idempotency**: Ensure your handlers are idempotent when possible
6. **Logging**: Add logging in handlers for debugging
7. **Rate limiting**: Implement rate limiting if needed for your API

## Troubleshooting

**Q: My filters aren't being applied**
- Check that your `formatFilter` function handles all filter types
- Verify your API expects filters in the format you're generating

**Q: Projection/select doesn't work**
- Some APIs don't support field selection; you may need to filter fields client-side
- Check if your API requires projection in headers, query params, or request body

**Q: Insert/update returns null**
- Ensure your API returns the inserted/updated data
- Check the `Prefer: return=representation` header if using PostgREST-style APIs

**Q: Authentication fails**
- Use `onInit` to authenticate before any queries
- Store tokens and refresh them when needed in your `headers` function

## Migration from Other Adapters

The CustomAdapter shares the same API as other vibecode-db adapters:

```typescript
// Before (Supabase)
const db = createClient({
  dbSpec: { schema: DBSchema },
  adapter: (ctx) => new SupabaseAdapter(ctx, { url, key })
})

// After (Custom)
const db = createClient({
  dbSpec: { schema: DBSchema },
  adapter: (ctx) => new CustomAdapter(ctx, { handlers })
})

// All queries remain the same!
await db.from('users').eq('status', 'active').select('*')
```
