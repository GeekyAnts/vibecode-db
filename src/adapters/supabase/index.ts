import type { DatabaseAdapter, RpcOptions, AuthAdapter, StorageAdapter, RealtimeAdapter, FunctionsAdapter } from '../types';
import type { QueryDescriptor, AdapterResponse } from '../../types';

export interface SupabaseAdapterOptions {
  supabaseUrl: string;
  supabaseKey: string;
  client?: any;
}

export class SupabaseAdapter implements DatabaseAdapter {
  private client: any;

  auth: AuthAdapter;
  storage: StorageAdapter;
  realtime: RealtimeAdapter;
  functions: FunctionsAdapter;

  /** Resolves when the adapter is fully initialized (auth, storage, etc. are ready) */
  readonly ready: Promise<void>;

  constructor(options: SupabaseAdapterOptions) {
    this.auth = null as unknown as AuthAdapter;
    this.storage = null as unknown as StorageAdapter;
    this.realtime = null as unknown as RealtimeAdapter;
    this.functions = null as unknown as FunctionsAdapter;

    this.ready = this.init(options);
  }

  private async init(options: SupabaseAdapterOptions) {
    if (options.client) {
      this.client = options.client;
    } else {
      try {
        const mod = await import('@supabase/supabase-js');
        const { createClient } = mod;
        this.client = createClient(options.supabaseUrl, options.supabaseKey);
      } catch {
        throw new Error(
          'SupabaseAdapter requires @supabase/supabase-js. Install it with: pnpm add @supabase/supabase-js',
        );
      }
    }

    this.auth = this.client.auth;
    this.storage = this.client.storage;
    this.realtime = this.client.realtime ?? createRealtimeProxy(this.client);
    this.functions = this.client.functions;
  }

  async executeQuery<T = any>(descriptor: QueryDescriptor): Promise<AdapterResponse<T>> {
    await this.ready;
    let query: any = this.client.from(descriptor.table);

    // Operation
    switch (descriptor.operation) {
      case 'select':
        query = query.select(descriptor.columns ?? '*', {
          head: descriptor.modifiers.head,
          count: descriptor.modifiers.count,
        });
        break;
      case 'insert':
        query = query.insert(descriptor.values);
        break;
      case 'update':
        query = query.update(descriptor.values);
        break;
      case 'upsert':
        query = query.upsert(descriptor.values, { onConflict: descriptor.onConflict });
        break;
      case 'delete':
        query = query.delete();
        break;
    }

    // Filters
    for (const filter of descriptor.filters) {
      if (filter.operator === 'or') {
        query = query.or(filter.value);
      } else if (filter.negate) {
        query = query.not(filter.column, filter.operator, filter.value);
      } else if (filter.operator === 'filter') {
        query = query.filter(filter.column, filter.value.operator, filter.value.value);
      } else {
        query = query[filter.operator](filter.column, filter.value);
      }
    }

    // Modifiers
    if (descriptor.modifiers.order) {
      for (const o of descriptor.modifiers.order) {
        query = query.order(o.column, { ascending: o.ascending, nullsFirst: o.nullsFirst });
      }
    }
    if (descriptor.modifiers.limit != null) {
      query = query.limit(descriptor.modifiers.limit);
    }
    if (descriptor.modifiers.range) {
      query = query.range(descriptor.modifiers.range.from, descriptor.modifiers.range.to);
    }
    if (descriptor.modifiers.single) {
      query = query.single();
    }
    if (descriptor.modifiers.maybeSingle) {
      query = query.maybeSingle();
    }
    if (descriptor.modifiers.csv) {
      query = query.csv();
    }
    if (descriptor.modifiers.abortSignal) {
      query = query.abortSignal(descriptor.modifiers.abortSignal);
    }

    return query;
  }

  async executeRpc<T = any>(fn: string, args?: Record<string, any>, options?: RpcOptions): Promise<AdapterResponse<T>> {
    await this.ready;
    return this.client.rpc(fn, args, options);
  }
}

function createRealtimeProxy(client: any) {
  return {
    channel: (name: string) => client.channel(name),
    removeChannel: (name: string) => client.removeChannel(name),
    removeAllChannels: () => client.removeAllChannels(),
  };
}
