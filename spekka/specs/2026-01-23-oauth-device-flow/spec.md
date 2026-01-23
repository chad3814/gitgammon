# Specification: OAuth Device Flow

## Goal
Implement GitHub OAuth Device Flow authentication for GitGammon, enabling players to authenticate and commit moves to the repository without a backend server or exposed secrets.

## User Stories
- As a player, I want to sign in with my GitHub account so that I can submit moves to the game repository
- As a player, I want to see my authentication status so that I know when I can make moves

## Specific Requirements

**Device Code Request**
- POST to `https://github.com/login/device/code` with Client ID and `repo` scope
- Display user code prominently in large, copyable text
- Provide "Copy Code" button with visual feedback on success
- Show verification URL (github.com/login/device) as text
- Provide "Open GitHub" button that opens URL in new tab
- Include "Cancel" option to abort the flow

**Token Polling**
- Begin polling `https://github.com/login/oauth/access_token` after displaying code
- Use interval value returned by GitHub (typically 5 seconds)
- Handle `authorization_pending` by continuing to poll (normal state)
- Handle `slow_down` by adding 5 seconds to polling interval
- Handle `expired_token` by showing "Code expired" message with retry button
- Handle `access_denied` by showing denial message with retry option
- Show polling status indicator ("Waiting for authorization...")

**Token Storage**
- Store access token in localStorage with key `gitgammon_token`
- Optionally store user info (username, avatar_url) with key `gitgammon_user`
- Client ID hardcoded directly in auth.js (public, not a secret)
- Use `Accept: application/json` header for all GitHub API calls

**Token Validation**
- On app load, check localStorage for existing token
- Validate token by calling `GET https://api.github.com/user`
- If valid (200), transition to authenticated state and cache user info
- If invalid (401), clear stored token and show unauthenticated state
- Silent clear on validation failure (no error message, just show sign-in)

**Authenticated State UI**
- Display user's GitHub username
- Display user's avatar (small, circular)
- Show "Logout" button with secondary styling
- Optionally show link to GitHub settings for token revocation

**Logout Functionality**
- Clear `gitgammon_token` from localStorage
- Clear `gitgammon_user` from localStorage
- Return to unauthenticated UI state
- Does not revoke token on GitHub's side (user can do this manually)

**Error Handling**
- Network errors: Show "Connection error" with retry option
- CORS issues: Provide troubleshooting guidance
- All error states include "Try Again" button
- Use consistent error message styling

**Integration API**
- Export `getToken()` function for use by moves.js
- Export `isAuthenticated()` function for UI state checks
- Export `getUser()` function for displaying player info
- Fire custom event `gitgammon:authchange` on authentication state changes

## Existing Code to Leverage

**public/js/board.js**
- Follow vanilla ES6+ JavaScript patterns (no framework dependencies)
- Use similar module organization with section comments
- Follow JSDoc documentation style for function signatures
- Use `window.*` exports for global function exposure

**public/js/board.js loadState() function**
- Reference fetch API usage pattern with async/await
- Use similar error handling with try/catch and console.error
- Follow cache busting pattern for API requests

**public/css/board.css**
- Use CSS custom properties for theming (add auth-specific colors to :root)
- Follow existing responsive breakpoint patterns
- Maintain 44px minimum touch target size for buttons
- Use existing font-family stack and color variables

**public/index.html**
- Add auth UI containers to existing HTML structure
- Follow existing semantic HTML patterns
- Add auth.js script tag after board.js

## Out of Scope
- Move submission logic (separate spec: moves.js)
- Repository/scope selection UI (single repo, hardcoded)
- Token refresh logic (not needed for GitHub OAuth)
- Server-side token exchange (no backend)
- OAuth App creation instructions (documentation task)
- Multiple account support
- "Remember me" options (always remember via localStorage)
- Token revocation via GitHub API
- Session timeout warnings
- Auth state sync across browser tabs
