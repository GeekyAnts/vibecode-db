import { ColumnDescriptor, ColumnKind, FKThunk, FKAction } from './types'

/**
 * ColumnBuilder - Provides a chainable API for defining column constraints.
 */
export class ColumnBuilder {
    kind: ColumnKind
    name?: string
    enumValues?: readonly string[]
    length?: number
    references?: FKThunk

    // Private constraint properties to avoid naming conflicts with methods
    private _primaryKey?: boolean
    private _notNull?: boolean
    private _nullable?: boolean
    private _unique?: boolean
    private _autoIncrement?: boolean
    private _onDelete?: FKAction
    private _onUpdate?: FKAction
    private _index?: boolean
    private _comment?: string

    constructor(kind: ColumnKind, extras?: Partial<ColumnDescriptor>) {
        this.kind = kind
        if (extras) {
            this.name = extras.name
            this.enumValues = extras.enumValues
            this.length = extras.length
            this.references = extras.references
            this._primaryKey = extras.primaryKey
            this._notNull = extras.notNull
            this._nullable = extras.nullable
            this._unique = extras.unique
            this._autoIncrement = extras.autoIncrement
            this._onDelete = extras.onDelete
            this._onUpdate = extras.onUpdate
            this._index = extras.index
            this._comment = extras.comment
        }
    }

    /**
     * Mark this column as PRIMARY KEY.
     * Implies notNull() automatically.
     */
    primaryKey(): this {
        this._primaryKey = true
        this._notNull = true // Primary keys are always NOT NULL
        return this
    }

    /**
     * Mark this column as NOT NULL (required field).
     * The field must be provided when inserting/updating.
     */
    notNull(): this {
        this._notNull = true
        this._nullable = false // Mutually exclusive
        return this
    }

    /**
     * Mark this column as NULLABLE (can explicitly be null).
     * The field is optional and can be set to null.
     * 
     * @example
     * col.varchar().nullable() // Can be omitted OR set to null
     */
    nullable(): this {
        this._nullable = true
        this._notNull = false // Mutually exclusive
        return this
    }

    /**
     * Mark this column as UNIQUE.
     */
    unique(): this {
        this._unique = true
        return this
    }

    /**
     * Mark this column as AUTO INCREMENT.
     * Only valid for integer columns.
     */
    autoIncrement(): this {
        if (this.kind !== 'integer') {
            throw new Error('autoIncrement() can only be applied to integer columns')
        }
        this._autoIncrement = true
        return this
    }

    /**
     * Set ON DELETE action for foreign key.
     * Only valid for columns with references().
     *
     * @example
     * references(col.integer('user_id').onDelete('CASCADE'), () => users.id)
     */
    onDelete(action: FKAction): this {
        this._onDelete = action
        return this
    }

    /**
     * Set ON UPDATE action for foreign key.
     * Only valid for columns with references().
     *
     * @example
     * references(col.integer('user_id').onUpdate('CASCADE'), () => users.id)
     */
    onUpdate(action: FKAction): this {
        this._onUpdate = action
        return this
    }

    /**
     * Create an index for this column.
     * Useful for foreign keys and frequently queried columns.
     *
     * @example
     * col.integer('user_id').index()
     */
    index(): this {
        this._index = true
        return this
    }

    /**
     * Add a comment/description for this column.
     * Used in DDL generation as SQL comments.
     *
     * @example
     * col.varchar().comment('User email address')
     */
    comment(text: string): this {
        this._comment = text
        return this
    }

    /**
     * Convert to ColumnDescriptor for internal use.
     * @internal
     */
    toDescriptor(): ColumnDescriptor {
        return {
            kind: this.kind,
            name: this.name,
            enumValues: this.enumValues,
            length: this.length,
            references: this.references,
            primaryKey: this._primaryKey,
            notNull: this._notNull,
            nullable: this._nullable,
            unique: this._unique,
            autoIncrement: this._autoIncrement,
            onDelete: this._onDelete,
            onUpdate: this._onUpdate,
            index: this._index,
            comment: this._comment,
        }
    }
}

/** Small builder returning a ColumnBuilder */
function make(kind: ColumnKind, extras?: Partial<ColumnDescriptor>): ColumnBuilder {
    return new ColumnBuilder(kind, extras)
}

export const col = {
    integer(name?: string) { return make('integer', { name }) },
    varchar(opts?: { length?: number }, name?: string) { return make('varchar', { name, length: opts?.length }) },
    boolean(name?: string) { return make('boolean', { name }) },
    timestamp(name?: string) { return make('timestamp', { name }) },
    uuid(name?: string) { return make('uuid', { name }) },
    json(name?: string) { return make('json', { name }) },
    enum<const L extends readonly string[]>(literals: L, name?: string) {
        return make('enum', { name, enumValues: literals })
    },
}

/**
 * Add a foreign key target thunk to a ColumnDescriptor or ColumnBuilder.
 * Works with both due to structural typing.
 */
export function references(col: ColumnDescriptor | ColumnBuilder, target: FKThunk): ColumnDescriptor | ColumnBuilder {
    col.references = target
    return col
}
