export function buildDelete(
    table: string,
    whereSql: string,
    whereParams: any[]
) {
    const sql = `DELETE FROM "${table}"${whereSql ? ` WHERE ${whereSql}` : ''}`
    return { sql, params: whereParams }
}
