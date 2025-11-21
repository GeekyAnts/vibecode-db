export * from './sqlite/types'          // SqlDriver, RelationIndex, QueryState, etc.
export * from './sqlite/base-adapter'   // BaseSQLiteAdapter (no platform I/O)
export * from './sqlite/executor'
export * from './sqlite/utils'
export * from './sqlite/driver'
export * from './sql-utils/buildSelect'
export * from './sql-utils/buildWhere'
export * from './sql-utils/buildInsert'
export * from './sql-utils/buildUpdate'
export * from './sql-utils/buildDelete'
export * from './sql-utils/buildModifiers'
export * from './sql-utils/common'

// Re-export DDL generation utilities from client package
export {
    generateMigrations,
    type DDLGenerationOptions,
    mapColumnKindToSQLiteType,
    generateColumnDefinition,
    generateEnumCheckConstraint,
    generateCreateTableStatement,
    generateIndexStatements,
    quoteIdentifier,
    formatDefaultValue,
    generateComment,
} from '@vibecode-db/client'
