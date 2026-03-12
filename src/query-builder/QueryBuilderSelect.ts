import type { QueryDescriptor } from '../types';
import type { DatabaseAdapter } from '../adapters/types';
import { TransformBuilder } from './TransformBuilder';

export class QueryBuilderSelect {
  private adapter: DatabaseAdapter;
  private table: string;

  constructor(adapter: DatabaseAdapter, table: string) {
    this.adapter = adapter;
    this.table = table;
  }

  select(columns = '*', options?: { head?: boolean; count?: 'exact' | 'planned' | 'estimated' }): TransformBuilder {
    const descriptor: QueryDescriptor = {
      table: this.table,
      operation: 'select',
      columns,
      filters: [],
      modifiers: {
        head: options?.head,
        count: options?.count,
      },
    };
    return new TransformBuilder(this.adapter, descriptor);
  }

  insert(values: Record<string, any> | Record<string, any>[], options?: { count?: 'exact' | 'planned' | 'estimated'; defaultToNull?: boolean }): TransformBuilder {
    const descriptor: QueryDescriptor = {
      table: this.table,
      operation: 'insert',
      values,
      filters: [],
      modifiers: {},
      count: options?.count,
    };
    return new TransformBuilder(this.adapter, descriptor);
  }

  update(values: Record<string, any>, options?: { count?: 'exact' | 'planned' | 'estimated' }): TransformBuilder {
    const descriptor: QueryDescriptor = {
      table: this.table,
      operation: 'update',
      values,
      filters: [],
      modifiers: {},
      count: options?.count,
    };
    return new TransformBuilder(this.adapter, descriptor);
  }

  upsert(values: Record<string, any> | Record<string, any>[], options?: { onConflict?: string; count?: 'exact' | 'planned' | 'estimated'; ignoreDuplicates?: boolean }): TransformBuilder {
    const descriptor: QueryDescriptor = {
      table: this.table,
      operation: 'upsert',
      values,
      filters: [],
      modifiers: {},
      onConflict: options?.onConflict,
      count: options?.count,
    };
    return new TransformBuilder(this.adapter, descriptor);
  }

  delete(options?: { count?: 'exact' | 'planned' | 'estimated' }): TransformBuilder {
    const descriptor: QueryDescriptor = {
      table: this.table,
      operation: 'delete',
      filters: [],
      modifiers: {},
      count: options?.count,
    };
    return new TransformBuilder(this.adapter, descriptor);
  }
}
