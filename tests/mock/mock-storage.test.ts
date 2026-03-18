import { describe, it, expect, beforeEach } from 'vitest';
import { createClient } from '../../src/index';
import { MockAdapter } from '../../src/adapters/mock/index';

describe('Mock Storage', () => {
  let adapter: MockAdapter;
  let client: ReturnType<typeof createClient>;

  beforeEach(() => {
    adapter = new MockAdapter();
    client = createClient('', '', { adapter });
  });

  describe('Buckets', () => {
    it('creates a bucket', async () => {
      const { data, error } = await client.storage.createBucket('avatars', { public: true });
      expect(error).toBeNull();
      expect(data!.name).toBe('avatars');
    });

    it('prevents duplicate bucket creation', async () => {
      await client.storage.createBucket('avatars');
      const { error } = await client.storage.createBucket('avatars');
      expect(error).not.toBeNull();
    });

    it('lists buckets', async () => {
      await client.storage.createBucket('avatars');
      await client.storage.createBucket('documents');
      const { data } = await client.storage.listBuckets();
      expect(data).toHaveLength(2);
    });

    it('gets a bucket', async () => {
      await client.storage.createBucket('avatars', { public: true });
      const { data } = await client.storage.getBucket('avatars');
      expect(data!.name).toBe('avatars');
      expect(data!.public).toBe(true);
    });

    it('returns error for nonexistent bucket', async () => {
      const { error } = await client.storage.getBucket('nonexistent');
      expect(error).not.toBeNull();
    });

    it('deletes a bucket', async () => {
      await client.storage.createBucket('avatars');
      const { error } = await client.storage.deleteBucket('avatars');
      expect(error).toBeNull();

      const { data } = await client.storage.listBuckets();
      expect(data).toHaveLength(0);
    });

    it('empties a bucket', async () => {
      await client.storage.createBucket('avatars');
      await client.storage.from('avatars').upload('file1.txt', 'content1');
      await client.storage.from('avatars').upload('file2.txt', 'content2');

      await client.storage.emptyBucket('avatars');

      const { data } = await client.storage.from('avatars').list();
      expect(data).toHaveLength(0);
    });
  });

  describe('Files', () => {
    beforeEach(async () => {
      await client.storage.createBucket('test-bucket');
    });

    it('uploads a file', async () => {
      const { data, error } = await client.storage.from('test-bucket').upload('hello.txt', 'Hello World');
      expect(error).toBeNull();
      expect(data!.path).toBe('hello.txt');
    });

    it('prevents duplicate upload without upsert', async () => {
      await client.storage.from('test-bucket').upload('hello.txt', 'content');
      const { error } = await client.storage.from('test-bucket').upload('hello.txt', 'new content');
      expect(error).not.toBeNull();
    });

    it('allows upsert upload', async () => {
      await client.storage.from('test-bucket').upload('hello.txt', 'content');
      const { error } = await client.storage.from('test-bucket').upload('hello.txt', 'new content', { upsert: true });
      expect(error).toBeNull();
    });

    it('downloads a file', async () => {
      await client.storage.from('test-bucket').upload('hello.txt', 'Hello World');
      const { data, error } = await client.storage.from('test-bucket').download('hello.txt');
      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Blob);
    });

    it('lists files', async () => {
      await client.storage.from('test-bucket').upload('a.txt', 'aaa');
      await client.storage.from('test-bucket').upload('b.txt', 'bbb');
      const { data } = await client.storage.from('test-bucket').list();
      expect(data).toHaveLength(2);
    });

    it('lists files with prefix', async () => {
      await client.storage.from('test-bucket').upload('docs/a.txt', 'aaa');
      await client.storage.from('test-bucket').upload('docs/b.txt', 'bbb');
      await client.storage.from('test-bucket').upload('images/c.png', 'ccc');
      const { data } = await client.storage.from('test-bucket').list('docs/');
      expect(data).toHaveLength(2);
    });

    it('removes files', async () => {
      await client.storage.from('test-bucket').upload('a.txt', 'aaa');
      await client.storage.from('test-bucket').upload('b.txt', 'bbb');
      const { data } = await client.storage.from('test-bucket').remove(['a.txt']);
      expect(data).toHaveLength(1);

      const { data: remaining } = await client.storage.from('test-bucket').list();
      expect(remaining).toHaveLength(1);
    });

    it('gets public url', () => {
      const { data } = client.storage.from('test-bucket').getPublicUrl('photo.jpg');
      expect(data.publicUrl).toContain('test-bucket');
      expect(data.publicUrl).toContain('photo.jpg');
    });

    it('returns file URI as public url when uploading a string', async () => {
      await client.storage.from('test-bucket').upload('avatar.jpg', 'file:///tmp/photo.jpg');
      const { data } = client.storage.from('test-bucket').getPublicUrl('avatar.jpg');
      expect(data.publicUrl).toBe('file:///tmp/photo.jpg');
    });

    it('returns data URI as public url when uploading a Blob', async () => {
      const blob = new Blob(['hello'], { type: 'text/plain' });
      await client.storage.from('test-bucket').upload('doc.txt', blob);
      const { data } = client.storage.from('test-bucket').getPublicUrl('doc.txt');
      expect(data.publicUrl).toMatch(/^data:text\/plain;base64,/);
    });

    it('returns data URI as public url when uploading an ArrayBuffer', async () => {
      const buffer = new TextEncoder().encode('hello').buffer;
      await client.storage.from('test-bucket').upload('image.png', buffer);
      const { data } = client.storage.from('test-bucket').getPublicUrl('image.png');
      expect(data.publicUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('falls back to fake url for non-uploaded files', () => {
      const { data } = client.storage.from('test-bucket').getPublicUrl('nonexistent.jpg');
      expect(data.publicUrl).toBe('https://mock-storage.local/test-bucket/nonexistent.jpg');
    });

    it('moves a file', async () => {
      await client.storage.from('test-bucket').upload('old.txt', 'content');
      const { error } = await client.storage.from('test-bucket').move('old.txt', 'new.txt');
      expect(error).toBeNull();

      const { error: downloadError } = await client.storage.from('test-bucket').download('old.txt');
      expect(downloadError).not.toBeNull();

      const { data } = await client.storage.from('test-bucket').download('new.txt');
      expect(data).not.toBeNull();
    });

    it('copies a file', async () => {
      await client.storage.from('test-bucket').upload('original.txt', 'content');
      const { data, error } = await client.storage.from('test-bucket').copy('original.txt', 'copy.txt');
      expect(error).toBeNull();
      expect(data!.path).toBe('copy.txt');

      const { data: files } = await client.storage.from('test-bucket').list();
      expect(files).toHaveLength(2);
    });
  });
});
