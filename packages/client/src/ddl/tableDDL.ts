import { TableDef, ColumnDescriptor, FKAction } from '../schema/types'
import { ColumnBuilder } from '../schema/columns'
import { generateColumnDefinition, generateEnumCheckConstraint } from './columnDDL'
import { quoteIdentifier, generateComment } from './utils'

interface ForeignKeyInfo {
    columnName: string
    targetTable: string
    targetColumn: string
    onDelete?: FKAction
    onUpdate?: FKAction
}

/**
 * Generate a CREATE TABLE statement from a TableDef.
 *
 * @param table - The table definition
 * @param options - Generation options
 * @returns SQL CREATE TABLE statement
 */
export function generateCreateTableStatement(
    table: TableDef,
    options: { ifNotExists?: boolean } = {}
): string {
    const lines: string[] = []
    const columnDefinitions: string[] = []
    const tableConstraints: string[] = []
    const foreignKeys: ForeignKeyInfo[] = []

    // Generate column definitions
    for (const [internalKey, colInput] of Object.entries(table.columns)) {
        // Convert ColumnBuilder to ColumnDescriptor if needed
        const col: ColumnDescriptor =
            colInput instanceof ColumnBuilder ? colInput.toDescriptor() : colInput

        const exposedName = col.name ?? internalKey

        // Add column comment if present
        if (col.comment) {
            lines.push(generateComment(col.comment))
        }

        // Generate column definition
        columnDefinitions.push(generateColumnDefinition(exposedName, col))

        // Collect foreign key info
        if (col.references) {
            const targetRef = col.references()
            foreignKeys.push({
                columnName: exposedName,
                targetTable: targetRef.table,
                targetColumn: targetRef.column,
                onDelete: col.onDelete,
                onUpdate: col.onUpdate,
            })
        }

        // Add CHECK constraint for enums
        if (col.kind === 'enum' && col.enumValues && col.enumValues.length > 0) {
            const checkConstraint = generateEnumCheckConstraint(exposedName, col.enumValues)
            if (checkConstraint) {
                tableConstraints.push(checkConstraint)
            }
        }
    }

    // Generate FOREIGN KEY constraints
    for (const fk of foreignKeys) {
        let fkDef = `FOREIGN KEY(${quoteIdentifier(fk.columnName)}) REFERENCES ${quoteIdentifier(fk.targetTable)}(${quoteIdentifier(fk.targetColumn)})`

        if (fk.onDelete) {
            fkDef += ` ON DELETE ${fk.onDelete}`
        }

        if (fk.onUpdate) {
            fkDef += ` ON UPDATE ${fk.onUpdate}`
        }

        tableConstraints.push(fkDef)
    }

    // Build CREATE TABLE statement
    const ifNotExists = options.ifNotExists ? 'IF NOT EXISTS ' : ''
    lines.push(`CREATE TABLE ${ifNotExists}${quoteIdentifier(table.tableName)} (`)

    // Combine column definitions and table constraints
    const allDefinitions = [...columnDefinitions, ...tableConstraints]
    const indentedDefinitions = allDefinitions.map((def, idx) => {
        const isLast = idx === allDefinitions.length - 1
        return `  ${def}${isLast ? '' : ','}`
    })

    lines.push(indentedDefinitions.join('\n'))
    lines.push(');')

    return lines.join('\n')
}
