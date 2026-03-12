import type { QueryDescriptor, AdapterResponse } from '../types';
import type { DatabaseAdapter } from '../adapters/types';

export class QueryBuilder<T = any> implements PromiseLike<AdapterResponse<T>> {
  protected descriptor: QueryDescriptor;
  protected adapter: DatabaseAdapter;

  constructor(adapter: DatabaseAdapter, descriptor: QueryDescriptor) {
    this.adapter = adapter;
    this.descriptor = descriptor;
  }

  then<TResult1 = AdapterResponse<T>, TResult2 = never>(
    onfulfilled?: ((value: AdapterResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.adapter
      .executeQuery<T>(this.descriptor)
      .then(onfulfilled, onrejected);
  }

  abortSignal(signal: AbortSignal): this {
    this.descriptor.modifiers.abortSignal = signal;
    return this;
  }

  /** Return a new builder with a cloned descriptor */
  protected clone(): this {
    const cloned = Object.create(Object.getPrototypeOf(this));
    cloned.adapter = this.adapter;
    cloned.descriptor = {
      ...this.descriptor,
      filters: [...this.descriptor.filters],
      modifiers: { ...this.descriptor.modifiers },
    };
    if (this.descriptor.modifiers.order) {
      cloned.descriptor.modifiers.order = [...this.descriptor.modifiers.order];
    }
    return cloned;
  }
}
