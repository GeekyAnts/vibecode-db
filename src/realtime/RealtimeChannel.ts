import type { RealtimeChannelAdapter } from '../adapters/types';
import type { RealtimeCallback } from '../types';

export class RealtimeChannel {
  private adapter: RealtimeChannelAdapter;

  constructor(adapter: RealtimeChannelAdapter) {
    this.adapter = adapter;
  }

  on(
    event: 'postgres_changes',
    filter: { event: string; schema?: string; table?: string; filter?: string },
    callback: RealtimeCallback,
  ): this {
    this.adapter.on(event, filter, callback);
    return this;
  }

  subscribe(callback?: (status: string) => void): this {
    this.adapter.subscribe(callback);
    return this;
  }

  unsubscribe() {
    this.adapter.unsubscribe();
  }
}
