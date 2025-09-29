import type { z } from 'zod'
import type { CreateClientOptions, DatabaseAdapter, DBSpec, TablesFromSchema } from '../core/types'
import { QueryBuilder } from './queryBuilder'

export type VibecodeClient<S extends z.ZodRawShape> = {
  from<TName extends TablesFromSchema<S>>(table: TName): QueryBuilder<S, TName>
}


export function createClient<S extends z.ZodRawShape>(opts: CreateClientOptions<S>): VibecodeClient<S> {
  const adapter: DatabaseAdapter = opts.adapter(opts.dbSpec)

  return {
    from(table) {
      const ref = adapter.from(table as string)  // adapter hook
      return new QueryBuilder<S, typeof table>(table, ref) // creates fluent API wrapper
    }
  }
}
