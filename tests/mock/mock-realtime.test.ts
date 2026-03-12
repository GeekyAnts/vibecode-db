import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createClient } from '../../src/index';
import { MockAdapter } from '../../src/adapters/mock/index';

describe('Mock Realtime', () => {
  let adapter: MockAdapter;
  let client: ReturnType<typeof createClient>;

  beforeEach(() => {
    adapter = new MockAdapter();
    adapter.seed('messages', []);
    client = createClient('', '', { adapter });
  });

  it('subscribes to insert events', async () => {
    const callback = vi.fn();

    client
      .channel('test')
      .on('postgres_changes', { event: 'INSERT', table: 'messages' }, callback)
      .subscribe();

    // Trigger an insert
    await client.from('messages').insert({ text: 'hello' });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'INSERT',
        table: 'messages',
        new: expect.objectContaining({ text: 'hello' }),
      }),
    );
  });

  it('subscribes to update events', async () => {
    adapter.seed('messages', [{ id: 1, text: 'old' }]);
    const callback = vi.fn();

    client
      .channel('test')
      .on('postgres_changes', { event: 'UPDATE', table: 'messages' }, callback)
      .subscribe();

    await client.from('messages').update({ text: 'new' }).eq('id', 1);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'UPDATE',
        new: expect.objectContaining({ text: 'new' }),
        old: expect.objectContaining({ text: 'old' }),
      }),
    );
  });

  it('subscribes to delete events', async () => {
    adapter.seed('messages', [{ id: 1, text: 'bye' }]);
    const callback = vi.fn();

    client
      .channel('test')
      .on('postgres_changes', { event: 'DELETE', table: 'messages' }, callback)
      .subscribe();

    await client.from('messages').delete().eq('id', 1);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'DELETE',
        old: expect.objectContaining({ text: 'bye' }),
      }),
    );
  });

  it('subscribes to * events', async () => {
    const callback = vi.fn();

    client
      .channel('test')
      .on('postgres_changes', { event: '*', table: 'messages' }, callback)
      .subscribe();

    await client.from('messages').insert({ id: 1, text: 'hello' });
    await client.from('messages').update({ text: 'updated' }).eq('id', 1);
    await client.from('messages').delete().eq('id', 1);

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('does not fire for unsubscribed channels', async () => {
    const callback = vi.fn();

    const channel = client
      .channel('test')
      .on('postgres_changes', { event: 'INSERT', table: 'messages' }, callback)
      .subscribe();

    channel.unsubscribe();

    await client.from('messages').insert({ text: 'hello' });
    expect(callback).not.toHaveBeenCalled();
  });

  it('filters by table', async () => {
    adapter.seed('other', []);
    const callback = vi.fn();

    client
      .channel('test')
      .on('postgres_changes', { event: 'INSERT', table: 'messages' }, callback)
      .subscribe();

    await client.from('other').insert({ text: 'hello' });
    expect(callback).not.toHaveBeenCalled();
  });

  it('calls subscribe callback with SUBSCRIBED status', () => {
    const statusCallback = vi.fn();

    client
      .channel('test')
      .on('postgres_changes', { event: '*', table: 'messages' }, vi.fn())
      .subscribe(statusCallback);

    expect(statusCallback).toHaveBeenCalledWith('SUBSCRIBED');
  });

  it('removes a channel', async () => {
    const callback = vi.fn();

    client
      .channel('test')
      .on('postgres_changes', { event: 'INSERT', table: 'messages' }, callback)
      .subscribe();

    client.removeChannel('test');

    await client.from('messages').insert({ text: 'hello' });
    expect(callback).not.toHaveBeenCalled();
  });

  it('removes all channels', async () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    client.channel('ch1').on('postgres_changes', { event: 'INSERT', table: 'messages' }, callback1).subscribe();
    client.channel('ch2').on('postgres_changes', { event: 'INSERT', table: 'messages' }, callback2).subscribe();

    client.removeAllChannels();

    await client.from('messages').insert({ text: 'hello' });
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });
});
