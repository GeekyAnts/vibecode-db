import type { AdapterTableExecutor, QueryState } from '../../core/types'
import type { CustomAdapterHandlers } from './types'

/**
 * Table executor for CustomAdapter.
 * Delegates CRUD operations to user-defined handlers with access to query state.
 */
export class CustomTableExecutor implements AdapterTableExecutor {
  constructor(
    private table: string,
    private handlers: CustomAdapterHandlers,
    private ready: Promise<void>
  ) {}

  private async ensureReady() {
    await this.ready
  }

  async select(projection: string | undefined, state: QueryState) {
    await this.ensureReady()
    return this.handlers.select(projection, { table: this.table, state })
  }

  async insert(values: any | any[]) {
    await this.ensureReady()
    return this.handlers.insert(values, { table: this.table })
  }

  async update(patch: Record<string, unknown>, state: QueryState) {
    await this.ensureReady()
    return this.handlers.update(patch, { table: this.table, state })
  }

  async delete(state: QueryState) {
    await this.ensureReady()
    return this.handlers.delete({ table: this.table, state })
  }
}
