/**
 * GitGammon OAuth Device Flow Authentication
 * GitHub OAuth Device Flow implementation for client-side authentication
 * @module auth
 */

// ============================================
// Configuration Constants
// ============================================

/** OAuth Client ID (public, not a secret) */
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE'; // Replace with actual GitHub OAuth App Client ID

/** OAuth scope required for repository access */
const OAUTH_SCOPE = 'repo';

/** localStorage keys */
const TOKEN_KEY = 'gitgammon_token';
const USER_KEY = 'gitgammon_user';

/** GitHub API endpoints */
const DEVICE_CODE_URL = 'https://github.com/login/device/code';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';
const USER_API_URL = 'https://api.github.com/user';

/** Polling status codes */
const POLL_STATUS = {
  PENDING: 'authorization_pending',
  SLOW_DOWN: 'slow_down',
  EXPIRED: 'expired_token',
  DENIED: 'access_denied',
  SUCCESS: 'success',
  ERROR: 'error',
};

// ============================================
// Token Storage Functions
// ============================================

/**
 * Save OAuth access token to localStorage
 * @param {string} token - The OAuth access token
 */
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Retrieve OAuth access token from localStorage
 * @returns {string|null} The stored token or null if not found
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Clear token and user data from localStorage
 */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Save user info to localStorage with JSON serialization
 * @param {Object} user - User object with login, avatar_url, etc.
 */
export function saveUserInfo(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Retrieve cached user info from localStorage
 * @returns {Object|null} User object or null if not found/invalid
 */
export function getUserInfo() {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) {
    return null;
  }

  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Failed to parse user info from localStorage:', error);
    return null;
  }
}

// ============================================
// Authentication State Functions
// ============================================

/**
 * Check if user is currently authenticated
 * @returns {boolean} True if token exists in localStorage
 */
export function isAuthenticated() {
  return getToken() !== null;
}

/**
 * Get cached user information
 * @returns {Object|null} User object or null
 */
export function getUser() {
  return getUserInfo();
}

/**
 * Dispatch custom auth change event
 * @param {boolean} authenticated - Whether user is authenticated
 * @param {Object|null} user - User info object or null
 */
export function dispatchAuthEvent(authenticated, user = null) {
  const event = new CustomEvent('gitgammon:authchange', {
    detail: { authenticated, user },
  });
  document.dispatchEvent(event);
}

// ============================================
// GitHub API Functions
// ============================================

/**
 * Request device code from GitHub
 * @returns {Promise<Object>} Device code response with user_code, verification_uri, etc.
 * @throws {Error} On network or API error
 */
export async function requestDeviceCode() {
  try {
    const response = await fetch(DEVICE_CODE_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        scope: OAUTH_SCOPE,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      deviceCode: data.device_code,
      userCode: data.user_code,
      verificationUri: data.verification_uri,
      interval: data.interval || 5,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error('Failed to request device code:', error);
    throw {
      type: 'network_error',
      message: 'Connection error. Please check your internet connection.',
      originalError: error,
    };
  }
}

/**
 * Poll GitHub for access token
 * @param {string} deviceCode - Device code from requestDeviceCode()
 * @param {number} interval - Polling interval in seconds
 * @returns {Promise<Object>} Poll result with status and optional token
 */
export async function pollForToken(deviceCode, interval) {
  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    const data = await response.json();

    // Check for error responses
    if (data.error) {
      switch (data.error) {
        case 'authorization_pending':
          return { status: POLL_STATUS.PENDING };

        case 'slow_down':
          return {
            status: POLL_STATUS.SLOW_DOWN,
            newInterval: interval + 5,
          };

        case 'expired_token':
          return {
            status: POLL_STATUS.EXPIRED,
            error: 'Code expired. Please try again.',
          };

        case 'access_denied':
          return {
            status: POLL_STATUS.DENIED,
            error: 'Authorization was denied. Please try again.',
          };

        default:
          return {
            status: POLL_STATUS.ERROR,
            error: data.error_description || 'Unknown error occurred.',
          };
      }
    }

    // Success - we have a token
    if (data.access_token) {
      return {
        status: POLL_STATUS.SUCCESS,
        token: data.access_token,
        tokenType: data.token_type,
        scope: data.scope,
      };
    }

    // Unexpected response
    return {
      status: POLL_STATUS.ERROR,
      error: 'Unexpected response from GitHub.',
    };
  } catch (error) {
    console.error('Failed to poll for token:', error);
    return {
      status: POLL_STATUS.ERROR,
      error: 'Connection error. Please check your internet connection.',
    };
  }
}

