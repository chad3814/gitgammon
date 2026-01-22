/**
 * Logging Utilities Module
 * GitHub Actions-compatible logging
 * @module action/logger
 */

/**
 * Log an info message
 * @param {string} message - Message to log
 */
export function logInfo(message) {
  console.log(`[GitGammon] ${message}`);
}

/**
 * Log a warning message (GitHub Actions format)
 * @param {string} message - Warning message
 */
export function logWarning(message) {
  console.log(`::warning::${message}`);
}

/**
 * Log an error message (GitHub Actions format)
 * @param {string} message - Error message
 */
export function logError(message) {
  console.log(`::error::${message}`);
}

/**
 * Log debug information
 * @param {string} message - Debug message
 */
export function logDebug(message) {
  console.log(`::debug::${message}`);
}

/**
 * Log a group of messages
 * @param {string} title - Group title
 * @param {Function} fn - Function containing log calls
 */
export function logGroup(title, fn) {
  console.log(`::group::${title}`);
  fn();
  console.log('::endgroup::');
}

/**
 * Generic log function
 * @param {string} level - Log level
 * @param {string} message - Message
 */
export function log(level, message) {
  switch (level) {
    case 'info':
      logInfo(message);
      break;
    case 'warning':
      logWarning(message);
      break;
    case 'error':
      logError(message);
      break;
    case 'debug':
      logDebug(message);
      break;
    default:
      console.log(message);
  }
}
