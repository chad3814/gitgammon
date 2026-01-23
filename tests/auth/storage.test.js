import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Task Group 1: Token Storage and Validation Core Tests
 * Tests for localStorage operations and authentication state
 */

// Setup DOM before importing auth module
function setupBasicDOM() {
  document.body.innerHTML = `
    <div id="auth-container">
      <div id="auth-unauthenticated" class="auth-view hidden">
        <button class="btn-sign-in">Sign in</button>
      </div>
      <div id="auth-device-code" class="auth-view hidden"></div>
      <div id="auth-authenticated" class="auth-view hidden">
        <button class="btn-logout">Logout</button>
      </div>
      <div id="auth-error" class="auth-view hidden"></div>
    </div>
  `;
}

// Import auth module
let auth;

beforeEach(async () => {
  // Setup DOM before importing module
  setupBasicDOM();
  localStorage.clear();
  vi.clearAllMocks();
  vi.resetModules();
  auth = await import('../../public/js/auth.js');
});

afterEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
});

describe('Token Storage Functions', () => {
  it('saveToken() stores token in localStorage with correct key', () => {
    const testToken = 'gho_test123456789';
    auth.saveToken(testToken);

    expect(localStorage.getItem('gitgammon_token')).toBe(testToken);
  });

  it('getToken() retrieves token from localStorage', () => {
    const testToken = 'gho_test123456789';
    localStorage.setItem('gitgammon_token', testToken);

    const result = auth.getToken();

    expect(result).toBe(testToken);
  });

  it('getToken() returns null when no token exists', () => {
    const result = auth.getToken();

    expect(result).toBeNull();
  });

  it('clearToken() removes token and user data from localStorage', () => {
    localStorage.setItem('gitgammon_token', 'test_token');
    localStorage.setItem('gitgammon_user', '{"login":"testuser"}');

    auth.clearToken();

    expect(localStorage.getItem('gitgammon_token')).toBeNull();
    expect(localStorage.getItem('gitgammon_user')).toBeNull();
  });
});

describe('User Info Storage Functions', () => {
  it('saveUserInfo() stores user object correctly with JSON serialization', () => {
    const userInfo = { login: 'testuser', avatar_url: 'https://example.com/avatar.jpg' };

    auth.saveUserInfo(userInfo);

    expect(localStorage.getItem('gitgammon_user')).toBe(JSON.stringify(userInfo));
  });

  it('getUserInfo() retrieves cached user info with JSON parsing', () => {
    const userInfo = { login: 'testuser', avatar_url: 'https://example.com/avatar.jpg' };
    localStorage.setItem('gitgammon_user', JSON.stringify(userInfo));

    const result = auth.getUserInfo();

    expect(result).toEqual(userInfo);
  });

  it('getUserInfo() returns null when no user info exists', () => {
    const result = auth.getUserInfo();

    expect(result).toBeNull();
  });

  it('getUserInfo() handles invalid JSON gracefully and returns null', () => {
    localStorage.setItem('gitgammon_user', 'invalid-json{');

    const result = auth.getUserInfo();

    expect(result).toBeNull();
  });
});

describe('Authentication State Functions', () => {
  it('isAuthenticated() returns true when token exists', () => {
    localStorage.setItem('gitgammon_token', 'gho_test123');

    const result = auth.isAuthenticated();

    expect(result).toBe(true);
  });

  it('isAuthenticated() returns false when no token exists', () => {
    const result = auth.isAuthenticated();

    expect(result).toBe(false);
  });

  it('getUser() returns cached user info', () => {
    const userInfo = { login: 'testuser', avatar_url: 'https://example.com/avatar.jpg' };
    localStorage.setItem('gitgammon_user', JSON.stringify(userInfo));

    const result = auth.getUser();

    expect(result).toEqual(userInfo);
  });

  it('getUser() returns null when no user info cached', () => {
    const result = auth.getUser();

    expect(result).toBeNull();
  });
});

describe('Auth Change Event', () => {
  it('dispatchAuthEvent() fires custom event with correct payload', () => {
    const eventHandler = vi.fn();
    document.addEventListener('gitgammon:authchange', eventHandler);

    const userInfo = { login: 'testuser', avatar_url: 'https://example.com/avatar.jpg' };
    auth.dispatchAuthEvent(true, userInfo);

    expect(eventHandler).toHaveBeenCalled();
    const event = eventHandler.mock.calls[0][0];
    expect(event.type).toBe('gitgammon:authchange');
    expect(event.detail).toEqual({ authenticated: true, user: userInfo });

    document.removeEventListener('gitgammon:authchange', eventHandler);
  });

  it('dispatchAuthEvent() fires event with authenticated=false on logout', () => {
    const eventHandler = vi.fn();
    document.addEventListener('gitgammon:authchange', eventHandler);

    auth.dispatchAuthEvent(false, null);

    const event = eventHandler.mock.calls[0][0];
    expect(event.detail).toEqual({ authenticated: false, user: null });

    document.removeEventListener('gitgammon:authchange', eventHandler);
  });
});
