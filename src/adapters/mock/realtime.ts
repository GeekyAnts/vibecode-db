import type { RealtimeAdapter, RealtimeChannelAdapter } from '../types';
import type { RealtimeCallback, RealtimePayload } from '../../types';

export class MockRealtimeAdapter implements RealtimeAdapter {
  private channels: Map<string, MockRealtimeChannel> = new Map();

  channel(name: string): RealtimeChannelAdapter {
    let ch = this.channels.get(name);
    if (!ch) {
      ch = new MockRealtimeChannel(name);
      this.channels.set(name, ch);
    }
    return ch;
  }

  removeChannel(name: string) {
    const ch = this.channels.get(name);
    if (ch) {
      ch.unsubscribe();
      this.channels.delete(name);
    }
  }

  removeAllChannels() {
    for (const ch of this.channels.values()) {
      ch.unsubscribe();
    }
    this.channels.clear();
  }

  /** Emit a realtime event to all matching channels - useful for tests */
  emit(table: string, payload: RealtimePayload) {
    for (const ch of this.channels.values()) {
      ch._handleEvent(table, payload);
    }
  }

  reset() {
    this.removeAllChannels();
  }
}

class MockRealtimeChannel implements RealtimeChannelAdapter {
  private name: string;
  private subscriptions: Array<{
    filter: { event: string; schema?: string; table?: string; filter?: string };
    callback: RealtimeCallback;
  }> = [];
  private subscribed = false;

  constructor(name: string) {
    this.name = name;
  }

  on(
    event: 'postgres_changes',
    filter: { event: string; schema?: string; table?: string; filter?: string },
    callback: RealtimeCallback,
  ): this {
    this.subscriptions.push({ filter, callback });
    return this;
  }

  subscribe(callback?: (status: string) => void): this {
    this.subscribed = true;
    if (callback) {
      callback('SUBSCRIBED');
    }
    return this;
  }

  unsubscribe() {
    this.subscribed = false;
    this.subscriptions = [];
  }

  /** Internal: handle an event dispatched by MockRealtimeAdapter */
  _handleEvent(table: string, payload: RealtimePayload) {
    if (!this.subscribed) return;

    for (const sub of this.subscriptions) {
      const f = sub.filter;
      if (f.table && f.table !== table) continue;
      if (f.event !== '*' && f.event !== payload.eventType) continue;
      sub.callback(payload);
    }
  }
}
