import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Task Group 2: Device Flow API Integration Tests
 * Tests for GitHub API functions: requestDeviceCode, pollForToken, validateToken
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

// Mock fetch
const originalFetch = global.fetch;

// Import auth module
let auth;

beforeEach(async () => {
  setupBasicDOM();
  localStorage.clear();
  vi.clearAllMocks();
  vi.resetModules();
  // Setup mock fetch before importing module
  global.fetch = vi.fn();
  auth = await import('../../public/js/auth.js');
});

afterEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
  global.fetch = originalFetch;
});

describe('requestDeviceCode()', () => {
  it('returns device_code, user_code, verification_uri, and interval on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          device_code: 'device123',
          user_code: 'ABCD-1234',
          verification_uri: 'https://github.com/login/device',
          interval: 5,
          expires_in: 900,
        }),
    });

    const result = await auth.requestDeviceCode();

    expect(result.deviceCode).toBe('device123');
    expect(result.userCode).toBe('ABCD-1234');
    expect(result.verificationUri).toBe('https://github.com/login/device');
    expect(result.interval).toBe(5);
    expect(result.expiresIn).toBe(900);
  });

  it('makes POST request with correct headers and body', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          device_code: 'device123',
          user_code: 'ABCD-1234',
          verification_uri: 'https://github.com/login/device',
          interval: 5,
          expires_in: 900,
        }),
    });

    await auth.requestDeviceCode();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://github.com/login/device/code',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      })
    );

    // Check body contains client_id and scope
    const callArgs = global.fetch.mock.calls[0][1];
    const body = JSON.parse(callArgs.body);
    expect(body).toHaveProperty('client_id');
    expect(body.scope).toBe('repo');
  });

  it('throws error with network_error type on fetch failure', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(auth.requestDeviceCode()).rejects.toMatchObject({
      type: 'network_error',
      message: expect.stringContaining('Connection error'),
    });
  });

  it('uses default interval of 5 when not provided', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          device_code: 'device123',
          user_code: 'ABCD-1234',
          verification_uri: 'https://github.com/login/device',
          expires_in: 900,
          // interval not provided
        }),
    });

    const result = await auth.requestDeviceCode();

    expect(result.interval).toBe(5);
  });
});

describe('pollForToken()', () => {
  it('returns success status with token on authorization complete', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'gho_abc123',
          token_type: 'bearer',
          scope: 'repo',
        }),
    });

    const result = await auth.pollForToken('device123', 5);

    expect(result.status).toBe('success');
    expect(result.token).toBe('gho_abc123');
    expect(result.tokenType).toBe('bearer');
    expect(result.scope).toBe('repo');
  });

  it('handles authorization_pending by returning pending status', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          error: 'authorization_pending',
          error_description: 'The authorization request is still pending.',
        }),
    });

    const result = await auth.pollForToken('device123', 5);

    expect(result.status).toBe('authorization_pending');
  });

  it('handles slow_down by returning new interval increased by 5 seconds', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          error: 'slow_down',
          error_description: 'Too many requests.',
        }),
    });

    const result = await auth.pollForToken('device123', 5);

    expect(result.status).toBe('slow_down');
    expect(result.newInterval).toBe(10);
  });

  it('handles expired_token error state', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          error: 'expired_token',
          error_description: 'The device_code has expired.',
        }),
    });

    const result = await auth.pollForToken('device123', 5);

    expect(result.status).toBe('expired_token');
    expect(result.error).toBe('Code expired. Please try again.');
  });

  it('handles access_denied error state', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          error: 'access_denied',
          error_description: 'The user has denied access.',
        }),
    });

    const result = await auth.pollForToken('device123', 5);

    expect(result.status).toBe('access_denied');
    expect(result.error).toBe('Authorization was denied. Please try again.');
  });

  it('handles network errors gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await auth.pollForToken('device123', 5);

    expect(result.status).toBe('error');
    expect(result.error).toContain('Connection error');
  });

  it('makes POST request with correct body structure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          error: 'authorization_pending',
        }),
    });

    await auth.pollForToken('device123', 5);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://github.com/login/oauth/access_token',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      })
    );

    const callArgs = global.fetch.mock.calls[0][1];
    const body = JSON.parse(callArgs.body);
    expect(body.device_code).toBe('device123');
    expect(body.grant_type).toBe('urn:ietf:params:oauth:grant-type:device_code');
  });
});

describe('validateToken()', () => {
  it('returns user object on 200 response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          login: 'testuser',
          avatar_url: 'https://avatars.githubusercontent.com/u/12345',
          name: 'Test User',
          id: 12345,
        }),
    });

    const result = await auth.validateToken('gho_test123');

    expect(result).toEqual({
      login: 'testuser',
      avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
      name: 'Test User',
      id: 12345,
    });
  });

  it('returns null on 401 response (invalid token)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Bad credentials' }),
    });

    const result = await auth.validateToken('invalid_token');

    expect(result).toBeNull();
  });

  it('makes GET request with Bearer token header', async () => {
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

    await auth.validateToken('gho_test123');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/user',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
          Authorization: 'Bearer gho_test123',
        }),
      })
    );
  });

  it('returns null on network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await auth.validateToken('gho_test123');

    expect(result).toBeNull();
  });

  it('returns null on non-200, non-401 error responses', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await auth.validateToken('gho_test123');

    expect(result).toBeNull();
  });
});
