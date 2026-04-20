import type { DatabaseAdapter, RpcOptions, AuthAdapter, StorageAdapter, RealtimeAdapter, FunctionsAdapter, StorageFileAdapter, RealtimeChannelAdapter } from '../types';
import type { QueryDescriptor, AdapterResponse, RealtimeCallback } from '../../types';
import type { RelationNode } from '../../relational/types';
import { translateFilters } from './filter-translator';
import { parseSelect } from '../../relational/select-parser';

/**
 * Extract a detailed error message from a PocketBase ClientResponseError.
 * PB errors carry `response.data` with per-field validation details that
 * the generic `message` property omits.
 */
function extractPbError(err: any): { message: string } {
  const base = err?.message ?? 'Unknown error';
  const data = err?.response?.data ?? err?.data;
  if (data && typeof data === 'object' && Object.keys(data).length > 0) {
    const details = Object.entries(data)
      .map(([field, info]: [string, any]) => `${field}: ${info?.message ?? JSON.stringify(info)}`)
      .join('; ');
    return { message: `${base} (${details})` };
  }
  return { message: base };
}

export interface PocketBaseAdapterOptions {
  url: string;
  client?: any;
  /**
   * Map of relation foreign keys for expand queries.
   * Key: "parentTable.childTable" → Value: FK field name on the child table.
   * Example: { "users.projects": "owner_id", "projects.tasks": "project_id" }
   * If not provided, the adapter tries conventions: `{singularParent}_id`, then `{parentTable}_id`.
   */
  relations?: Record<string, string>;
}

export class PocketBaseAdapter implements DatabaseAdapter {
  private pb: any;
  private relationMap: Record<string, string>;
  /** Cache of collection fields: collectionName → field names */
  private fieldCache: Map<string, string[]> = new Map();

  auth: AuthAdapter;
  storage: StorageAdapter;
  realtime: RealtimeAdapter;
  functions: FunctionsAdapter;

  private initialized: Promise<void>;

  constructor(options: PocketBaseAdapterOptions) {
    this.relationMap = options.relations ?? {};
    this.storage = new PocketBaseLazyStorageAdapter(() => this.pb, () => this.initialized, options.url);
    this.functions = new PocketBaseFunctionsAdapter();

    // Create lazy-init wrappers so auth/realtime are usable immediately
    // but defer actual PB calls until the async init completes.
    this.auth = new PocketBaseLazyAuthAdapter(() => this.pb, () => this.initialized);
    this.realtime = new PocketBaseLazyRealtimeAdapter(() => this.pb, () => this.initialized);

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
      return { data: null, error: extractPbError(err), status: err.status ?? 500, statusText: 'Error' };
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

    // Parse relational selects and build PocketBase expand parameter
    let parsedRelations: RelationNode[] = [];
    if (descriptor.columns && descriptor.columns !== '*') {
      const parsed = parseSelect(descriptor.columns);
      if (parsed.relations.length > 0) {
        parsedRelations = parsed.relations;
        const expandParts = await this.buildExpand(descriptor.table, parsed.relations);
        if (expandParts) options.expand = expandParts;
      }
    }

    if (descriptor.modifiers.single || descriptor.modifiers.maybeSingle) {
      options.limit = 1;
      const result = await collection.getList(1, 1, options);
      let item = result.items[0] ?? null;
      if (descriptor.modifiers.single && !item) {
        return { data: null, error: { message: 'No rows found', code: 'PGRST116' }, status: 406, statusText: 'Not Acceptable' };
      }
      if (item && parsedRelations.length > 0) {
        item = await this.flattenExpand(item, descriptor.table, parsedRelations);
      }
      return { data: item as T, error: null, status: 200, statusText: 'OK' };
    }

    const page = 1;
    const perPage = descriptor.modifiers.limit ?? 500;
    const result = await collection.getList(page, perPage, options);
    let items = result.items;
    if (parsedRelations.length > 0) {
      items = await Promise.all(items.map((item: any) => this.flattenExpand(item, descriptor.table, parsedRelations)));
    }
    return { data: items as T, error: null, count: result.totalItems, status: 200, statusText: 'OK' };
  }

