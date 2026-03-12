import type { StorageFileAdapter } from '../adapters/types';

export class StorageFileApi {
  private adapter: StorageFileAdapter;

  constructor(adapter: StorageFileAdapter) {
    this.adapter = adapter;
  }

  upload(path: string, file: Blob | ArrayBuffer | string, options?: { contentType?: string; upsert?: boolean }) {
    return this.adapter.upload(path, file, options);
  }

  download(path: string) {
    return this.adapter.download(path);
  }

  list(path?: string, options?: { limit?: number; offset?: number; sortBy?: { column: string; order: string } }) {
    return this.adapter.list(path, options);
  }

  remove(paths: string[]) {
    return this.adapter.remove(paths);
  }

  getPublicUrl(path: string) {
    return this.adapter.getPublicUrl(path);
  }

  move(fromPath: string, toPath: string) {
    return this.adapter.move(fromPath, toPath);
  }

  copy(fromPath: string, toPath: string) {
    return this.adapter.copy(fromPath, toPath);
  }
}
