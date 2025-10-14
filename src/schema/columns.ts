import { ColumnDescriptor, ColumnKind, FKThunk } from './types'

/** Small builder returning a descriptor; methods attach FK later if needed */
function make(kind: ColumnKind, extras?: Partial<ColumnDescriptor>): ColumnDescriptor {
    return { kind, ...extras }
}

export const col = {
    integer(name?: string) { return make('integer', { name }) },
    varchar(opts?: { length?: number }, name?: string) { return make('varchar', { name, length: opts?.length }) },
    boolean(name?: string) { return make('boolean', { name }) },
    timestamp(name?: string) { return make('timestamp', { name }) },
    uuid(name?: string) { return make('uuid', { name }) },
    json(name?: string) { return make('json', { name }) },
    enum<const L extends readonly string[]>(literals: L, name?: string) {
        return make('enum', { name, enumValues: literals })
    },
}

/** Add a foreign key target thunk to a ColumnDescriptor */
export function references(col: ColumnDescriptor, target: FKThunk): ColumnDescriptor {
    col.references = target
    return col
}
