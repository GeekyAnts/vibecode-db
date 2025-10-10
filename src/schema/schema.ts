import { z } from 'zod'
import { ColumnDescriptor, ColumnKind, ColumnRef, DefinedSchema, TableDef } from './types'

/** Base Zod type by kind */
function kindToZod(kind: ColumnKind, enumValues?: readonly string[], length?: number): z.ZodTypeAny {
    switch (kind) {
        case 'integer': return z.number()
        case 'varchar': return z.string() // length kept as metadata for now
        case 'boolean': return z.boolean()
        case 'timestamp': return z.date()
        case 'uuid': return z.string().uuid()
        case 'json': return z.unknown()
        case 'enum':
            if (!enumValues || enumValues.length === 0) return z.string()
            return z.enum(enumValues as [string, ...string[]])
        default: return z.unknown()
    }
}

/** Resolve FK target; throws if not found */
function resolveTarget(tables: TableDef[], ref: ColumnRef): { target: ColumnDescriptor } {
    const t = tables.find(tt => tt.tableName === ref.table)
    if (!t) throw new Error(`FK target table "${ref.table}" not found`)
    const colEntry = Object.entries(t.columns).find(([key, desc]) => (desc.name ?? key) === ref.column)
    if (!colEntry) throw new Error(`FK target column "${ref.table}.${ref.column}" not found`)
    const [, target] = colEntry
    return { target }
}

/**
 * defineSchema:
 *  - builds per-table Zod objects
 *  - if a column has .references(() => otherTable.col), it adopts the Z    od type
 *    of the target column (FK type = target type)
 */
export function defineSchema(tablesRecord: Record<string, TableDef>): DefinedSchema {
    const tables: TableDef[] = Object.values(tablesRecord)
    console.log('[DSL] Tables:', tables)
    const tableZods: Record<string, z.ZodObject<any>> = {}
    for (const table of tables) {
        const shape: Record<string, z.ZodTypeAny> = {}

        for (const [key, col] of Object.entries(table.columns)) {
            const exposedName = col.name ?? key

            // If FK: override kind using the target column's kind
            if (col.references) {
                const { target } = resolveTarget(tables, col.references())

                const targetKind = target.kind
                shape[exposedName] = kindToZod(targetKind, target.enumValues, target.length)
            } else {
                // Regular column: use its own kind
                shape[exposedName] = kindToZod(col.kind, col.enumValues, col.length)
            }
        }

        tableZods[table.tableName] = z.object(shape)
    }


    const zodBundle = z.object(tableZods)

    return { tableZods, zodBundle, tables }
}
