# Spec Requirements: State Polling

## Initial Description

State Polling — Implement unauthenticated polling of `state.json` from GitHub Pages URL with cache busting (`?_=${Date.now()}` and `cache: "no-store"`).

This is Roadmap Item #9 from Phase 1 (Core MVP), which enables the board to automatically update when the opponent makes a move without requiring manual page refresh.

## Requirements Discussion

### First Round Questions

**Q1:** What should the base polling interval be, and should we implement exponential backoff on errors?
**Answer:** Start at 5 seconds for the base polling interval. Implement exponential backoff on errors (doubling interval on each failure) with a maximum of 3 retries before pausing polling and showing an error state to the user.

**Q2:** How should the GitHub Pages URL be constructed for fetching state.json?
**Answer:** The URL pattern should be `{baseUrl}/tables/{tableId}/state.json` where baseUrl is the GitHub Pages root (e.g., `https://<user>.github.io/gitgammon`). The baseUrl should be configurable and the tableId should be passed to the polling function.

**Q3:** How should state changes be detected and communicated to other parts of the application?
**Answer:** Compare the `updatedAt` timestamp from the fetched state against the previously stored timestamp. When a change is detected, dispatch a custom event `gitgammon:statechange` with the new state in the event detail. This follows the existing pattern used by auth.js which dispatches `gitgammon:authchange`.

**Q4:** What public API should the polling module expose?
**Answer:** Provide `startPolling(tableId)` and `stopPolling()` functions. The startPolling function should accept a tableId parameter and begin the polling loop. The stopPolling function should cleanly terminate any active polling. Both should be exposed globally via `window.gitgammonPolling` following the pattern in auth.js.

**Q5:** How should the polling module integrate with the existing board.js for re-rendering?
**Answer:** The board.js already exposes `window.renderBoard(state)` globally. The polling module should dispatch the `gitgammon:statechange` event, and the integration code (likely in index.html or a main.js) should listen for this event and call renderBoard with the new state.

**Q6:** What memory management considerations should be addressed?
**Answer:** Clear the polling interval when `stopPolling()` is called. Use a single interval reference that gets cleared and reset. Avoid creating memory leaks by ensuring proper cleanup. The module should be safe to call startPolling multiple times (subsequent calls should stop existing polling before starting new).

**Q7:** Should the polling module handle the initial state load, or only subsequent updates?
**Answer:** The polling module should focus on ongoing polling after the initial page load. The existing board.js already handles initial state loading via its `loadState()` and `init()` functions. The polling module can optionally perform an immediate fetch when startPolling is called before beginning the interval.

**Q8:** What should happen when the user is not viewing the page (tab is backgrounded)?
**Answer:** For MVP, continue polling regardless of tab visibility. Future enhancement could pause polling when the tab is not visible using the Page Visibility API, but this is out of scope for the initial implementation.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: OAuth Device Flow Polling - Path: `/Users/cwalker/Projects/gitgammon/public/js/auth.js`
  - Lines 173-244: `pollForToken()` function demonstrates interval-based polling pattern
  - Lines 480-564: `startDeviceFlow()` shows polling loop with abort controller pattern
  - Lines 26-34: `POLL_STATUS` constants pattern for status handling

- Feature: State Loading - Path: `/Users/cwalker/Projects/gitgammon/public/js/board.js`
  - Lines 506-520: `loadState()` function shows basic fetch with cache busting
  - Lines 569-573: Global exports pattern via `window.functionName`
  - Lines 567: Event listener pattern using `DOMContentLoaded`

- Feature: Custom Events - Path: `/Users/cwalker/Projects/gitgammon/public/js/auth.js`
  - Lines 114-120: `dispatchAuthEvent()` shows custom event dispatch pattern using `CustomEvent`

### Follow-up Questions

No follow-up questions were needed. The requirements are clear from the roadmap context, tech stack documentation, and existing code patterns.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

Not applicable - this is a backend/infrastructure feature with no visual components.

## Requirements Summary

### Functional Requirements

- Poll `state.json` from GitHub Pages URL at regular intervals (5 second base interval)
- Use cache busting with both query parameter (`?_=${Date.now()}`) AND fetch option (`cache: "no-store"`)
- Detect state changes by comparing `updatedAt` timestamps
- Dispatch `gitgammon:statechange` custom event when state changes
- Provide `startPolling(tableId)` function to begin polling for a specific table
- Provide `stopPolling()` function to terminate active polling
- Implement exponential backoff on fetch errors (double interval each failure)
- Cap retry attempts at 3 before pausing and showing error state
- Perform optional immediate fetch when polling starts
- Handle multiple startPolling calls gracefully (stop existing before starting new)

### Non-Functional Requirements

- Memory safe: clean up intervals on stop, no leaks
- Follow existing code style and patterns from auth.js and board.js
- Use ES6+ vanilla JavaScript (no framework dependencies)
- Export functions both as ES modules and via window global
- Include JSDoc comments for all public functions

### Reusability Opportunities

- Polling pattern from auth.js `pollForToken()` can be adapted
- Cache busting implementation from board.js `loadState()` already exists
- Custom event dispatch pattern from auth.js `dispatchAuthEvent()`
- Global export pattern from both auth.js and board.js

### Scope Boundaries

**In Scope:**

- Create new `polling.js` module in `/public/js/`
- Implement startPolling(tableId) and stopPolling() functions
- Cache busting with query param and no-store header
- State change detection via updatedAt comparison
- Custom event dispatch on state change
- Exponential backoff error handling
- Retry logic with max attempts
- Global export via window.gitgammonPolling
- JSDoc documentation

**Out of Scope:**

- Modifying board.js (integration handled externally)
- Page Visibility API optimization (future enhancement)
- WebSocket or real-time alternatives
- Server-sent events
- UI components for polling status
- Offline support or service worker caching

### Technical Considerations

- Base URL must be configurable for different GitHub Pages deployments
- URL pattern: `{baseUrl}/tables/{tableId}/state.json`
- Both cache busting techniques required per tech stack docs
- Custom event name: `gitgammon:statechange`
- Event detail should contain: `{ state, previousState, tableId }`
- Follow module pattern: ES module exports + window global fallback
- Single interval reference to prevent multiple polling loops
- Use AbortController pattern for clean cancellation (as seen in auth.js)
- Module location: `/public/js/polling.js`

### State Change Event Specification

```javascript
// Event dispatch pattern
const event = new CustomEvent('gitgammon:statechange', {
  detail: {
    state: newState,           // The new game state object
    previousState: oldState,   // The previous state for comparison
    tableId: tableId           // Which table changed
  }
});
document.dispatchEvent(event);
```

### Error Handling Specification

| Condition | Action |
|-----------|--------|
| Network error | Retry with backoff, max 3 attempts |
| HTTP 4xx | Stop polling, dispatch error event |
| HTTP 5xx | Retry with backoff, max 3 attempts |
| Parse error | Retry with backoff, max 3 attempts |
| Max retries exceeded | Pause polling, dispatch error event |

### Configuration Constants

```javascript
const POLL_INTERVAL_MS = 5000;        // 5 seconds base interval
const MAX_RETRY_ATTEMPTS = 3;          // Maximum retries before pause
const BACKOFF_MULTIPLIER = 2;          // Double interval on each failure
const MAX_BACKOFF_MS = 60000;          // Cap backoff at 60 seconds
```
