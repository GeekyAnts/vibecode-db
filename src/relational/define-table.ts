import type { SchemaDefinition, RelationType } from './types';

// ---------------------------------------------------------------------------
// Relationship descriptors — used inside defineTable column definitions
// ---------------------------------------------------------------------------

/** Marker symbol so we can distinguish relation descriptors from regular Zod schemas */
const RELATION_MARKER = Symbol.for('vibecode-db:relation');

export interface RelationDescriptor {
  [RELATION_MARKER]: true;
  /** Name used as the key in the schema relations map */
  name: string;
  type: RelationType;
  foreignKey: string;
  /** Lazy reference to the related TableDefinition */
  ref: () => TableDefinition<any>;
}

/**
 * Declare a one-to-many relationship.
 *
 * Usage inside defineTable:
 * ```ts
 * const users = defineTable('users', {
 *   id: z.number(),
 *   posts: hasMany(() => posts, 'user_id'),
 * });
 * ```
 *
 * @param ref  - Lazy ref to the related table (use arrow fn to avoid circular deps)
 * @param foreignKey - The FK column on the *related* table that points back here
 */
export function hasMany(ref: () => TableDefinition<any>, foreignKey: string): RelationDescriptor {
  return {
    [RELATION_MARKER]: true,
    name: '', // filled in by defineTable
    type: 'one-to-many',
    foreignKey,
    ref,
  };
}

/**
 * Declare a many-to-one (belongs-to) relationship.
 *
 * Usage inside defineTable:
 * ```ts
 * const posts = defineTable('posts', {
 *   id: z.number(),
 *   user_id: z.number(),
 *   author: belongsTo(() => users, 'user_id'),
 * });
 * ```
 *
 * @param ref  - Lazy ref to the related table
 * @param foreignKey - The FK column on *this* table
 */
export function belongsTo(ref: () => TableDefinition<any>, foreignKey: string): RelationDescriptor {
  return {
    [RELATION_MARKER]: true,
    name: '', // filled in by defineTable
    type: 'many-to-one',
    foreignKey,
    ref,
  };
}

// ---------------------------------------------------------------------------
// Table definition
// ---------------------------------------------------------------------------

export interface TableDefinition<T extends Record<string, any> = Record<string, any>> {
  /** Table name */
  tableName: string;
  /** Raw columns object (may include Zod schemas + relation descriptors) */
  columns: T;
  /** Extracted relation descriptors */
  relations: RelationDescriptor[];
}

/**
 * Check if a value is a RelationDescriptor.
 */
function isRelation(val: unknown): val is RelationDescriptor {
  return (
    typeof val === 'object' &&
    val !== null &&
    (val as any)[RELATION_MARKER] === true
  );
}

/**
 * Define a table with its columns and relationships.
 *
 * Columns can be:
 * - Zod schemas (z.string(), z.number(), etc.) — used for validation
 * - Plain values — ignored, just for documentation
 * - Relation descriptors (hasMany, belongsTo) — extracted into the relation graph
 *
 * ```ts
 * import { z } from 'zod';
 * import { defineTable, hasMany, belongsTo } from '@vibecode-db/client';
 *
 * const users = defineTable('users', {
 *   id: z.number(),
 *   email: z.string(),
 *   posts: hasMany(() => posts, 'user_id'),
 * });
 *
 * const posts = defineTable('posts', {
 *   id: z.number(),
 *   title: z.string(),
 *   user_id: z.number(),
 *   author: belongsTo(() => users, 'user_id'),
 * });
 * ```
 */
export function defineTable<T extends Record<string, any>>(
  tableName: string,
  columns: T,
): TableDefinition<T> {
  const relations: RelationDescriptor[] = [];

  for (const [key, value] of Object.entries(columns)) {
    if (isRelation(value)) {
      value.name = key;
      relations.push(value);
    }
  }

  return { tableName, columns, relations };
}

// ---------------------------------------------------------------------------
// Schema builder — collects table definitions into a SchemaDefinition
// ---------------------------------------------------------------------------

/**
 * Build a SchemaDefinition from table definitions.
 *
 * ```ts
 * const schema = defineSchema(users, posts, comments);
 * adapter.setSchema(schema);
 * ```
 */
export function defineSchema(...tables: TableDefinition<any>[]): SchemaDefinition {
  const schema: SchemaDefinition = {};

  for (const table of tables) {
    const relations: SchemaDefinition[string]['relations'] = {};

    for (const rel of table.relations) {
      const relatedTable = rel.ref();
      relations[rel.name] = {
        type: rel.type,
        foreignKey: rel.foreignKey,
        table: relatedTable.tableName,
      };
    }

    schema[table.tableName] = { relations };
  }

  return schema;
}
