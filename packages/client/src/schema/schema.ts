import { z } from 'zod'
import { ColumnDescriptor, ColumnKind, ColumnRef, DefinedSchema, TableDef } from './types'
import { RelationIndex } from '../core/types'

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

/**
 * Resolve a foreign key target (table+column) from a ColumnRef.
 *
 * Returns the target table, the internal column key, the exposed column name,
 * and the full ColumnDescriptor so callers can adopt type info and register relations.
 */
export function resolveTarget(
    tables: Record<string, TableDef> | TableDef[],
    ref: ColumnRef
): {
    targetTable: TableDef
    targetKey: string                // internal key in `columns`
    targetExposedName: string        // (desc.name ?? key)
    target: ColumnDescriptor
} {
    // Normalize to a fast lookup map
    const byName: Record<string, TableDef> = Array.isArray(tables)
        ? Object.fromEntries(tables.map(t => [t.tableName, t]))
        : tables

    const targetTable = byName[ref.table]
    if (!targetTable) {
        throw new Error(`FK target table "${ref.table}" not found`)
    }

    let targetKey: string | undefined
    let target: ColumnDescriptor | undefined
    for (const [key, desc] of Object.entries(targetTable.columns)) {
        const exposed = desc.name ?? key
        if (exposed === ref.column) {
            targetKey = key
            target = desc
            break
        }
    }

    if (!target || !targetKey) {
        throw new Error(`FK target column "${ref.table}.${ref.column}" not found`)
    }

    const targetExposedName = target.name ?? targetKey
    return { targetTable, targetKey, targetExposedName, target }
}

/**
 * Build per-table Zod schemas, adopt FK target types, and collect relations (many-to-one).
 */
export function defineSchema(tablesRecord: Record<string, TableDef>): DefinedSchema {
    // Use the provided record directly as our O(1) lookup map.
    const tablesByName = tablesRecord
    const tables: TableDef[] = Object.values(tablesByName)
  
    const tableZods: Record<string, z.ZodObject<any>> = {}
    const relations: RelationIndex = {}
  
    for (const table of tables) {
      const shape: Record<string, z.ZodTypeAny> = {}
      // Ensure relations bucket for this table
      relations[table.tableName] = relations[table.tableName] ?? {}
  
      for (const [internalKey, col] of Object.entries(table.columns)) {
        const exposedName = col.name ?? internalKey
  
        if (col.references) {
          // Resolve FK target and adopt its type
          const { targetTable, targetExposedName, target } = resolveTarget(
            tablesByName,
            col.references()
          )
          shape[exposedName] = kindToZod(target.kind, target.enumValues, target.length)
  
          // Record a many-to-one hint (localTable.localKey -> remoteTable.remoteKey)
          // If multiple FKs to the same remote table exist, last write wins (v1 constraint).
          relations[table.tableName][targetTable.tableName] = {
            kind: 'many-to-one',
            localTable: table.tableName,
            localKey: exposedName,
            remoteTable: targetTable.tableName,
            remoteKey: targetExposedName,
          }
        } else {
          // Regular column → own kind
          shape[exposedName] = kindToZod(col.kind, col.enumValues, col.length)
        }
      }
  
      tableZods[table.tableName] = z.object(shape)
    }
  
    const zodBundle = z.object(tableZods)
  
    return {
      tableZods,
      zodBundle,
      tables,
      relations,
    }
  }