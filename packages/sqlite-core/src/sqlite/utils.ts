import type { DBSpec } from '@vibecode-db/client'
import { buildInsert } from '../sql-utils/buildInsert'
import { SqlDriver } from './driver';

export async function applyPragmasAndMigrations(
    driver: SqlDriver,
    opts: { enableForeignKeys?: boolean; migrations?: string[] }
) {
    if (opts.enableForeignKeys !== false) await driver.run('PRAGMA foreign_keys = ON;')
    const ddls = opts.migrations ?? []
    if (!ddls.length) return
    if (driver.transaction) {
        await driver.transaction(async () => {
            for (const ddl of ddls) await driver.run(ddl)
        })
    } else {
        for (const ddl of ddls) await driver.run(ddl)
    }
}


export async function seedDatabase(
    driver: SqlDriver,
    dbSpec: DBSpec<any>,
    behavior: 'upsert' | 'insertIgnore' | 'replace' = 'upsert'
): Promise<void> {
    const seed = dbSpec.seed
    if (!seed) return

    const tables = Object.keys(seed)
    if (!tables.length) return

    const runAll = async () => {
        for (const table of tables) {
            const rows = (seed as Record<string, any[]>)[table]
            if (!Array.isArray(rows) || rows.length === 0) continue
            const { sql, params } = buildInsert(table, rows, behavior)
            await driver.run(sql, params) // <-- await each insert
        }
    }

    if (driver.transaction) {
        await driver.transaction(runAll)
    } else {
        await runAll()
    }
}


export async function wipeDatabase(driver: SqlDriver) {
    await driver.run('PRAGMA foreign_keys = OFF;')
    const tables = await driver.all<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
    )
    for (const { name } of tables) {
        await driver.run(`DROP TABLE IF EXISTS "${name}"`)
    }
    await driver.run('PRAGMA foreign_keys = ON;')

}
