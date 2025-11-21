import { TableDef, ColumnDescriptor } from '../schema/types'
import { ColumnBuilder } from '../schema/columns'
import { quoteIdentifier, generateComment } from './utils'

/**
 * Generate CREATE INDEX statements for a table.
 *
 * Creates indices for:
 * 1. Columns marked with .index()
 * 2. (Optional) Foreign key columns for better join performance
 *
 * @param table - The table definition
 * @param options - Generation options
 * @returns Array of CREATE INDEX statements
 */
export function generateIndexStatements(
    table: TableDef,
    options: {
        ifNotExists?: boolean
        autoIndexForeignKeys?: boolean
    } = {}
): string[] {
    const statements: string[] = []
    const { ifNotExists = true, autoIndexForeignKeys = false } = options

    for (const [internalKey, colInput] of Object.entries(table.columns)) {
        // Convert ColumnBuilder to ColumnDescriptor if needed
        const col: ColumnDescriptor =
            colInput instanceof ColumnBuilder ? colInput.toDescriptor() : colInput

        const exposedName = col.name ?? internalKey

        // Skip primary keys (already indexed)
        if (col.primaryKey) {
            continue
        }

        // Check if we should create an index
        const shouldIndex = col.index || (autoIndexForeignKeys && col.references)

        if (shouldIndex) {
            const indexName = `${table.tableName}_${exposedName}_idx`
            const ifNotExistsClause = ifNotExists ? 'IF NOT EXISTS ' : ''

            const indexStatement = [
                col.comment ? generateComment(`Index for ${col.comment}`) : null,
                `CREATE INDEX ${ifNotExistsClause}${quoteIdentifier(indexName)} ON ${quoteIdentifier(table.tableName)} (${quoteIdentifier(exposedName)});`,
            ]
                .filter(Boolean)
                .join('\n')

            statements.push(indexStatement)
        }
    }

    return statements
}
