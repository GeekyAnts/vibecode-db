import type { SchemaDefinition, TableSchema, RelationDefinition } from './types';

/**
 * Registry that stores table relationship metadata.
 * Used by adapters to resolve relational select queries.
 */
export class SchemaRegistry {
  private schema: SchemaDefinition = {};

  constructor(schema?: SchemaDefinition) {
    if (schema) {
      this.schema = { ...schema };
    }
  }

  /** Register or replace the entire schema */
  setSchema(schema: SchemaDefinition): void {
    this.schema = { ...schema };
  }

  /** Register relationships for a single table (merges with existing) */
  defineTable(table: string, tableSchema: TableSchema): void {
    this.schema[table] = {
      relations: {
        ...this.schema[table]?.relations,
        ...tableSchema.relations,
      },
    };
  }

  /** Add a single relation to a table */
  addRelation(table: string, name: string, definition: RelationDefinition): void {
    if (!this.schema[table]) {
      this.schema[table] = { relations: {} };
    }
    this.schema[table].relations[name] = definition;
  }

  /** Look up a relation by table and relation name */
  getRelation(table: string, relationName: string): RelationDefinition | undefined {
    return this.schema[table]?.relations[relationName];
  }

  /** Get all relations for a table */
  getTableRelations(table: string): Record<string, RelationDefinition> | undefined {
    return this.schema[table]?.relations;
  }

  /** Check whether the registry has any schema defined */
  hasSchema(): boolean {
    return Object.keys(this.schema).length > 0;
  }

  /** Get the full schema definition */
  getSchema(): SchemaDefinition {
    return this.schema;
  }
}