/**
 * Validate an access token by fetching user info
 * @param {string} token - OAuth access token to validate
 * @returns {Promise<Object|null>} User object if valid, null if invalid
 */
export async function validateToken(token) {
  try {
    const response = await fetch(USER_API_URL, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const user = await response.json();
    return {
      login: user.login,
      avatarUrl: user.avatar_url,
      name: user.name,
      id: user.id,
    };
  } catch (error) {
    console.error('Failed to validate token:', error);
    return null;
  }
}

// ============================================
// UI State Management
// ============================================

/** UI view IDs */
const VIEW_IDS = {
  AUTH_CONTAINER: 'auth-container',
  UNAUTHENTICATED: 'auth-unauthenticated',
  DEVICE_CODE: 'auth-device-code',
  AUTHENTICATED: 'auth-authenticated',
  ERROR: 'auth-error',
};

/**
 * Hide all auth views
 */
export function hideAllAuthViews() {
  const views = [
    VIEW_IDS.UNAUTHENTICATED,
    VIEW_IDS.DEVICE_CODE,
    VIEW_IDS.AUTHENTICATED,
    VIEW_IDS.ERROR,
  ];

  views.forEach((viewId) => {
    const view = document.getElementById(viewId);
    if (view) {
      view.classList.add('hidden');
    }
  });
}

/**
 * Show the unauthenticated view with sign-in button
 */
export function showUnauthenticatedUI() {
  hideAllAuthViews();
  const view = document.getElementById(VIEW_IDS.UNAUTHENTICATED);
  if (view) {
    view.classList.remove('hidden');
  }
}

/**
 * Show the device code view during authentication flow
 * @param {Object} data - Device code data with userCode, verificationUri
 */
export function showDeviceCodeUI(data) {
  hideAllAuthViews();
  const view = document.getElementById(VIEW_IDS.DEVICE_CODE);
  if (!view) return;

  view.classList.remove('hidden');

  // Update user code display
  const codeDisplay = view.querySelector('.device-code-display');
  if (codeDisplay) {
    codeDisplay.textContent = data.userCode;
  }

  // Update verification URL
  const urlDisplay = view.querySelector('.verification-url');
  if (urlDisplay) {
    urlDisplay.textContent = data.verificationUri;
  }

  // Set up Open GitHub button
  const openButton = view.querySelector('.btn-open-github');
  if (openButton) {
    openButton.onclick = () => window.open(data.verificationUri, '_blank');
  }
}

/**
 * Show the authenticated view with user info
 * @param {Object} user - User object with login, avatarUrl
 */
export function showAuthenticatedUI(user) {
  hideAllAuthViews();
  const view = document.getElementById(VIEW_IDS.AUTHENTICATED);
  if (!view) return;

  view.classList.remove('hidden');

  // Update avatar
  const avatar = view.querySelector('.user-avatar');
  if (avatar && user.avatarUrl) {
    avatar.src = user.avatarUrl;
    avatar.alt = `${user.login}'s avatar`;
  }

  // Update username
  const username = view.querySelector('.user-name');
  if (username) {
    username.textContent = user.login;
  }
}

/**
 * Show error view with message and retry option
 * @param {string} message - Error message to display
 * @param {Function} onRetry - Callback when retry button clicked
 */
export function showErrorUI(message, onRetry) {
  hideAllAuthViews();
  const view = document.getElementById(VIEW_IDS.ERROR);
  if (!view) return;

  view.classList.remove('hidden');

  // Update error message
  const messageEl = view.querySelector('.error-message');
  if (messageEl) {
    messageEl.textContent = message;
  }

  // Set up retry button
  const retryButton = view.querySelector('.btn-retry');
  if (retryButton && onRetry) {
    retryButton.onclick = onRetry;
  }
}

/**
 * Update polling status message
 * @param {string} message - Status message to display
 */
export function showPollingStatus(message) {
  const view = document.getElementById(VIEW_IDS.DEVICE_CODE);
  if (!view) return;

  const status = view.querySelector('.polling-status');
  if (status) {
    status.textContent = message;
  }
}

// ============================================
// Button Handlers
// ============================================

/** Current polling state */
let pollingController = null;

/**
 * Handle copy code button click
 * @param {string} code - The code to copy
 */
export async function handleCopyCode(code) {
  try {
    await navigator.clipboard.writeText(code);

    // Visual feedback
    const copyButton = document.querySelector('.btn-copy-code');
    if (copyButton) {
      const originalText = copyButton.textContent;
      copyButton.textContent = 'Copied!';
      copyButton.classList.add('copied');

      setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.classList.remove('copied');
      }, 2000);
    }

    return true;
  } catch (error) {
    console.error('Failed to copy code:', error);
    return false;
  }
}

