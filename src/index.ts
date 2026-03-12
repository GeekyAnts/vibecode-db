import { VibeCodeClient } from './client';
import type { ClientOptions } from './types';

export function createClient(
  supabaseUrl: string,
  supabaseKey: string,
  options: ClientOptions,
): VibeCodeClient {
  return new VibeCodeClient(supabaseUrl, supabaseKey, options);
}

export { VibeCodeClient } from './client';
export { QueryBuilder } from './query-builder/QueryBuilder';
export { FilterBuilder } from './query-builder/FilterBuilder';
export { TransformBuilder } from './query-builder/TransformBuilder';
export { QueryBuilderSelect } from './query-builder/QueryBuilderSelect';
export { AuthClient } from './auth/AuthClient';
export { StorageClient } from './storage/StorageClient';
export { StorageFileApi } from './storage/StorageFileApi';
export { RealtimeClient } from './realtime/RealtimeClient';
export { RealtimeChannel } from './realtime/RealtimeChannel';
export { FunctionsClient } from './functions/FunctionsClient';
export { PostgrestError, AuthError, StorageError, FunctionsError } from './errors';

export type {
  QueryDescriptor,
  Filter,
  FilterOperator,
  QueryModifiers,
  AdapterResponse,
  AdapterError,
  AuthUser,
  AuthSession,
  AuthResponse,
  StorageBucket,
  StorageFile,
  RealtimePayload,
  RealtimeCallback,
  ClientOptions,
} from './types';

export type {
  DatabaseAdapter,
  AuthAdapter,
  StorageAdapter,
  StorageFileAdapter,
  RealtimeAdapter,
  RealtimeChannelAdapter,
  FunctionsAdapter,
  RpcOptions,
} from './adapters/types';
