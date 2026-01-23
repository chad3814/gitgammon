# Task Breakdown: State Polling

## Overview
Total Tasks: 16 (across 4 task groups)

This spec creates a new `polling.js` module in `/public/js/` that polls `state.json` from GitHub Pages with cache busting, detects state changes, and dispatches custom events for board updates.

## Task List

### Foundation Layer

#### Task Group 1: Module Setup and Configuration
**Dependencies:** None

- [x] 1.0 Complete module foundation
  - [x] 1.1 Write 4-6 focused tests for polling configuration
    - Test `POLL_INTERVAL_MS` equals 5000
    - Test `MAX_RETRY_ATTEMPTS` equals 3
    - Test `BACKOFF_MULTIPLIER` equals 2
    - Test `MAX_BACKOFF_MS` equals 60000
    - Test URL construction with configurable baseUrl and tableId
    - Test cache busting query parameter format
  - [x] 1.2 Create `/public/js/polling.js` with module structure
    - Add file header comment following auth.js pattern
    - Define configuration constants at module level
    - Set up module-level state variables (lastState, lastUpdatedAt, pollInterval, abortController)
    - Add ES module export structure
  - [x] 1.3 Implement URL construction helper
    - Create `buildPollingUrl(baseUrl, tableId)` internal function
    - Format: `{baseUrl}/tables/{tableId}/state.json?_=${Date.now()}`
    - Include cache busting query parameter
  - [x] 1.4 Ensure foundation tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify constants are correctly defined

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- Module structure follows existing auth.js patterns
- Configuration constants match spec requirements
- URL construction produces correct format

---

### Core Polling

#### Task Group 2: Fetch Logic and State Change Detection
**Dependencies:** Task Group 1

- [x] 2.0 Complete core polling functionality
  - [x] 2.1 Write 6-8 focused tests for fetch and state detection
    - Test `fetchState()` makes request with `cache: "no-store"` option
    - Test `fetchState()` includes AbortController signal
    - Test `hasStateChanged()` returns true when updatedAt differs
    - Test `hasStateChanged()` returns false when updatedAt matches
    - Test `hasStateChanged()` handles first fetch (no previous state)
    - Test JSON parse error handling
    - Test network error handling
  - [x] 2.2 Implement fetchState function
    - Create internal `fetchState(url, signal)` function
    - Use fetch with both `cache: "no-store"` and query param cache busting
    - Accept AbortController signal for cancellation
    - Return parsed JSON state object
    - Throw on HTTP 4xx/5xx errors with error type distinction
  - [x] 2.3 Implement state change detection
    - Create internal `hasStateChanged(newState)` function
    - Compare `newState.updatedAt` against `lastUpdatedAt` module variable
    - Return boolean indicating if state changed
    - Handle initial state case (no previous state stored)
  - [x] 2.4 Implement state storage
    - Create internal `updateStoredState(state)` function
    - Store `lastState` and `lastUpdatedAt` in module variables
    - Preserve previous state for event dispatch
  - [x] 2.5 Ensure fetch and detection tests pass
    - Run ONLY the 6-8 tests written in 2.1
    - Verify dual cache busting is applied

**Acceptance Criteria:**
- The 6-8 tests written in 2.1 pass
- Dual cache busting (query param AND no-store) implemented
- State change detection compares updatedAt correctly
- AbortController pattern matches auth.js

---

### Event Dispatch and Error Handling

#### Task Group 3: Custom Events and Exponential Backoff
**Dependencies:** Task Group 2

- [x] 3.0 Complete event and error handling
  - [x] 3.1 Write 6-8 focused tests for events and backoff
    - Test `gitgammon:statechange` event dispatched on state change
    - Test event detail contains `{ state, previousState, tableId }`
    - Test event dispatched on document (following auth.js pattern)
    - Test `gitgammon:pollerror` event dispatched on max retries
    - Test backoff doubles interval on consecutive failures
    - Test backoff caps at `MAX_BACKOFF_MS`
    - Test backoff resets to base interval on success
    - Test HTTP 4xx stops polling immediately
  - [x] 3.2 Implement event dispatch functions
    - Create `dispatchStateChangeEvent(state, previousState, tableId)` function
    - Create `dispatchErrorEvent(error, tableId)` function
    - Follow `dispatchAuthEvent()` pattern from auth.js (lines 114-120)
    - Dispatch on document using CustomEvent
  - [x] 3.3 Implement exponential backoff logic
    - Create internal `calculateBackoff(failureCount)` function
    - Formula: `Math.min(POLL_INTERVAL_MS * Math.pow(BACKOFF_MULTIPLIER, failureCount), MAX_BACKOFF_MS)`
    - Track consecutive failure count in module variable
    - Reset failure count on successful fetch
  - [x] 3.4 Implement error classification
    - Create internal `handleFetchError(error, tableId)` function
    - HTTP 4xx: stop polling, dispatch error event
    - HTTP 5xx/network/parse errors: increment failure count, apply backoff
    - On max retries: pause polling, dispatch `gitgammon:pollerror`
  - [x] 3.5 Ensure event and backoff tests pass
    - Run ONLY the 6-8 tests written in 3.1
    - Verify event structure matches spec

