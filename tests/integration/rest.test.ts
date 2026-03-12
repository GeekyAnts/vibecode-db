import { describe, it, expect } from 'vitest';

// Integration tests require REST_BASE_URL env var
const REST_BASE_URL = process.env.REST_BASE_URL;

describe.skipIf(!REST_BASE_URL)('REST Integration', () => {
  it('placeholder - requires real REST API', () => {
    expect(true).toBe(true);
  });
});
