/**
 * Test file for CustomAdapter
 *
 * This test uses JSONPlaceholder API (https://jsonplaceholder.typicode.com/)
 * to verify CustomAdapter functionality.
 *
 * Run with: npx tsx test-custom-adapter.ts
 */

import { vibecodeTable, col, references, defineSchema, createClient, type DBSpec } from './packages/client/src'
import { CustomAdapter, createRESTHandlers } from './packages/client/src/adapters/custom'
import type { FilterOp } from './packages/client/src/core/types'

// Define schema using vibecode-db schema builder with proper references
const users = vibecodeTable('users', {
  id: col.integer(),
  name: col.varchar(),
  username: col.varchar(),
  email: col.varchar(),
  phone: col.varchar(),
  website: col.varchar(),
})

const posts = vibecodeTable('posts', {
  id: col.integer(),
  userId: references(col.integer('userId'), () => users.id),
  title: col.varchar(),
  body: col.varchar(),
})

const comments = vibecodeTable('comments', {
  id: col.integer(),
  postId: references(col.integer('postId'), () => posts.id),
  name: col.varchar(),
  email: col.varchar(),
  body: col.varchar(),
})

const schema = defineSchema({ users, posts, comments })

const dbSpec: DBSpec<typeof schema.zodBundle.shape> = {
  schema: schema.zodBundle,
  relations: schema.relations,
}

const API_BASE = 'https://jsonplaceholder.typicode.com'

