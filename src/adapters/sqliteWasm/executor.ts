import type { AdapterTableExecutor, QueryState, RelationIndex } from '../../core/types'
import { buildWhere } from '../../core/sql-utils/buildWhere'
import { buildUpdate } from '../../core/sql-utils/buildUpdate'
import { buildDelete } from '../../core/sql-utils/buildDelete'
import { buildInsert } from '../../core/sql-utils/buildInsert'
import { buildSelect } from '../../core/sql-utils/buildSelect'

export class SQLiteTableExecutor implements AdapterTableExecutor {
    constructor(
        private table: string,
        private getDb: () => any,
        private relations?: RelationIndex,
        private ready?: Promise<void>
    ) { }

    private async ensureReady() { if (this.ready) await this.ready }

    async select(select: string | undefined, state: QueryState) {
        await this.ensureReady()
        const { sql, params } = buildSelect({ table: this.table, state, relations: this.relations })
        const stmt = this.getDb().prepare(sql)
        stmt.bind(params)
        const rows: any[] = []
        while (stmt.step()) rows.push(stmt.getAsObject())
        stmt.free()
        return { data: rows, error: null }
    }

    async insert(values: any) {
        await this.ensureReady()
        const rows = Array.isArray(values) ? values : [values]
        const { sql, params } = buildInsert(this.table, rows)
        this.getDb().run(sql, params)
        // Return what we inserted (sql.js has no RETURNING)
        return { data: Array.isArray(values) ? rows : rows[0], error: null }
    }

    async update(patch: Record<string, unknown>, state: QueryState) {
        await this.ensureReady()
        const { whereSql, whereParams } = buildWhere(state) // no alias for UPDATE
        const { sql, params } = buildUpdate(this.table, patch as any, whereSql, whereParams)
        this.getDb().run(sql, params)

        // Re-select updated rows using the same state (projection/filters/ordering)
        const sel = buildSelect({ table: this.table, state, relations: this.relations })
        const stmt = this.getDb().prepare(sel.sql)
        stmt.bind(sel.params)
        const rows: any[] = []
        while (stmt.step()) rows.push(stmt.getAsObject())
        stmt.free()
        return { data: rows, error: null }
    }

    async delete(state: QueryState) {
        await this.ensureReady()
        const { whereSql, whereParams } = buildWhere(state)
        const { sql, params } = buildDelete(this.table, whereSql, whereParams)
        this.getDb().run(sql, params)
        return { data: null, error: null }
    }
}
