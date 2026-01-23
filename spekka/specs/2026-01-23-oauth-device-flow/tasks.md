# Task Breakdown: OAuth Device Flow

## Overview
Total Tasks: 21 (across 4 task groups)

This spec implements GitHub OAuth Device Flow authentication for GitGammon, enabling players to authenticate and commit moves to the repository without a backend server or exposed secrets. Creates `public/js/auth.js` with device code request, token polling, storage, and validation.

## Task List

### Foundation Layer

#### Task Group 1: Token Storage and Validation Core
**Dependencies:** None

- [x] 1.0 Complete token storage and validation foundation
  - [x] 1.1 Write 4-6 focused tests for token storage and validation
    - Test `saveToken(token)` stores token in localStorage with correct key
    - Test `getToken()` retrieves token from localStorage
    - Test `clearToken()` removes token and user data from localStorage
    - Test `saveUserInfo(user)` stores user object correctly
    - Test `getUserInfo()` retrieves cached user info
    - Test `isAuthenticated()` returns correct boolean based on token presence
  - [x] 1.2 Create `public/js/auth.js` with module structure
    - Add section comments following board.js pattern
    - Define constants: `TOKEN_KEY = 'gitgammon_token'`, `USER_KEY = 'gitgammon_user'`
    - Add placeholder Client ID constant (to be replaced with actual ID)
    - Use JSDoc documentation style for function signatures
  - [x] 1.3 Implement localStorage wrapper functions
    - Implement `saveToken(token)` storing to localStorage
    - Implement `getToken()` retrieving from localStorage
    - Implement `clearToken()` removing token and user keys
    - Implement `saveUserInfo(user)` with JSON serialization
    - Implement `getUserInfo()` with JSON parsing and error handling
  - [x] 1.4 Implement authentication state functions
    - Implement `isAuthenticated()` checking token presence
    - Implement `getUser()` returning cached user info or null
    - Implement `dispatchAuthEvent(authenticated)` firing custom event
    - Event name: `gitgammon:authchange` with detail `{ authenticated, user }`
  - [x] 1.5 Ensure foundation tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify localStorage operations work correctly

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- Token storage uses correct localStorage keys
- Auth state functions return accurate boolean values
- Custom event fires with correct payload structure

---

### API Layer

#### Task Group 2: Device Flow API Integration
**Dependencies:** Task Group 1

- [x] 2.0 Complete GitHub API integration
  - [x] 2.1 Write 4-6 focused tests for API functions
    - Test `requestDeviceCode()` returns device_code, user_code, verification_uri, interval
    - Test `pollForToken()` handles `authorization_pending` by continuing
    - Test `pollForToken()` handles `slow_down` by increasing interval
    - Test `pollForToken()` handles `expired_token` error state
    - Test `pollForToken()` handles `access_denied` error state
    - Test `validateToken(token)` returns user object on success
  - [x] 2.2 Implement device code request
    - Implement `requestDeviceCode()` async function
    - POST to `https://github.com/login/device/code`
    - Include Client ID and `repo` scope in body
    - Set `Accept: application/json` header
    - Return parsed response with device_code, user_code, verification_uri, interval, expires_in
    - Handle network errors with descriptive error object
  - [x] 2.3 Implement token polling
    - Implement `pollForToken(deviceCode, interval)` async function
    - POST to `https://github.com/login/oauth/access_token`
    - Include device_code, client_id, grant_type in body
    - Set `Accept: application/json` header
    - Return object with `status` and optional `token` or `error`
    - Handle all GitHub error codes: authorization_pending, slow_down, expired_token, access_denied
  - [x] 2.4 Implement token validation
    - Implement `validateToken(token)` async function
    - GET `https://api.github.com/user` with Bearer token
    - Return user object on 200 response
    - Return null on 401 (invalid token)
    - Handle network errors gracefully
  - [x] 2.5 Ensure API integration tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Verify all API functions handle errors correctly

**Acceptance Criteria:**
- The 4-6 tests written in 2.1 pass
- Device code request includes correct scope and headers
- Polling handles all GitHub-defined error states
- Token validation correctly identifies valid/invalid tokens

---

### UI Layer

#### Task Group 3: Authentication UI Components
**Dependencies:** Task Groups 1 and 2

