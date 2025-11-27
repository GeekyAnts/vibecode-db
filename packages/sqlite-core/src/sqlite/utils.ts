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
    
    // Filter out empty strings and standalone comment-only lines
    // Comments embedded within SQL statements (multi-line) are preserved
    // But standalone comment lines and empty strings should be skipped
    const validMigrations = ddls.filter(ddl => {
        const trimmed = ddl.trim()
        // Skip empty strings
        if (!trimmed) return false
        // Skip standalone comment lines (single-line comments that don't contain SQL)
        // Multi-line statements with embedded comments are valid and should be executed
        const lines = trimmed.split('\n').map(l => l.trim()).filter(l => l.length > 0)
        const hasNonCommentLines = lines.some(line => !line.startsWith('--'))
        // Only skip if it's a single comment line with no SQL
        if (!hasNonCommentLines && lines.length === 1 && lines[0].startsWith('--')) {
            return false
        }
        return true
    })
    
    if (!validMigrations.length) return
    
    if (driver.transaction) {
        await driver.transaction(async () => {
            for (const ddl of validMigrations) await driver.run(ddl)
        })
    } else {
        for (const ddl of validMigrations) await driver.run(ddl)
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
