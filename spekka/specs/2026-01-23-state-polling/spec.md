# Specification: State Polling

## Goal
Implement unauthenticated polling of `state.json` from GitHub Pages URL with cache busting to enable automatic board updates when the opponent makes a move without requiring manual page refresh.

## User Stories
- As a player, I want the game board to update automatically when my opponent moves so I do not have to manually refresh the page
- As a player, I want to be notified if polling fails so I know when connectivity issues occur

## Specific Requirements

**Polling Module Structure**
- Create new file at `/public/js/polling.js` following existing module patterns
- Use ES6+ vanilla JavaScript with no framework dependencies
- Export functions both as ES modules and via `window.gitgammonPolling` global object
- Include JSDoc comments for all public functions

**URL Construction**
- Construct polling URL as `{baseUrl}/tables/{tableId}/state.json`
- baseUrl is the GitHub Pages root (e.g., `https://<user>.github.io/gitgammon`)
- baseUrl must be configurable for different deployments
- tableId parameter passed to startPolling function

**Cache Busting Implementation**
- Apply dual cache busting: query parameter (`?_=${Date.now()}`) AND fetch option (`cache: "no-store"`)
- Both techniques required per tech stack requirements to ensure fresh state on every poll

**State Change Detection**
- Compare `updatedAt` timestamp from fetched state against previously stored timestamp
- Store last known state and timestamp as module-level variables
- Only dispatch event when actual state change detected (timestamp differs)

**Custom Event Dispatch**
- Dispatch `gitgammon:statechange` custom event on state changes
- Event detail structure: `{ state, previousState, tableId }`
- Dispatch event on `document` following auth.js pattern

**Public API Functions**
- `startPolling(tableId)`: Begin polling for specific table, perform immediate fetch before starting interval
- `stopPolling()`: Cleanly terminate active polling, clear interval reference
- Multiple startPolling calls must stop existing polling before starting new

**Error Handling with Exponential Backoff**
- Base polling interval: 5000ms (5 seconds)
- On network/HTTP 5xx/parse errors: double interval on each failure
- Maximum retry attempts: 3 before pausing polling
- Maximum backoff interval: 60000ms (60 seconds)
- On HTTP 4xx: stop polling immediately, dispatch error event
- Dispatch `gitgammon:pollerror` event when max retries exceeded

**Memory Management**
- Use single interval reference that gets cleared and reset
- Clear interval on stopPolling() call
- Use AbortController pattern for clean fetch cancellation
- Ensure safe to call startPolling multiple times without leaks

## Existing Code to Leverage

**auth.js pollForToken() (Lines 173-244)**
- Demonstrates interval-based polling pattern with status handling
- Shows how to structure poll results with status codes
- Provides pattern for error handling within polling loop

**auth.js startDeviceFlow() (Lines 480-564)**
- Shows AbortController usage for clean polling cancellation
- Demonstrates while loop with signal.aborted check pattern
- Provides pattern for interval adjustment during polling

**auth.js dispatchAuthEvent() (Lines 114-120)**
- Shows CustomEvent dispatch pattern on document
- Provides structure for event detail payload
- Pattern to follow for gitgammon:statechange event

**board.js loadState() (Lines 506-520)**
- Demonstrates fetch with cache busting query parameter
- Shows basic error handling for state loading
- Pattern for JSON parsing and error logging

**auth.js and board.js Global Exports (Lines 618-625, 569-573)**
- Shows window global object pattern for external module access
- Demonstrates exposing multiple functions via single namespace
- Pattern to follow for window.gitgammonPolling

## Out of Scope
- Modifying board.js or any existing modules
- Page Visibility API optimization for backgrounded tabs
- WebSocket or real-time push alternatives
- Server-sent events implementation
- UI components for polling status display
- Offline support or service worker caching
- Initial state loading (handled by existing board.js init)
- Authentication or token handling for polling requests
- Retry logic beyond the specified 3 attempts
- Polling for multiple tables simultaneously
