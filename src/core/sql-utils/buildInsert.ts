import { encodeRows } from './common'

export function buildInsert(
    table: string,
    rows: Record<string, any>[],
    behavior: 'upsert' | 'insertIgnore' | 'replace' = 'upsert'
) {
    if (!rows.length) throw new Error('INSERT: no rows provided')
    const encoded = encodeRows(rows)
    const cols = Object.keys(encoded[0]!)
    const placeholders = `(${cols.map(() => '?').join(',')})`

    const verb =
        behavior === 'insertIgnore'
            ? 'INSERT OR IGNORE'
            : behavior === 'replace'
                ? 'INSERT OR REPLACE'
                : 'INSERT OR REPLACE' // default upsert without explicit conflict target

    const sql = `${verb} INTO "${table}" (${cols.map(c => `"${c}"`).join(',')}) VALUES ${encoded.map(() => placeholders).join(',')}`
    const params = encoded.flatMap(r => cols.map(c => r[c]))
    return { sql, params, columns: cols }
}
