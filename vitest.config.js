import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom for browser environment testing
    environment: 'jsdom',
    // Include setup file for global mocks
    setupFiles: ['./tests/setup.js'],
  },
});
