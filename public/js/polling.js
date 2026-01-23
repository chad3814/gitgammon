/**
 * GitGammon State Polling
 * Polls state.json from GitHub Pages with cache busting for automatic board updates
 * @module polling
 */

// ============================================
// Configuration Constants
// ============================================

/** Base polling interval in milliseconds */
export const POLL_INTERVAL_MS = 5000;

/** Maximum number of retry attempts before pausing */
export const MAX_RETRY_ATTEMPTS = 3;

/** Backoff multiplier for exponential backoff on failures */
export const BACKOFF_MULTIPLIER = 2;

/** Maximum backoff interval in milliseconds */
export const MAX_BACKOFF_MS = 60000;

// ============================================
// Module State Variables
// ============================================

/** Last fetched state object */
let lastState = null;

/** Last known updatedAt timestamp */
let lastUpdatedAt = null;

/** Current polling interval reference */
let pollIntervalId = null;

/** AbortController for fetch cancellation */
let abortController = null;

/** Current consecutive failure count */
let failureCount = 0;

/** Current table ID being polled */
let currentTableId = null;

/** Current base URL for polling */
let currentBaseUrl = null;

// ============================================
// URL Construction
// ============================================

/**
 * Build the polling URL with cache busting query parameter
 * @param {string} baseUrl - The GitHub Pages base URL
 * @param {string} tableId - The table ID to poll
 * @returns {string} The complete polling URL with cache busting
 */
export function buildPollingUrl(baseUrl, tableId) {
  return `${baseUrl}/tables/${tableId}/state.json?_=${Date.now()}`;
}

// ============================================
// Fetch Functions
// ============================================

/**
 * Fetch state from the polling URL
 * @param {string} url - The URL to fetch from
 * @param {AbortSignal} signal - AbortController signal for cancellation
 * @returns {Promise<Object>} The parsed state object
 * @throws {Error} On HTTP errors or network failures
 */