  /**
   * Get the field names of a collection by sampling one record.
   * Results are cached so each collection is only queried once.
   */
  private async getCollectionFields(collectionName: string): Promise<string[]> {
    if (this.fieldCache.has(collectionName)) {
      return this.fieldCache.get(collectionName)!;
    }
    try {
      const result = await this.pb.collection(collectionName).getList(1, 1);
      const record = result.items[0];
      const fields = record ? Object.keys(record) : [];
      this.fieldCache.set(collectionName, fields);
      return fields;
    } catch {
      return [];
    }
  }

  /**
   * Auto-detect FK from child collection that references the parent.
   * Fetches one record from child, looks for fields ending in _id
   * that could reference the parent table.
   */
  private async detectBackFK(parentTable: string, childTable: string): Promise<string> {
    const fields = await this.getCollectionFields(childTable);
    const singularParent = parentTable.replace(/s$/, '');

    // Priority: exact match {singularParent}_id, then {parentTable}_id, then owner_id for users
    const candidates = [
      `${singularParent}_id`,
      `${parentTable}_id`,
      ...(parentTable === 'users' ? ['owner_id', 'author_id', 'creator_id'] : []),
    ];

    for (const candidate of candidates) {
      if (fields.includes(candidate)) return candidate;
    }

    // Last resort: find any field ending in _id that has a PB-style ID value
    const idFields = fields.filter(f => f.endsWith('_id') && !['collectionId'].includes(f));
    if (idFields.length === 1) return idFields[0];

    // Fallback to convention
    return `${singularParent}_id`;
  }

  /**
   * Auto-detect FK on the parent table that references the child (forward relation).
   */
  private async detectForwardFK(parentTable: string, rel: RelationNode): Promise<string | null> {
    const fields = await this.getCollectionFields(parentTable);

    // If alias is present (e.g. task:tasks), look for alias_id
    if (rel.alias && fields.includes(`${rel.alias}_id`)) {
      return `${rel.alias}_id`;
    }

    // Look for {singularChild}_id on parent
    const singularChild = rel.table.replace(/s$/, '');
    if (fields.includes(`${singularChild}_id`)) {
      return `${singularChild}_id`;
    }

    return null;
  }

  /**
   * Resolve how to expand a relation in PocketBase.
   * Auto-detects whether it's a forward or back relation.
   */
  private async resolveExpand(parentTable: string, rel: RelationNode): Promise<{ expandKey: string; flattenKey: string; isForward: boolean }> {
    // 1. Check explicit forward map: "parent->child"
    const forwardKey = `${parentTable}->${rel.table}`;
    if (this.relationMap[forwardKey]) {
      const fk = this.relationMap[forwardKey];
      return { expandKey: fk, flattenKey: rel.alias || rel.table, isForward: true };
    }

    // 2. Check explicit back map: "parent.child"
    const backKey = `${parentTable}.${rel.table}`;
    if (this.relationMap[backKey]) {
      const fk = this.relationMap[backKey];
      return { expandKey: `${rel.table}_via_${fk}`, flattenKey: rel.alias || rel.table, isForward: false };
    }

    // 3. Auto-detect: check if parent has a FK pointing to child (forward)
    const forwardFK = await this.detectForwardFK(parentTable, rel);
    if (forwardFK) {
      return { expandKey: forwardFK, flattenKey: rel.alias || rel.table, isForward: true };
    }

    // 4. Auto-detect: check child for a FK pointing back to parent (back-relation)
    const backFK = await this.detectBackFK(parentTable, rel.table);
    return { expandKey: `${rel.table}_via_${backFK}`, flattenKey: rel.alias || rel.table, isForward: false };
  }

  /**
   * Build PocketBase expand string from parsed relation nodes.
   */
  private async buildExpand(parentTable: string, relations: RelationNode[], prefix = ''): Promise<string> {
    const parts: string[] = [];
    for (const rel of relations) {
      const { expandKey } = await this.resolveExpand(parentTable, rel);
      const fullKey = prefix ? `${prefix}.${expandKey}` : expandKey;
      parts.push(fullKey);

      if (rel.relations.length > 0) {
        const nested = await this.buildExpand(rel.table, rel.relations, fullKey);
        if (nested) parts.push(nested);
      }
    }
    return parts.join(',');
  }

