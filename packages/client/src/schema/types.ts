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

export interface ColumnDescriptor {
    kind: ColumnKind
    name?: string            // optional DB column name override
    enumValues?: readonly string[] // only used for 'enum'
    length?: number          // only used for varchar
    references?: FKThunk     // foreign key target thunk
}

export type ColumnsShape = Record<string, ColumnDescriptor>

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
}
