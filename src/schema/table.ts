import { ColumnRef, ColumnsShape, TableDef } from './types'

/**
 * We return a "table handle" that is both the TableDef (for assembly)
 * and exposes ColumnRefs as properties (users.id) for FK thunks.
 */
type TableHandle<TCols extends ColumnsShape> = TableDef & {
    [K in keyof TCols]: ColumnRef
}

export function vibecodeTable<TCols extends ColumnsShape>(tableName: string, columns: TCols): TableHandle<TCols> {
    const def: TableDef = { tableName, columns }
    // Create a proxy-like obj  ect exposing column refs as properties
    const handle: any = { ...def }

    for (const key of Object.keys(columns)) {
        const colName = columns[key].name ?? key
        Object.defineProperty(handle, key, {
            enumerable: true,
            get: (): ColumnRef => ({ __brand: 'ColumnRef', table: tableName, column: String(colName) }),
        })
    }
    return handle as TableHandle<TCols>
}
