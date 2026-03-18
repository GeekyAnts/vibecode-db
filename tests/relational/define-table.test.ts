import { describe, it, expect, beforeEach } from 'vitest';
import { createClient } from '../../src/index';
import { MockAdapter } from '../../src/adapters/mock/index';
import { defineTable, defineSchema, hasMany, belongsTo } from '../../src/relational/define-table';

// ── Define tables with relationships ─────────────────

const users = defineTable('users', {
  id: 'number',
  name: 'string',
  email: 'string',
  posts: hasMany(() => posts, 'user_id'),
});

const posts = defineTable('posts', {
  id: 'number',
  title: 'string',
  user_id: 'number',
  author: belongsTo(() => users, 'user_id'),
  comments: hasMany(() => comments, 'post_id'),
});

const comments = defineTable('comments', {
  id: 'number',
  body: 'string',
  post_id: 'number',
  user_id: 'number',
  post: belongsTo(() => posts, 'post_id'),
  commenter: belongsTo(() => users, 'user_id'),
});

// ── Workout tables ───────────────────────────────────

const exercises = defineTable('exercises', {
  id: 'string',
  name: 'string',
  muscle_group: 'string',
});

const workouts = defineTable('workouts', {
  id: 'string',
  name: 'string',
  workout_exercises: hasMany(() => workoutExercises, 'workout_id'),
});

const workoutExercises = defineTable('workout_exercises', {
  id: 'string',
  workout_id: 'string',
  exercise_id: 'string',
  sets: 'number',
  reps: 'number',
  exercises: belongsTo(() => exercises, 'exercise_id'),
});

// ── Tests ────────────────────────────────────────────

describe('defineTable + defineSchema', () => {
  it('extracts relations from defineTable', () => {
    expect(users.tableName).toBe('users');
    expect(users.relations).toHaveLength(1);
    expect(users.relations[0].name).toBe('posts');
    expect(users.relations[0].type).toBe('one-to-many');
    expect(users.relations[0].foreignKey).toBe('user_id');

    expect(posts.relations).toHaveLength(2);
    expect(posts.relations[0].name).toBe('author');
    expect(posts.relations[0].type).toBe('many-to-one');
    expect(posts.relations[1].name).toBe('comments');
    expect(posts.relations[1].type).toBe('one-to-many');
  });

  it('defineSchema builds a SchemaDefinition from table defs', () => {
    const schema = defineSchema(users, posts, comments);

    expect(schema.users.relations.posts).toEqual({
      type: 'one-to-many',
      foreignKey: 'user_id',
      table: 'posts',
    });

    expect(schema.posts.relations.author).toEqual({
      type: 'many-to-one',
      foreignKey: 'user_id',
      table: 'users',
    });

    expect(schema.posts.relations.comments).toEqual({
      type: 'one-to-many',
      foreignKey: 'post_id',
      table: 'comments',
    });

    expect(schema.comments.relations.post).toEqual({
      type: 'many-to-one',
      foreignKey: 'post_id',
      table: 'posts',
    });
  });
});

describe('MockAdapter with defineTable schema', () => {
  let adapter: MockAdapter;
  let client: ReturnType<typeof createClient>;

  beforeEach(() => {
    adapter = new MockAdapter();

    // Pass table definitions directly to setSchema
    adapter.setSchema(users, posts, comments, workouts, workoutExercises, exercises);

    adapter
      .seed('users', [
        { id: 1, name: 'Alice', email: 'alice@test.com' },
        { id: 2, name: 'Bob', email: 'bob@test.com' },
      ])
      .seed('posts', [
        { id: 1, title: 'Hello World', user_id: 1 },
        { id: 2, title: 'Second Post', user_id: 1 },
        { id: 3, title: 'Bob Post', user_id: 2 },
      ])
      .seed('comments', [
        { id: 1, body: 'Nice!', post_id: 1, user_id: 2 },
        { id: 2, body: 'Thanks', post_id: 1, user_id: 1 },
      ])
      .seed('exercises', [
        { id: 'ex1', name: 'Bench Press', muscle_group: 'chest' },
        { id: 'ex2', name: 'Squat', muscle_group: 'legs' },
      ])
      .seed('workouts', [
        { id: 'w1', name: 'Leg Day' },
      ])
      .seed('workout_exercises', [
        { id: 'we1', workout_id: 'w1', exercise_id: 'ex2', sets: 4, reps: 10 },
      ]);

    client = createClient('', '', { adapter });
  });

  it('resolves one-to-many with defineTable schema', async () => {
    const { data } = await client
      .from('users')
      .select('id, name, posts(id, title)');

    const alice = data!.find((u: any) => u.id === 1);
    expect(alice.posts).toHaveLength(2);
    expect(alice.posts[0]).toHaveProperty('title');
  });

  it('resolves many-to-one (belongsTo) with defineTable schema', async () => {
    const { data } = await client
      .from('posts')
      .select('id, title, author:users(name)');

    const hello = data!.find((p: any) => p.id === 1);
    expect(hello.author).toEqual({ name: 'Alice' });
  });

  it('resolves nested workout → workout_exercises → exercises', async () => {
    const { data } = await client
      .from('workouts')
      .select(`
        id,
        name,
        workout_exercises (
          sets,
          reps,
          exercises ( id, name )
        )
      `);

    expect(data).toHaveLength(1);
    expect(data![0].name).toBe('Leg Day');
    expect(data![0].workout_exercises).toHaveLength(1);
    expect(data![0].workout_exercises[0].exercises).toEqual({
      id: 'ex2',
      name: 'Squat',
    });
  });

  it('resolves deep nesting: users → posts → comments', async () => {
    const { data } = await client
      .from('users')
      .select('id, name, posts(id, title, comments(id, body))');

    const alice = data!.find((u: any) => u.id === 1);
    expect(alice.posts).toHaveLength(2);

    const hello = alice.posts.find((p: any) => p.id === 1);
    expect(hello.comments).toHaveLength(2);
  });

  it('works with defineSchema() passed as raw object', async () => {
    // Reset and use defineSchema() output as a raw object
    const freshAdapter = new MockAdapter();
    freshAdapter.setSchema(defineSchema(users, posts));
    freshAdapter
      .seed('users', [{ id: 1, name: 'Alice' }])
      .seed('posts', [{ id: 1, title: 'Test', user_id: 1 }]);

    const freshClient = createClient('', '', { adapter: freshAdapter });
    const { data } = await freshClient
      .from('users')
      .select('id, name, posts(title)');

    expect(data![0].posts).toHaveLength(1);
    expect(data![0].posts[0].title).toBe('Test');
  });
});