/**
 * Handle cancel button click
 */
export function handleCancel() {
  if (pollingController) {
    pollingController.abort();
    pollingController = null;
  }
  showUnauthenticatedUI();
}

/**
 * Handle logout button click
 */
export function handleLogout() {
  clearToken();
  dispatchAuthEvent(false, null);
  showUnauthenticatedUI();
}

// ============================================
// Main Authentication Flow
// ============================================

/**
 * Start the OAuth device flow
 */
export async function startDeviceFlow() {
  try {
    // Request device code
    const deviceData = await requestDeviceCode();

    // Show device code UI
    showDeviceCodeUI(deviceData);

    // Set up copy button
    const copyButton = document.querySelector('.btn-copy-code');
    if (copyButton) {
      copyButton.onclick = () => handleCopyCode(deviceData.userCode);
    }

    // Set up cancel button
    const cancelButton = document.querySelector('.btn-cancel');
    if (cancelButton) {
      cancelButton.onclick = handleCancel;
    }

    // Start polling
    pollingController = new AbortController();
    let interval = deviceData.interval;

    showPollingStatus('Waiting for authorization...');

    while (!pollingController.signal.aborted) {
      // Wait for interval
      await new Promise((resolve) => setTimeout(resolve, interval * 1000));

      if (pollingController.signal.aborted) break;

      // Poll for token
      const result = await pollForToken(deviceData.deviceCode, interval);

      switch (result.status) {
        case POLL_STATUS.SUCCESS:
          // Save token and user info
          saveToken(result.token);

          // Validate and get user info
          const user = await validateToken(result.token);
          if (user) {
            saveUserInfo(user);
            showAuthenticatedUI(user);
            dispatchAuthEvent(true, user);
          } else {
            showErrorUI('Failed to get user information.', () => startDeviceFlow());
          }
          pollingController = null;
          return;

        case POLL_STATUS.PENDING:
          // Continue polling
          showPollingStatus('Waiting for authorization...');
          break;

        case POLL_STATUS.SLOW_DOWN:
          // Increase interval
          interval = result.newInterval;
          showPollingStatus('Waiting for authorization...');
          break;

        case POLL_STATUS.EXPIRED:
          showErrorUI(result.error, () => startDeviceFlow());
          pollingController = null;
          return;

        case POLL_STATUS.DENIED:
          showErrorUI(result.error, () => startDeviceFlow());
          pollingController = null;
          return;

        case POLL_STATUS.ERROR:
          showErrorUI(result.error, () => startDeviceFlow());
          pollingController = null;
          return;
      }
    }
  } catch (error) {
    console.error('Device flow error:', error);
    const message = error.message || 'An error occurred. Please try again.';
    showErrorUI(message, () => startDeviceFlow());
  }
}

/**
 * Initialize authentication on app load
 */
export async function initAuth() {
  const token = getToken();

  if (token) {
    // Validate existing token
    const user = await validateToken(token);

    if (user) {
      // Token is valid
      saveUserInfo(user);
      showAuthenticatedUI(user);
      dispatchAuthEvent(true, user);
    } else {
      // Token is invalid, clear it silently
      clearToken();
      showUnauthenticatedUI();
      dispatchAuthEvent(false, null);
    }
  } else {
    // No token, show sign-in
    showUnauthenticatedUI();
    dispatchAuthEvent(false, null);
  }

  // Set up sign-in button handler
  const signInButton = document.querySelector('.btn-sign-in');
  if (signInButton) {
    signInButton.onclick = () => startDeviceFlow();
  }

  // Set up logout button handler
  const logoutButton = document.querySelector('.btn-logout');
  if (logoutButton) {
    logoutButton.onclick = handleLogout;
  }
}

// ============================================
// Initialization
// ============================================

// Run initialization on DOM ready
document.addEventListener('DOMContentLoaded', initAuth);

// ============================================
// Global Exports for External Use
// ============================================

// Export functions globally for use by other modules (e.g., moves.js)
window.gitgammonAuth = {
  getToken,
  isAuthenticated,
  getUser,
  initAuth,
  login: startDeviceFlow,
  logout: handleLogout,
};

// Also export individual functions for module usage
export { POLL_STATUS, TOKEN_KEY, USER_KEY };
