import type { DatabaseAdapter, RpcOptions, AuthAdapter, StorageAdapter, StorageFileAdapter, RealtimeAdapter, RealtimeChannelAdapter, FunctionsAdapter } from '../types';
import type { QueryDescriptor, AdapterResponse, RealtimeCallback } from '../../types';

export interface RestAdapterOptions {
  baseUrl: string;
  headers?: Record<string, string>;
  /** Custom fetch function (defaults to global fetch) */
  fetch?: typeof fetch;
}

export class RestAdapter implements DatabaseAdapter {
  private baseUrl: string;
  private headers: Record<string, string>;
  private fetchFn: typeof fetch;

  auth: AuthAdapter;
  storage: StorageAdapter;
  realtime: RealtimeAdapter;
  functions: FunctionsAdapter;

  constructor(options: RestAdapterOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.headers = { 'Content-Type': 'application/json', ...options.headers };
    this.fetchFn = options.fetch ?? globalThis.fetch.bind(globalThis);

    this.auth = new RestAuthAdapter(this.baseUrl, this.headers, this.fetchFn);
    this.storage = new RestStorageStub();
    this.realtime = new RestRealtimeStub();
    this.functions = new RestFunctionsAdapter(this.baseUrl, this.headers, this.fetchFn);
  }

  async executeQuery<T = any>(descriptor: QueryDescriptor): Promise<AdapterResponse<T>> {
    const url = `${this.baseUrl}/${descriptor.table}`;

    try {
      switch (descriptor.operation) {
        case 'select':
          return this.doSelect<T>(url, descriptor);
        case 'insert':
          return this.doInsert<T>(url, descriptor);
        case 'update':
          return this.doUpdate<T>(url, descriptor);
        case 'delete':
          return this.doDelete<T>(url, descriptor);
        case 'upsert':
          return this.doInsert<T>(url, descriptor); // PUT semantics
        default:
          return { data: null, error: { message: `Unknown operation` }, status: 400, statusText: 'Bad Request' };
      }
    } catch (err: any) {
      return { data: null, error: { message: err.message }, status: 500, statusText: 'Error' };
    }
  }

  private async doSelect<T>(url: string, descriptor: QueryDescriptor): Promise<AdapterResponse<T>> {
    const params = new URLSearchParams();
    if (descriptor.columns && descriptor.columns !== '*') {
      params.set('fields', descriptor.columns);
    }
    for (const f of descriptor.filters) {
      params.set(`${f.column}[${f.operator}]`, String(f.value));
    }
    if (descriptor.modifiers.order) {
      const sort = descriptor.modifiers.order.map((o) => `${o.ascending ? '' : '-'}${o.column}`).join(',');
      params.set('sort', sort);
    }
    if (descriptor.modifiers.limit != null) {
      params.set('limit', String(descriptor.modifiers.limit));
    }
    if (descriptor.modifiers.range) {
      params.set('offset', String(descriptor.modifiers.range.from));
      params.set('limit', String(descriptor.modifiers.range.to - descriptor.modifiers.range.from + 1));
    }

    const queryString = params.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    const res = await this.fetchFn(fullUrl, { headers: this.headers, signal: descriptor.modifiers.abortSignal });
    const data = await res.json();

    if (!res.ok) {
      return { data: null, error: { message: data.message ?? res.statusText }, status: res.status, statusText: res.statusText };
    }

    if (descriptor.modifiers.single) {
      const item = Array.isArray(data) ? data[0] : data;
      return { data: item as T, error: null, status: 200, statusText: 'OK' };
    }

    return { data: data as T, error: null, status: 200, statusText: 'OK' };
  }

  private async doInsert<T>(url: string, descriptor: QueryDescriptor): Promise<AdapterResponse<T>> {
    const method = descriptor.operation === 'upsert' ? 'PUT' : 'POST';
    const res = await this.fetchFn(url, {
      method,
      headers: this.headers,
      body: JSON.stringify(descriptor.values),
      signal: descriptor.modifiers.abortSignal,
    });
    const data = await res.json();

    if (!res.ok) {
      return { data: null, error: { message: data.message ?? res.statusText }, status: res.status, statusText: res.statusText };
    }

    return { data: data as T, error: null, status: res.status, statusText: res.statusText };
  }

  private async doUpdate<T>(url: string, descriptor: QueryDescriptor): Promise<AdapterResponse<T>> {
    // If there's an 'eq' filter on 'id', use it as the resource URL
    const idFilter = descriptor.filters.find((f) => f.column === 'id' && f.operator === 'eq');
    const targetUrl = idFilter ? `${url}/${idFilter.value}` : url;

    const res = await this.fetchFn(targetUrl, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(descriptor.values),
      signal: descriptor.modifiers.abortSignal,
    });
    const data = await res.json();

    if (!res.ok) {
      return { data: null, error: { message: data.message ?? res.statusText }, status: res.status, statusText: res.statusText };
    }

