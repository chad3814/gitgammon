# Spec Requirements: OAuth Device Flow

## Initial Description

OAuth Device Flow - Implement authentication using GitHub's Device Flow: request device code, poll for token, store access token locally. Only Client ID needed - no secrets.

This is Roadmap item #7 from the GitGammon project, part of Phase 1 (Core MVP). The OAuth Device Flow enables players to authenticate and commit moves to the repository without requiring a backend server or exposing client secrets.

## Requirements Discussion

### First Round Questions

**Q1:** For token storage, should we use localStorage for simplicity (suitable for a client-side game on GitHub Pages), or implement a more secure storage mechanism?
**Answer:** Use localStorage for simplicity. This is a casual game running entirely client-side on GitHub Pages. The token only grants access to commit moves, and users can revoke access anytime via GitHub settings. The simplicity benefit outweighs the theoretical security concerns for this use case.

**Q2:** How should we handle token refresh? GitHub device flow tokens typically have long lifespans, but should we implement refresh logic?
**Answer:** GitHub personal access tokens and OAuth tokens from device flow do not expire automatically for most use cases. However, tokens can be revoked by the user or become invalid. Handle token invalidation gracefully by detecting 401 responses and prompting re-authentication rather than implementing refresh logic.

**Q3:** Where should the Client ID be stored? Should it be in a config file, environment variable, or hardcoded?
**Answer:** Hardcode the Client ID directly in the auth.js file. The Client ID is public by design (it's not a secret), and this is a static site without build-time environment variable injection. Keep it simple.

**Q4:** What OAuth scopes are required for GitGammon's functionality?
**Answer:** Request the `repo` scope. This is required to push move files (JSON) to the repository. The `repo` scope is broad but necessary since GitHub doesn't offer more granular push-only permissions for specific directories.

**Q5:** What should the authentication UI flow look like from the user's perspective?
**Answer:** Display the device code prominently with a "Copy Code" button, show the verification URL (github.com/login/device), and provide a button to open GitHub in a new tab. While the user authenticates in the other tab, show a polling status indicator. On success, show a brief success message and transition to the authenticated state. On failure, show a clear error message with retry option.

**Q6:** What error states need to be handled during the device flow?
**Answer:** Handle these error conditions:
- `authorization_pending`: Continue polling (normal state while user hasn't completed auth)
- `slow_down`: Increase polling interval by 5 seconds (GitHub rate limiting)
- `expired_token`: Device code expired (15 minutes) - restart the flow
- `access_denied`: User denied authorization - show message, offer retry
- Network errors: Show connectivity message, allow retry
- CORS issues: Provide troubleshooting guidance

**Q7:** Should we validate the stored token on app load, and how?
**Answer:** Yes, validate on app load by making a lightweight API call (GET /user) to verify the token is still valid. If the call returns 401 or fails, clear the stored token and show the unauthenticated state. This prevents users from discovering their token is invalid only when they try to make a move.

**Q8:** What logout functionality is needed?
**Answer:** Provide a logout button in the authenticated UI. On logout, clear the token from localStorage and return to the unauthenticated state. Note: this does not revoke the token on GitHub's side - users who want full revocation can do so in their GitHub settings (link to this in the UI is a nice-to-have).

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Board Rendering - Path: `/Users/cwalker/Projects/gitgammon/public/js/board.js`
  - Contains existing JavaScript patterns used in the project
  - Uses vanilla ES6+ JavaScript
  - No framework dependencies

**Tech Stack Patterns:**
- Token storage: localStorage (as specified in tech-stack.md)
- JavaScript: Vanilla ES6+ with no framework overhead
- File location: `public/js/auth.js` (as specified in repository structure)

### Follow-up Questions

No additional follow-up questions required. The OAuth Device Flow is well-documented by GitHub, and the implementation patterns are standard.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - Standard OAuth Device Flow UI patterns will be followed based on GitHub's documentation and common implementation practices.

## Requirements Summary

### Functional Requirements

**Authentication Initiation**
- Display a "Sign in with GitHub" button when user is not authenticated
- On click, request a device code from GitHub's device authorization endpoint
- Display the user code prominently (large, copyable text)
- Provide "Copy Code" button for easy clipboard access
- Show the verification URL (github.com/login/device)
- Provide "Open GitHub" button that opens the URL in a new tab

**Token Polling**
- Begin polling GitHub's token endpoint after displaying the code
- Use the `interval` value returned by GitHub (typically 5 seconds)
- Handle `slow_down` response by adding 5 seconds to interval
- Continue polling until success, expiration, or denial
- Show polling status to user ("Waiting for authorization...")

**Token Storage**
- On successful authorization, store the access token in localStorage
- Store with a consistent key (e.g., `gitgammon_token`)
- Optionally store basic user info (username, avatar) for display

**Token Validation**
- On app load, check localStorage for existing token
- If token exists, validate by calling GitHub API (GET /user)
- If valid, transition to authenticated state and display user info
- If invalid (401), clear token and show unauthenticated state

**Authenticated State**
- Display user's GitHub username and avatar
- Show "Logout" button
- Enable move submission functionality (integration point for moves.js)

**Logout**
- Clear token from localStorage
- Clear any cached user info
- Return to unauthenticated UI state
- Optionally show link to GitHub settings for full token revocation

**Error Handling**
- Expired code: Show "Code expired" message with "Try Again" button
- Access denied: Show "Authorization denied" message with "Try Again" button
- Network error: Show "Connection error" with retry option
- Invalid token on load: Silent clear and show sign-in option

### Technical Requirements

**API Endpoints**
- Device code request: `POST https://github.com/login/device/code`
- Token polling: `POST https://github.com/login/oauth/access_token`
- User validation: `GET https://api.github.com/user`

**Request Headers**
- Accept: `application/json` for all GitHub API calls
- Authorization: `Bearer {token}` for authenticated requests
- Content-Type: `application/json` for POST requests

**OAuth Configuration**
- Client ID: Hardcoded in auth.js
- Scope: `repo`
- Grant type: `urn:ietf:params:oauth:grant-type:device_code`

**localStorage Keys**
- `gitgammon_token`: The OAuth access token
- `gitgammon_user`: Cached user info (username, avatar_url) - optional

### UI Components

**Unauthenticated View**
- "Sign in with GitHub" button (primary action)
- Brief explanation of why authentication is needed

**Device Code View**
- Large, prominent user code display
- "Copy Code" button with feedback
- Verification URL text
- "Open GitHub" button (opens new tab)
- Status indicator ("Waiting for authorization...")
- Cancel option to abort the flow

**Authenticated View**
- User avatar (small, circular)
- Username display
- "Logout" button (secondary styling)

**Error States**
- Error message text
- "Try Again" button
- Optional help link for troubleshooting

### Reusability Opportunities

**Existing Patterns to Follow:**
- JavaScript patterns from board.js (vanilla ES6+, no framework)
- Fetch API usage patterns (already used for state.json loading)
- Error handling patterns for network requests

**Components for Future Reuse:**
- Token management utilities can be reused by moves.js for authenticated commits
- User info display component can be reused in player profiles (roadmap item #18)

### Scope Boundaries

**In Scope:**
- Device code request and display
- Token polling with proper error handling
- Token storage in localStorage
- Token validation on app load
- Basic authenticated/unauthenticated UI states
- Logout functionality
- Integration hook for move submission (export token getter function)

**Out of Scope:**
- Move submission logic (separate spec: moves.js)
- Repository/scope selection UI (single repo, hardcoded)
- Token refresh logic (not needed for GitHub OAuth)
- Server-side token exchange (no backend)
- OAuth App creation instructions (documentation task)
- Multiple account support
- "Remember me" options (always remember via localStorage)

**Future Enhancements (Not This Spec):**
- Token revocation via GitHub API
- Session timeout warnings
- Re-authentication prompts before token expiration
- Auth state sync across tabs

### Technical Considerations

**CORS Requirements**
- GitHub's device flow endpoints support CORS for client-side requests
- Ensure Accept header is set to `application/json`

**Rate Limiting**
- Respect GitHub's polling interval (typically 5 seconds)
- Handle `slow_down` response by increasing interval
- Token validation on load counts against rate limit (5000/hr authenticated)

**Security Notes**
- Client ID is public and safe to expose in client code
- Token stored in localStorage is accessible to XSS attacks (acceptable risk for this app)
- Token grants repo access - users should understand this scope
- No sensitive secrets in client code

**Integration Points**
- Export `getToken()` function for use by moves.js
- Export `isAuthenticated()` function for UI state checks
- Export `getUser()` function for displaying player info
- Fire custom event on auth state change for UI updates

**File Location**
- Implementation: `/Users/cwalker/Projects/gitgammon/public/js/auth.js`
- Tests: `/Users/cwalker/Projects/gitgammon/tests/auth.test.js`
