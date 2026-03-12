import type { DatabaseAdapter, RpcOptions } from '../types';
import type { QueryDescriptor, AdapterResponse } from '../../types';
import { applyFilters, applyModifiers, selectColumns } from './query-engine';
import { MockAuthAdapter } from './auth';
import { MockStorageAdapter } from './storage';
import { MockRealtimeAdapter } from './realtime';

export class MockAdapter implements DatabaseAdapter {
  private tables: Map<string, Record<string, any>[]> = new Map();
  private rpcs: Map<string, (args?: Record<string, any>) => any> = new Map();
  private autoId: Map<string, number> = new Map();

  auth = new MockAuthAdapter();
  storage = new MockStorageAdapter();
  realtime = new MockRealtimeAdapter();
  functions = new MockFunctionsAdapter();

  /** Seed a table with initial data */
  seed(table: string, data: Record<string, any>[]) {
    this.tables.set(table, [...data]);
    return this;
  }

  /** Register a mock RPC function */
  registerRpc(name: string, handler: (args?: Record<string, any>) => any) {
    this.rpcs.set(name, handler);
    return this;
  }

  /** Reset all data */
  reset() {
    this.tables.clear();
    this.rpcs.clear();
    this.autoId.clear();
    this.auth.reset();
    this.storage.reset();
    this.realtime.reset();
  }

  private getTable(name: string): Record<string, any>[] {
    if (!this.tables.has(name)) {
      this.tables.set(name, []);
    }
    return this.tables.get(name)!;
  }

  private nextId(table: string): number {
    const current = this.autoId.get(table) ?? 0;
    const next = current + 1;
    this.autoId.set(table, next);
    return next;
  }

  async executeQuery<T = any>(descriptor: QueryDescriptor): Promise<AdapterResponse<T>> {
    try {
      switch (descriptor.operation) {
        case 'select':
          return this.executeSelect<T>(descriptor);
        case 'insert':
          return this.executeInsert<T>(descriptor);
        case 'update':
          return this.executeUpdate<T>(descriptor);
        case 'upsert':
          return this.executeUpsert<T>(descriptor);
        case 'delete':
          return this.executeDelete<T>(descriptor);
        default:
          return {
            data: null,
            error: { message: `Unknown operation: ${descriptor.operation}` },
            status: 400,
            statusText: 'Bad Request',
          };
      }
    } catch (err: any) {
      return {
        data: null,
        error: { message: err.message },
        status: 500,
        statusText: 'Internal Server Error',
      };
    }
  }

  private executeSelect<T>(descriptor: QueryDescriptor): AdapterResponse<T> {
    const table = this.getTable(descriptor.table);
    let result = applyFilters(table, descriptor.filters);
    result = applyModifiers(result, descriptor.modifiers);
    result = selectColumns(result, descriptor.columns);

    const count = descriptor.modifiers.count ? table.length : undefined;

    if (descriptor.modifiers.head) {
      return { data: null, error: null, count, status: 200, statusText: 'OK' };
    }

    if (descriptor.modifiers.single) {
      if (result.length === 0) {
        return {
          data: null,
          error: { message: 'JSON object requested, multiple (or no) rows returned', code: 'PGRST116' },
          status: 406,
          statusText: 'Not Acceptable',
        };
      }
      if (result.length > 1) {
        return {
          data: null,
          error: { message: 'JSON object requested, multiple (or no) rows returned', code: 'PGRST116' },
          status: 406,
          statusText: 'Not Acceptable',
        };
      }
      return { data: result[0] as T, error: null, count, status: 200, statusText: 'OK' };
    }

    if (descriptor.modifiers.maybeSingle) {
      if (result.length > 1) {
        return {
          data: null,
          error: { message: 'JSON object requested, multiple (or no) rows returned', code: 'PGRST116' },
          status: 406,
          statusText: 'Not Acceptable',
        };
      }
      return { data: (result[0] ?? null) as T, error: null, count, status: 200, statusText: 'OK' };
    }

    return { data: result as T, error: null, count, status: 200, statusText: 'OK' };
  }

  private executeInsert<T>(descriptor: QueryDescriptor): AdapterResponse<T> {
    const table = this.getTable(descriptor.table);
    const values = Array.isArray(descriptor.values) ? descriptor.values : [descriptor.values!];

    const inserted: Record<string, any>[] = [];
    for (const val of values) {
      const record = { ...val };
      if (!('id' in record)) {
        record.id = this.nextId(descriptor.table);
      }
      table.push(record);
      inserted.push(record);

      // Emit realtime event
      this.realtime.emit(descriptor.table, {
        eventType: 'INSERT',
        new: record,
        old: {} as any,
        schema: 'public',
        table: descriptor.table,
        commit_timestamp: new Date().toISOString(),
      });
    }

    const count = descriptor.count ? inserted.length : undefined;

    if (descriptor.modifiers.single) {
      return { data: inserted[0] as T, error: null, count, status: 201, statusText: 'Created' };
    }

    return { data: inserted as T, error: null, count, status: 201, statusText: 'Created' };
  }

