import type { RealtimeAdapter } from '../adapters/types';
import { RealtimeChannel } from './RealtimeChannel';

export class RealtimeClient {
  private adapter: RealtimeAdapter;

  constructor(adapter: RealtimeAdapter) {
    this.adapter = adapter;
  }

  channel(name: string): RealtimeChannel {
    return new RealtimeChannel(this.adapter.channel(name));
  }

  removeChannel(name: string) {
    this.adapter.removeChannel(name);
  }

  removeAllChannels() {
    this.adapter.removeAllChannels();
  }
}
