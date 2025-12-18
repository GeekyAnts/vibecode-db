import type { z } from 'zod'
import type {
    AuthResult,
    Session,
    User,
    SignUpCredentials,
    SignInCredentials,
    ResetPasswordRequest,
    ResetPasswordConfirm,
    ChangePasswordRequest,
    UpdateUserProfile,
} from '../auth/types'

export type TablesFromSchema<S extends z.ZodRawShape> = keyof S & string

export type RowFromSchema<
    S extends z.ZodRawShape,
    T extends TablesFromSchema<S>
> = z.infer<S[T]>

export type AnyTableSchema = z.ZodObject<z.ZodRawShape>

export type DatabaseZodSchema<Tables extends Record<string, AnyTableSchema>> =
    z.ZodObject<Tables>

export type SelectResult<T> = Promise<{ data: T | null; error: Error | null }>
export type MutateResult<T> = Promise<{ data: T | null; error: Error | null }>

export type OrderSpec = { column: string; ascending?: boolean; nullsFirst?: boolean }

export type FilterOp =
    | { type: 'eq'; column: string; value: unknown }
    | { type: 'ne'; column: string; value: unknown }
    | { type: 'gt' | 'gte' | 'lt' | 'lte'; column: string; value: unknown }
    | { type: 'in'; column: string; value: unknown[] }
    | { type: 'like'; column: string; value: string }

/** One-level projection tree: columns + nested children by table name. */
export type ProjectionNode = {
    columns: string[] | ['*']
    children: Record<string, ProjectionNode> // tableName -> nested projection
}

/** Optional relationship hint when compiling joins (one level for v0.1). */
export type Relation = {
    // many-to-one: localTable.localKey -> remoteTable.remoteKey
    kind: 'many-to-one'
    localTable: string
    localKey: string
    remoteTable: string
    remoteKey: string
}

/** Relation index: localTable -> childTableName -> relation */
export type RelationIndex = Record<string, Record<string, Relation>>

export interface QueryState {
    filters: FilterOp[]
    order?: OrderSpec
    limit?: number
    range?: { from: number; to: number }
    projectionAst?: ProjectionNode
    rawProjection?: string
}

/**
 * Minimal provider interface implemented by each adapter (Runtime, Supabase, ...).
 *
 * The client calls `from(table)` to obtain a per-table reference that knows how to
 * build and execute queries for the target backend.
 *

 */
export interface DatabaseAdapter {
    from(table: string): AdapterTableExecutor
}

export interface AdapterTableExecutor {
    select(select: string | undefined, state: QueryState): SelectResult<any>
    insert(values: any | any[]): MutateResult<any>
    update(patch: Record<string, unknown>, state: QueryState): MutateResult<any>
    delete(state: QueryState): MutateResult<any>
}

/**
 * Optional seed rows keyed by table name.
 * Used by adapters that support local bootstrapping (e.g., Runtime) or one-time seeding (e.g., Supabase).
 *
 * @public
 * @typeParam S - Zod raw shape from your DB schema.
 *
 * @example
 * ```ts
 * const seed: DBSeed<typeof DBSchema.shape> = {
 *   users: [{ id: 'u1', name: 'Ada', email: 'ada@example.com', created_at: new Date(), updated_at: new Date() }]
 * }
 * ```
 */
export type DBSeed<S extends z.ZodRawShape> = Partial<
    {
        [K in TablesFromSchema<S>]: Array<z.infer<S[K]>>
    }
>



/*
DBSpec carries today’s schema + seed data, and leaves room for future meta without another breaking change.
*/
export type DBSpec<S extends z.ZodRawShape> = {
    schema: z.ZodObject<S>
    seed?: DBSeed<S>
    relations?: RelationIndex
    meta?: Record<string, unknown>
}

/**
 * Auth executor interface - handles all authentication operations.
 * Implemented by adapter-specific auth classes (Supabase, SQLite, etc.)
 */
export interface AuthExecutor {
    signUp(credentials: SignUpCredentials): AuthResult<Session>
    signIn(credentials: SignInCredentials): AuthResult<Session>
    signOut(): AuthResult<void>
    getSession(): AuthResult<Session | null>
    refreshSession(refreshToken?: string): AuthResult<Session>
    resetPassword(request: ResetPasswordRequest): AuthResult<void>
    resetPasswordConfirm(confirm: ResetPasswordConfirm): AuthResult<Session>
    changePassword(request: ChangePasswordRequest): AuthResult<void>
    updateUser(updates: UpdateUserProfile): AuthResult<User>
    getUser(): AuthResult<User | null>
}

/**
 * Unified adapter interface that combines DB and optional Auth capabilities.
 * All adapters (Supabase, SQLite-web, SQLite-expo) implement this interface.
 */
export interface UnifiedAdapter {
    /** Database operations - get a table executor */
    from(table: string): AdapterTableExecutor

    /** Auth executor (undefined if auth not configured) */
    auth?: AuthExecutor
}

/**
 * Unified adapter factory - receives DBSpec and returns adapter with optional auth.
 */
export type UnifiedAdapterFactory<S extends z.ZodRawShape> = (dbSpec: DBSpec<S>) => UnifiedAdapter

/**
 * @deprecated Use UnifiedAdapterFactory instead
 */
export type AdapterFactory<S extends z.ZodRawShape> = (dbSpec: DBSpec<S>) => DatabaseAdapter

/**
 * Options for createClient()
 */
export type CreateClientOptions<S extends z.ZodRawShape> = {
    dbSpec: DBSpec<S>
    adapter: UnifiedAdapterFactory<S>
}
