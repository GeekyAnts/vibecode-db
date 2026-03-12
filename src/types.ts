export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'is'
  | 'in'
  | 'contains'
  | 'containedBy'
  | 'rangeGt'
  | 'rangeGte'
  | 'rangeLt'
  | 'rangeLte'
  | 'rangeAdjacent'
  | 'overlaps'
  | 'textSearch'
  | 'match'
  | 'not'
  | 'or'
  | 'filter';

export interface Filter {
  column: string;
  operator: FilterOperator;
  value: any;
  negate?: boolean;
}

export interface QueryModifiers {
  order?: Array<{ column: string; ascending: boolean; nullsFirst?: boolean }>;
  limit?: number;
  range?: { from: number; to: number };
  single?: boolean;
  maybeSingle?: boolean;
  csv?: boolean;
  head?: boolean;
  count?: 'exact' | 'planned' | 'estimated';
  abortSignal?: AbortSignal;
}

export interface QueryDescriptor {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'upsert' | 'delete';
  columns?: string;
  values?: Record<string, any> | Record<string, any>[];
  filters: Filter[];
  modifiers: QueryModifiers;
  returning?: boolean;
  returningColumns?: string;
  count?: 'exact' | 'planned' | 'estimated';
  onConflict?: string;
}

export interface AdapterResponse<T = any> {
  data: T | null;
  error: AdapterError | null;
  count?: number | null;
  status: number;
  statusText: string;
}

export interface AdapterError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  created_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: AuthUser;
}

export interface AuthResponse {
  data: { user: AuthUser | null; session: AuthSession | null };
  error: AdapterError | null;
}

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  created_at: string;
  updated_at: string;
}

export interface StorageFile {
  name: string;
  id?: string;
  bucket_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface RealtimePayload<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
}

export type RealtimeCallback<T = any> = (payload: RealtimePayload<T>) => void;

export interface ClientOptions {
  adapter: import('./adapters/types').DatabaseAdapter;
}
