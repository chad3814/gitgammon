/**
 * Move Filename Utilities
 * Parse, create, and validate move filenames
 * @module moves/filename
 */

import {
  FILENAME_PATTERN,
  SEQUENCE_DIGITS,
  FILENAME_SHA_LENGTH,
  isValidPlayer
} from './constants.js';

/**
 * Parse a move filename into its components
 * @param {string} filename - The filename to parse (e.g., "0001-white-a1b2c3.json")
 * @returns {import('./types.js').FilenameComponents | null} Parsed components or null if invalid
 */
export function parseFilename(filename) {
  const match = filename.match(FILENAME_PATTERN);
  if (!match) {
    return null;
  }

  const [, sequenceStr, player, sha] = match;
  return {
    sequence: parseInt(sequenceStr, 10),
    player: /** @type {import('./types.js').PlayerColor} */ (player),
    sha
  };
}

/**
 * Create a move filename from components
 * @param {number} sequence - Move sequence number (1-9999)
 * @param {import('./types.js').PlayerColor} player - Player color
 * @param {string} sha - 6-character SHA
 * @returns {string} Formatted filename
 */
export function createFilename(sequence, player, sha) {
  const paddedSequence = padSequence(sequence);
  return `${paddedSequence}-${player}-${sha}.json`;
}

/**
 * Validate a move filename
 * @param {string} filename - The filename to validate
 * @returns {import('./types.js').MoveValidationResult} Validation result
 */
export function validateFilename(filename) {
  const errors = [];

  // Check overall format
  const match = filename.match(FILENAME_PATTERN);
  if (!match) {
    errors.push(`Filename "${filename}" does not match expected format: {4-digit sequence}-{player}-{6-char hex}.json`);
    return { valid: false, errors };
  }

  const [, sequenceStr, player, sha] = match;
  const sequence = parseInt(sequenceStr, 10);

  // Validate sequence number range
  if (sequence < 1) {
    errors.push(`Sequence number ${sequence} must be at least 1`);
  }
  if (sequence > 9999) {
    errors.push(`Sequence number ${sequence} exceeds maximum of 9999`);
  }

  // Validate player
  if (!isValidPlayer(player)) {
    errors.push(`Player "${player}" is not valid (must be "white" or "black")`);
  }

  // Validate SHA format (already matched by regex, but check for clarity)
  if (sha.length !== FILENAME_SHA_LENGTH) {
    errors.push(`SHA "${sha}" must be exactly ${FILENAME_SHA_LENGTH} characters`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Zero-pad a sequence number to 4 digits
 * @param {number} num - The sequence number to pad
 * @returns {string} Zero-padded string (e.g., "0001", "0012", "0123")
 */
export function padSequence(num) {
  return String(num).padStart(SEQUENCE_DIGITS, '0');
}
