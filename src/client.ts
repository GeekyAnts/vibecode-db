import type { DatabaseAdapter } from './adapters/types';
import type { ClientOptions, AdapterResponse } from './types';
import { QueryBuilderSelect } from './query-builder/QueryBuilderSelect';
import { AuthClient } from './auth/AuthClient';
import { StorageClient } from './storage/StorageClient';
import { RealtimeClient } from './realtime/RealtimeClient';
import { FunctionsClient } from './functions/FunctionsClient';

export class VibeCodeClient {
  private adapter: DatabaseAdapter;
  auth: AuthClient;
  storage: StorageClient;
  realtime: RealtimeClient;
  functions: FunctionsClient;

  constructor(
    _supabaseUrl: string,
    _supabaseKey: string,
    options: ClientOptions,
  ) {
    this.adapter = options.adapter;
    this.auth = new AuthClient(this.adapter.auth, options.config);
    this.storage = new StorageClient(this.adapter.storage);
    this.realtime = new RealtimeClient(this.adapter.realtime);
    this.functions = new FunctionsClient(this.adapter.functions);
  }

  from(table: string): QueryBuilderSelect {
    return new QueryBuilderSelect(this.adapter, table);
  }

  rpc<T = any>(fn: string, args?: Record<string, any>, options?: { head?: boolean; count?: 'exact' | 'planned' | 'estimated' }): PromiseLike<AdapterResponse<T>> {
    return this.adapter.executeRpc<T>(fn, args, options);
  }

  channel(name: string) {
    return this.realtime.channel(name);
  }

  removeChannel(name: string) {
    this.realtime.removeChannel(name);
  }

  removeAllChannels() {
    this.realtime.removeAllChannels();
  }
}
