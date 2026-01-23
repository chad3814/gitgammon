import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Task Group 3: UI Component Tests
 * Tests for UI state management and button handlers
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
});

describe('hideAllAuthViews()', () => {
  it('adds hidden class to all auth views', () => {
    // Remove hidden class first
    document.getElementById('auth-unauthenticated').classList.remove('hidden');
    document.getElementById('auth-device-code').classList.remove('hidden');
    document.getElementById('auth-authenticated').classList.remove('hidden');
    document.getElementById('auth-error').classList.remove('hidden');

    auth.hideAllAuthViews();

    expect(document.getElementById('auth-unauthenticated').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('auth-device-code').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('auth-authenticated').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('auth-error').classList.contains('hidden')).toBe(true);
  });
});

describe('showUnauthenticatedUI()', () => {
  it('displays sign-in button and hides other views', () => {
    // Show another view first
    document.getElementById('auth-authenticated').classList.remove('hidden');

    auth.showUnauthenticatedUI();

    expect(document.getElementById('auth-unauthenticated').classList.contains('hidden')).toBe(
      false
    );
    expect(document.getElementById('auth-authenticated').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('auth-device-code').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('auth-error').classList.contains('hidden')).toBe(true);
  });
});

describe('showDeviceCodeUI()', () => {
  it('displays user code and verification URL', () => {
    const data = {
      userCode: 'ABCD-1234',
      verificationUri: 'https://github.com/login/device',
    };

    auth.showDeviceCodeUI(data);

    const view = document.getElementById('auth-device-code');
    expect(view.classList.contains('hidden')).toBe(false);
    expect(view.querySelector('.device-code-display').textContent).toBe('ABCD-1234');
    expect(view.querySelector('.verification-url').textContent).toBe(
      'https://github.com/login/device'
    );
  });

  it('hides other views when shown', () => {
    document.getElementById('auth-unauthenticated').classList.remove('hidden');

    auth.showDeviceCodeUI({ userCode: 'TEST', verificationUri: 'https://github.com' });

    expect(document.getElementById('auth-unauthenticated').classList.contains('hidden')).toBe(true);
  });

  it('sets up Open GitHub button to open verification URL', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    const data = {
      userCode: 'ABCD-1234',
      verificationUri: 'https://github.com/login/device',
    };

    auth.showDeviceCodeUI(data);

    const openButton = document.querySelector('.btn-open-github');
    openButton.click();

    expect(windowOpenSpy).toHaveBeenCalledWith('https://github.com/login/device', '_blank');

    windowOpenSpy.mockRestore();
  });
});

describe('showAuthenticatedUI()', () => {
  it('displays username and avatar', () => {
    const user = {
      login: 'testuser',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    auth.showAuthenticatedUI(user);

    const view = document.getElementById('auth-authenticated');
    expect(view.classList.contains('hidden')).toBe(false);
    expect(view.querySelector('.user-name').textContent).toBe('testuser');
    expect(view.querySelector('.user-avatar').src).toBe('https://example.com/avatar.jpg');
    expect(view.querySelector('.user-avatar').alt).toBe("testuser's avatar");
  });

  it('hides other views when shown', () => {
    document.getElementById('auth-unauthenticated').classList.remove('hidden');

    auth.showAuthenticatedUI({ login: 'test', avatarUrl: 'https://example.com/a.jpg' });

    expect(document.getElementById('auth-unauthenticated').classList.contains('hidden')).toBe(true);
  });
});

describe('showErrorUI()', () => {
  it('displays error message with retry button', () => {
    const onRetry = vi.fn();

    auth.showErrorUI('Code expired. Please try again.', onRetry);

    const view = document.getElementById('auth-error');
    expect(view.classList.contains('hidden')).toBe(false);
    expect(view.querySelector('.error-message').textContent).toBe(
      'Code expired. Please try again.'
    );
  });

  it('calls onRetry callback when retry button clicked', () => {
    const onRetry = vi.fn();

    auth.showErrorUI('Error message', onRetry);

    const retryButton = document.querySelector('.btn-retry');
    retryButton.click();

    expect(onRetry).toHaveBeenCalled();
  });

  it('hides other views when shown', () => {
    document.getElementById('auth-authenticated').classList.remove('hidden');

    auth.showErrorUI('Error', () => {});

    expect(document.getElementById('auth-authenticated').classList.contains('hidden')).toBe(true);
  });
});

describe('showPollingStatus()', () => {
  it('updates polling status indicator in device code view', () => {
    // First show device code view
    auth.showDeviceCodeUI({ userCode: 'TEST', verificationUri: 'https://github.com' });

    auth.showPollingStatus('Waiting for authorization...');

    const status = document.querySelector('.polling-status');
    expect(status.textContent).toBe('Waiting for authorization...');
  });

  it('updates status message dynamically', () => {
    auth.showDeviceCodeUI({ userCode: 'TEST', verificationUri: 'https://github.com' });

    auth.showPollingStatus('First status');
    expect(document.querySelector('.polling-status').textContent).toBe('First status');

    auth.showPollingStatus('Second status');
    expect(document.querySelector('.polling-status').textContent).toBe('Second status');
  });
});

describe('handleCopyCode()', () => {
  it('copies code to clipboard', async () => {
    auth.showDeviceCodeUI({ userCode: 'ABCD-1234', verificationUri: 'https://github.com' });

    const result = await auth.handleCopyCode('ABCD-1234');

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ABCD-1234');
    expect(result).toBe(true);
  });

  it('provides visual feedback on success', async () => {
    auth.showDeviceCodeUI({ userCode: 'ABCD-1234', verificationUri: 'https://github.com' });

    await auth.handleCopyCode('ABCD-1234');

    const copyButton = document.querySelector('.btn-copy-code');
    expect(copyButton.textContent).toBe('Copied!');
    expect(copyButton.classList.contains('copied')).toBe(true);
  });

  it('returns false on clipboard error', async () => {
    navigator.clipboard.writeText = vi.fn(() => Promise.reject(new Error('Clipboard error')));

    const result = await auth.handleCopyCode('ABCD-1234');

    expect(result).toBe(false);
  });
});

describe('handleCancel()', () => {
  it('returns to unauthenticated UI', () => {
    auth.showDeviceCodeUI({ userCode: 'TEST', verificationUri: 'https://github.com' });

    auth.handleCancel();

    expect(document.getElementById('auth-unauthenticated').classList.contains('hidden')).toBe(
      false
    );
    expect(document.getElementById('auth-device-code').classList.contains('hidden')).toBe(true);
  });
});

describe('handleLogout()', () => {
  it('clears token and shows unauthenticated UI', () => {
    localStorage.setItem('gitgammon_token', 'test_token');
    localStorage.setItem('gitgammon_user', '{"login":"test"}');

    auth.handleLogout();

    expect(localStorage.getItem('gitgammon_token')).toBeNull();
    expect(localStorage.getItem('gitgammon_user')).toBeNull();
    expect(document.getElementById('auth-unauthenticated').classList.contains('hidden')).toBe(
      false
    );
  });

  it('dispatches authchange event with authenticated=false', () => {
    const eventHandler = vi.fn();
    document.addEventListener('gitgammon:authchange', eventHandler);

    auth.handleLogout();

    expect(eventHandler).toHaveBeenCalled();
    expect(eventHandler.mock.calls[0][0].detail.authenticated).toBe(false);

    document.removeEventListener('gitgammon:authchange', eventHandler);
  });
});
