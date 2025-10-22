import { Database } from "sql.js";

export interface SqlDriver {
    /** Run a statement that doesn’t return rows (INSERT/UPDATE/DELETE/DDL). */
    run(sql: string, params?: unknown[]): Promise<void>;

    /** Run a statement that returns rows (SELECT). */
    all<T = any>(sql: string, params?: unknown[]): Promise<T[]>;

    /** Optional helpers */
    transaction?<T>(fn: () => Promise<T> | T): Promise<T>;
    close?(): Promise<void>;
}


export class SqlJsDriver implements SqlDriver {
    constructor(private db: Database) { }

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


export class NativeDriver implements SqlDriver {
    constructor(private exec: (sql: string, params?: unknown[]) => Promise<{ rows?: any[] }>) { }
    async run(sql: string, params?: unknown[]) { await this.exec(sql, params) }
    async all<T = any>(sql: string, params?: unknown[]): Promise<T[]> {
        const { rows } = await this.exec(sql, params); return (rows ?? []) as T[]
    }
}
