import type { QueryDescriptor, AdapterResponse, Filter } from '../types';
import type { DatabaseAdapter } from '../adapters/types';
import { QueryBuilder } from './QueryBuilder';

export class FilterBuilder<T = any> extends QueryBuilder<T> {
  constructor(adapter: DatabaseAdapter, descriptor: QueryDescriptor) {
    super(adapter, descriptor);
  }

  eq(column: string, value: any): this {
    this.descriptor.filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: any): this {
    this.descriptor.filters.push({ column, operator: 'neq', value });
    return this;
  }

  gt(column: string, value: any): this {
    this.descriptor.filters.push({ column, operator: 'gt', value });
    return this;
  }

  gte(column: string, value: any): this {
    this.descriptor.filters.push({ column, operator: 'gte', value });
    return this;
  }

  lt(column: string, value: any): this {
    this.descriptor.filters.push({ column, operator: 'lt', value });
    return this;
  }

  lte(column: string, value: any): this {
    this.descriptor.filters.push({ column, operator: 'lte', value });
    return this;
  }

  like(column: string, pattern: string): this {
    this.descriptor.filters.push({ column, operator: 'like', value: pattern });
    return this;
  }

  ilike(column: string, pattern: string): this {
    this.descriptor.filters.push({ column, operator: 'ilike', value: pattern });
    return this;
  }

  is(column: string, value: null | boolean): this {
    this.descriptor.filters.push({ column, operator: 'is', value });
    return this;
  }

  in(column: string, values: any[]): this {
    this.descriptor.filters.push({ column, operator: 'in', value: values });
    return this;
  }

  contains(column: string, value: any): this {
    this.descriptor.filters.push({ column, operator: 'contains', value });
    return this;
  }

  containedBy(column: string, value: any): this {
    this.descriptor.filters.push({ column, operator: 'containedBy', value });
    return this;
  }

  rangeGt(column: string, value: any): this {
    this.descriptor.filters.push({ column, operator: 'rangeGt', value });
    return this;
  }

  rangeGte(column: string, value: any): this {
    this.descriptor.filters.push({ column, operator: 'rangeGte', value });
    return this;
  }

  rangeLt(column: string, value: any): this {
    this.descriptor.filters.push({ column, operator: 'rangeLt', value });
    return this;
  }

  rangeLte(column: string, value: any): this {
    this.descriptor.filters.push({ column, operator: 'rangeLte', value });
    return this;
  }

  rangeAdjacent(column: string, value: any): this {
    this.descriptor.filters.push({ column, operator: 'rangeAdjacent', value });
    return this;
  }

  overlaps(column: string, value: any[]): this {
    this.descriptor.filters.push({ column, operator: 'overlaps', value });
    return this;
  }

  textSearch(column: string, query: string, options?: { type?: 'plain' | 'phrase' | 'websearch'; config?: string }): this {
    this.descriptor.filters.push({ column, operator: 'textSearch', value: { query, ...options } });
    return this;
  }

  match(query: Record<string, any>): this {
    for (const [column, value] of Object.entries(query)) {
      this.descriptor.filters.push({ column, operator: 'eq', value });
    }
    return this;
  }

  not(column: string, operator: string, value: any): this {
    this.descriptor.filters.push({ column, operator: operator as Filter['operator'], value, negate: true });
    return this;
  }

  or(filters: string, { foreignTable }: { foreignTable?: string } = {}): this {
    const column = foreignTable ? `${foreignTable}.or` : 'or';
    this.descriptor.filters.push({ column, operator: 'or', value: filters });
    return this;
  }

  filter(column: string, operator: string, value: any): this {
    this.descriptor.filters.push({ column, operator: 'filter', value: { operator, value } });
    return this;
  }
}
