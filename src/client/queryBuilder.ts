import type { z } from 'zod'
import type {
  AdapterTableExecutor,
  FilterOp,
  MutateResult,
  OrderSpec,
  SelectResult,
  TablesFromSchema,
  RowFromSchema,
  QueryState,
} from '../core/types'
import { parseProjection } from 'src/core/projectionUtil'

export class QueryBuilder<S extends z.ZodRawShape, TName extends TablesFromSchema<S>> {
  private _state: QueryState = { filters: [] }

  constructor(
    private table: TName,
    private exec: AdapterTableExecutor,
    private tableSchema: z.ZodObject<any>
  ) { }

  private reset() {
    this._state = { filters: [] }
  }

  private ensureValidFilters() {
    const shape = this.tableSchema.shape as Record<string, unknown>
    for (const f of this._state.filters) {
      if (!(f.column in shape)) {
        throw new Error(`Unknown column "${f.column}" for table "${this.table}"`)
      }
      if (f.type === 'in' && !Array.isArray(f.value)) {
        throw new Error(`Filter "in" expects an array for column "${f.column}"`)
      }
    }
  }

  private validateInsert(values: any | any[]) {
    if (Array.isArray(values)) this.tableSchema.array().parse(values)
    else this.tableSchema.parse(values)
  }

  private validateUpdate(patch: Record<string, unknown>) {
    this.tableSchema.partial().parse(patch)
  }

  select<T = RowFromSchema<S, TName>>(select?: string): SelectResult<T[]> {
    this.ensureValidFilters()

    if (!select) throw new Error('Projection is required')

    const projAst = parseProjection(select)
    if (!projAst) throw new Error('Invalid projection')

    this._state.projectionAst = projAst
    this._state.rawProjection = select

    const out = this.exec.select(select, this._state)
    this.reset()
    return out
  }

  insert<T = RowFromSchema<S, TName>>(values: T | T[]): MutateResult<T | T[]> {
    // Validate payload against table schema
    this.validateInsert(values)

    const out = this.exec.insert(values)
    // inserts don't consume filters/order, but to be safe:
    this.reset()
    return out
  }

  update<T = RowFromSchema<S, TName>>(patch: Partial<T>): MutateResult<T[]> {
    // Validate patch (partial)
    this.validateUpdate(patch)
    const out = this.exec.update(patch as Record<string, unknown>, this._state)
    this.reset()
    return out
  }

  delete(): MutateResult<null> {
    this.ensureValidFilters()
    const out = this.exec.delete(this._state)
    this.reset()
    return out
  }

  private ensureColumn(column: string) {
    const shape = this.tableSchema.shape as Record<string, unknown>
    if (!(column in shape)) throw new Error(`Unknown column "${column}" on table "${String(this.table)}"`)
  }

  private add(op: FilterOp) {
    this.ensureColumn(op.column)
    if (op.type === 'in' && !Array.isArray(op.value)) {
      throw new Error(`Filter "in" expects array for column "${op.column}"`)
    }
    this._state.filters.push(op)
    return this
  }
  eq(column: string, value: unknown) { return this.add({ type: 'eq', column, value }) }
  ne(column: string, value: unknown) { return this.add({ type: 'ne', column, value }) }
  gt(column: string, value: unknown) { return this.add({ type: 'gt', column, value }) }
  gte(column: string, value: unknown) { return this.add({ type: 'gte', column, value }) }
  lt(column: string, value: unknown) { return this.add({ type: 'lt', column, value }) }
  lte(column: string, value: unknown) { return this.add({ type: 'lte', column, value }) }
  in(column: string, value: unknown[]) { return this.add({ type: 'in', column, value }) }
  like(column: string, value: string) { return this.add({ type: 'like', column, value }) }

  order(column: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.ensureColumn(column)
    const spec: OrderSpec = { column, ascending: opts?.ascending ?? true, nullsFirst: opts?.nullsFirst }
    this._state.order = spec
    return this
  }

  limit(n: number) { this._state.limit = n; return this }
  range(from: number, to: number) { this._state.range = { from, to }; return this }
}

