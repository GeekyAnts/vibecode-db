import type { AdapterTableExecutor, QueryState, RelationIndex } from '../../core/types'
import { buildWhere } from '../../core/sql-utils/buildWhere'
import { buildUpdate } from '../../core/sql-utils/buildUpdate'
import { buildDelete } from '../../core/sql-utils/buildDelete'
import { buildInsert } from '../../core/sql-utils/buildInsert'
import { buildSelect } from '../../core/sql-utils/buildSelect'
import { hydrateToNested } from 'src/core/sql-utils/common'
import { SqlDriver } from './driver'

export class SQLiteTableExecutor implements AdapterTableExecutor {
    constructor(
        private table: string,
        private getDriver: () => SqlDriver,
        private relations?: RelationIndex,
        private ready?: Promise<void>
    ) { }

    private async ensureReady() { if (this.ready) await this.ready }



    async select(select: string | undefined, state: QueryState) {
        await this.ensureReady()
        // Build SQL + alias map (JOINs handled if relations present)
        const { sql, params, aliasToPath } = buildSelect({
            table: this.table,
            state: state,                 // must include projectionAst parsed from select string
            relations: this.relations // provided from defineSchema
        })
        const rows = await this.getDriver().all<any>(sql, params)


        // 🔁 Normalize shape to match Supabase nested payloads
        const data = hydrateToNested(rows, aliasToPath, this.table)
        return { data, error: null }
    }

    async insert(values: any) {
        await this.ensureReady()
        const rows = Array.isArray(values) ? values : [values]
        const { sql, params } = buildInsert(this.table, rows)
        await this.getDriver().run(sql, params)
        // Return what we inserted (sql.js has no RETURNING)
        return { data: Array.isArray(values) ? rows : rows[0], error: null }
    }

    async update(patch: Record<string, unknown>, state: QueryState) {
        await this.ensureReady()
        const { whereSql, whereParams } = buildWhere(state) // no alias for UPDATE
        const { sql, params } = buildUpdate(this.table, patch as any, whereSql, whereParams)
        await this.getDriver().run(sql, params)

        // Re-select updated rows using the same state (projection/filters/ordering)
        const sel = buildSelect({ table: this.table, state, relations: this.relations })
        const rows = await this.getDriver().all<any>(sel.sql, sel.params)

        return { data: rows, error: null }
    }

    async delete(state: QueryState) {
        await this.ensureReady()
        const { whereSql, whereParams } = buildWhere(state)
        const { sql, params } = buildDelete(this.table, whereSql, whereParams)
        await this.getDriver().run(sql, params)
        return { data: null, error: null }
    }
}
