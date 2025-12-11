import type { AdapterTableExecutor, QueryState, RelationIndex, FilterOp } from '@vibecode-db/client'
import { buildWhere } from '../sql-utils/buildWhere'
import { buildUpdate } from '../sql-utils/buildUpdate'
import { buildDelete } from '../sql-utils/buildDelete'
import { buildInsert } from '../sql-utils/buildInsert'
import { buildSelect } from '../sql-utils/buildSelect'
import { hydrateToNested } from '../sql-utils/common'
import { SqlDriver } from './driver'

/**
 * Callback to get the current authenticated user ID
 */
export type GetCurrentUserIdFn = () => string | null

export class SQLiteTableExecutor implements AdapterTableExecutor {
    constructor(
        private table: string,
        private getDriver: () => SqlDriver,
        private relations?: RelationIndex,
        private ready?: Promise<void>,
        private getCurrentUserId?: GetCurrentUserIdFn
    ) { }

    private async ensureReady() { if (this.ready) await this.ready }

    /**
     * Check if this table has a user_id column (user-scoped table)
     */
    private async hasUserIdColumn(): Promise<boolean> {
        try {
            const result = await this.getDriver().all<{ name: string }>(
                `PRAGMA table_info("${this.table}")`
            )
            return result.some(col => col.name === 'user_id')
        } catch {
            return false
        }
    }

    /**
     * Add user_id filter to query state if:
     * 1. Table has user_id column
     * 2. Current user is authenticated
     * 3. No explicit user_id filter already set
     */
    private async addUserScope(state: QueryState): Promise<QueryState> {
        const userId = this.getCurrentUserId?.()
        if (!userId) return state

        // Check if user_id filter already exists
        const hasUserIdFilter = state.filters?.some(f => f.column === 'user_id')
        if (hasUserIdFilter) return state

        // Check if table has user_id column
        const hasColumn = await this.hasUserIdColumn()
        if (!hasColumn) return state

        // Add user_id filter (using FilterOp type: 'eq')
        return {
            ...state,
            filters: [
                ...(state.filters || []),
                { type: 'eq', column: 'user_id', value: userId }
            ]
        }
    }

    /**
     * Auto-inject user_id into insert values if:
     * 1. Table has user_id column
     * 2. Current user is authenticated
     * 3. user_id not already provided
     */
    private async injectUserId(values: any): Promise<any> {
        const userId = this.getCurrentUserId?.()
        if (!userId) return values

        const hasColumn = await this.hasUserIdColumn()
        if (!hasColumn) return values

        if (Array.isArray(values)) {
            return values.map(row =>
                row.user_id === undefined ? { ...row, user_id: userId } : row
            )
        }

        return values.user_id === undefined ? { ...values, user_id: userId } : values
    }

    async select(select: string | undefined, state: QueryState) {
        await this.ensureReady()

        // Auto-scope to current user if applicable
        const scopedState = await this.addUserScope(state)

        // Build SQL + alias map (JOINs handled if relations present)
        const { sql, params, aliasToPath } = buildSelect({
            table: this.table,
            state: scopedState,
            relations: this.relations
        })
        const rows = await this.getDriver().all<any>(sql, params)

        // 🔁 Normalize shape to match Supabase nested payloads
        const data = hydrateToNested(rows, aliasToPath, this.table)
        return { data, error: null }
    }

    async insert(values: any) {
        await this.ensureReady()

        // Auto-inject user_id if applicable
        const valuesWithUser = await this.injectUserId(values)

        const rows = Array.isArray(valuesWithUser) ? valuesWithUser : [valuesWithUser]
        const { sql, params } = buildInsert(this.table, rows)
        await this.getDriver().run(sql, params)
        // Return what we inserted (sql.js has no RETURNING)
        return { data: Array.isArray(valuesWithUser) ? rows : rows[0], error: null }
    }

    async update(patch: Record<string, unknown>, state: QueryState) {
        await this.ensureReady()

        // Auto-scope to current user if applicable
        const scopedState = await this.addUserScope(state)

        const { whereSql, whereParams } = buildWhere(scopedState)
        const { sql, params } = buildUpdate(this.table, patch as any, whereSql, whereParams)
        await this.getDriver().run(sql, params)

        // Re-select updated rows using the same state (projection/filters/ordering)
        const sel = buildSelect({ table: this.table, state: scopedState, relations: this.relations })
        const rows = await this.getDriver().all<any>(sel.sql, sel.params)

        return { data: rows, error: null }
    }

    async delete(state: QueryState) {
        await this.ensureReady()

        // Auto-scope to current user if applicable
        const scopedState = await this.addUserScope(state)

        const { whereSql, whereParams } = buildWhere(scopedState)
        const { sql, params } = buildDelete(this.table, whereSql, whereParams)
        await this.getDriver().run(sql, params)
        return { data: null, error: null }
    }
}
