import { describe, it, expect } from 'vitest';
import { parseSelect } from '../../src/relational/select-parser';

describe('Select Parser', () => {
  it('parses wildcard / empty select', () => {
    expect(parseSelect('*')).toEqual({ columns: [], relations: [] });
    expect(parseSelect('')).toEqual({ columns: [], relations: [] });
    expect(parseSelect('  ')).toEqual({ columns: [], relations: [] });
  });

  it('parses simple columns', () => {
    const result = parseSelect('id, name, email');
    expect(result.columns).toEqual(['id', 'name', 'email']);
    expect(result.relations).toEqual([]);
  });

  it('parses a single relation', () => {
    const result = parseSelect('id, name, posts(id, title)');
    expect(result.columns).toEqual(['id', 'name']);
    expect(result.relations).toHaveLength(1);
    expect(result.relations[0]).toEqual({
      table: 'posts',
      alias: undefined,
      columns: ['id', 'title'],
      relations: [],
    });
  });

  it('parses nested relations', () => {
    const result = parseSelect(`
      id,
      name,
      workout_exercises (
        sets,
        reps,
        exercises (
          id,
          name
        )
      )
    `);

    expect(result.columns).toEqual(['id', 'name']);
    expect(result.relations).toHaveLength(1);

    const we = result.relations[0];
    expect(we.table).toBe('workout_exercises');
    expect(we.columns).toEqual(['sets', 'reps']);
    expect(we.relations).toHaveLength(1);

    const ex = we.relations[0];
    expect(ex.table).toBe('exercises');
    expect(ex.columns).toEqual(['id', 'name']);
    expect(ex.relations).toEqual([]);
  });

  it('parses aliased relations', () => {
    const result = parseSelect('id, author:users(name, email)');
    expect(result.columns).toEqual(['id']);
    expect(result.relations).toHaveLength(1);
    expect(result.relations[0]).toEqual({
      table: 'users',
      alias: 'author',
      columns: ['name', 'email'],
      relations: [],
    });
  });

  it('parses multiple relations at the same level', () => {
    const result = parseSelect('id, posts(title), comments(body)');
    expect(result.columns).toEqual(['id']);
    expect(result.relations).toHaveLength(2);
    expect(result.relations[0].table).toBe('posts');
    expect(result.relations[1].table).toBe('comments');
  });

  it('parses deeply nested relations', () => {
    const result = parseSelect('a(b(c(d)))');
    expect(result.columns).toEqual([]);
    expect(result.relations).toHaveLength(1);
    expect(result.relations[0].table).toBe('a');
    expect(result.relations[0].relations[0].table).toBe('b');
    expect(result.relations[0].relations[0].relations[0].table).toBe('c');
    expect(result.relations[0].relations[0].relations[0].columns).toEqual(['d']);
  });

  it('parses relation with wildcard columns', () => {
    const result = parseSelect('id, posts(*)');
    expect(result.columns).toEqual(['id']);
    expect(result.relations[0].table).toBe('posts');
    expect(result.relations[0].columns).toEqual(['*']);
  });

  it('handles no whitespace', () => {
    const result = parseSelect('id,name,posts(id,title)');
    expect(result.columns).toEqual(['id', 'name']);
    expect(result.relations[0].table).toBe('posts');
    expect(result.relations[0].columns).toEqual(['id', 'title']);
  });
});
