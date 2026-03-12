import type { StorageAdapter, StorageFileAdapter } from '../types';
import type { StorageBucket, StorageFile } from '../../types';

export class MockStorageAdapter implements StorageAdapter {
  private buckets: Map<string, StorageBucket> = new Map();
  private files: Map<string, Map<string, { data: Blob | ArrayBuffer | string; metadata?: Record<string, any> }>> = new Map();

  async listBuckets() {
    return { data: Array.from(this.buckets.values()), error: null };
  }

  async getBucket(id: string) {
    const bucket = this.buckets.get(id);
    if (!bucket) {
      return { data: null, error: { message: `Bucket not found: ${id}` } };
    }
    return { data: bucket, error: null };
  }

  async createBucket(id: string, options?: { public?: boolean }) {
    if (this.buckets.has(id)) {
      return { data: null, error: { message: `Bucket already exists: ${id}` } };
    }
    const bucket: StorageBucket = {
      id,
      name: id,
      public: options?.public ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.buckets.set(id, bucket);
    this.files.set(id, new Map());
    return { data: { name: id }, error: null };
  }

  async deleteBucket(id: string) {
    if (!this.buckets.has(id)) {
      return { data: null, error: { message: `Bucket not found: ${id}` } };
    }
    this.buckets.delete(id);
    this.files.delete(id);
    return { data: { message: 'Successfully deleted' }, error: null };
  }

  async emptyBucket(id: string) {
    if (!this.buckets.has(id)) {
      return { data: null, error: { message: `Bucket not found: ${id}` } };
    }
    this.files.set(id, new Map());
    return { data: { message: 'Successfully emptied' }, error: null };
  }

  from(bucket: string): StorageFileAdapter {
    return new MockStorageFileAdapter(this, bucket);
  }

  /** Internal: get the file store for a bucket */
  _getFileStore(bucket: string) {
    return this.files.get(bucket);
  }

  reset() {
    this.buckets.clear();
    this.files.clear();
  }
}

class MockStorageFileAdapter implements StorageFileAdapter {
  private storage: MockStorageAdapter;
  private bucket: string;

  constructor(storage: MockStorageAdapter, bucket: string) {
    this.storage = storage;
    this.bucket = bucket;
  }

  async upload(path: string, file: Blob | ArrayBuffer | string, options?: { contentType?: string; upsert?: boolean }) {
    const store = this.storage._getFileStore(this.bucket);
    if (!store) {
      return { data: null, error: { message: `Bucket not found: ${this.bucket}` } };
    }
    if (store.has(path) && !options?.upsert) {
      return { data: null, error: { message: `File already exists: ${path}` } };
    }
    store.set(path, { data: file, metadata: { contentType: options?.contentType } });
    return { data: { path }, error: null };
  }

  async download(path: string) {
    const store = this.storage._getFileStore(this.bucket);
    if (!store) {
      return { data: null, error: { message: `Bucket not found: ${this.bucket}` } };
    }
    const file = store.get(path);
    if (!file) {
      return { data: null, error: { message: `File not found: ${path}` } };
    }
    const blob = file.data instanceof Blob ? file.data : new Blob([file.data as any]);
    return { data: blob, error: null };
  }

  async list(path?: string, options?: { limit?: number; offset?: number; sortBy?: { column: string; order: string } }) {
    const store = this.storage._getFileStore(this.bucket);
    if (!store) {
      return { data: null, error: { message: `Bucket not found: ${this.bucket}` } };
    }

    let files: StorageFile[] = [];
    for (const [filePath] of store) {
      if (!path || filePath.startsWith(path)) {
        const name = path ? filePath.substring(path.length).replace(/^\//, '') : filePath;
        files.push({ name, bucket_id: this.bucket });
      }
    }

    if (options?.sortBy) {
      const { column, order } = options.sortBy;
      files.sort((a, b) => {
        const aVal = (a as any)[column] ?? '';
        const bVal = (b as any)[column] ?? '';
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return order === 'desc' ? -cmp : cmp;
      });
    }

    if (options?.offset) {
      files = files.slice(options.offset);
    }
    if (options?.limit) {
      files = files.slice(0, options.limit);
    }

    return { data: files, error: null };
  }

  async remove(paths: string[]) {
    const store = this.storage._getFileStore(this.bucket);
    if (!store) {
      return { data: null, error: { message: `Bucket not found: ${this.bucket}` } };
    }

    const removed: StorageFile[] = [];
    for (const path of paths) {
      if (store.has(path)) {
        store.delete(path);
        removed.push({ name: path, bucket_id: this.bucket });
      }
    }
    return { data: removed, error: null };
  }

  getPublicUrl(path: string) {
    return { data: { publicUrl: `https://mock-storage.local/${this.bucket}/${path}` } };
  }

  async move(fromPath: string, toPath: string) {
    const store = this.storage._getFileStore(this.bucket);
    if (!store) {
      return { data: null, error: { message: `Bucket not found: ${this.bucket}` } };
    }
    const file = store.get(fromPath);
    if (!file) {
      return { data: null, error: { message: `File not found: ${fromPath}` } };
    }
    store.set(toPath, file);
    store.delete(fromPath);
    return { data: { message: 'Successfully moved' }, error: null };
  }

  async copy(fromPath: string, toPath: string) {
    const store = this.storage._getFileStore(this.bucket);
    if (!store) {
      return { data: null, error: { message: `Bucket not found: ${this.bucket}` } };
    }
    const file = store.get(fromPath);
    if (!file) {
      return { data: null, error: { message: `File not found: ${fromPath}` } };
    }
    store.set(toPath, { ...file });
    return { data: { path: toPath }, error: null };
  }
}
