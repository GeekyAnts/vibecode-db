import type { RelationNode } from '../../relational/types';
import type { SchemaRegistry } from '../../relational/schema-registry';

/**
 * Index for fast foreign-key lookups.
 * Key format: "table.column" → Map<value, rows[]>
 */
export class RelationIndex {
  private indexes: Map<string, Map<any, Record<string, any>[]>> = new Map();

  /** Build an index for a given table+column combination */
  build(table: string, column: string, rows: Record<string, any>[]): void {
    const key = `${table}.${column}`;
    const index = new Map<any, Record<string, any>[]>();

    for (const row of rows) {
      const val = row[column];
      if (val === undefined || val === null) continue;
      let bucket = index.get(val);
      if (!bucket) {
        bucket = [];
        index.set(val, bucket);
      }
      bucket.push(row);
    }

    this.indexes.set(key, index);
  }

  /** Look up rows by indexed column value */
  lookup(table: string, column: string, value: any): Record<string, any>[] {
    const key = `${table}.${column}`;
    return this.indexes.get(key)?.get(value) ?? [];
  }

  /** Check whether an index exists */
  has(table: string, column: string): boolean {
    return this.indexes.has(`${table}.${column}`);
  }

  /** Clear all indexes */
  clear(): void {
    this.indexes.clear();
  }
}

/**
 * Pick specific columns from a row.
 * If `columns` is empty, return all columns (equivalent to `*`).
 */
function pickColumns(row: Record<string, any>, columns: string[]): Record<string, any> {
  if (columns.length === 0 || (columns.length === 1 && columns[0] === '*')) {
    return { ...row };
  }
  const result: Record<string, any> = {};
  for (const col of columns) {
    if (col in row) {
      result[col] = row[col];
    }
  }
  return result;
}

/**
 * Recursively resolve relational includes on a set of base rows.
 *
 * @param baseRows - The rows to attach relations to
 * @param baseTable - The table name of baseRows
 * @param relations - The relation nodes to resolve
 * @param schema - The schema registry with relationship metadata
 * @param getTable - Function to retrieve all rows for a table by name
 * @param index - The relation index for fast lookups
 * @param baseColumns - Columns to pick from baseRows (empty = all)
 */
export function resolveRelations(
  baseRows: Record<string, any>[],
  baseTable: string,
  relations: RelationNode[],
  schema: SchemaRegistry,
  getTable: (name: string) => Record<string, any>[],
  index: RelationIndex,
  baseColumns: string[],
): Record<string, any>[] {
  if (relations.length === 0) {
    // Just pick columns from base rows
    return baseRows.map((row) => pickColumns(row, baseColumns));
  }

  return baseRows.map((row) => {
    const result = pickColumns(row, baseColumns);

    for (const rel of relations) {
      const relationDef = schema.getRelation(baseTable, rel.alias ?? rel.table);
      if (!relationDef) {
        // No schema definition found — attach empty array/null
        result[rel.alias ?? rel.table] = [];
        continue;
      }

      const outputKey = rel.alias ?? rel.table;
      const relatedTableName = relationDef.table;
      const relatedTable = getTable(relatedTableName);

      // Ensure index is built for the join column
      if (relationDef.type === 'one-to-many') {
        // Foreign key is on the related table, pointing back to this table's id
        const fk = relationDef.foreignKey;
        if (!index.has(relatedTableName, fk)) {
          index.build(relatedTableName, fk, relatedTable);
        }

        const matchedRows = index.lookup(relatedTableName, fk, row.id);
        result[outputKey] = resolveRelations(
          matchedRows,
          relatedTableName,
          rel.relations,
          schema,
          getTable,
          index,
          rel.columns,
        );
      } else if (relationDef.type === 'many-to-one') {
        // Foreign key is on this table, pointing to the related table's id
        const fk = relationDef.foreignKey;
        const fkValue = row[fk];

        if (fkValue === undefined || fkValue === null) {
          result[outputKey] = null;
          continue;
        }

        if (!index.has(relatedTableName, 'id')) {
          index.build(relatedTableName, 'id', relatedTable);
        }

        const matchedRows = index.lookup(relatedTableName, 'id', fkValue);
        if (matchedRows.length === 0) {
          result[outputKey] = null;
        } else {
          // many-to-one returns a single object, not an array
          const resolved = resolveRelations(
            [matchedRows[0]],
            relatedTableName,
            rel.relations,
            schema,
            getTable,
            index,
            rel.columns,
          );
          result[outputKey] = resolved[0];
        }
      } else {
        // many-to-many — not yet implemented, return empty array
        result[outputKey] = [];
      }
    }

    return result;
  });
}
