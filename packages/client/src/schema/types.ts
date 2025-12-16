import { RelationIndex } from '../core/types'
import { z } from 'zod'

export type ColumnKind =
    | 'integer'
    | 'varchar'
    | 'boolean'
    | 'timestamp'
    | 'uuid'
    | 'json'
    | 'enum'

export type ColumnRef = {
    table: string
    column: string
}

export type FKThunk = () => ColumnRef

/** Foreign key actions for ON DELETE and ON UPDATE */
export type FKAction = 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT'

export interface ColumnDescriptor {
    kind: ColumnKind
    name?: string            // optional DB column name override
    enumValues?: readonly string[] // only used for 'enum'
    length?: number          // only used for varchar
    references?: FKThunk     // foreign key target thunk

    // Constraints
    primaryKey?: boolean     // PRIMARY KEY constraint
    notNull?: boolean        // NOT NULL constraint (field must be provided)
    nullable?: boolean       // NULLABLE constraint (field can be explicitly null)
    unique?: boolean         // UNIQUE constraint
    autoIncrement?: boolean  // AUTO INCREMENT (integer only)

    // Foreign key actions
    onDelete?: FKAction      // ON DELETE action for foreign keys
    onUpdate?: FKAction      // ON UPDATE action for foreign keys

    // Index and metadata
    index?: boolean          // Create an index for this column
    comment?: string         // Column comment (used in DDL generation)
}

// Note: ColumnsShape can contain either ColumnDescriptor or ColumnBuilder
// ColumnBuilder will be converted to ColumnDescriptor during schema processing
export type ColumnsShape = Record<string, ColumnDescriptor | { kind: ColumnKind, [key: string]: any }>

export interface TableDef {
    tableName: string
    columns: ColumnsShape
}

export interface DefinedSchema {
    /** Per-table Zod objects */
    tableZods: Record<string, z.ZodObject<any>>
    /** Convenience bundle: { users: ZodObject, posts: ZodObject, ... } */
    zodBundle: z.ZodObject<Record<string, z.ZodObject<any>>>
    /** Original table defs (to enable future growth) */
    tables: TableDef[]
    /** Relation index: localTable -> childTableName -> relation */
    relations: RelationIndex
    /** Auto-generated SQLite migrations (CREATE TABLE + CREATE INDEX statements) */
    migrations: string[]
}
