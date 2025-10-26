import { SqlDriver } from '@vibecode-db/sqlite-core'

export class SQLExpoDriver implements SqlDriver {
    constructor(private exec: (sql: string, params?: unknown[]) => Promise<{ rows?: any[] }>) { }
    async run(sql: string, params?: unknown[]) { await this.exec(sql, params) }
    async all<T = any>(sql: string, params?: unknown[]): Promise<T[]> {
        const { rows } = await this.exec(sql, params); return (rows ?? []) as T[]
    }
}
