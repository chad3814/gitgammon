/**
 * Player Validation Utilities
 * @module table/players
 */

/**
 * Validate players object
 * @param {import('../state/types.js').Players} players - Player GitHub usernames
 * @returns {import('./types.js').PlayerValidationResult} Validation result
 */
export function validatePlayers(players) {
  // Check for null/undefined
  if (!players) {
    return {
      valid: false,
      error: 'Players object is required'
    };
  }

  // Check for white player
  if (!players.white && players.white !== '') {
    return {
      valid: false,
      error: 'White player username is required'
    };
  }

  // Check for black player
  if (!players.black && players.black !== '') {
    return {
      valid: false,
      error: 'Black player username is required'
    };
  }

  // Check for empty white username
  if (players.white.trim() === '') {
    return {
      valid: false,
      error: 'White player username cannot be empty'
    };
  }

  // Check for empty black username
  if (players.black.trim() === '') {
    return {
      valid: false,
      error: 'Black player username cannot be empty'
    };
  }

  return { valid: true };
}
