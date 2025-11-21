/**
 * Escape and quote a SQLite identifier (table/column name).
 * Uses double quotes as per SQLite standard.
 */
export function quoteIdentifier(name: string): string {
    return `"${name.replace(/"/g, '""')}"`
}

/**
 * Format a default value for SQLite DDL.
 *
 * - Strings: quoted with single quotes
 * - Numbers: as-is
 * - Booleans: 0 or 1
 * - Dates: ISO8601 string
 * - null/undefined: NULL
 */
export function formatDefaultValue(value: any): string {
    if (value === null || value === undefined) {
        return 'NULL'
    }

    if (typeof value === 'string') {
        // Escape single quotes by doubling them
        return `'${value.replace(/'/g, "''")}'`
    }

    if (typeof value === 'number') {
        return String(value)
    }

    if (typeof value === 'boolean') {
        return value ? '1' : '0'
    }

    if (value instanceof Date) {
        return `'${value.toISOString()}'`
    }

    // For objects/arrays (JSON), stringify them
    if (typeof value === 'object') {
        return `'${JSON.stringify(value).replace(/'/g, "''")}'`
    }

    return String(value)
}

/**
 * Generate a SQL comment line.
 */
export function generateComment(text: string): string {
    return `-- ${text}`
}
