/**
 * AST node representing a relation in a parsed select string.
 *
 * Example: `workout_exercises(sets, reps, exercises(id, name))`
 * becomes:
 * {
 *   table: "workout_exercises",
 *   alias: undefined,
 *   columns: ["sets", "reps"],
 *   relations: [{ table: "exercises", columns: ["id", "name"], relations: [] }]
 * }
 */
export interface RelationNode {
  /** The target table name */
  table: string;
  /** Optional alias (e.g. `exercise:exercises(name)` → alias="exercise", table="exercises") */
  alias?: string;
  /** Columns to select from this relation's table. Empty array means all columns (*). */
  columns: string[];
  /** Nested relations */
  relations: RelationNode[];
}

/**
 * Result of parsing a select string. Represents the root-level columns
 * and any relational includes.
 */
export interface ParsedSelect {
  /** Scalar columns at the root level */
  columns: string[];
  /** Relational includes (foreign-key joins) */
  relations: RelationNode[];
}

/** Relationship type between two tables */
export type RelationType = 'one-to-many' | 'many-to-one' | 'many-to-many';

/** Definition of a single relationship edge */
export interface RelationDefinition {
  type: RelationType;
  /** The related table */
  table: string;
  /** The foreign key column used for the join */
  foreignKey: string;
  /**
   * For many-to-many: the junction/pivot table.
   * For one-to-many: not needed (foreignKey is on the related table).
   * For many-to-one: not needed (foreignKey is on this table).
   */
  junctionTable?: string;
}

/** Schema definition for a single table */
export interface TableSchema {
  relations: Record<string, RelationDefinition>;
}

/** Full schema registry mapping table names to their schemas */
export type SchemaDefinition = Record<string, TableSchema>;
