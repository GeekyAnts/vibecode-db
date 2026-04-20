import type {
  QueryDescriptor,
  AdapterResponse,
  AuthResponse,
  AuthUser,
  AuthSession,
  StorageBucket,
  StorageFile,
  RealtimeCallback,
} from '../types';

export interface DatabaseAdapter {
  executeQuery<T = any>(descriptor: QueryDescriptor): Promise<AdapterResponse<T>>;
  executeRpc<T = any>(fn: string, args?: Record<string, any>, options?: RpcOptions): Promise<AdapterResponse<T>>;
  auth: AuthAdapter;
  storage: StorageAdapter;
  realtime: RealtimeAdapter;
  functions: FunctionsAdapter;
}

export interface RpcOptions {
  head?: boolean;
  count?: 'exact' | 'planned' | 'estimated';
}

export interface AuthAdapter {
  signUp(credentials: { email?: string; phone?: string; password: string }): Promise<AuthResponse>;
  signInWithPassword(credentials: { email?: string; phone?: string; password: string }): Promise<AuthResponse>;
  signOut(): Promise<{ error: { message: string; reason?: string } | null }>;
  getUser(): Promise<{ data: { user: AuthUser | null }; error: { message: string } | null }>;
  getSession(): Promise<{ data: { session: AuthSession | null }; error: { message: string } | null }>;
  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void): {
    data: { subscription: { unsubscribe: () => void } };
  };
  updateUser(attributes: { email?: string; password?: string; data?: Record<string, any> }): Promise<AuthResponse>;
  resetPasswordForEmail(email: string): Promise<{ data: {}; error: { message: string } | null }>;
}

export interface StorageAdapter {
  listBuckets(): Promise<{ data: StorageBucket[] | null; error: { message: string } | null }>;
  getBucket(id: string): Promise<{ data: StorageBucket | null; error: { message: string } | null }>;
  createBucket(id: string, options?: { public?: boolean }): Promise<{ data: { name: string } | null; error: { message: string } | null }>;
  deleteBucket(id: string): Promise<{ data: { message: string } | null; error: { message: string } | null }>;
  emptyBucket(id: string): Promise<{ data: { message: string } | null; error: { message: string } | null }>;
  from(bucket: string): StorageFileAdapter;
}

export interface StorageFileAdapter {
  upload(path: string, file: Blob | ArrayBuffer | string, options?: { contentType?: string; upsert?: boolean }): Promise<{ data: { path: string } | null; error: { message: string } | null }>;
  download(path: string): Promise<{ data: Blob | null; error: { message: string } | null }>;
  list(path?: string, options?: { limit?: number; offset?: number; sortBy?: { column: string; order: string } }): Promise<{ data: StorageFile[] | null; error: { message: string } | null }>;
  remove(paths: string[]): Promise<{ data: StorageFile[] | null; error: { message: string } | null }>;
  getPublicUrl(path: string): { data: { publicUrl: string } };
  move(fromPath: string, toPath: string): Promise<{ data: { message: string } | null; error: { message: string } | null }>;
  copy(fromPath: string, toPath: string): Promise<{ data: { path: string } | null; error: { message: string } | null }>;
}

export interface RealtimeAdapter {
  channel(name: string): RealtimeChannelAdapter;
  removeChannel(name: string): void;
  removeAllChannels(): void;
}

export interface RealtimeChannelAdapter {
  on(
    event: 'postgres_changes',
    filter: { event: string; schema?: string; table?: string; filter?: string },
    callback: RealtimeCallback,
  ): RealtimeChannelAdapter;
  subscribe(callback?: (status: string) => void): RealtimeChannelAdapter;
  unsubscribe(): void;
}

export interface FunctionsAdapter {
  invoke<T = any>(
    functionName: string,
    options?: { body?: any; headers?: Record<string, string> },
  ): Promise<{ data: T | null; error: { message: string } | null }>;
}
