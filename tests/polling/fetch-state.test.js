import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Task Group 2: Fetch Logic and State Change Detection Tests
 * Tests for fetchState, hasStateChanged, and state storage
 */

let polling;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.stubGlobal('fetch', vi.fn());
  polling = await import('../../public/js/polling.js');
  polling.resetState();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchState Function', () => {
  it('makes request with cache: "no-store" option', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ updatedAt: '2024-01-01T00:00:00Z' }),
    };
    fetch.mockResolvedValue(mockResponse);

    const controller = new AbortController();
    await polling.fetchState('https://example.com/state.json', controller.signal);

    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/state.json',
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('includes AbortController signal in fetch request', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ updatedAt: '2024-01-01T00:00:00Z' }),
    };
    fetch.mockResolvedValue(mockResponse);

    const controller = new AbortController();
    await polling.fetchState('https://example.com/state.json', controller.signal);

    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/state.json',
      expect.objectContaining({ signal: controller.signal })
    );
  });

  it('throws error with status property on HTTP error', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
    };
    fetch.mockResolvedValue(mockResponse);

    const controller = new AbortController();

    await expect(polling.fetchState('https://example.com/state.json', controller.signal))
      .rejects.toMatchObject({
        status: 500,
        isServerError: true,
      });
  });

  it('throws error with isClientError flag on 4xx errors', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
    };
    fetch.mockResolvedValue(mockResponse);

    const controller = new AbortController();

    await expect(polling.fetchState('https://example.com/state.json', controller.signal))
      .rejects.toMatchObject({
        status: 404,
        isClientError: true,
      });
  });

  it('handles network errors', async () => {
    fetch.mockRejectedValue(new Error('Network error'));

    const controller = new AbortController();

    await expect(polling.fetchState('https://example.com/state.json', controller.signal))
      .rejects.toThrow('Network error');
  });
});

describe('hasStateChanged Function', () => {
  it('returns true when updatedAt differs from stored value', () => {
    // Set initial state
    polling.updateStoredState({ updatedAt: '2024-01-01T00:00:00Z' });

    const result = polling.hasStateChanged({ updatedAt: '2024-01-02T00:00:00Z' });

    expect(result).toBe(true);
  });

  it('returns false when updatedAt matches stored value', () => {
    // Set initial state
    polling.updateStoredState({ updatedAt: '2024-01-01T00:00:00Z' });

    const result = polling.hasStateChanged({ updatedAt: '2024-01-01T00:00:00Z' });

    expect(result).toBe(false);
  });

  it('returns true on first fetch (no previous state)', () => {
    // No state has been stored yet
    const result = polling.hasStateChanged({ updatedAt: '2024-01-01T00:00:00Z' });

    expect(result).toBe(true);
  });

  it('returns false when newState has no updatedAt', () => {
    const result = polling.hasStateChanged({});

    expect(result).toBe(false);
  });

  it('returns false when newState is null', () => {
    const result = polling.hasStateChanged(null);

    expect(result).toBe(false);
  });
});

describe('updateStoredState Function', () => {
  it('stores state and returns previous state', () => {
    const firstState = { updatedAt: '2024-01-01T00:00:00Z', data: 'first' };
    const secondState = { updatedAt: '2024-01-02T00:00:00Z', data: 'second' };

    // First update - previous should be null
    const prev1 = polling.updateStoredState(firstState);
    expect(prev1).toBeNull();

    // Second update - previous should be firstState
    const prev2 = polling.updateStoredState(secondState);
    expect(prev2).toEqual(firstState);
  });

  it('updates lastUpdatedAt for subsequent change detection', () => {
    polling.updateStoredState({ updatedAt: '2024-01-01T00:00:00Z' });

    // Same timestamp should not be detected as change
    expect(polling.hasStateChanged({ updatedAt: '2024-01-01T00:00:00Z' })).toBe(false);

    // Different timestamp should be detected as change
    expect(polling.hasStateChanged({ updatedAt: '2024-01-02T00:00:00Z' })).toBe(true);
  });
});
