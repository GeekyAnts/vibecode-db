import { ColumnKind } from '../schema/types'

/**
 * Map a ColumnKind to its SQLite type.
 *
 * SQLite Type Affinity:
 * - INTEGER: integers
 * - TEXT: strings, timestamps, UUIDs, JSON
 * - REAL: floating point (not used currently)
 * - BLOB: binary data (not used currently)
 */
export function mapColumnKindToSQLiteType(kind: ColumnKind): string {
    switch (kind) {
        case 'integer':
            return 'INTEGER'
        case 'varchar':
            return 'TEXT'
        case 'boolean':
            return 'INTEGER' // SQLite uses 0/1 for booleans
        case 'timestamp':
            return 'TEXT' // ISO8601 strings: "YYYY-MM-DD HH:MM:SS.SSS"
        case 'uuid':
            return 'TEXT'
        case 'json':
            return 'TEXT' // JSON stored as text
        case 'enum':
            return 'TEXT' // Enums stored as text with CHECK constraint
        default:
            return 'TEXT' // Fallback
    }
}
