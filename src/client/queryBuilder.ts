import type { z } from 'zod'
import type {
  AdapterTableRef,
  FilterOp,
  MutateResult,
  OrderSpec,
  SelectResult,
  TablesFromSchema,
  RowFromSchema,
} from '../core/types'

export class QueryBuilder<S extends z.ZodRawShape, TName extends TablesFromSchema<S>> {
  constructor(
    private table: TName,
    private ref: AdapterTableRef
  ) {}

  select<T = RowFromSchema<S, TName>>(select?: string): SelectResult<T[]> {
    return this.ref.select(select, (this.ref as any)._state ?? { filters: [] })
  }

  insert<T = RowFromSchema<S, TName>>(values: T | T[]): MutateResult<T | T[]> {
    return this.ref.insert(values)
  }

  update<T = RowFromSchema<S, TName>>(patch: Partial<T>): MutateResult<T[]> {
    return this.ref.update(patch as Record<string, unknown>, (this.ref as any)._state ?? { filters: [] })
  }

  delete(): MutateResult<null> {
    return this.ref.delete((this.ref as any)._state ?? { filters: [] })
  }

  private add(op: FilterOp) { this.ref.where(op); return this }

  eq(column: string, value: unknown)  { return this.add({ type: 'eq', column, value }) }
  ne(column: string, value: unknown)  { return this.add({ type: 'ne', column, value }) }
  gt(column: string, value: unknown)  { return this.add({ type: 'gt', column, value }) }
  gte(column: string, value: unknown) { return this.add({ type: 'gte', column, value }) }
  lt(column: string, value: unknown)  { return this.add({ type: 'lt', column, value }) }
  lte(column: string, value: unknown) { return this.add({ type: 'lte', column, value }) }
  in(column: string, value: unknown[]) { return this.add({ type: 'in', column, value }) }
  like(column: string, value: string) { return this.add({ type: 'like', column, value }) }

  order(column: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) {
    const spec: OrderSpec = { column, ascending: opts?.ascending ?? true, nullsFirst: opts?.nullsFirst }
    this.ref.order(spec)
    return this
  }

  limit(n: number) { this.ref.setLimit(n); return this }
  range(from: number, to: number) { this.ref.setRange(from, to); return this }
}