**Acceptance Criteria:**
- The 6-8 tests written in 3.1 pass
- Custom events follow auth.js dispatch pattern
- Exponential backoff correctly doubles interval
- HTTP 4xx errors stop polling immediately
- Max retries triggers error event

---

### Public API and Integration

#### Task Group 4: startPolling, stopPolling, and Global Export
**Dependencies:** Task Groups 1, 2, and 3

- [x] 4.0 Complete public API
  - [x] 4.1 Write 6-8 focused tests for public API
    - Test `startPolling(tableId)` begins polling loop
    - Test `startPolling()` performs immediate fetch before interval
    - Test `startPolling()` stops existing polling before starting new
    - Test `stopPolling()` clears interval and abort controller
    - Test multiple `startPolling()` calls do not create memory leaks
    - Test `window.gitgammonPolling` exposes public functions
    - Test stopPolling is safe to call when not polling
  - [x] 4.2 Implement startPolling function
    - Create `startPolling(tableId, baseUrl)` public function
    - Call `stopPolling()` first to clear any existing polling
    - Create new AbortController for this polling session
    - Perform immediate fetch before starting interval
    - Set up interval using calculated backoff
    - JSDoc with parameter and return documentation
  - [x] 4.3 Implement stopPolling function
    - Create `stopPolling()` public function
    - Clear interval using `clearInterval()`
    - Call `abortController.abort()` if active
    - Reset module state (interval ref, abort controller)
    - Safe to call multiple times (no-op if not polling)
    - JSDoc documentation
  - [x] 4.4 Implement poll loop logic
    - Create internal `poll(tableId, baseUrl)` function
    - Fetch state with error handling
    - Check for state change, dispatch event if changed
    - Update stored state on success
    - Reschedule next poll with appropriate interval
  - [x] 4.5 Add global export
    - Export via `window.gitgammonPolling = { startPolling, stopPolling }`
    - Follow pattern from auth.js (lines 618-625) and board.js (lines 569-573)
    - Also export as ES modules for import usage
  - [x] 4.6 Ensure public API tests pass
    - Run all tests in polling test file
    - Verify no memory leaks with multiple starts
    - Verify clean cancellation

**Acceptance Criteria:**
- The 6-8 tests written in 4.1 pass
- Public API matches spec requirements
- Multiple startPolling calls are safe
- Global export follows existing patterns
- Memory management prevents leaks

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Foundation Layer**
   - Module structure and configuration constants
   - URL construction helper
   - No dependencies on other code

2. **Task Group 2: Core Polling**
   - Fetch logic with dual cache busting
   - State change detection via updatedAt
   - AbortController for cancellation

3. **Task Group 3: Event Dispatch and Error Handling**
   - Custom event dispatch following auth.js pattern
   - Exponential backoff implementation
   - Error classification and handling

4. **Task Group 4: Public API**
   - startPolling and stopPolling functions
   - Poll loop orchestration
   - Global export and ES module exports

## File Structure

After completion, the polling module should contain:

```
public/js/
  polling.js              # Complete polling module
    - Configuration constants
    - URL construction
    - Fetch with cache busting
    - State change detection
    - Event dispatch functions
    - Exponential backoff logic
    - Error handling
    - startPolling(tableId, baseUrl)
    - stopPolling()
    - window.gitgammonPolling global export
```

## Notes

- Single file module (unlike multi-file dice system) following board.js pattern
- All state management via module-level variables
- Dual cache busting required per tech stack: query param AND `cache: "no-store"`
- Custom events dispatch on `document` following auth.js pattern
- AbortController pattern from auth.js startDeviceFlow() (lines 480-564)
- No modifications to board.js - integration handled externally
- Base URL must be configurable for different GitHub Pages deployments
- Polling continues regardless of tab visibility (Page Visibility API out of scope)
