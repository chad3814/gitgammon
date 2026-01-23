import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Task Group 4: Public API and Global Export Tests
 * Tests for startPolling, stopPolling, and window.gitgammonPolling
 */

let polling;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn());

  // Setup default successful fetch response
  fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ updatedAt: '2024-01-01T00:00:00Z' }),
  });

  polling = await import('../../public/js/polling.js');
  polling.resetState();
});

afterEach(() => {
  polling.stopPolling();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('startPolling Function', () => {
  it('begins polling loop for specified table', async () => {
    polling.startPolling('game-123', 'https://example.github.io/gitgammon');

    // Allow the immediate fetch to run
    await vi.advanceTimersByTimeAsync(0);

    expect(fetch).toHaveBeenCalled();
    expect(fetch.mock.calls[0][0]).toContain('/tables/game-123/state.json');
  });

  it('performs immediate fetch before starting interval', async () => {
    polling.startPolling('game-123', 'https://example.github.io/gitgammon');

    // Let the immediate poll() promise resolve
    await vi.advanceTimersByTimeAsync(0);

    // Fetch should have been called immediately, not waiting for interval
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('stops existing polling before starting new', async () => {
    // Start first polling
    polling.startPolling('game-1', 'https://example.github.io/gitgammon');
    await vi.advanceTimersByTimeAsync(0);

    const initialCallCount = fetch.mock.calls.length;

    // Start second polling - should stop the first
    fetch.mockClear();
    polling.startPolling('game-2', 'https://example.github.io/gitgammon');
    await vi.advanceTimersByTimeAsync(0);

    // All new calls should be for game-2
    expect(fetch).toHaveBeenCalled();
    fetch.mock.calls.forEach((call) => {
      expect(call[0]).toContain('/tables/game-2/state.json');
    });
  });

  it('dispatches statechange event when state changes', async () => {
    const eventHandler = vi.fn();
    document.addEventListener('gitgammon:statechange', eventHandler);

    polling.startPolling('game-123', 'https://example.github.io/gitgammon');
    await vi.advanceTimersByTimeAsync(0);

    expect(eventHandler).toHaveBeenCalled();

    document.removeEventListener('gitgammon:statechange', eventHandler);
  });

  it('schedules next poll after successful fetch', async () => {
    polling.startPolling('game-123', 'https://example.github.io/gitgammon');

    // Let the immediate fetch complete
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(1);

    // Advance just under the polling interval
    await vi.advanceTimersByTimeAsync(4999);
    expect(fetch).toHaveBeenCalledTimes(1);

    // Advance to reach the polling interval
    await vi.advanceTimersByTimeAsync(2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe('stopPolling Function', () => {
  it('clears interval and prevents future polls', async () => {
    polling.startPolling('game-123', 'https://example.github.io/gitgammon');
    await vi.advanceTimersByTimeAsync(0);

    const fetchCountBeforeStop = fetch.mock.calls.length;
    polling.stopPolling();

    // Advance time - no more fetches should occur
    await vi.advanceTimersByTimeAsync(20000);

    expect(fetch.mock.calls.length).toBe(fetchCountBeforeStop);
  });

  it('is safe to call when not polling', () => {
    // Should not throw
    expect(() => polling.stopPolling()).not.toThrow();
    expect(() => polling.stopPolling()).not.toThrow();
    expect(() => polling.stopPolling()).not.toThrow();
  });

  it('aborts in-flight fetch requests via AbortController', async () => {
    // Track the abort signal passed to fetch
    let capturedSignal = null;
    fetch.mockImplementation((url, options) => {
      capturedSignal = options.signal;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ updatedAt: '2024-01-01T00:00:00Z' }),
      });
    });

    polling.startPolling('game-123', 'https://example.github.io/gitgammon');
    await vi.advanceTimersByTimeAsync(0);

    // The signal should not be aborted yet
    expect(capturedSignal).not.toBeNull();
    const signalBeforeStop = capturedSignal;

    // Stop polling
    polling.stopPolling();

    // The signal that was passed should now be aborted
    expect(signalBeforeStop.aborted).toBe(true);
  });
});

describe('Memory Leak Prevention', () => {
  it('multiple startPolling calls do not create memory leaks', async () => {
    // Start and stop multiple times
    for (let i = 0; i < 10; i++) {
      polling.startPolling(`game-${i}`, 'https://example.github.io/gitgammon');
      await vi.advanceTimersByTimeAsync(0);
    }

    // Stop all
    polling.stopPolling();
    const fetchCountAfterStop = fetch.mock.calls.length;

    // Advance time - no more fetches should occur
    await vi.advanceTimersByTimeAsync(30000);
    expect(fetch.mock.calls.length).toBe(fetchCountAfterStop);
  });

  it('starting new polling cancels previous polling timer', async () => {
    polling.startPolling('game-1', 'https://example.github.io/gitgammon');
    await vi.advanceTimersByTimeAsync(0);

    // Start second polling right before first would fire again
    fetch.mockClear();
    polling.startPolling('game-2', 'https://example.github.io/gitgammon');
    await vi.advanceTimersByTimeAsync(0);

    // Advance past when game-1 would have polled
    await vi.advanceTimersByTimeAsync(5001);

    // Should only have calls for game-2
    fetch.mock.calls.forEach((call) => {
      expect(call[0]).toContain('/tables/game-2/state.json');
      expect(call[0]).not.toContain('/tables/game-1/state.json');
    });
  });
});

describe('Global Export', () => {
  it('window.gitgammonPolling exposes startPolling function', () => {
    expect(window.gitgammonPolling).toBeDefined();
    expect(typeof window.gitgammonPolling.startPolling).toBe('function');
  });

  it('window.gitgammonPolling exposes stopPolling function', () => {
    expect(window.gitgammonPolling).toBeDefined();
    expect(typeof window.gitgammonPolling.stopPolling).toBe('function');
  });

  it('global functions work correctly', async () => {
    window.gitgammonPolling.startPolling('game-global', 'https://example.github.io/gitgammon');
    await vi.advanceTimersByTimeAsync(0);

    expect(fetch).toHaveBeenCalled();
    expect(fetch.mock.calls[0][0]).toContain('/tables/game-global/state.json');

    window.gitgammonPolling.stopPolling();
  });
});

describe('Backoff Reset on Success', () => {
  it('resets to base interval after successful fetch following failures', async () => {
    // First call fails
    fetch.mockRejectedValueOnce(new Error('Network error'));

    polling.startPolling('game-123', 'https://example.github.io/gitgammon');
    await vi.advanceTimersByTimeAsync(0);

    // Reset for successful response
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ updatedAt: '2024-01-02T00:00:00Z' }),
    });

    // Advance to backoff interval (10000ms for first failure)
    await vi.advanceTimersByTimeAsync(10001);
    expect(fetch).toHaveBeenCalledTimes(2);

    // After success, next poll should be at base interval (5000ms)
    await vi.advanceTimersByTimeAsync(5001);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
