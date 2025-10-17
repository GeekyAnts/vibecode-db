import type { QueryState } from '../types'

const q = (col: string, baseAlias?: string) =>
    baseAlias ? `${baseAlias}."${col}"` : `"${col}"`

/** Build ORDER BY segment. */
export function buildOrder(state: QueryState, baseAlias?: string): string {
    const by = state.order
    if (!by) return ''

    const dir = by.ascending === false ? 'DESC' : 'ASC'
    let sql = `ORDER BY ${q(by.column, baseAlias)} ${dir}`

    // SQLite ignores NULLS FIRST/LAST; keep as comments for portability.
    if (typeof by.nullsFirst === 'boolean') {
        sql += by.nullsFirst ? ' -- NULLS FIRST (noop in SQLite)' : ' -- NULLS LAST (noop in SQLite)'
    }
    return sql
}

/** Build LIMIT/OFFSET from range (inclusive) or limit. Range takes precedence. */
export function buildLimitRange(state: QueryState): string {
    let sql = ''

    if (state.range) {
        const { from, to } = state.range
        const count = Math.max(0, to - from + 1)
        sql += ` LIMIT ${count} OFFSET ${from}`
    } else if (typeof state.limit === 'number') {
        sql += ` LIMIT ${state.limit}`
    }

    return sql

}

/** Compose ORDER + LIMIT/RANGE with smart spacing. */
export function buildModifiers(state: QueryState, baseAlias?: string): string {
    const parts = [buildOrder(state, baseAlias), buildLimitRange(state)].filter(Boolean)
    return parts.length ? parts.join(' ') : ''
}

