import { DefinedSchema } from '../schema/types'
import { generateCreateTableStatement } from './tableDDL'
import { generateIndexStatements } from './indexDDL'
import { generateComment } from './utils'

export interface DDLGenerationOptions {
    /**
     * Add IF NOT EXISTS to CREATE TABLE statements.
     * @default true
     */
    ifNotExists?: boolean

    /**
     * Automatically create indices for foreign key columns.
     * Improves JOIN performance but increases storage.
     * @default false
     */
    autoIndexForeignKeys?: boolean

    /**
     * Include comments in generated DDL.
     * @default true
     */
    includeComments?: boolean

    /**
     * Custom header comment for the migration file.
     */
    header?: string
}

/**
 * Generate SQLite DDL migrations from a schema definition.
 *
 * Returns an array of SQL statements ready to be executed.
 * Each statement is either a CREATE TABLE or CREATE INDEX.
 *
 * @param schema - The defined schema from defineSchema()
 * @param options - DDL generation options
 * @returns Array of SQL DDL statements
 *
 * @example
 * ```typescript
 * const schema = defineSchema({ users, todos })
 * const migrations = generateMigrations(schema)
 *
 * // Use with SQLite adapter
 * const adapter = new SQLiteWebAdapter(ctx, {
 *   migrations,
 *   // ...other options
 * })
 * ```
 */
export function generateMigrations(
    schema: DefinedSchema,
    options: DDLGenerationOptions = {}
): string[] {
    const {
        ifNotExists = true,
        autoIndexForeignKeys = false,
        includeComments = true,
        header,
    } = options

    const migrations: string[] = []

    // Add header comment if provided
    if (includeComments && header) {
        migrations.push(generateComment(header))
        migrations.push('') // Empty line for readability
    }

    // Sort tables by dependency order to avoid FK errors
    // Tables without foreign keys come first
    const sortedTables = sortTablesByDependencies(schema)

    // Generate CREATE TABLE statements
    for (const table of sortedTables) {
        if (includeComments) {
            migrations.push(generateComment(`Table: ${table.tableName}`))
        }

        const createTableStmt = generateCreateTableStatement(table, { ifNotExists })
        migrations.push(createTableStmt)

        // Add empty line for readability
        if (includeComments) {
            migrations.push('')
        }
    }

    // Generate CREATE INDEX statements
    for (const table of sortedTables) {
        const indexStmts = generateIndexStatements(table, {
            ifNotExists,
            autoIndexForeignKeys,
        })

        if (indexStmts.length > 0) {
            if (includeComments) {
                migrations.push(generateComment(`Indices for ${table.tableName}`))
            }

            migrations.push(...indexStmts)

            if (includeComments) {
                migrations.push('')
            }
        }
    }

    return migrations
}

/**
 * Sort tables by dependency order (topological sort).
 * Tables with no foreign keys come first, then tables that depend on them.
 *
 * This ensures CREATE TABLE statements execute without FK errors.
 */
function sortTablesByDependencies(schema: DefinedSchema): typeof schema.tables {
    const tables = schema.tables
    const sorted: typeof tables = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    function visit(tableName: string) {
        if (visited.has(tableName)) return
        if (visiting.has(tableName)) {
            // Circular dependency - just continue (SQLite allows this with PRAGMA defer_foreign_keys)
            return
        }

        visiting.add(tableName)

        const table = tables.find((t) => t.tableName === tableName)
        if (!table) return

        // Visit dependencies first (tables this table references)
        for (const col of Object.values(table.columns)) {
            if (col.references) {
                const targetRef = col.references()
                visit(targetRef.table)
            }
        }

        visiting.delete(tableName)
        visited.add(tableName)
        sorted.push(table)
    }

    // Visit all tables
    for (const table of tables) {
        visit(table.tableName)
    }

    return sorted
}

/**
 * Export all DDL generation utilities.
 */
export * from './typeMapping'
export * from './columnDDL'
export * from './tableDDL'
export * from './indexDDL'
export * from './utils'
