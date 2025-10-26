// buildSelect.ts
import type { ProjectionNode, RelationIndex, QueryState } from '../../../client/src/core/types'
import { buildWhere } from './buildWhere'                   // <- your existing helper
import { buildModifiers } from './buildModifiers'    // <- your existing helper

export type BuildSelectInput = {
    table: string
    state: QueryState
    relations?: RelationIndex
}

export type BuildSelectOutput = {
    sql: string
    params: unknown[]
    aliasToPath: Record<string, string[]> // alias -> [tableName, columnName]
}



type SelectAndJoins = {
    baseAlias: string
    selectList: string
    joins: string[]
    aliasToPath: Record<string, string[]>
}

/** SELECT list + LEFT JOINs for one-level many-to-one nesting. */
export function buildSelectAndJoins(
    baseTable: string,
    proj: ProjectionNode | undefined,
    relations?: RelationIndex
): SelectAndJoins {
    const baseAlias = 't0'
    const cols: string[] = []
    const aliasToPath: Record<string, string[]> = {}

    const pushCol = (qualified: string, asAlias: string, path: string[]) => {
        cols.push(`${qualified} AS "${asAlias}"`)
        aliasToPath[asAlias] = path.slice()
    }

    // Base columns
    const wantsAllBase = !proj || proj.columns.includes('*')
    if (wantsAllBase) {
        // No per-column aliasing when '*' is used.
        cols.push(`${baseAlias}.*`)
    } else {
        for (const c of proj.columns) {
            pushCol(`${baseAlias}."${c}"`, `${baseTable}__${c}`, [baseTable, c])
        }
    }

    // One-level children
    const childNodes = proj?.children ?? {}

    if (Object.keys(childNodes).length > 0 && !relations) {
        throw new Error(
            `[vibecode-db] Nested projection requested on "${baseTable}" but no relations were provided in DBSpec.`
        )
    }

    const joins: string[] = []
    let joinIdx = 1

    for (const childTable of Object.keys(childNodes)) {
        const rel = relations?.[baseTable]?.[childTable]
        if (!rel || rel.kind !== 'many-to-one') continue

        const childAlias = `t${joinIdx++}`
        joins.push(
            `LEFT JOIN "${rel.remoteTable}" ${childAlias} ` +
            `ON ${childAlias}."${rel.remoteKey}" = ${baseAlias}."${rel.localKey}"`
        )

        const child = childNodes[childTable]
        const wantsAllChild = child.columns.includes('*')
        if (wantsAllChild) {
            cols.push(`${childAlias}.*`)
        } else {
            for (const c of child.columns) {
                pushCol(`${childAlias}."${c}"`, `${childTable}__${c}`, [childTable, c])
            }
        }
    }

    return { baseAlias, selectList: cols.join(', '), joins, aliasToPath }
}

/** Build SELECT (with optional JOINs), using your existing where/order+limit helpers. */
export function buildSelect({ table, state, relations }: BuildSelectInput): BuildSelectOutput {

    const hasChildren =
        !!state.projectionAst && Object.keys(state.projectionAst.children ?? {}).length > 0
    if (hasChildren && !relations) {
        throw new Error(
            `[vibecode-db] Nested projection requested on "${table}" but no relations were provided in DBSpec.`
        )
    }

    const { baseAlias, selectList, joins, aliasToPath } = buildSelectAndJoins(
        table,
        state.projectionAst,
        relations
    )

    const where = buildWhere(state, baseAlias)                 // => { sql, params }
    const orderLimit = buildModifiers(state, baseAlias)  // => string | ''

    const sql =
        `SELECT ${selectList} FROM "${table}" ${baseAlias}` +
        (joins.length ? ` ${joins.join(' ')}` : '') +
        (where.whereSql ? ` ${where.whereSql}` : '') +
        (orderLimit ? ` ${orderLimit}` : '')
    return { sql: sql.trim(), params: where.whereParams, aliasToPath }
}
