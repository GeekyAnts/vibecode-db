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
  