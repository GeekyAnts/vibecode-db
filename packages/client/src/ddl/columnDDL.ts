import { ColumnDescriptor } from '../schema/types'
import { ColumnBuilder } from '../schema/columns'
import { mapColumnKindToSQLiteType } from './typeMapping'
import { quoteIdentifier } from './utils'

/**
 * Generate a column definition for SQLite CREATE TABLE.
 *
 * Format:
 * "column_name" TYPE [PRIMARY KEY] [AUTOINCREMENT] [NOT NULL] [UNIQUE]
 *
 * @param columnName - The exposed column name
 * @param colInput - The column descriptor or builder
 * @returns SQL column definition string
 */
export function generateColumnDefinition(
    columnName: string,
    colInput: ColumnDescriptor | ColumnBuilder
): string {
    // Convert ColumnBuilder to ColumnDescriptor if needed
    const col: ColumnDescriptor =
        colInput instanceof ColumnBuilder ? colInput.toDescriptor() : colInput

    const parts: string[] = []

    // Column name and type
    parts.push(quoteIdentifier(columnName))
    parts.push(mapColumnKindToSQLiteType(col.kind))

    // PRIMARY KEY
    if (col.primaryKey) {
        parts.push('PRIMARY KEY')

        // AUTOINCREMENT (only for INTEGER PRIMARY KEY)
        if (col.autoIncrement && col.kind === 'integer') {
            parts.push('AUTOINCREMENT')
        }
    }

    // NOT NULL (unless it's a primary key, which is implicitly NOT NULL)
    if (col.notNull && !col.primaryKey) {
        parts.push('NOT NULL')
    }

    // UNIQUE (unless it's a primary key, which is implicitly UNIQUE)
    if (col.unique && !col.primaryKey) {
        parts.push('UNIQUE')
    }

    return parts.join(' ')
}

/**
 * Generate CHECK constraint for enum columns.
 *
 * @param columnName - The column name
 * @param enumValues - Array of valid enum values
 * @returns CHECK constraint SQL string
 */
export function generateEnumCheckConstraint(
    columnName: string,
    enumValues: readonly string[]
): string {
    if (!enumValues || enumValues.length === 0) {
        return ''
    }

    const quotedValues = enumValues.map((v) => `'${v.replace(/'/g, "''")}'`).join(', ')
    return `CHECK(${quoteIdentifier(columnName)} IN (${quotedValues}))`
}
