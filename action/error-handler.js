/**
 * Global Error Handler Module
 * Handles and reports errors in a consistent manner
 * @module action/error-handler
 */

import { logError, logInfo } from './logger.js';

/**
 * Handle an error and convert to a structured result
 * @param {Error} error - The error to handle
 * @returns {{ message: string, recoverable: boolean, originalError: Error }}
 */
export function handleError(error) {
  let message = error.message;
  let recoverable = false;

  // Detect error types and provide better messages
  if (error instanceof SyntaxError && message.includes('JSON')) {
    message = `Malformed JSON: ${message}`;
  } else if (message.includes('state.json not found')) {
    message = `Missing state file: ${message}`;
  } else if (message.includes('Move file not found')) {
    message = `Missing move file: ${message}`;
  } else if (message.includes('Invalid state after move')) {
    message = `State validation failed: ${message}`;
  }

  return {
    message,
    recoverable,
    originalError: error
  };
}

/**
 * Wrap an async function with error handling
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function that catches and handles errors
 */
export function wrapWithErrorHandler(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const handled = handleError(error);
      logError(handled.message);

      // Don't re-throw - ensure workflow completes
      return { success: false, error: handled };
    }
  };
}

/**
 * Format an error for display
 * @param {Error} error - Error to format
 * @returns {string} Formatted error message
 */
export function formatError(error) {
  if (error.stack) {
    return `${error.message}\n${error.stack}`;
  }
  return error.message;
}
