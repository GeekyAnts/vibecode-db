export function encodeValue(v: any) {
    if (v instanceof Date) return v.toISOString()
    if (typeof v === 'boolean') return v ? 1 : 0
    return v
}

export function encodeRow(row: Record<string, any>) {
    const out: Record<string, any> = {}
    for (const k of Object.keys(row)) out[k] = encodeValue(row[k])
    return out
}

export function encodeRows(rows: Record<string, any>[]) {
    return rows.map(encodeRow)
}

// src/core/shape/hydrate.ts
export type AliasPathMap = Record<string, string[]> // alias -> [tableName, columnName]

/**
 * Turn rows like { todos__id, users__name } into:
 * { id, ..., users: { name, ... } }
 *
 * - baseTable fields become top-level keys
 * - child tables become nested objects by table-name
 * - if all child fields are null => child is null
 */
export function hydrateToNested(
    rows: any[],
    aliasToPath: AliasPathMap,
    baseTable: string
) {
    return rows.map((row) => {
        const root: any = {}
        const childBuckets: Record<string, Record<string, any>> = {}

        for (const [alias, path] of Object.entries(aliasToPath)) {
            const [tbl, col] = path
            const val = row[alias]

            if (tbl === baseTable) {
                root[col] = val
            } else {
                const bucket = (childBuckets[tbl] ??= {})
                bucket[col] = val
            }
        }

        for (const [tbl, obj] of Object.entries(childBuckets)) {
            const allNull = Object.values(obj).every((v) => v == null)
            root[tbl] = allNull ? null : obj
        }

        return root
    })
}
