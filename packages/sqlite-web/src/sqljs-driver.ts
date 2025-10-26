import { SqlDriver } from '@vibecode-db/sqlite-core'


export class SqlJsDriver implements SqlDriver {
    constructor(private db: any) { }

    async run(sql: string, params: unknown[] = []) {
        this.db.run(sql, params as any)
    }

    async all<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
        const stmt = this.db.prepare(sql)
        const out: any[] = []
        try { stmt.bind(params as any); while (stmt.step()) out.push(stmt.getAsObject()) } finally { stmt.free() }
        return out as T[]
    }
}
