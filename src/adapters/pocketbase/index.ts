import type { DatabaseAdapter, RpcOptions, AuthAdapter, StorageAdapter, RealtimeAdapter, FunctionsAdapter, StorageFileAdapter, RealtimeChannelAdapter } from '../types';
import type { QueryDescriptor, AdapterResponse, RealtimeCallback } from '../../types';
import { translateFilters } from './filter-translator';

export interface PocketBaseAdapterOptions {
  url: string;
  client?: any;
}

export class PocketBaseAdapter implements DatabaseAdapter {
  private pb: any;

  auth: AuthAdapter;
  storage: StorageAdapter;
  realtime: RealtimeAdapter;
  functions: FunctionsAdapter;

  private initialized: Promise<void>;

  constructor(options: PocketBaseAdapterOptions) {
    // Placeholders until async init completes
    this.auth = null as unknown as AuthAdapter;
    this.storage = new PocketBaseStorageAdapter();
    this.realtime = null as unknown as RealtimeAdapter;
    this.functions = new PocketBaseFunctionsAdapter();

    this.initialized = this.init(options);
  }

  private async init(options: PocketBaseAdapterOptions) {
    if (options.client) {
      this.pb = options.client;
    } else {
      try {
        const mod = await import('pocketbase');
        const PocketBase = mod.default ?? mod;
        this.pb = new PocketBase(options.url);
      } catch {
        throw new Error('PocketBaseAdapter requires pocketbase. Install it with: pnpm add pocketbase');
      }
    }

    this.auth = new PocketBaseAuthAdapter(this.pb);
    this.realtime = new PocketBaseRealtimeAdapter(this.pb);
  }

  async executeQuery<T = any>(descriptor: QueryDescriptor): Promise<AdapterResponse<T>> {
    await this.initialized;
    try {
      const collection = this.pb.collection(descriptor.table);

      switch (descriptor.operation) {
        case 'select':
          return this.executeSelect<T>(collection, descriptor);
        case 'insert':
          return this.executeInsert<T>(collection, descriptor);
        case 'update':
          return this.executeUpdate<T>(collection, descriptor);
        case 'upsert':
          return this.executeUpsert<T>(collection, descriptor);
        case 'delete':
          return this.executeDelete<T>(collection, descriptor);
        default:
          return { data: null, error: { message: `Unknown operation: ${descriptor.operation}` }, status: 400, statusText: 'Bad Request' };
      }
    } catch (err: any) {
      return { data: null, error: { message: err.message }, status: err.status ?? 500, statusText: 'Error' };
    }
  }

  private async executeSelect<T>(collection: any, descriptor: QueryDescriptor): Promise<AdapterResponse<T>> {
    const filter = translateFilters(descriptor.filters);
    const sort = descriptor.modifiers.order
      ?.map((o) => `${o.ascending ? '' : '-'}${o.column}`)
      .join(',') ?? '';

    const options: any = {};
    if (filter) options.filter = filter;
    if (sort) options.sort = sort;

    if (descriptor.modifiers.single || descriptor.modifiers.maybeSingle) {
      options.limit = 1;
      const result = await collection.getList(1, 1, options);
      const item = result.items[0] ?? null;
      if (descriptor.modifiers.single && !item) {
        return { data: null, error: { message: 'No rows found', code: 'PGRST116' }, status: 406, statusText: 'Not Acceptable' };
      }
      return { data: item as T, error: null, status: 200, statusText: 'OK' };
    }

    const page = 1;
    const perPage = descriptor.modifiers.limit ?? 500;
    const result = await collection.getList(page, perPage, options);
    return { data: result.items as T, error: null, count: result.totalItems, status: 200, statusText: 'OK' };
  }

  private async executeInsert<T>(collection: any, descriptor: QueryDescriptor): Promise<AdapterResponse<T>> {
    const values = Array.isArray(descriptor.values) ? descriptor.values : [descriptor.values!];
    const results = [];
    for (const val of values) {
      const record = await collection.create(val);
      results.push(record);
    }
    const data = values.length === 1 ? results[0] : results;
    return { data: data as T, error: null, status: 201, statusText: 'Created' };
  }

