import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Task Group 1: Module Setup and Configuration Tests
 * Tests for polling configuration constants and URL construction
 */

let polling;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  polling = await import('../../public/js/polling.js');
});

describe('Polling Configuration Constants', () => {
  it('POLL_INTERVAL_MS equals 5000', () => {
    expect(polling.POLL_INTERVAL_MS).toBe(5000);
  });

  it('MAX_RETRY_ATTEMPTS equals 3', () => {
    expect(polling.MAX_RETRY_ATTEMPTS).toBe(3);
  });

  it('BACKOFF_MULTIPLIER equals 2', () => {
    expect(polling.BACKOFF_MULTIPLIER).toBe(2);
  });

  it('MAX_BACKOFF_MS equals 60000', () => {
    expect(polling.MAX_BACKOFF_MS).toBe(60000);
  });
});

describe('URL Construction', () => {
  it('constructs URL with configurable baseUrl and tableId', () => {
    const baseUrl = 'https://user.github.io/gitgammon';
    const tableId = 'game-123';

    const url = polling.buildPollingUrl(baseUrl, tableId);

    expect(url).toContain(`${baseUrl}/tables/${tableId}/state.json`);
  });

  it('includes cache busting query parameter', () => {
    const baseUrl = 'https://user.github.io/gitgammon';
    const tableId = 'game-456';

    const url = polling.buildPollingUrl(baseUrl, tableId);

    // URL should contain ?_= followed by a timestamp
    expect(url).toMatch(/\?_=\d+$/);
  });
});
