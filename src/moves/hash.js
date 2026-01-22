/**
 * State Hash Utility
 * Compute deterministic hash of game state for conflict detection
 * @module moves/hash
 */

import { createHash } from 'node:crypto';
import { EXPECTED_STATE_HASH_LENGTH } from './constants.js';

/**
 * Compute a deterministic hash of a game state
 * Returns a truncated SHA-256 hash for use in move file expectedState field
 * @param {object | string} state - The state object or JSON string to hash
 * @returns {string} 16-character lowercase hexadecimal hash
 */
export function computeStateHash(state) {
  // Ensure consistent serialization with sorted keys
  const jsonString = typeof state === 'string'
    ? state
    : JSON.stringify(state, Object.keys(state).sort());

  const hash = createHash('sha256')
    .update(jsonString)
    .digest('hex');

  // Return truncated hash (first 16 characters)
  return hash.slice(0, EXPECTED_STATE_HASH_LENGTH);
}

/**
 * Validate that a hash matches the expected format
 * @param {string} hash - The hash to validate
 * @returns {boolean} True if valid format
 */
export function isValidStateHash(hash) {
  return typeof hash === 'string' &&
    hash.length === EXPECTED_STATE_HASH_LENGTH &&
    /^[a-f0-9]+$/.test(hash);
}
