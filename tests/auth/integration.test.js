import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Task Group 4: Full Flow Integration Tests
 * Tests for complete authentication flow and public API
 */

/**
 * Create mock DOM structure for auth UI
 */
function setupMockDOM() {
  document.body.innerHTML = `
    <div id="auth-container">
      <div id="auth-unauthenticated" class="auth-view hidden">
        <button class="btn-sign-in">Sign in with GitHub</button>
      </div>
      <div id="auth-device-code" class="auth-view hidden">
        <span class="device-code-display"></span>
        <span class="verification-url"></span>
        <span class="polling-status"></span>
        <button class="btn-copy-code">Copy Code</button>
        <button class="btn-open-github">Open GitHub</button>
        <button class="btn-cancel">Cancel</button>
      </div>
      <div id="auth-authenticated" class="auth-view hidden">
        <img class="user-avatar" src="" alt="">
        <span class="user-name"></span>
        <button class="btn-logout">Logout</button>
      </div>
      <div id="auth-error" class="auth-view hidden">
        <span class="error-message"></span>
        <button class="btn-retry">Try Again</button>
      </div>
    </div>
  `;
}

// Mock fetch
const originalFetch = global.fetch;

// Import auth module
let auth;

beforeEach(async () => {
  setupMockDOM();
  localStorage.clear();
  vi.clearAllMocks();
  vi.resetModules();
  vi.useFakeTimers();

  // Mock fetch
  global.fetch = vi.fn();

  // Mock clipboard API
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn(() => Promise.resolve()),
    },
  });

  auth = await import('../../public/js/auth.js');
});

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  global.fetch = originalFetch;
  vi.useRealTimers();
});

describe('Full Device Flow Integration', () => {
  it('complete flow: sign in -> display code -> poll -> authenticate', async () => {
    // Mock device code request
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            device_code: 'device123',
            user_code: 'ABCD-1234',
            verification_uri: 'https://github.com/login/device',
            interval: 5,
            expires_in: 900,
          }),
      })
      // First poll - pending
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            error: 'authorization_pending',
          }),
      })
      // Second poll - success
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'gho_test123',
            token_type: 'bearer',
            scope: 'repo',
          }),
      })
      // Validate token
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            login: 'testuser',
            avatar_url: 'https://example.com/avatar.jpg',
            name: 'Test User',
            id: 12345,
          }),
      });

    // Start the device flow (don't await - it runs in background)
    const flowPromise = auth.startDeviceFlow();

    // Wait for device code request
    await vi.runOnlyPendingTimersAsync();

    // Check device code UI is shown
    expect(document.getElementById('auth-device-code').classList.contains('hidden')).toBe(false);
    expect(document.querySelector('.device-code-display').textContent).toBe('ABCD-1234');

    // Advance timer for first poll
    await vi.advanceTimersByTimeAsync(5000);

    // Advance timer for second poll (success)
    await vi.advanceTimersByTimeAsync(5000);

    // Wait for all promises to resolve
    await flowPromise;

    // Check authenticated UI is shown
    expect(document.getElementById('auth-authenticated').classList.contains('hidden')).toBe(false);
    expect(document.querySelector('.user-name').textContent).toBe('testuser');

    // Check token is saved
    expect(localStorage.getItem('gitgammon_token')).toBe('gho_test123');
  });
});

describe('initAuth() - App Load', () => {
  it('with valid token: validates and shows authenticated UI', async () => {
    // Pre-set token in localStorage
    localStorage.setItem('gitgammon_token', 'gho_valid123');

    // Mock successful validation
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          login: 'existinguser',
          avatar_url: 'https://example.com/existing-avatar.jpg',
          name: 'Existing User',
          id: 54321,
        }),
    });

    await auth.initAuth();

    // Check authenticated UI is shown
    expect(document.getElementById('auth-authenticated').classList.contains('hidden')).toBe(false);
    expect(document.querySelector('.user-name').textContent).toBe('existinguser');

    // Check user info is cached
    expect(localStorage.getItem('gitgammon_user')).toContain('existinguser');
  });

  it('with invalid token: clears storage and shows unauthenticated UI', async () => {
    // Pre-set invalid token in localStorage
    localStorage.setItem('gitgammon_token', 'gho_invalid');
    localStorage.setItem('gitgammon_user', '{"login":"olduser"}');

    // Mock 401 response (invalid token)
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Bad credentials' }),
    });

    await auth.initAuth();

    // Check token is cleared
    expect(localStorage.getItem('gitgammon_token')).toBeNull();
    expect(localStorage.getItem('gitgammon_user')).toBeNull();

    // Check unauthenticated UI is shown
    expect(document.getElementById('auth-unauthenticated').classList.contains('hidden')).toBe(
      false
    );
  });

  it('without token: shows unauthenticated UI without API call', async () => {
    await auth.initAuth();

    // No fetch should be made
    expect(global.fetch).not.toHaveBeenCalled();

    // Check unauthenticated UI is shown
    expect(document.getElementById('auth-unauthenticated').classList.contains('hidden')).toBe(
      false
    );
  });
});

