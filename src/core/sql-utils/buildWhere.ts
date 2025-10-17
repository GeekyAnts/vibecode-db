import type { FilterOp, QueryState } from '../../core/types'

/**
 * Build a SQL WHERE clause from filter ops.
 */
export function buildWhere(state: QueryState, baseAlias?: string) {
    const parts: string[] = []
    const params: unknown[] = []

    const q = (col: string) => (baseAlias ? `${baseAlias}."${col}"` : `"${col}"`)

    for (const f of (state?.filters ?? [])) {
        const col = q(f.column)
        switch (f.type) {
            case 'eq': parts.push(`${col} = ?`); params.push(f.value); break
            case 'ne': parts.push(`${col} <> ?`); params.push(f.value); break
            case 'gt': parts.push(`${col} > ?`); params.push(f.value); break
            case 'gte': parts.push(`${col} >= ?`); params.push(f.value); break
            case 'lt': parts.push(`${col} < ?`); params.push(f.value); break
            case 'lte': parts.push(`${col} <= ?`); params.push(f.value); break
            case 'in':
                if (!Array.isArray(f.value) || f.value.length === 0) {
                    // Empty IN -> always false
                    parts.push('1=0')
                } else {
                    parts.push(`${col} IN (${(f.value as unknown[]).map(() => '?').join(',')})`)
                    params.push(...(f.value as unknown[]))
                }
                break
            case 'like': parts.push(`${col} LIKE ?`); params.push(f.value); break
        }
    }

    const whereSql = parts.length ? parts.join(' AND ') : ''
    return { whereSql, whereParams: params }
}