  private async executeUpdate<T>(collection: any, descriptor: QueryDescriptor): Promise<AdapterResponse<T>> {
    // PocketBase requires record IDs for updates - find matching records first
    const filter = translateFilters(descriptor.filters);
    const matching = await collection.getFullList({ filter });
    const results = [];
    for (const record of matching) {
      const updated = await collection.update(record.id, descriptor.values);
      results.push(updated);
    }
    return { data: results as T, error: null, status: 200, statusText: 'OK' };
  }

  private async executeUpsert<T>(collection: any, descriptor: QueryDescriptor): Promise<AdapterResponse<T>> {
    const values = Array.isArray(descriptor.values) ? descriptor.values : [descriptor.values!];
    const results = [];
    for (const val of values) {
      try {
        if (val.id) {
          const record = await collection.update(val.id, val);
          results.push(record);
        } else {
          const record = await collection.create(val);
          results.push(record);
        }
      } catch {
        const record = await collection.create(val);
        results.push(record);
      }
    }
    return { data: results as T, error: null, status: 201, statusText: 'Created' };
  }

  private async executeDelete<T>(collection: any, descriptor: QueryDescriptor): Promise<AdapterResponse<T>> {
    const filter = translateFilters(descriptor.filters);
    const matching = await collection.getFullList({ filter });
    for (const record of matching) {
      await collection.delete(record.id);
    }
    return { data: matching as T, error: null, status: 200, statusText: 'OK' };
  }

  async executeRpc<T = any>(_fn: string, _args?: Record<string, any>, _options?: RpcOptions): Promise<AdapterResponse<T>> {
    return { data: null, error: { message: 'RPC not supported by PocketBase adapter' }, status: 501, statusText: 'Not Implemented' };
  }
}

class PocketBaseAuthAdapter implements AuthAdapter {
  private pb: any;

  constructor(pb: any) {
    this.pb = pb;
  }

  async signUp(credentials: { email?: string; phone?: string; password: string }) {
    try {
      const user = await this.pb.collection('users').create({
        email: credentials.email,
        password: credentials.password,
        passwordConfirm: credentials.password,
      });
      const authResult = await this.pb.collection('users').authWithPassword(credentials.email, credentials.password);
      return {
        data: {
          user: { id: user.id, email: user.email, app_metadata: {}, user_metadata: {}, created_at: user.created },
          session: { access_token: authResult.token, refresh_token: '', expires_in: 3600, token_type: 'bearer', user: { id: user.id, email: user.email, app_metadata: {}, user_metadata: {}, created_at: user.created } },
        },
        error: null,
      };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: { message: err.message } };
    }
  }

  async signInWithPassword(credentials: { email?: string; phone?: string; password: string }) {
    try {
      const result = await this.pb.collection('users').authWithPassword(credentials.email ?? credentials.phone, credentials.password);
      return {
        data: {
          user: { id: result.record.id, email: result.record.email, app_metadata: {}, user_metadata: {}, created_at: result.record.created },
          session: { access_token: result.token, refresh_token: '', expires_in: 3600, token_type: 'bearer', user: { id: result.record.id, email: result.record.email, app_metadata: {}, user_metadata: {}, created_at: result.record.created } },
        },
        error: null,
      };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: { message: err.message } };
    }
  }

  async signOut() {
    this.pb.authStore.clear();
    return { error: null };
  }

  async getUser() {
    const model = this.pb.authStore.model;
    if (!model) return { data: { user: null }, error: { message: 'Not authenticated' } };
    return { data: { user: { id: model.id, email: model.email, app_metadata: {}, user_metadata: {}, created_at: model.created } }, error: null };
  }

  async getSession() {
    if (!this.pb.authStore.isValid) return { data: { session: null }, error: null };
    const model = this.pb.authStore.model;
    return {
      data: {
        session: {
          access_token: this.pb.authStore.token,
          refresh_token: '',
          expires_in: 3600,
          token_type: 'bearer',
          user: { id: model.id, email: model.email, app_metadata: {}, user_metadata: {}, created_at: model.created },
        },
      },
      error: null,
    };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const unsubscribe = this.pb.authStore.onChange(() => {
      const session = this.pb.authStore.isValid ? { access_token: this.pb.authStore.token } : null;
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    });
    return { data: { subscription: { unsubscribe } } };
  }

  async updateUser(attributes: { email?: string; password?: string; data?: Record<string, any> }) {
    try {
      const model = this.pb.authStore.model;
      if (!model) return { data: { user: null, session: null }, error: { message: 'Not authenticated' } };
      const updated = await this.pb.collection('users').update(model.id, attributes);
      return {
        data: {
          user: { id: updated.id, email: updated.email, app_metadata: {}, user_metadata: {}, created_at: updated.created },
          session: null,
        },
        error: null,
      };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: { message: err.message } };
    }
  }

  async resetPasswordForEmail(email: string) {
    try {
      await this.pb.collection('users').requestPasswordReset(email);
      return { data: {}, error: null };
    } catch (err: any) {
      return { data: {}, error: { message: err.message } };
    }
  }
}

