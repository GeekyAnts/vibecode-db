import type { z } from 'zod'
import type {
    AdapterTableRef,
    DatabaseAdapter,
    FilterOp,
    OrderSpec,
    QueryState,
    DBSpec
} from '../../core/types'

// Default demo data (used if dbSpec.seed is not provided)
const DEFAULT_DB = {
    users: [
        { id: 'u1', name: 'Ada Lovelace', email: 'ada@example.com', created_at: new Date(), updated_at: new Date() },
        { id: 'u2', name: 'Alan Turing', email: 'alan@example.com', created_at: new Date(), updated_at: new Date() }
    ],
    posts: [
        { id: 'p1', title: 'Hello', content: 'World', user_id: 'u1', published: true, created_at: new Date(), updated_at: new Date() }
    ],
    comments: [
        { id: 'c1', content: 'Nice post', post_id: 'p1', user_id: 'u2', created_at: new Date() }
    ]
} as const

type SeedShape = Record<string, any[]>

class FakeTable implements AdapterTableRef {
    _state: QueryState = { filters: [] }
    private tableSchema: z.ZodObject<any>
    private rows: any[]

    constructor(
        private table: string,
        private schema: z.ZodObject<any>,
        private seed: SeedShape | undefined
    ) {
        const ts = (schema.shape as any)[table]
        if (!ts) throw new Error(`Table "${table}" not found in schema`)
        this.tableSchema = ts

        // Choose rows: dbSpec.seed[table] if present, else default
        const seeded = seed?.[table]
        const fallback = (DEFAULT_DB as any)[table]
        this.rows = Array.isArray(seeded) ? seeded.slice() : Array.isArray(fallback) ? fallback.slice() : []
    }

    private ensureValidFilters() {
        const shape = this.tableSchema.shape as Record<string, unknown>
        for (const f of this._state.filters) {
            if (!(f.column in shape)) throw new Error(`Unknown column "${f.column}" for table "${this.table}"`)
            if (f.type === 'in' && !Array.isArray(f.value)) throw new Error(`Filter "in" expects an array for column "${f.column}"`)
        }
    }

    private validateInsert(values: any | any[]) {
        if (Array.isArray(values)) this.tableSchema.array().parse(values)
        else this.tableSchema.parse(values)
    }
    private validateUpdate(patch: Record<string, unknown>) {
        this.tableSchema.partial().parse(patch)
    }

    // NOTE: v0.1 still ignores filters/order and returns current rows (good for prototyping)
    select(_select?: string) {
        this.ensureValidFilters()
        return Promise.resolve({ data: this.rows.slice(), error: null })
    }

    insert(values: any | any[]) {
        this.validateInsert(values)
        const arr = Array.isArray(values) ? values : [values]
        // Keep an in-memory array so devs see their data back during the demo
        this.rows.push(...arr)
        return Promise.resolve({ data: arr, error: null })
    }

    update(patch: Record<string, unknown>) {
        this.validateUpdate(patch)
        // For v0.1, we just echo the patch and avoid complex matching (filters ignored)
        return Promise.resolve({ data: [patch], error: null })
    }

    delete() {
        // For v0.1, we don’t actually mutate; just acknowledge
        this.ensureValidFilters()
        return Promise.resolve({ data: null, error: null })
    }

    order(by: OrderSpec) { this._state.order = by }
    where(op: FilterOp) { this._state.filters.push(op) }
    setLimit(n: number) { this._state.limit = n }
    setRange(from: number, to: number) { this._state.range = { from, to } }
}

/**
 * FakeAdapter — zero-backend adapter for instant prototyping and tests.
 *
 * Uses `dbSpec.seed` (if provided) as the initial in-memory dataset per table,
 * validates CRUD payloads against your Zod schema, and returns results without any network calls.
 *
 * @public
 * @example
 * ```ts
 * const db = createClient({
 *   dbSpec: { schema: DBSchema, seed },
 *   adapter: (spec) => new FakeAdapter(spec)
 * })
 * const { data } = await db.from('users').select('*')
 * ```
 */
export class FakeAdapter implements DatabaseAdapter {
    constructor(private dbSpec: DBSpec<any>) { }

    from(table: string): AdapterTableRef {
        return new FakeTable(table, this.dbSpec.schema, this.dbSpec.seed as SeedShape | undefined)
    }
}
