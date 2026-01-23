/**
 * Vitest Setup File
 * Global test configuration and mocks
 */

// This file runs before all tests
// Add any global mocks or configurations here

// Ensure window.open is available for tests
if (typeof window !== 'undefined') {
  window.open = window.open || (() => null);
}
