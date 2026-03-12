import { describe, it, expect } from 'vitest';
import { applyFilters, applyModifiers, selectColumns, parseOrString } from '../../src/adapters/mock/query-engine';

describe('applyFilters', () => {
  const data = [
    { id: 1, name: 'Alice', age: 30, status: 'active' },
    { id: 2, name: 'Bob', age: 25, status: 'inactive' },
    { id: 3, name: 'Charlie', age: 35, status: 'active' },
    { id: 4, name: 'Diana', age: 28, status: 'active' },
  ];

  it('filters with eq', () => {
    const result = applyFilters(data, [{ column: 'status', operator: 'eq', value: 'active' }]);
    expect(result).toHaveLength(3);
  });

  it('filters with neq', () => {
    const result = applyFilters(data, [{ column: 'status', operator: 'neq', value: 'active' }]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });

  it('filters with gt', () => {
    const result = applyFilters(data, [{ column: 'age', operator: 'gt', value: 28 }]);
    expect(result).toHaveLength(2);
  });

  it('filters with lte', () => {
    const result = applyFilters(data, [{ column: 'age', operator: 'lte', value: 28 }]);
    expect(result).toHaveLength(2);
  });

  it('filters with like', () => {
    const result = applyFilters(data, [{ column: 'name', operator: 'like', value: '%li%' }]);
    expect(result).toHaveLength(2); // Alice, Charlie
  });

  it('filters with ilike (case insensitive)', () => {
    const result = applyFilters(data, [{ column: 'name', operator: 'ilike', value: '%ALICE%' }]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });

  it('filters with is (null)', () => {
    const dataWithNull = [...data, { id: 5, name: 'Eve', age: null as any, status: 'active' }];
    const result = applyFilters(dataWithNull, [{ column: 'age', operator: 'is', value: null }]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Eve');
  });

  it('filters with in', () => {
    const result = applyFilters(data, [{ column: 'id', operator: 'in', value: [1, 3] }]);
    expect(result).toHaveLength(2);
  });

  it('filters with contains (array)', () => {
    const dataWithTags = [
      { id: 1, tags: ['a', 'b', 'c'] },
      { id: 2, tags: ['b', 'c'] },
      { id: 3, tags: ['a', 'c'] },
    ];
    const result = applyFilters(dataWithTags, [{ column: 'tags', operator: 'contains', value: ['a', 'b'] }]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('filters with overlaps', () => {
    const dataWithTags = [
      { id: 1, tags: ['a', 'b'] },
      { id: 2, tags: ['c', 'd'] },
      { id: 3, tags: ['b', 'd'] },
    ];
    const result = applyFilters(dataWithTags, [{ column: 'tags', operator: 'overlaps', value: ['a', 'c'] }]);
    expect(result).toHaveLength(2);
  });

  it('filters with negate', () => {
    const result = applyFilters(data, [{ column: 'status', operator: 'eq', value: 'active', negate: true }]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });

  it('combines multiple filters with AND', () => {
    const result = applyFilters(data, [
      { column: 'status', operator: 'eq', value: 'active' },
      { column: 'age', operator: 'gt', value: 29 },
    ]);
    expect(result).toHaveLength(2); // Alice (30), Charlie (35)
  });
});

describe('parseOrString', () => {
  it('parses simple or string', () => {
    const filters = parseOrString('age.gt.18,name.eq.admin');
    expect(filters).toHaveLength(2);
    expect(filters[0]).toEqual({ column: 'age', operator: 'gt', value: 18 });
    expect(filters[1]).toEqual({ column: 'name', operator: 'eq', value: 'admin' });
  });

  it('parses null values', () => {
    const filters = parseOrString('name.is.null');
    expect(filters[0].value).toBeNull();
  });

  it('parses boolean values', () => {
    const filters = parseOrString('active.is.true');
    expect(filters[0].value).toBe(true);
  });
});

describe('applyModifiers', () => {
  const data = [
    { id: 1, name: 'Charlie', age: 35 },
    { id: 2, name: 'Alice', age: 30 },
    { id: 3, name: 'Bob', age: 25 },
    { id: 4, name: 'Diana', age: 28 },
  ];

  it('sorts ascending by column', () => {
    const result = applyModifiers(data, { order: [{ column: 'name', ascending: true }] });
    expect(result.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Charlie', 'Diana']);
  });

  it('sorts descending by column', () => {
    const result = applyModifiers(data, { order: [{ column: 'age', ascending: false }] });
    expect(result[0].age).toBe(35);
    expect(result[3].age).toBe(25);
  });

  it('applies limit', () => {
    const result = applyModifiers(data, { limit: 2 });
    expect(result).toHaveLength(2);
  });

  it('applies range', () => {
    const result = applyModifiers(data, { range: { from: 1, to: 2 } });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(2);
  });

  it('applies sort + limit', () => {
    const result = applyModifiers(data, {
      order: [{ column: 'age', ascending: true }],
      limit: 2,
    });
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Bob');
    expect(result[1].name).toBe('Diana');
  });
});

describe('selectColumns', () => {
  const data = [
    { id: 1, name: 'Alice', email: 'alice@test.com' },
    { id: 2, name: 'Bob', email: 'bob@test.com' },
  ];

  it('returns all columns for *', () => {
    const result = selectColumns(data, '*');
    expect(result).toEqual(data);
  });

  it('returns all columns when no columns specified', () => {
    const result = selectColumns(data);
    expect(result).toEqual(data);
  });

  it('selects specific columns', () => {
    const result = selectColumns(data, 'id, name');
    expect(result[0]).toEqual({ id: 1, name: 'Alice' });
    expect(result[0]).not.toHaveProperty('email');
  });
});
