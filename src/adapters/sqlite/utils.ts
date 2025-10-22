import type { DBSpec } from '../../core/types'
import { buildInsert } from '../../core/sql-utils/buildInsert'
import initSqlJs from 'sql.js';
import { NativeDriver, SqlDriver, SqlJsDriver } from './driver';

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


export async function resolveWebDriver(wasmUrl?: string): Promise<SqlDriver> {
    const SQL = await initSqlJs({
        locateFile: () => wasmUrl ?? 'sql-wasm.wasm'
    })
    return new SqlJsDriver(new SQL.Database())

}

// Keep your SqlDriver/NativeDriver types as-is

export async function resolveNativeDriver(dbName = 'app.db'): Promise<SqlDriver> {
    // Dynamic import so web builds don't try to bundle expo-sqlite
    // eslint-disable-next-line no-new-func
    const dynImport = new Function('m', 'return import(m)')
    const Expo = await dynImport('expo-sqlite')

    // New async API
    const db = await Expo.openDatabaseAsync(dbName)

    // Single exec bridge for our NativeDriver
    const exec = async (sql: string, params?: unknown[]) => {
        const isSelect = /^\s*select\b/i.test(sql)
        if (isSelect) {
            const rows = await db.getAllAsync(sql, params as any)
            return { rows } // matches your NativeDriver's expectation
        } else {
            await db.runAsync(sql, params as any)
            return { rows: [] }
        }
    }

    return new NativeDriver(exec)
}
