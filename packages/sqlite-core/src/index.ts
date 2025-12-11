// SQLite core exports
export * from './sqlite/types'
export * from './sqlite/base-adapter'
export * from './sqlite/executor'
export * from './sqlite/utils'
export * from './sqlite/driver'

// SQL utilities
export * from './sql-utils/buildSelect'
export * from './sql-utils/buildWhere'
export * from './sql-utils/buildInsert'
export * from './sql-utils/buildUpdate'
export * from './sql-utils/buildDelete'
export * from './sql-utils/buildModifiers'
export * from './sql-utils/common'

// Auth exports
export * from './auth'

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
