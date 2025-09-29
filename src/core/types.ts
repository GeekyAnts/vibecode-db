import type { z } from 'zod'

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

export interface QueryState {
    filters: FilterOp[]
    order?: OrderSpec
    limit?: number
    range?: { from: number; to: number }
}

export interface DatabaseAdapter {
    from(table: string): AdapterTableRef
}

export interface AdapterTableRef {
    select(select: string | undefined, state: QueryState): SelectResult<any>
    insert(values: any | any[]): MutateResult<any>
    update(patch: Record<string, unknown>, state: QueryState): MutateResult<any>
    delete(state: QueryState): MutateResult<any>
    order(by: OrderSpec): void
    where(op: FilterOp): void
    setLimit(n: number): void
    setRange(from: number, to: number): void
}


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
    meta?: Record<string, unknown>
}

/**
 * Adapter factory MUST be a callback that receives DBSpec (not an instance).
 * (We keep DatabaseAdapter/AdapterTableRef contracts as-is.)
 */
export type AdapterFactory<S extends z.ZodRawShape> = (dbSpec: DBSpec<S>) => DatabaseAdapter


export type CreateClientOptions<S extends z.ZodRawShape> = { dbSpec: DBSpec<S>; adapter: AdapterFactory<S> }