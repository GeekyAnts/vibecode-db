
export interface SqlDriver {
    /** Run a statement that doesn’t return rows (INSERT/UPDATE/DELETE/DDL). */
    run(sql: string, params?: unknown[]): Promise<void>;

    /** Run a statement that returns rows (SELECT). */
    all<T = any>(sql: string, params?: unknown[]): Promise<T[]>;

    /** Optional helpers */
    transaction?<T>(fn: () => Promise<T> | T): Promise<T>;
    close?(): Promise<void>;
}




