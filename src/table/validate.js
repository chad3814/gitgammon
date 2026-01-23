/**
 * Table ID Validation Utilities
 * @module table/validate
 */

import { TABLE_ID_PATTERN, MIN_TABLE_ID_LENGTH } from './constants.js';

/**
 * Validate a table ID format
 * @param {string} tableId - The table ID to validate
 * @returns {import('./types.js').TableValidationResult} Validation result
 */
export function validateTableId(tableId) {
  // Check for empty string
  if (!tableId || tableId.length === 0) {
    return {
      valid: false,
      error: 'Table ID cannot be empty'
    };
  }

  // Check minimum length
  if (tableId.length < MIN_TABLE_ID_LENGTH) {
    return {
      valid: false,
      error: `Table ID must be at least ${MIN_TABLE_ID_LENGTH} characters`
    };
  }

  // Check for uppercase characters
  if (tableId !== tableId.toLowerCase()) {
    return {
      valid: false,
      error: 'Table ID must be lowercase only'
    };
  }

  // Check for starting/ending with hyphen
  if (tableId.startsWith('-') || tableId.endsWith('-')) {
    return {
      valid: false,
      error: 'Table ID cannot start or end with a hyphen'
    };
  }

  // Check pattern (lowercase letters, numbers, hyphens only)
  if (!TABLE_ID_PATTERN.test(tableId)) {
    return {
      valid: false,
      error: 'Table ID must contain only lowercase letters, numbers, and hyphens'
    };
  }

  return { valid: true };
}
