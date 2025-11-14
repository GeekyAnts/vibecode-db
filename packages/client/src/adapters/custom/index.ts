/**
 * CustomAdapter - Connect vibecode-db to any backend via custom CRUD handlers.
 *
 * @packageDocumentation
 */

export { CustomAdapter } from './adapter'
export { CustomTableExecutor } from './executor'
export type {
  CustomAdapterContext,
  SelectHandler,
  InsertHandler,
  UpdateHandler,
  DeleteHandler,
  CustomAdapterHandlers,
  CustomAdapterOptions,
} from './types'
export { createRESTHandlers } from './helpers'
