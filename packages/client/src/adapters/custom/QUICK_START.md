# CustomAdapter - Quick Start Guide

Get up and running with CustomAdapter in 5 minutes!

## Installation

CustomAdapter is included in the `@vibecode-db/client` package:

```bash
npm install @vibecode-db/client zod
```

## 5-Minute Setup

### Step 1: Import

```typescript
import { createClient } from '@vibecode-db/client'
import { CustomAdapter, createRESTHandlers } from '@vibecode-db/client'
import { z } from 'zod'
```

### Step 2: Define Your Schema

```typescript
const DBSchema = z.object({
  users: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    status: z.enum(['active', 'inactive'])
  }),
  posts: z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    content: z.string()
  })
})
```

### Step 3: Create Client with CustomAdapter

```typescript
const db = createClient({
  dbSpec: { schema: DBSchema },
  adapter: (dbSpec) => new CustomAdapter(dbSpec, {
    handlers: createRESTHandlers({
      baseUrl: 'https://api.example.com',
      headers: () => ({
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
      })
    })
  })
})
```

### Step 4: Query Away!

```typescript
// SELECT with filters
const { data: activeUsers } = await db
  .from('users')
  .eq('status', 'active')
  .order('name', { ascending: true })
  .select('id, name, email')

// INSERT
const { data: newUser } = await db
  .from('users')
  .insert({
    id: '123',
    name: 'Alice',
    email: 'alice@example.com',
    status: 'active'
  })

// UPDATE
const { data: updated } = await db
  .from('users')
  .eq('id', '123')
  .update({ status: 'inactive' })

// DELETE
await db
  .from('users')
  .eq('id', '123')
  .delete()
```

## Custom Filter Formatting

If your API uses a different query parameter format:

```typescript
const db = createClient({
  dbSpec: { schema: DBSchema },
  adapter: (dbSpec) => new CustomAdapter(dbSpec, {
    handlers: createRESTHandlers({
      baseUrl: 'https://api.example.com',

      // Customize how filters are formatted
      formatFilter: (filter) => {
        switch (filter.type) {
          case 'eq':
            return `${filter.column}=${filter.value}`
          case 'gt':
            return `${filter.column}_greater_than=${filter.value}`
          case 'in':
            return `${filter.column}_in=${filter.value.join(',')}`
          // ... add more as needed
          default:
            return ''
        }
      }
    })
  })
})
```

## Manual Handler Implementation

For full control or non-REST APIs:

```typescript
const db = createClient({
  dbSpec: { schema: DBSchema },
  adapter: (dbSpec) => new CustomAdapter(dbSpec, {
    handlers: {
      select: async (projection, ctx) => {
        // Build your custom URL
        let url = `https://api.example.com/${ctx.table}?`

        // Transform filters to your format
        const params = ctx.state.filters.map(f =>
          `${f.column}=${f.value}`
        ).join('&')

        if (params) url += params

        // Make the request
        const response = await fetch(url)
        const data = await response.json()

        return { data, error: null }
      },

      insert: async (values, ctx) => {
        const response = await fetch(`https://api.example.com/${ctx.table}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        })
        const data = await response.json()
        return { data, error: null }
      },

      update: async (patch, ctx) => {
        // Build URL with filters
        let url = `https://api.example.com/${ctx.table}?`
        url += ctx.state.filters.map(f => `${f.column}=${f.value}`).join('&')

        const response = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch)
        })
        const data = await response.json()
        return { data, error: null }
      },

      delete: async (ctx) => {
        let url = `https://api.example.com/${ctx.table}?`
        url += ctx.state.filters.map(f => `${f.column}=${f.value}`).join('&')

        await fetch(url, { method: 'DELETE' })
        return { data: null, error: null }
      }
    }
  })
})
```

## Common Patterns

### Authentication

```typescript
const db = createClient({
  dbSpec: { schema: DBSchema },
  adapter: (dbSpec) => new CustomAdapter(dbSpec, {
    onInit: async () => {
      // Authenticate once on startup
      const response = await fetch('https://api.example.com/auth', {
        method: 'POST',
        body: JSON.stringify({ apiKey: 'YOUR_KEY' })
      })
      const { token } = await response.json()
      // Store token for use in headers
    },
    handlers: createRESTHandlers({
      baseUrl: 'https://api.example.com'
    })
  })
})
```

### Error Handling

```typescript
const { data, error } = await db
  .from('users')
  .eq('id', '123')
  .select('*')

if (error) {
  console.error('Query failed:', error.message)
  // Handle error
} else {
  console.log('Data:', data)
  // Use data
}
```

### Multiple Filters

```typescript
const { data } = await db
  .from('posts')
  .eq('published', true)          // AND published = true
  .gt('views', 100)                // AND views > 100
  .in('category', ['tech', 'ai'])  // AND category IN ('tech', 'ai')
  .like('title', '%tutorial%')     // AND title LIKE '%tutorial%'
  .select('*')
```

## Query State Reference

Your handlers receive this state:

```typescript
{
  table: 'users',           // Table name
  state: {
    filters: [              // All filter conditions
      { type: 'eq', column: 'status', value: 'active' },
      { type: 'gt', column: 'age', value: 18 }
    ],
    order: {                // Ordering
      column: 'created_at',
      ascending: false,
      nullsFirst: undefined
    },
    limit: 10,              // Limit
    range: { from: 0, to: 9 },  // Range (alternative to limit)
    rawProjection: 'id, name, email'  // Projection string
  }
}
```

## Filter Types

| Type | vibecode-db | Example Handler Transform |
|------|-------------|---------------------------|
| `eq` | `.eq('status', 'active')` | `status=eq.active` |
| `ne` | `.ne('status', 'banned')` | `status=neq.banned` |
| `gt` | `.gt('age', 18)` | `age=gt.18` |
| `gte` | `.gte('score', 100)` | `score=gte.100` |
| `lt` | `.lt('price', 50)` | `price=lt.50` |
| `lte` | `.lte('stock', 10)` | `stock=lte.10` |
| `in` | `.in('id', [1,2,3])` | `id=in.(1,2,3)` |
| `like` | `.like('name', '%john%')` | `name=like.%john%` |

## Next Steps

- Read the full [README](./README.md) for advanced features
- Check out [examples](./example.ts) for complete implementations
- Explore the [type definitions](./types.ts) for API reference

## Need Help?

- **API doesn't match PostgREST format?** Use custom `formatFilter`
- **Need authentication?** Use `onInit` and `headers` options
- **Non-REST backend?** Implement custom handlers
- **GraphQL, gRPC, WebSocket?** See the example.ts file

Happy querying! 🚀