- [x] 3.0 Complete authentication UI
  - [x] 3.1 Write 4-6 focused tests for UI state management
    - Test `showUnauthenticatedUI()` displays sign-in button
    - Test `showDeviceCodeUI(data)` displays user code and copy button
    - Test `showAuthenticatedUI(user)` displays username and avatar
    - Test `showErrorUI(message)` displays error with retry button
    - Test copy button copies code to clipboard
    - Test polling status indicator shows during auth flow
  - [x] 3.2 Add HTML structure to index.html
    - Add auth container element in appropriate location
    - Include unauthenticated view: sign-in button with explanation
    - Include device code view: code display, copy button, open GitHub button, cancel button
    - Include authenticated view: avatar, username, logout button
    - Include error view: message text, retry button
    - Add auth.js script tag after board.js
  - [x] 3.3 Add CSS styles to auth.css
    - Add auth-specific CSS custom properties to :root
    - Style sign-in button (primary action, 44px min touch target)
    - Style device code display (large, prominent, monospace)
    - Style copy button with success feedback state
    - Style authenticated view with circular avatar
    - Style error states with consistent error message styling
    - Add responsive styles following existing breakpoints
  - [x] 3.4 Implement UI state functions
    - Implement `showUnauthenticatedUI()` showing sign-in button
    - Implement `showDeviceCodeUI(data)` showing code and buttons
    - Implement `showAuthenticatedUI(user)` showing avatar and username
    - Implement `showErrorUI(message, onRetry)` with retry callback
    - Implement `showPollingStatus(message)` for status indicator
    - Implement `hideAllAuthViews()` helper function
  - [x] 3.5 Implement button handlers
    - Implement sign-in button click handler starting device flow
    - Implement copy button with clipboard API and visual feedback
    - Implement "Open GitHub" button opening verification_uri in new tab
    - Implement cancel button aborting flow and returning to unauthenticated
    - Implement logout button clearing token and resetting UI
    - Implement retry button restarting device flow
  - [x] 3.6 Ensure UI tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify all UI states render correctly

**Acceptance Criteria:**
- The 4-6 tests written in 3.1 pass
- All UI states (unauthenticated, device code, authenticated, error) render correctly
- Buttons have proper click handlers and provide feedback
- UI follows responsive design patterns from board.css

---

### Integration Layer

#### Task Group 4: Full Flow Integration and Public API
**Dependencies:** Task Groups 1, 2, and 3

- [x] 4.0 Complete integration and public API
  - [x] 4.1 Write 4-6 focused tests for full flow integration
    - Test full device flow: sign in -> display code -> poll -> authenticate
    - Test app load with valid token validates and shows authenticated UI
    - Test app load with invalid token clears storage and shows unauthenticated UI
    - Test logout clears token and returns to unauthenticated state
    - Test `getToken()`, `isAuthenticated()`, `getUser()` exports work correctly
    - Test `gitgammon:authchange` event fires on state changes
  - [x] 4.2 Implement main authentication orchestrator
    - Implement `startDeviceFlow()` async function
      - Call requestDeviceCode()
      - Display device code UI
      - Start polling loop with proper interval handling
      - Handle slow_down by increasing interval
      - On success, save token and user, show authenticated UI
      - On expiration or denial, show appropriate error UI
    - Implement `initAuth()` function for app load
      - Check for existing token
      - Validate token via API
      - Show authenticated or unauthenticated UI based on result
      - Fire authchange event with initial state
  - [x] 4.3 Implement public API exports
    - Export `getToken()` for moves.js integration
    - Export `isAuthenticated()` for UI state checks
    - Export `getUser()` for displaying player info
    - Export `initAuth()` for app initialization
    - Use `window.*` pattern matching board.js exports
  - [x] 4.4 Wire up initialization
    - Call `initAuth()` on DOMContentLoaded
    - Ensure auth state is validated before game interaction
    - Handle race conditions with board initialization
  - [x] 4.5 Ensure integration tests pass
    - Run ONLY tests in `tests/auth/`
    - Verify full flow works end-to-end

**Acceptance Criteria:**
- The 4-6 tests written in 4.1 pass
- Full device flow works from sign-in to authenticated state
- App load validates existing tokens correctly
- Public API functions accessible for moves.js integration
- Auth state changes fire custom events

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Foundation Layer**
   - Token storage and authentication state
   - localStorage operations
   - No external API dependencies

2. **Task Group 2: API Layer**
   - GitHub API integration
   - Device code request, polling, validation
   - Depends on storage functions from Group 1

3. **Task Group 3: UI Layer**
   - HTML structure and CSS styles
   - UI state management functions
   - Button handlers and user feedback
   - Depends on API functions from Group 2

4. **Task Group 4: Integration Layer**
   - Full flow orchestration
   - Public API exports
   - App initialization
   - Depends on all previous groups

## File Structure

After completion, auth-related files:

```
public/
  js/
    auth.js               # OAuth Device Flow implementation
  css/
    auth.css              # Auth-specific styles
  index.html              # Add auth UI containers

tests/
  auth/
    storage.test.js       # Token storage tests
    device-flow.test.js   # API integration tests
    ui.test.js            # UI component tests
    integration.test.js   # Full flow tests
```

## Notes

- Client ID is public and hardcoded directly in auth.js
- Token stored in localStorage (acceptable for this client-side game)
- No token refresh needed (GitHub OAuth tokens don't expire automatically)
- No server-side component - all operations are client-side
- Integration with moves.js via exported getToken() function
- Custom event `gitgammon:authchange` enables reactive UI updates
- CORS is supported by GitHub's device flow endpoints
- Polling interval respects GitHub's rate limiting requirements
- All GitHub API calls use `Accept: application/json` header