  private executeUpdate<T>(descriptor: QueryDescriptor): AdapterResponse<T> {
    const table = this.getTable(descriptor.table);
    const matching = applyFilters(table, descriptor.filters);

    const updated: Record<string, any>[] = [];
    for (const row of matching) {
      const old = { ...row };
      Object.assign(row, descriptor.values);
      updated.push({ ...row });

      this.realtime.emit(descriptor.table, {
        eventType: 'UPDATE',
        new: { ...row },
        old,
        schema: 'public',
        table: descriptor.table,
        commit_timestamp: new Date().toISOString(),
      });
    }

    const count = descriptor.count ? updated.length : undefined;

    if (descriptor.modifiers.single) {
      if (updated.length === 0) {
        return { data: null, error: { message: 'No rows found', code: 'PGRST116' }, status: 406, statusText: 'Not Acceptable' };
      }
      return { data: updated[0] as T, error: null, count, status: 200, statusText: 'OK' };
    }

    return { data: updated as T, error: null, count, status: 200, statusText: 'OK' };
  }

  private executeUpsert<T>(descriptor: QueryDescriptor): AdapterResponse<T> {
    const table = this.getTable(descriptor.table);
    const values = Array.isArray(descriptor.values) ? descriptor.values : [descriptor.values!];
    const conflictCol = descriptor.onConflict || 'id';

    const upserted: Record<string, any>[] = [];
    for (const val of values) {
      const existing = table.find((row) => row[conflictCol] === val[conflictCol]);
      if (existing) {
        const old = { ...existing };
        Object.assign(existing, val);
        upserted.push({ ...existing });

        this.realtime.emit(descriptor.table, {
          eventType: 'UPDATE',
          new: { ...existing },
          old,
          schema: 'public',
          table: descriptor.table,
          commit_timestamp: new Date().toISOString(),
        });
      } else {
        const record = { ...val };
        if (!('id' in record)) {
          record.id = this.nextId(descriptor.table);
        }
        table.push(record);
        upserted.push(record);

        this.realtime.emit(descriptor.table, {
          eventType: 'INSERT',
          new: record,
          old: {} as any,
          schema: 'public',
          table: descriptor.table,
          commit_timestamp: new Date().toISOString(),
        });
      }
    }

    const count = descriptor.count ? upserted.length : undefined;
    return { data: upserted as T, error: null, count, status: 201, statusText: 'Created' };
  }

  private executeDelete<T>(descriptor: QueryDescriptor): AdapterResponse<T> {
    const table = this.getTable(descriptor.table);
    const matching = applyFilters(table, descriptor.filters);

    const deleted: Record<string, any>[] = [];
    for (const row of matching) {
      const idx = table.indexOf(row);
      if (idx >= 0) {
        table.splice(idx, 1);
        deleted.push(row);

        this.realtime.emit(descriptor.table, {
          eventType: 'DELETE',
          new: {} as any,
          old: row,
          schema: 'public',
          table: descriptor.table,
          commit_timestamp: new Date().toISOString(),
        });
      }
    }

    const count = descriptor.count ? deleted.length : undefined;
    return { data: deleted as T, error: null, count, status: 200, statusText: 'OK' };
  }

  async executeRpc<T = any>(fn: string, args?: Record<string, any>, _options?: RpcOptions): Promise<AdapterResponse<T>> {
    const handler = this.rpcs.get(fn);
    if (!handler) {
      return { data: null, error: { message: `Function not found: ${fn}` }, status: 404, statusText: 'Not Found' };
    }
    try {
      const result = await handler(args);
      return { data: result as T, error: null, status: 200, statusText: 'OK' };
    } catch (err: any) {
      return { data: null, error: { message: err.message }, status: 500, statusText: 'Internal Server Error' };
    }
  }
}

class MockFunctionsAdapter {
  private handlers: Map<string, (options?: any) => any> = new Map();

  registerFunction(name: string, handler: (options?: any) => any) {
    this.handlers.set(name, handler);
  }

  async invoke<T = any>(functionName: string, options?: { body?: any; headers?: Record<string, string> }) {
    const handler = this.handlers.get(functionName);
    if (!handler) {
      return { data: null, error: { message: `Function not found: ${functionName}` } };
    }
    try {
      const result = await handler(options);
      return { data: result as T, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }
}

export { MockAuthAdapter } from './auth';
export { MockStorageAdapter } from './storage';
export { MockRealtimeAdapter } from './realtime';