class PocketBaseStorageAdapter implements StorageAdapter {
  async listBuckets() { return { data: [], error: null }; }
  async getBucket(_id: string) { return { data: null, error: { message: 'Storage not supported in PocketBase adapter (use PB file fields instead)' } }; }
  async createBucket(_id: string) { return { data: null, error: { message: 'Not supported' } }; }
  async deleteBucket(_id: string) { return { data: null, error: { message: 'Not supported' } }; }
  async emptyBucket(_id: string) { return { data: null, error: { message: 'Not supported' } }; }
  from(_bucket: string): StorageFileAdapter {
    return {
      async upload() { return { data: null, error: { message: 'Not supported' } }; },
      async download() { return { data: null, error: { message: 'Not supported' } }; },
      async list() { return { data: null, error: { message: 'Not supported' } }; },
      async remove() { return { data: null, error: { message: 'Not supported' } }; },
      getPublicUrl() { return { data: { publicUrl: '' } }; },
      async move() { return { data: null, error: { message: 'Not supported' } }; },
      async copy() { return { data: null, error: { message: 'Not supported' } }; },
    };
  }
}

class PocketBaseRealtimeAdapter implements RealtimeAdapter {
  private pb: any;
  private channels: Map<string, any> = new Map();

  constructor(pb: any) {
    this.pb = pb;
  }

  channel(name: string): RealtimeChannelAdapter {
    const ch = new PocketBaseRealtimeChannel(this.pb, name);
    this.channels.set(name, ch);
    return ch;
  }

  removeChannel(name: string) {
    const ch = this.channels.get(name);
    if (ch) ch.unsubscribe();
    this.channels.delete(name);
  }

  removeAllChannels() {
    for (const ch of this.channels.values()) ch.unsubscribe();
    this.channels.clear();
  }
}

class PocketBaseRealtimeChannel implements RealtimeChannelAdapter {
  private pb: any;
  private name: string;
  private subs: Array<{ table: string; callback: RealtimeCallback }> = [];
  private unsubscribeFns: Array<() => void> = [];

  constructor(pb: any, name: string) {
    this.pb = pb;
    this.name = name;
  }

  on(_event: 'postgres_changes', filter: { event: string; schema?: string; table?: string; filter?: string }, callback: RealtimeCallback): this {
    if (filter.table) {
      this.subs.push({ table: filter.table, callback });
    }
    return this;
  }

  subscribe(callback?: (status: string) => void): this {
    for (const sub of this.subs) {
      this.pb.collection(sub.table).subscribe('*', (e: any) => {
        sub.callback({
          eventType: e.action.toUpperCase(),
          new: e.record,
          old: {},
          schema: 'public',
          table: sub.table,
          commit_timestamp: new Date().toISOString(),
        });
      });
    }
    if (callback) callback('SUBSCRIBED');
    return this;
  }

  unsubscribe() {
    for (const sub of this.subs) {
      try { this.pb.collection(sub.table).unsubscribe(); } catch {}
    }
    this.subs = [];
  }
}

class PocketBaseFunctionsAdapter implements FunctionsAdapter {
  async invoke<T = any>(_functionName: string): Promise<{ data: T | null; error: { message: string } | null }> {
    return { data: null, error: { message: 'Edge functions not supported in PocketBase adapter' } };
  }
}
