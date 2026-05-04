import type { QueryDescriptor, AdapterResponse } from '../types';
import type { DatabaseAdapter } from '../adapters/types';
import { FilterBuilder } from './FilterBuilder';

export class TransformBuilder<T = any> extends FilterBuilder<T> {
  constructor(adapter: DatabaseAdapter, descriptor: QueryDescriptor) {
    super(adapter, descriptor);
  }

  select(columns = '*'): this {
    this.descriptor.columns = columns;
    return this;
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): this {
    if (!this.descriptor.modifiers.order) {
      this.descriptor.modifiers.order = [];
    }
    this.descriptor.modifiers.order.push({
      column,
      ascending: options?.ascending ?? true,
      nullsFirst: options?.nullsFirst,
    });
    return this;
  }

  limit(count: number): this {
    this.descriptor.modifiers.limit = count;
    return this;
  }

  range(from: number, to: number): this {
    this.descriptor.modifiers.range = { from, to };
    return this;
  }

  single(): PromiseLike<AdapterResponse<T>> {
    this.descriptor.modifiers.single = true;
    return this;
  }

  maybeSingle(): PromiseLike<AdapterResponse<T | null>> {
    this.descriptor.modifiers.maybeSingle = true;
    return this as unknown as PromiseLike<AdapterResponse<T | null>>;
  }

  csv(): PromiseLike<AdapterResponse<string>> {
    this.descriptor.modifiers.csv = true;
    return this as unknown as PromiseLike<AdapterResponse<string>>;
  }

  returns<NewT = T>(): TransformBuilder<NewT> {
    return this as unknown as TransformBuilder<NewT>;
  }
}