    return { data: data as T, error: null, status: res.status, statusText: res.statusText };
  }

  private async doDelete<T>(url: string, descriptor: QueryDescriptor): Promise<AdapterResponse<T>> {
    const idFilter = descriptor.filters.find((f) => f.column === 'id' && f.operator === 'eq');
    const targetUrl = idFilter ? `${url}/${idFilter.value}` : url;

    const res = await this.fetchFn(targetUrl, {
      method: 'DELETE',
      headers: this.headers,
      signal: descriptor.modifiers.abortSignal,
    });

    let data: any = null;
    try { data = await res.json(); } catch {}

    if (!res.ok) {
      return { data: null, error: { message: data?.message ?? res.statusText }, status: res.status, statusText: res.statusText };
    }

    return { data: data as T, error: null, status: res.status, statusText: res.statusText };
  }

  async executeRpc<T = any>(fn: string, args?: Record<string, any>, _options?: RpcOptions): Promise<AdapterResponse<T>> {
    try {
      const res = await this.fetchFn(`${this.baseUrl}/rpc/${fn}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(args ?? {}),
      });
      const data = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: data.message ?? res.statusText }, status: res.status, statusText: res.statusText };
      }
      return { data: data as T, error: null, status: 200, statusText: 'OK' };
    } catch (err: any) {
      return { data: null, error: { message: err.message }, status: 500, statusText: 'Error' };
    }
  }
}

class RestAuthAdapter implements AuthAdapter {
  constructor(private baseUrl: string, private headers: Record<string, string>, private fetchFn: typeof fetch) {}

  async signUp(credentials: { email?: string; phone?: string; password: string }) {
    try {
      const res = await this.fetchFn(`${this.baseUrl}/auth/signup`, { method: 'POST', headers: this.headers, body: JSON.stringify(credentials) });
      const data = await res.json();
      if (!res.ok) return { data: { user: null, session: null }, error: { message: data.message } };
      return { data, error: null };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: { message: err.message } };
    }
  }

  async signInWithPassword(credentials: { email?: string; phone?: string; password: string }) {
    try {
      const res = await this.fetchFn(`${this.baseUrl}/auth/login`, { method: 'POST', headers: this.headers, body: JSON.stringify(credentials) });
      const data = await res.json();
      if (!res.ok) return { data: { user: null, session: null }, error: { message: data.message } };
      return { data, error: null };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: { message: err.message } };
    }
  }

  async signOut() {
    try {
      await this.fetchFn(`${this.baseUrl}/auth/logout`, { method: 'POST', headers: this.headers });
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message } };
    }
  }

  async getUser() {
    try {
      const res = await this.fetchFn(`${this.baseUrl}/auth/user`, { headers: this.headers });
      const data = await res.json();
      if (!res.ok) return { data: { user: null }, error: { message: data.message } };
      return { data: { user: data }, error: null };
    } catch (err: any) {
      return { data: { user: null }, error: { message: err.message } };
    }
  }

  async getSession() {
    try {
      const res = await this.fetchFn(`${this.baseUrl}/auth/session`, { headers: this.headers });
      const data = await res.json();
      if (!res.ok) return { data: { session: null }, error: { message: data.message } };
      return { data: { session: data }, error: null };
    } catch (err: any) {
      return { data: { session: null }, error: { message: err.message } };
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  async updateUser(attributes: { email?: string; password?: string; data?: Record<string, any> }) {
    try {
      const res = await this.fetchFn(`${this.baseUrl}/auth/user`, { method: 'PATCH', headers: this.headers, body: JSON.stringify(attributes) });
      const data = await res.json();
      if (!res.ok) return { data: { user: null, session: null }, error: { message: data.message } };
      return { data, error: null };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: { message: err.message } };
    }
  }

  async resetPasswordForEmail(email: string) {
    try {
      await this.fetchFn(`${this.baseUrl}/auth/reset-password`, { method: 'POST', headers: this.headers, body: JSON.stringify({ email }) });
      return { data: {}, error: null };
    } catch (err: any) {
      return { data: {}, error: { message: err.message } };
    }
  }
}

class RestStorageStub implements StorageAdapter {
  async listBuckets() { return { data: [], error: null }; }
  async getBucket() { return { data: null, error: { message: 'Not implemented' } }; }
  async createBucket() { return { data: null, error: { message: 'Not implemented' } }; }
  async deleteBucket() { return { data: null, error: { message: 'Not implemented' } }; }
  async emptyBucket() { return { data: null, error: { message: 'Not implemented' } }; }
  from(): StorageFileAdapter {
    return {
      async upload() { return { data: null, error: { message: 'Not implemented' } }; },
      async download() { return { data: null, error: { message: 'Not implemented' } }; },
      async list() { return { data: null, error: { message: 'Not implemented' } }; },
      async remove() { return { data: null, error: { message: 'Not implemented' } }; },
      getPublicUrl() { return { data: { publicUrl: '' } }; },
      async move() { return { data: null, error: { message: 'Not implemented' } }; },
      async copy() { return { data: null, error: { message: 'Not implemented' } }; },
    };
  }
}

class RestRealtimeStub implements RealtimeAdapter {
  channel(): RealtimeChannelAdapter {
    return {
      on() { return this; },
      subscribe(cb) { if (cb) cb('SUBSCRIBED'); return this; },
      unsubscribe() {},
    };
  }
  removeChannel() {}
  removeAllChannels() {}
}

class RestFunctionsAdapter implements FunctionsAdapter {
  constructor(private baseUrl: string, private headers: Record<string, string>, private fetchFn: typeof fetch) {}

  async invoke<T = any>(functionName: string, options?: { body?: any; headers?: Record<string, string> }) {
    try {
      const res = await this.fetchFn(`${this.baseUrl}/functions/${functionName}`, {
        method: 'POST',
        headers: { ...this.headers, ...options?.headers },
        body: JSON.stringify(options?.body ?? {}),
      });
      const data = await res.json();
      if (!res.ok) return { data: null, error: { message: data.message ?? res.statusText } };
      return { data: data as T, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }
}
