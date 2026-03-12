import type { StorageAdapter } from '../adapters/types';
import { StorageFileApi } from './StorageFileApi';

export class StorageClient {
  private adapter: StorageAdapter;

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
  }

  listBuckets() {
    return this.adapter.listBuckets();
  }

  getBucket(id: string) {
    return this.adapter.getBucket(id);
  }

  createBucket(id: string, options?: { public?: boolean }) {
    return this.adapter.createBucket(id, options);
  }

  deleteBucket(id: string) {
    return this.adapter.deleteBucket(id);
  }

  emptyBucket(id: string) {
    return this.adapter.emptyBucket(id);
  }

  from(bucket: string): StorageFileApi {
    return new StorageFileApi(this.adapter.from(bucket));
  }
}
