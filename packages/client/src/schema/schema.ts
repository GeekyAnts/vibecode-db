import { z } from 'zod'
import type { ColumnDescriptor, ColumnKind, ColumnRef, DefinedSchema, TableDef } from './types'
import { RelationIndex } from '../core/types'
import { ColumnBuilder } from './columns'
import { generateMigrations } from '../ddl/generateDDL'

/**
 * Build a Zod type for a column, applying constraints.
 * 
 * ## Constraint Semantics (for INSERT validation):
 * 
 * Follows SQL semantics where columns WITHOUT `NOT NULL` can store NULL.
 * 
 * | Constraint                      | Required? | Nullable? | Zod Result                         |
 * |---------------------------------|-----------|-----------|-----------------------------------|
 * | No constraints                  | NO        | YES       | `z.string().nullable().optional()` |
 * | `nullable()`                    | NO        | YES       | `z.string().nullable().optional()` |
 * | `notNull()` only                | YES       | NO        | `z.string()`                       |
 * | `primaryKey()` only             | YES       | NO        | `z.string()`                       |
 * | `primaryKey().autoIncrement()`  | NO        | NO        | `z.number().optional()`            |
 * 
 * Key insights:
 * - SQL columns are nullable by default (without NOT NULL)
 * - `notNull()` makes a field required AND non-nullable
 * - `autoIncrement()` makes a field optional (DB generates value)
 *
 * @param col - The column descriptor with constraints
 * @returns A Zod type with appropriate constraints applied
 */
function columnToZod(col: ColumnDescriptor): z.ZodTypeAny {
  // Step 1: Get base Zod type by column kind
  let zodType: z.ZodTypeAny = getBaseZodType(col.kind, col.enumValues)

  // Step 2: Analyze constraints
  const hasNotNull = col.notNull === true
  const isAutoIncrement = col.autoIncrement === true

  // Step 3: Determine nullability and requirement
  // NULLABILITY: In SQL, columns are nullable by default unless NOT NULL is specified
  // REQUIREMENT: A field is required ONLY if it has notNull and is NOT auto-increment
  const isNullable = !hasNotNull
  const isRequired = hasNotNull && !isAutoIncrement

  // Step 4: Apply constraints in order

  // If nullable (SQL default), wrap with .nullable()
  if (isNullable) {
    zodType = zodType.nullable()
  }

  // If not required, wrap with .optional()
  if (!isRequired) {
    zodType = zodType.optional()
  }

  return zodType
}

/**
 * Get the base Zod type for a column kind (without constraints).
 */
function getBaseZodType(kind: ColumnKind, enumValues?: readonly string[]): z.ZodTypeAny {
  switch (kind) {
    case 'integer':
      return z.number().int()
    case 'varchar':
      return z.string()
    case 'boolean':
      return z.boolean()
    case 'timestamp':
      // Accept both Date objects and ISO strings
      return z.union([z.date(), z.string().datetime({ offset: true }).pipe(z.coerce.date())])
        .or(z.string()) // Also accept plain strings for flexibility
    case 'uuid':
      return z.string().uuid()
    case 'json':
      return z.unknown()
    case 'enum':
      if (!enumValues || enumValues.length === 0) {
        return z.string()
      }
      return z.enum(enumValues as [string, ...string[]])
    default:
      return z.unknown()
  }
}

/**
 * Resolve a foreign key target (table+column) from a ColumnRef.
 *
 * Returns the target table, the internal column key, the exposed column name,
 * and the full ColumnDescriptor so callers can adopt type info and register relations.
 */
function resolveTarget(
  tables: Record<string, TableDef> | TableDef[],
  ref: ColumnRef
): {
  targetTable: TableDef
  targetKey: string                // internal key in `columns`
  targetExposedName: string        // (desc.name ?? key)
  target: ColumnDescriptor
} {
  // Normalize to a lookup map keyed by tableName (the actual DB table name)
  // This ensures foreign key references (which use tableName) can find their targets
  const tablesList = Array.isArray(tables) ? tables : Object.values(tables)
  const byName: Record<string, TableDef> = Object.fromEntries(
    tablesList.map(t => [t.tableName, t])
  )

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
  // Convert record to array and create lookup map keyed by tableName (DB name)
  // This ensures FK references using tableName can resolve correctly
  const tables: TableDef[] = Object.values(tablesRecord)
  const tablesByName: Record<string, TableDef> = Object.fromEntries(
    tables.map(t => [t.tableName, t])
  )

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
          // Preserve local constraints (notNull, nullable, etc.)
          notNull: col.notNull,
          nullable: col.nullable,
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