  /**
   * Flatten PocketBase's `expand` response into Supabase-style nested objects.
   * Back-relation:    { expand: { tasks_via_project_id: [...] } } → { tasks: [...] }
   * Forward relation: { expand: { task_id: { ... } } }            → { task: { ... } }
   */
  private async flattenExpand(record: any, parentTable: string, relations: RelationNode[]): Promise<any> {
    if (!record || !record.expand) return record;
    const result = { ...record };

    for (const rel of relations) {
      const { expandKey, flattenKey, isForward } = await this.resolveExpand(parentTable, rel);
      const expanded = result.expand?.[expandKey];

      if (expanded !== undefined) {
        if (isForward) {
          let item = expanded;
          if (rel.relations.length > 0 && item) {
            item = await this.flattenExpand(item, rel.table, rel.relations);
          }
          result[flattenKey] = item;
        } else {
          let nested = Array.isArray(expanded) ? expanded : [expanded];
          if (rel.relations.length > 0) {
            nested = await Promise.all(nested.map((item: any) => this.flattenExpand(item, rel.table, rel.relations)));
          }
          result[flattenKey] = nested;
        }
      }
    }

    delete result.expand;
    return result;
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

class PocketBaseLazyAuthAdapter implements AuthAdapter {
  private getPb: () => any;
  private getReady: () => Promise<void>;

  constructor(getPb: () => any, getReady: () => Promise<void>) {
    this.getPb = getPb;
    this.getReady = getReady;
  }

  private get pb() { return this.getPb(); }

  async signUp(credentials: { email?: string; phone?: string; password: string }) {
    await this.getReady();
    try {
      const user = await this.pb.collection('users').create({
        email: credentials.email,
        password: credentials.password,
        passwordConfirm: credentials.password,
        emailVisibility: true,
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
      return { data: { user: null, session: null }, error: extractPbError(err) };
    }
  }

  async signInWithPassword(credentials: { email?: string; phone?: string; password: string }) {
    await this.getReady();
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
      return { data: { user: null, session: null }, error: extractPbError(err) };
    }
  }

  async signOut() {
    await this.getReady();
    this.pb.authStore.clear();
    return { error: null };
  }

  async getUser() {
    await this.getReady();
    const model = this.pb.authStore.model;
    if (!model) return { data: { user: null }, error: { message: 'Not authenticated' } };
    return { data: { user: { id: model.id, email: model.email, app_metadata: {}, user_metadata: {}, created_at: model.created } }, error: null };
  }

  async getSession() {
    await this.getReady();
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
    // Cannot await here (sync method), so we set up a deferred listener
    let unsubscribeFn: (() => void) | null = null;
    this.getReady().then(() => {
      unsubscribeFn = this.pb.authStore.onChange(() => {
        const session = this.pb.authStore.isValid ? { access_token: this.pb.authStore.token } : null;
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
      });
    });
    return { data: { subscription: { unsubscribe: () => { if (unsubscribeFn) unsubscribeFn(); } } } };
  }

  async updateUser(attributes: { email?: string; password?: string; data?: Record<string, any> }) {
    await this.getReady();
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
      return { data: { user: null, session: null }, error: extractPbError(err) };
    }
  }

  async resetPasswordForEmail(email: string) {
    await this.getReady();
    try {
      await this.pb.collection('users').requestPasswordReset(email);
      return { data: {}, error: null };
    } catch (err: any) {
      return { data: {}, error: extractPbError(err) };
    }
  }
}

/**
 * PocketBase Storage — Collection-as-Bucket
 *
 * Maps Supabase storage to PocketBase collections with file fields.
 * Each "bucket" = a PocketBase collection with a `file` field.
 * Path format: "recordId/filename" — this is what upload() returns and
 * what you pass to download(), getPublicUrl(), remove().
 *
 * Collections must be pre-created via migrations or admin UI.
 */
class PocketBaseLazyStorageAdapter implements StorageAdapter {
  private getPb: () => any;
  private getReady: () => Promise<void>;
  private baseUrl: string;

  constructor(getPb: () => any, getReady: () => Promise<void>, baseUrl: string) {
    this.getPb = getPb;
    this.getReady = getReady;
    this.baseUrl = (baseUrl ?? '').replace(/\/$/, '');
  }

  async listBuckets() {
    return { data: [], error: { message: 'PocketBase uses collections with file fields instead of buckets. Create them via migrations or admin UI.' } };
  }

  async getBucket(_id: string) {
    return { data: null, error: { message: 'PocketBase uses collections with file fields instead of buckets.' } };
  }

  async createBucket(_id: string) {
    return { data: null, error: { message: 'PocketBase collections must be pre-created via migrations or admin UI.' } };
  }

  async deleteBucket(_id: string) {
    return { data: null, error: { message: 'PocketBase collections must be deleted via migrations or admin UI.' } };
  }

  async emptyBucket(id: string) {
    await this.getReady();
    try {
      const pb = this.getPb();
      const records = await pb.collection(id).getFullList();
      for (const record of records) {
        await pb.collection(id).delete(record.id);
      }
      return { data: { message: `Collection '${id}' emptied` }, error: null };
    } catch (err: any) {
      return { data: null, error: extractPbError(err) };
    }
  }

  from(collection: string): StorageFileAdapter {
    return new PocketBaseFileAdapter(this.getPb, this.getReady, this.baseUrl, collection);
  }
}

class PocketBaseFileAdapter implements StorageFileAdapter {
  private getPb: () => any;
  private getReady: () => Promise<void>;
  private baseUrl: string;
  private collection: string;

  constructor(getPb: () => any, getReady: () => Promise<void>, baseUrl: string, collection: string) {
    this.getPb = getPb;
    this.getReady = getReady;
    this.baseUrl = baseUrl;
    this.collection = collection;
  }

  async upload(path: string, file: Blob | ArrayBuffer | string, _options?: { contentType?: string; upsert?: boolean }) {
    await this.getReady();
    try {
      const pb = this.getPb();
      const filename = path.split('/').pop() || path;
      const fileObj = file instanceof Blob
        ? new File([file], filename)
        : new File([file], filename);

      const formData = new FormData();
      formData.append('file', fileObj);
      formData.append('path', path);

      const record = await pb.collection(this.collection).create(formData);
      const storedPath = `${record.id}/${record.file}`;
      return { data: { path: storedPath }, error: null };
    } catch (err: any) {
      return { data: null, error: extractPbError(err) };
    }
  }

  async download(path: string) {
    await this.getReady();
    try {
      const pb = this.getPb();
      const [recordId, ...rest] = path.split('/');
      const filename = rest.join('/');
      if (!recordId || !filename) {
        return { data: null, error: { message: 'Path must be in format: recordId/filename' } };
      }
      const record = await pb.collection(this.collection).getOne(recordId);
      const url = pb.files.getURL(record, filename);
      const res = await fetch(url);
      const blob = await res.blob();
      return { data: blob, error: null };
    } catch (err: any) {
      return { data: null, error: extractPbError(err) };
    }
  }

  async list(_path?: string, options?: { limit?: number; offset?: number; sortBy?: { column: string; order: string } }) {
    await this.getReady();
    try {
      const pb = this.getPb();
      const page = options?.offset ? Math.floor(options.offset / (options?.limit || 100)) + 1 : 1;
      const perPage = options?.limit || 100;
      const opts: any = {};
      if (options?.sortBy) {
        opts.sort = `${options.sortBy.order === 'desc' ? '-' : ''}${options.sortBy.column}`;
      }

      const result = await pb.collection(this.collection).getList(page, perPage, opts);
      const files: any[] = [];
      for (const record of result.items) {
        if (record.file) {
          const fname = Array.isArray(record.file) ? record.file : [record.file];
          for (const f of fname) {
            files.push({
              name: f,
              id: record.id,
              created_at: record.created,
              updated_at: record.updated,
              metadata: { recordId: record.id, path: record.path },
            });
          }
        }
      }
      return { data: files, error: null };
    } catch (err: any) {
      return { data: null, error: extractPbError(err) };
    }
  }

  async remove(paths: string[]) {
    await this.getReady();
    try {
      const pb = this.getPb();
      const removed: any[] = [];
      for (const p of paths) {
        const [recordId] = p.split('/');
        if (!recordId) continue;
        try {
          await pb.collection(this.collection).delete(recordId);
          removed.push({ name: p, id: recordId });
        } catch (err: any) {
          // Record may already be deleted, skip
        }
      }
      return { data: removed, error: null };
    } catch (err: any) {
      return { data: null, error: extractPbError(err) };
    }
  }

  getPublicUrl(path: string) {
    const [recordId, ...rest] = path.split('/');
    const filename = rest.join('/');
    if (recordId && filename) {
      return { data: { publicUrl: `${this.baseUrl}/api/files/${this.collection}/${recordId}/${filename}` } };
    }
    return { data: { publicUrl: `${this.baseUrl}/api/files/${this.collection}/${path}` } };
  }

  async move(fromPath: string, toPath: string) {
    await this.getReady();
    try {
      // Download the file
      const { data: blob, error: dlErr } = await this.download(fromPath);
      if (dlErr || !blob) return { data: null, error: dlErr || { message: 'Download failed' } };

      // Upload to new path
      const { data: upData, error: upErr } = await this.upload(toPath, blob);
      if (upErr) return { data: null, error: upErr };

      // Delete original
      await this.remove([fromPath]);

      return { data: { message: `Moved to ${upData?.path}` }, error: null };
    } catch (err: any) {
      return { data: null, error: extractPbError(err) };
    }
  }

  async copy(fromPath: string, toPath: string) {
    await this.getReady();
    try {
      // Download the file
      const { data: blob, error: dlErr } = await this.download(fromPath);
      if (dlErr || !blob) return { data: null, error: dlErr || { message: 'Download failed' } };

      // Upload to new path
      const { data: upData, error: upErr } = await this.upload(toPath, blob);
      if (upErr) return { data: null, error: upErr };

      return { data: { path: upData?.path || toPath }, error: null };
    } catch (err: any) {
      return { data: null, error: extractPbError(err) };
    }
  }
}

class PocketBaseLazyRealtimeAdapter implements RealtimeAdapter {
  private getPb: () => any;
  private getReady: () => Promise<void>;
  private channels: Map<string, any> = new Map();

  constructor(getPb: () => any, getReady: () => Promise<void>) {
    this.getPb = getPb;
    this.getReady = getReady;
  }

  channel(name: string): RealtimeChannelAdapter {
    const ch = new PocketBaseRealtimeChannel(this.getPb, this.getReady, name);
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
  private getPb: () => any;
  private getReady: () => Promise<void>;
  private name: string;
  private subs: Array<{ table: string; callback: RealtimeCallback }> = [];

  constructor(getPb: () => any, getReady: () => Promise<void>, name: string) {
    this.getPb = getPb;
    this.getReady = getReady;
    this.name = name;
  }

  on(_event: 'postgres_changes', filter: { event: string; schema?: string; table?: string; filter?: string }, callback: RealtimeCallback): this {
    if (filter.table) {
      this.subs.push({ table: filter.table, callback });
    }
    return this;
  }

  subscribe(callback?: (status: string) => void): this {
    this.getReady().then(() => {
      const pb = this.getPb();
      for (const sub of this.subs) {
        pb.collection(sub.table).subscribe('*', (e: any) => {
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
    });
    if (callback) callback('SUBSCRIBED');
    return this;
  }

  unsubscribe() {
    try {
      const pb = this.getPb();
      for (const sub of this.subs) {
        try { pb.collection(sub.table).unsubscribe(); } catch {}
      }
    } catch {}
    this.subs = [];
  }
}

class PocketBaseFunctionsAdapter implements FunctionsAdapter {
  async invoke<T = any>(_functionName: string): Promise<{ data: T | null; error: { message: string } | null }> {
    return { data: null, error: { message: 'Edge functions not supported in PocketBase adapter' } };
  }
}