export async function fetchState(url, signal) {
  const response = await fetch(url, {
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.isClientError = response.status >= 400 && response.status < 500;
    error.isServerError = response.status >= 500;
    throw error;
  }

  return response.json();
}

// ============================================
// State Change Detection
// ============================================

/**
 * Check if the state has changed based on updatedAt timestamp
 * @param {Object} newState - The newly fetched state object
 * @returns {boolean} True if state has changed or this is the first fetch
 */
export function hasStateChanged(newState) {
  if (!newState || !newState.updatedAt) {
    return false;
  }

  // First fetch - consider it a change to trigger initial render
  if (lastUpdatedAt === null) {
    return true;
  }

  return newState.updatedAt !== lastUpdatedAt;
}

/**
 * Update the stored state and timestamp
 * @param {Object} state - The state to store
 * @returns {Object} The previous state (for event dispatch)
 */
export function updateStoredState(state) {
  const previousState = lastState;
  lastState = state;
  lastUpdatedAt = state ? state.updatedAt : null;
  return previousState;
}

// ============================================
// Event Dispatch Functions
// ============================================

/**
 * Dispatch state change event on document
 * @param {Object} state - The new state
 * @param {Object} previousState - The previous state
 * @param {string} tableId - The table ID
 */
export function dispatchStateChangeEvent(state, previousState, tableId) {
  const event = new CustomEvent('gitgammon:statechange', {
    detail: { state, previousState, tableId },
  });
  document.dispatchEvent(event);
}

/**
 * Dispatch error event on document
 * @param {Error} error - The error that occurred
 * @param {string} tableId - The table ID
 */
export function dispatchErrorEvent(error, tableId) {
  const event = new CustomEvent('gitgammon:pollerror', {
    detail: { error, tableId },
  });
  document.dispatchEvent(event);
}

// ============================================
// Exponential Backoff
// ============================================

/**
 * Calculate backoff interval based on failure count
 * @param {number} failures - Number of consecutive failures
 * @returns {number} The backoff interval in milliseconds
 */
export function calculateBackoff(failures) {
  const backoff = POLL_INTERVAL_MS * Math.pow(BACKOFF_MULTIPLIER, failures);
  return Math.min(backoff, MAX_BACKOFF_MS);
}

// ============================================
// Error Handling
// ============================================

/**
 * Handle fetch errors with appropriate response
 * @param {Error} error - The error that occurred
 * @param {string} tableId - The table ID
 * @returns {Object} Result with action to take
 */
export function handleFetchError(error, tableId) {
  // HTTP 4xx - stop polling immediately
  if (error.isClientError) {
    dispatchErrorEvent(error, tableId);
    return { action: 'stop' };
  }

  // Network/5xx/parse errors - increment failure count
  failureCount++;

  // Max retries exceeded - pause and dispatch error
  if (failureCount >= MAX_RETRY_ATTEMPTS) {
    dispatchErrorEvent(error, tableId);
    return { action: 'pause' };
  }

  // Continue with backoff
  return { action: 'backoff', interval: calculateBackoff(failureCount) };
}

// ============================================
// Poll Loop
// ============================================

/**
 * Execute a single poll cycle
 * @param {string} tableId - The table ID to poll
 * @param {string} baseUrl - The base URL for polling
 * @returns {Promise<void>}
 */
async function poll(tableId, baseUrl) {
  if (!abortController || abortController.signal.aborted) {
    return;
  }

  const url = buildPollingUrl(baseUrl, tableId);

  try {
    const state = await fetchState(url, abortController.signal);

    // Reset failure count on success
    failureCount = 0;

    // Check for state change
    if (hasStateChanged(state)) {
      const previousState = updateStoredState(state);
      dispatchStateChangeEvent(state, previousState, tableId);
    } else {
      // Still update stored state even if no change
      updateStoredState(state);
    }

    // Schedule next poll at base interval
    scheduleNextPoll(tableId, baseUrl, POLL_INTERVAL_MS);
  } catch (error) {
    // Handle aborted requests silently
    if (error.name === 'AbortError') {
      return;
    }

    const result = handleFetchError(error, tableId);

    if (result.action === 'stop') {
      stopPolling();
    } else if (result.action === 'pause') {
      stopPolling();
    } else if (result.action === 'backoff') {
      scheduleNextPoll(tableId, baseUrl, result.interval);
    }
  }
}

/**
 * Schedule the next poll cycle
 * @param {string} tableId - The table ID to poll
 * @param {string} baseUrl - The base URL for polling
 * @param {number} interval - The interval in milliseconds
 */
function scheduleNextPoll(tableId, baseUrl, interval) {
  // Clear any existing interval
  if (pollIntervalId !== null) {
    clearTimeout(pollIntervalId);
  }

  pollIntervalId = setTimeout(() => poll(tableId, baseUrl), interval);
}

// ============================================
// Public API
// ============================================

/**
 * Start polling for state changes
 * @param {string} tableId - The table ID to poll
 * @param {string} baseUrl - The GitHub Pages base URL
 */
export function startPolling(tableId, baseUrl) {
  // Stop any existing polling first
  stopPolling();

  // Store current context
  currentTableId = tableId;
  currentBaseUrl = baseUrl;

  // Create new abort controller
  abortController = new AbortController();

  // Reset failure count
  failureCount = 0;

  // Perform immediate fetch before starting interval
  poll(tableId, baseUrl);
}

/**
 * Stop polling and clean up resources
 */
export function stopPolling() {
  // Clear interval
  if (pollIntervalId !== null) {
    clearTimeout(pollIntervalId);
    pollIntervalId = null;
  }

  // Abort any in-flight requests
  if (abortController) {
    abortController.abort();
    abortController = null;
  }

  // Clear current context
  currentTableId = null;
  currentBaseUrl = null;
}

/**
 * Reset module state (for testing purposes)
 */
export function resetState() {
  lastState = null;
  lastUpdatedAt = null;
  pollIntervalId = null;
  abortController = null;
  failureCount = 0;
  currentTableId = null;
  currentBaseUrl = null;
}

// ============================================
// Global Exports for External Use
// ============================================

// Export functions globally for use by other modules
window.gitgammonPolling = {
  startPolling,
  stopPolling,
};