// Create client with CustomAdapter using manual implementation
const dbManual = createClient({
  dbSpec,
  adapter: (dbSpec) => new CustomAdapter(dbSpec, {
    handlers: {
      select: async (projection, ctx) => {
        try {
          console.log(`[SELECT] ${ctx.table}`, ctx.state)

          let url = `${API_BASE}/${ctx.table}`
          const params = new URLSearchParams()

          // Apply filters (JSONPlaceholder supports simple equality filters)
          for (const filter of ctx.state.filters) {
            if (filter.type === 'eq') {
              params.append(filter.column, String(filter.value))
            }
          }

          // Add limit
          if (ctx.state.limit) {
            params.append('_limit', String(ctx.state.limit))
          }

          const queryString = params.toString()
          if (queryString) url += `?${queryString}`

          console.log(`[SELECT] Fetching: ${url}`)
          const response = await fetch(url)

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          let data = await response.json()

          // Apply client-side filtering for unsupported operations
          for (const filter of ctx.state.filters) {
            if (filter.type === 'gt') {
              data = data.filter((row: any) => row[filter.column] > (filter.value as number))
            } else if (filter.type === 'lt') {
              data = data.filter((row: any) => row[filter.column] < (filter.value as number))
            } else if (filter.type === 'in') {
              data = data.filter((row: any) => (filter.value as unknown[]).includes(row[filter.column]))
            }
          }
          // Apply ordering client-side
          if (ctx.state.order) {
            const { column, ascending = true } = ctx.state.order
            data.sort((a: any, b: any) => {
              if (a[column] < b[column]) return ascending ? -1 : 1
              if (a[column] > b[column]) return ascending ? 1 : -1
              return 0
            })
          }

          console.log(`[SELECT] Found ${data.length} rows`)
          return { data, error: null }
        } catch (error) {
          console.error('[SELECT] Error:', error)
          return { data: null, error: error as Error }
        }
      },

      insert: async (values, ctx) => {
        try {
          console.log(`[INSERT] ${ctx.table}`, values)

          const response = await fetch(`${API_BASE}/${ctx.table}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const data = await response.json()
          console.log(`[INSERT] Created:`, data)
          return { data, error: null }
        } catch (error) {
          console.error('[INSERT] Error:', error)
          return { data: null, error: error as Error }
        }
      },

      update: async (patch, ctx) => {
        try {
          console.log(`[UPDATE] ${ctx.table}`, { patch, filters: ctx.state.filters })

          // JSONPlaceholder requires ID in the URL
          const idFilter = ctx.state.filters.find(f => f.column === 'id' && f.type === 'eq')
          if (!idFilter) {
            throw new Error('Update requires id filter')
          }

          const response = await fetch(`${API_BASE}/${ctx.table}/${idFilter.value}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const data = await response.json()
          console.log(`[UPDATE] Updated:`, data)
          return { data: [data], error: null }
        } catch (error) {
          console.error('[UPDATE] Error:', error)
          return { data: null, error: error as Error }
        }
      },

      delete: async (ctx) => {
        try {
          console.log(`[DELETE] ${ctx.table}`, ctx.state.filters)

          // JSONPlaceholder requires ID in the URL
          const idFilter = ctx.state.filters.find(f => f.column === 'id' && f.type === 'eq')
          if (!idFilter) {
            throw new Error('Delete requires id filter')
          }

          const response = await fetch(`${API_BASE}/${ctx.table}/${idFilter.value}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          console.log(`[DELETE] Deleted successfully`)
          return { data: null, error: null }
        } catch (error) {
          console.error('[DELETE] Error:', error)
          return { data: null, error: error as Error }
        }
      }
    },

    onInit: async () => {
      console.log('\n🚀 CustomAdapter initialized with manual handlers\n')
    }
  })
})

// Create client with REST helper
const dbHelper = createClient({
  dbSpec,
  adapter: (dbSpec) => new CustomAdapter(dbSpec, {
    handlers: createRESTHandlers({
      baseUrl: API_BASE,
      formatFilter: (filter: FilterOp) => {
        // JSONPlaceholder uses simple query params
        if (filter.type === 'eq') {
          return `${filter.column}=${filter.value}`
        }
        return ''
      }
    }),
    onInit: async () => {
      console.log('\n🚀 CustomAdapter initialized with REST helper\n')
    }
  })
})

// Test functions
async function testSelect() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('TEST 1: SELECT with filters and limit')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const { data, error } = await dbManual
    .from('posts')
    .eq('userId', 1)
    .limit(3)
    .select('id, title, userId')

  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ Success! Found posts:', data)
  }
  console.log('')
}

async function testSelectWithOrdering() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('TEST 2: SELECT with ordering')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const { data, error } = await dbManual
    .from('users')
    .limit(3)
    .order('name', { ascending: true })
    .select('id, name, email')

  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ Success! Found users:', data)
  }
  console.log('')
}

async function testSelectWithMultipleFilters() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('TEST 3: SELECT with multiple filters (client-side)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const { data, error } = await dbManual
    .from('posts')
    .in('userId', [1, 2])
    .limit(5)
    .select('id, userId, title')

  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ Success! Found posts:', data)
  }
  console.log('')
}

async function testInsert() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('TEST 4: INSERT')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const { data, error } = await dbManual
    .from('posts')
    .insert({
      id: 101, // Include ID to satisfy schema validation
      userId: 1,
      title: 'Test Post from CustomAdapter',
      body: 'This is a test post created using vibecode-db CustomAdapter!'
    })

  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ Success! Inserted post:', data)
  }
  console.log('')
}

async function testUpdate() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('TEST 5: UPDATE')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const { data, error } = await dbManual
    .from('posts')
    .eq('id', 1)
    .update({ title: 'Updated Title via CustomAdapter' })

  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ Success! Updated post:', data)
  }
  console.log('')
}

async function testDelete() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('TEST 6: DELETE')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const { data, error } = await dbManual
    .from('posts')
    .eq('id', 1)
    .delete()

  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ Success! Deleted post')
  }
  console.log('')
}

async function testRESTHelper() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('TEST 7: Using REST Helper')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const { data, error } = await dbHelper
    .from('users')
    .eq('id', 1)
    .select('id, name, email, username')

  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ Success! Found user:', data)
  }
  console.log('')
}

// Run all tests
async function runTests() {
  console.log('\n')
  console.log('╔═══════════════════════════════════════════════════════╗')
  console.log('║       CustomAdapter Test Suite                        ║')
  console.log('║       Testing with JSONPlaceholder API                ║')
  console.log('╚═══════════════════════════════════════════════════════╝')
  console.log('\n')

  try {
    await testSelect()
    await testSelectWithOrdering()
    await testSelectWithMultipleFilters()
    await testInsert()
    await testUpdate()
    await testDelete()
    await testRESTHelper()

    console.log('╔═══════════════════════════════════════════════════════╗')
    console.log('║       ✅ All tests completed!                         ║')
    console.log('╚═══════════════════════════════════════════════════════╝')
  } catch (error) {
    console.error('\n❌ Test suite failed:', error)
  }
}

// Run tests
runTests()
