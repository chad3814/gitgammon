import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Task Group 3: Custom Events and Exponential Backoff Tests
 * Tests for event dispatch and error handling with backoff
 */

let polling;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  polling = await import('../../public/js/polling.js');
  polling.resetState();
});

afterEach(() => {
  // Clean up event listeners
  document.body.innerHTML = '';
});

describe('State Change Event Dispatch', () => {
  it('dispatches gitgammon:statechange event on state change', () => {
    const eventHandler = vi.fn();
    document.addEventListener('gitgammon:statechange', eventHandler);

    const state = { updatedAt: '2024-01-01T00:00:00Z' };
    const previousState = null;
    polling.dispatchStateChangeEvent(state, previousState, 'game-123');

    expect(eventHandler).toHaveBeenCalled();

    document.removeEventListener('gitgammon:statechange', eventHandler);
  });

  it('event detail contains state, previousState, and tableId', () => {
    const eventHandler = vi.fn();
    document.addEventListener('gitgammon:statechange', eventHandler);

    const state = { updatedAt: '2024-01-02T00:00:00Z', board: [1, 2, 3] };
    const previousState = { updatedAt: '2024-01-01T00:00:00Z', board: [0, 0, 0] };
    const tableId = 'game-456';

    polling.dispatchStateChangeEvent(state, previousState, tableId);

    const event = eventHandler.mock.calls[0][0];
    expect(event.detail).toEqual({ state, previousState, tableId });

    document.removeEventListener('gitgammon:statechange', eventHandler);
  });

  it('event is dispatched on document (following auth.js pattern)', () => {
    const eventHandler = vi.fn();
    document.addEventListener('gitgammon:statechange', eventHandler);

    polling.dispatchStateChangeEvent({}, null, 'test');

    expect(eventHandler).toHaveBeenCalledTimes(1);
    const event = eventHandler.mock.calls[0][0];
    expect(event.type).toBe('gitgammon:statechange');

    document.removeEventListener('gitgammon:statechange', eventHandler);
  });
});

describe('Error Event Dispatch', () => {
  it('dispatches gitgammon:pollerror event on max retries', () => {
    const eventHandler = vi.fn();
    document.addEventListener('gitgammon:pollerror', eventHandler);

    const error = new Error('Max retries exceeded');
    polling.dispatchErrorEvent(error, 'game-123');

    expect(eventHandler).toHaveBeenCalled();
    const event = eventHandler.mock.calls[0][0];
    expect(event.type).toBe('gitgammon:pollerror');
    expect(event.detail).toEqual({ error, tableId: 'game-123' });

    document.removeEventListener('gitgammon:pollerror', eventHandler);
  });
});

describe('Exponential Backoff', () => {
  it('doubles interval on consecutive failures', () => {
    // Base interval is 5000ms
    expect(polling.calculateBackoff(1)).toBe(10000); // 5000 * 2^1
    expect(polling.calculateBackoff(2)).toBe(20000); // 5000 * 2^2
    expect(polling.calculateBackoff(3)).toBe(40000); // 5000 * 2^3
  });

  it('caps backoff at MAX_BACKOFF_MS (60000)', () => {
    // 5000 * 2^4 = 80000, should cap at 60000
    expect(polling.calculateBackoff(4)).toBe(60000);
    expect(polling.calculateBackoff(5)).toBe(60000);
    expect(polling.calculateBackoff(10)).toBe(60000);
  });

  it('returns base interval at 0 failures', () => {
    // 5000 * 2^0 = 5000
    expect(polling.calculateBackoff(0)).toBe(5000);
  });
});

describe('Error Classification and Handling', () => {
  it('HTTP 4xx stops polling immediately', () => {
    const errorHandler = vi.fn();
    document.addEventListener('gitgammon:pollerror', errorHandler);

    const error = new Error('Not found');
    error.isClientError = true;
    error.status = 404;

    const result = polling.handleFetchError(error, 'game-123');

    expect(result.action).toBe('stop');
    expect(errorHandler).toHaveBeenCalled();

    document.removeEventListener('gitgammon:pollerror', errorHandler);
  });

  it('HTTP 5xx/network errors apply backoff and return backoff action', () => {
    const error = new Error('Server error');
    error.isServerError = true;
    error.status = 500;

    const result = polling.handleFetchError(error, 'game-123');

    expect(result.action).toBe('backoff');
    expect(result.interval).toBeGreaterThan(5000); // Should be backed off
  });

  it('dispatches error event after max retries exceeded', () => {
    const errorHandler = vi.fn();
    document.addEventListener('gitgammon:pollerror', errorHandler);

    const error = new Error('Network error');

    // Simulate 3 failures (MAX_RETRY_ATTEMPTS)
    polling.handleFetchError(error, 'game-123'); // 1st failure
    polling.handleFetchError(error, 'game-123'); // 2nd failure
    const result = polling.handleFetchError(error, 'game-123'); // 3rd failure

    expect(result.action).toBe('pause');
    expect(errorHandler).toHaveBeenCalled();

    document.removeEventListener('gitgammon:pollerror', errorHandler);
  });
});
