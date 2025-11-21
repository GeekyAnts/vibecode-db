import { z } from 'zod'
import { ColumnDescriptor, ColumnKind, ColumnRef, DefinedSchema, TableDef } from './types'
import { RelationIndex } from '../core/types'
import { ColumnBuilder } from './columns'
import { generateMigrations } from '../ddl/generateDDL'

/**
 * Build a Zod type for a column, applying constraints.
 *
 * @param col - The column descriptor with constraints
 * @returns A Zod type with appropriate constraints applied
 */
function columnToZod(col: ColumnDescriptor): z.ZodTypeAny {
    // Get base Zod type by kind
    let zodType: z.ZodTypeAny

    switch (col.kind) {
        case 'integer': zodType = z.number(); break
        case 'varchar': zodType = z.string(); break // length kept as metadata for now
        case 'boolean': zodType = z.boolean(); break
        case 'timestamp': zodType = z.date(); break
        case 'uuid': zodType = z.string().uuid(); break
        case 'json': zodType = z.unknown(); break
        case 'enum':
            if (!col.enumValues || col.enumValues.length === 0) {
                zodType = z.string()
            } else {
                zodType = z.enum(col.enumValues as [string, ...string[]])
            }
            break
        default: zodType = z.unknown()
    }

    // Apply default value if specified
    if (col.defaultValue !== undefined) {
        zodType = zodType.default(col.defaultValue)
    }

    // Apply nullability
    // - If notNull is explicitly true OR primaryKey is true, field is required
    // - Otherwise, field is optional (nullable)
    const isRequired = col.notNull === true || col.primaryKey === true

    if (!isRequired) {
        zodType = zodType.optional()
    }

    return zodType
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
    for (const [key, descInput] of Object.entries(targetTable.columns)) {
        // Convert ColumnBuilder to ColumnDescriptor if needed
        const desc: ColumnDescriptor = descInput instanceof ColumnBuilder
            ? descInput.toDescriptor()
            : descInput
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
  
      for (const [internalKey, colInput] of Object.entries(table.columns)) {
        // Convert ColumnBuilder to ColumnDescriptor if needed
        const col: ColumnDescriptor = colInput instanceof ColumnBuilder
          ? colInput.toDescriptor()
          : colInput

        const exposedName = col.name ?? internalKey

        if (col.references) {
          // Resolve FK target and adopt its type + constraints from the local column
          const { targetTable, targetExposedName, target } = resolveTarget(
            tablesByName,
            col.references()
          )

          // Create a merged descriptor: target's type + local column's constraints
          const mergedCol: ColumnDescriptor = {
            kind: target.kind,
            enumValues: target.enumValues,
            length: target.length,
            // Preserve local constraints (notNull, default, etc.)
            notNull: col.notNull,
            defaultValue: col.defaultValue,
            primaryKey: col.primaryKey,
            unique: col.unique,
            autoIncrement: col.autoIncrement,
          }

          shape[exposedName] = columnToZod(mergedCol)

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
          // Regular column → use columnToZod with constraints
          shape[exposedName] = columnToZod(col)
        }
      }
  
      tableZods[table.tableName] = z.object(shape)
    }
  
    const zodBundle = z.object(tableZods)

    // Create the partial schema object for migration generation
    const partialSchema: DefinedSchema = {
      tableZods,
      zodBundle,
      tables,
      relations,
      migrations: [], // Temporary empty array
    }

    // Generate SQLite migrations from the schema
    const migrations = generateMigrations(partialSchema, {
      ifNotExists: true,
      autoIndexForeignKeys: false,
      includeComments: true,
    })

    return {
      tableZods,
      zodBundle,
      tables,
      relations,
      migrations,
    }
  }