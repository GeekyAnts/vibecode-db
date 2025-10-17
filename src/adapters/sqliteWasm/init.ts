import type { Database } from 'sql.js'
import type { DBSpec } from '../../core/types'
import { buildInsert } from '../../core/sql-utils/buildInsert'

export function applyPragmasAndMigrations(
    db: Database,
    opts: { enableForeignKeys?: boolean; migrations?: string[] }
) {
    if (opts.enableForeignKeys !== false) db.run('PRAGMA foreign_keys = ON;')
    if (opts.migrations?.length) for (const ddl of opts.migrations) db.run(ddl)
}

export function seedDatabase(
    db: Database,
    dbSpec: DBSpec<any>,
    behavior: 'upsert' | 'insertIgnore' | 'replace' = 'upsert'
) {
    if (!dbSpec.seed) return
    for (const table of Object.keys(dbSpec.seed)) {
        const rows = (dbSpec.seed as Record<string, any[]>)[table]
        if (!Array.isArray(rows) || rows.length === 0) continue
        const { sql, params } = buildInsert(table, rows, behavior)
        db.run(sql, params)
    }
}