describe('Logout Flow', () => {
  it('clears token and returns to unauthenticated state', async () => {
    // Set up authenticated state
    localStorage.setItem('gitgammon_token', 'gho_test123');
    localStorage.setItem(
      'gitgammon_user',
      JSON.stringify({ login: 'testuser', avatarUrl: 'https://example.com/avatar.jpg' })
    );

    // Show authenticated UI
    auth.showAuthenticatedUI({ login: 'testuser', avatarUrl: 'https://example.com/avatar.jpg' });

    // Perform logout
    auth.handleLogout();

    // Check token is cleared
    expect(localStorage.getItem('gitgammon_token')).toBeNull();
    expect(localStorage.getItem('gitgammon_user')).toBeNull();

    // Check unauthenticated UI is shown
    expect(document.getElementById('auth-unauthenticated').classList.contains('hidden')).toBe(
      false
    );
    expect(document.getElementById('auth-authenticated').classList.contains('hidden')).toBe(true);
  });
});

describe('Public API Exports', () => {
  it('getToken() returns stored token', () => {
    localStorage.setItem('gitgammon_token', 'gho_test123');

    const token = auth.getToken();

    expect(token).toBe('gho_test123');
  });

  it('isAuthenticated() returns true when token exists', () => {
    localStorage.setItem('gitgammon_token', 'gho_test123');

    const result = auth.isAuthenticated();

    expect(result).toBe(true);
  });

  it('isAuthenticated() returns false when no token', () => {
    const result = auth.isAuthenticated();

    expect(result).toBe(false);
  });

  it('getUser() returns cached user info', () => {
    const userInfo = { login: 'testuser', avatarUrl: 'https://example.com/avatar.jpg' };
    localStorage.setItem('gitgammon_user', JSON.stringify(userInfo));

    const result = auth.getUser();

    expect(result).toEqual(userInfo);
  });

  it('getUser() returns null when no user cached', () => {
    const result = auth.getUser();

    expect(result).toBeNull();
  });
});

describe('gitgammon:authchange Event', () => {
  it('fires on successful authentication', async () => {
    const eventHandler = vi.fn();
    document.addEventListener('gitgammon:authchange', eventHandler);

    const user = { login: 'testuser', avatarUrl: 'https://example.com/avatar.jpg' };
    auth.dispatchAuthEvent(true, user);

    expect(eventHandler).toHaveBeenCalled();
    const event = eventHandler.mock.calls[0][0];
    expect(event.detail.authenticated).toBe(true);
    expect(event.detail.user).toEqual(user);

    document.removeEventListener('gitgammon:authchange', eventHandler);
  });

  it('fires on logout', () => {
    const eventHandler = vi.fn();
    document.addEventListener('gitgammon:authchange', eventHandler);

    auth.dispatchAuthEvent(false, null);

    expect(eventHandler).toHaveBeenCalled();
    const event = eventHandler.mock.calls[0][0];
    expect(event.detail.authenticated).toBe(false);
    expect(event.detail.user).toBeNull();

    document.removeEventListener('gitgammon:authchange', eventHandler);
  });

  it('fires on initAuth with existing valid token', async () => {
    const eventHandler = vi.fn();
    document.addEventListener('gitgammon:authchange', eventHandler);

    localStorage.setItem('gitgammon_token', 'gho_valid');

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          login: 'testuser',
          avatar_url: 'https://example.com/avatar.jpg',
          name: 'Test User',
          id: 12345,
        }),
    });

    await auth.initAuth();

    expect(eventHandler).toHaveBeenCalled();
    const event = eventHandler.mock.calls[0][0];
    expect(event.detail.authenticated).toBe(true);

    document.removeEventListener('gitgammon:authchange', eventHandler);
  });

  it('fires on initAuth with no token (unauthenticated)', async () => {
    const eventHandler = vi.fn();
    document.addEventListener('gitgammon:authchange', eventHandler);

    await auth.initAuth();

    expect(eventHandler).toHaveBeenCalled();
    const event = eventHandler.mock.calls[0][0];
    expect(event.detail.authenticated).toBe(false);

    document.removeEventListener('gitgammon:authchange', eventHandler);
  });
});
