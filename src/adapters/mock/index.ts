import type { DatabaseAdapter, RpcOptions } from '../types';
import type { QueryDescriptor, AdapterResponse } from '../../types';
import type { SchemaDefinition } from '../../relational/types';
import type { TableDefinition } from '../../relational/define-table';
import { defineSchema } from '../../relational/define-table';
import { applyFilters, applyModifiers, selectColumns } from './query-engine';
import { parseSelect } from '../../relational/select-parser';
import { SchemaRegistry } from '../../relational/schema-registry';
import { RelationIndex, resolveRelations } from './relation-resolver';
import { MockAuthAdapter } from './auth';
import { MockStorageAdapter } from './storage';
import { MockRealtimeAdapter } from './realtime';

export class MockAdapter implements DatabaseAdapter {
  private tables: Map<string, Record<string, any>[]> = new Map();
  private rpcs: Map<string, (args?: Record<string, any>) => any> = new Map();
  private autoId: Map<string, number> = new Map();
  private schemaRegistry: SchemaRegistry = new SchemaRegistry();
  private relationIndex: RelationIndex = new RelationIndex();

  auth = new MockAuthAdapter();
  storage = new MockStorageAdapter();
  realtime = new MockRealtimeAdapter();
  functions = new MockFunctionsAdapter();

  /** Seed a table with initial data */
  seed(table: string, data: Record<string, any>[]) {
    this.tables.set(table, [...data]);
    return this;
  }

  /** Seed auth users without setting session or firing listeners */
  seedUsers(users: Array<{ email: string; password: string; id?: string; user_metadata?: Record<string, any> }>) {
    for (const u of users) {
      const authUser = this.auth.seedUser(u.email, u.password, { id: u.id, user_metadata: u.user_metadata });
      // Also seed into the "users" table so from('users').select() works
      const table = this.getTable('users');
      // Avoid duplicates if seedUsers is called multiple times
      if (!table.some(row => row.id === authUser.id)) {
        table.push({
          id: authUser.id,
          email: authUser.email,
          user_metadata: authUser.user_metadata,
          created_at: authUser.created_at,
        });
      }
    }
    return this;
  }

  /** Register a mock RPC function */
  registerRpc(name: string, handler: (args?: Record<string, any>) => any) {
    this.rpcs.set(name, handler);
    return this;
  }

  /** Set the schema definition for relational queries (raw object) */
  setSchema(schema: SchemaDefinition): this;
  /** Set the schema from defineTable() definitions */
  setSchema(...tables: TableDefinition<any>[]): this;
  setSchema(...args: [SchemaDefinition] | TableDefinition<any>[]): this {
    // If first arg has a `tableName` property, it's a TableDefinition
    if (args.length > 0 && typeof (args[0] as any).tableName === 'string') {
      this.schemaRegistry.setSchema(defineSchema(...(args as TableDefinition<any>[])));
    } else {
      this.schemaRegistry.setSchema(args[0] as SchemaDefinition);
    }
    this.relationIndex.clear();
    return this;
  }

  /** Reset all data */
  reset() {
    this.tables.clear();
    this.rpcs.clear();
    this.autoId.clear();
    this.schemaRegistry = new SchemaRegistry();
    this.relationIndex.clear();
    this.auth.reset();
    this.storage.reset();
    this.realtime.reset();
  }

  getTable(name: string): Record<string, any>[] {
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

    // Parse the select string for relational includes
    const parsed = parseSelect(descriptor.columns ?? '*');

    if (parsed.relations.length > 0 && this.schemaRegistry.hasSchema()) {
      // Clear indexes on each query to reflect any data mutations since last query
      this.relationIndex.clear();

      // Resolve relations recursively
      result = resolveRelations(
        result,
        descriptor.table,
        parsed.relations,
        this.schemaRegistry,
        (name) => this.getTable(name),
        this.relationIndex,
        parsed.columns,
      );
    } else {
      // No relations — use simple column selection
      result = selectColumns(result, descriptor.columns);
    }

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
