import { encodeRow } from './common'

export function buildUpdate(
    table: string,
    patch: Record<string, any>,
    whereSql: string,
    whereParams: any[]
) {
    const enc = encodeRow(patch)
    const keys = Object.keys(enc)
    if (!keys.length) throw new Error('UPDATE: empty patch')

    const setClause = keys.map(c => `"${c}" = ?`).join(', ')
    const sql = `UPDATE "${table}" SET ${setClause}${whereSql ? ` WHERE ${whereSql}` : ''}`
    const params = keys.map(k => enc[k]).concat(whereParams)
    return { sql, params }
}
