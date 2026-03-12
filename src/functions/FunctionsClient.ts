import type { FunctionsAdapter } from '../adapters/types';

export class FunctionsClient {
  private adapter: FunctionsAdapter;

  constructor(adapter: FunctionsAdapter) {
    this.adapter = adapter;
  }

  invoke<T = any>(functionName: string, options?: { body?: any; headers?: Record<string, string> }) {
    return this.adapter.invoke<T>(functionName, options);
  }
}
