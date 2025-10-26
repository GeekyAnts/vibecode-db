import type { DBSpec } from '@vibecode-db/client'
import { buildInsert } from '../sql-utils/buildInsert'
import { SqlDriver } from './driver';

export function applyPragmasAndMigrations(
    driver: SqlDriver,
    opts: { enableForeignKeys?: boolean; migrations?: string[] }
) {
    if (opts.enableForeignKeys !== false) driver.run('PRAGMA foreign_keys = ON;')
    if (opts.migrations?.length) for (const ddl of opts.migrations) driver.run(ddl)
}

export function seedDatabase(
    driver: SqlDriver,
    dbSpec: DBSpec<any>,
    behavior: 'upsert' | 'insertIgnore' | 'replace' = 'upsert'
) {
    if (!dbSpec.seed) return
    for (const table of Object.keys(dbSpec.seed)) {
        const rows = (dbSpec.seed as Record<string, any[]>)[table]
        if (!Array.isArray(rows) || rows.length === 0) continue
        const { sql, params } = buildInsert(table, rows, behavior)
        driver.run(sql, params)
    }
}

