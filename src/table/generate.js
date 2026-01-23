/**
 * Table ID Generation Utilities
 * @module table/generate
 */

/**
 * Generate a table ID from player names and date
 * Format: {player1}-vs-{player2}-{YYYY-MM-DD}
 *
 * @param {import('../state/types.js').Players} players - Player GitHub usernames
 * @param {Date} [date] - Date to use (defaults to current date)
 * @returns {string} Generated table ID
 */
export function generateTableId(players, date = new Date()) {
  // Normalize usernames to lowercase
  const white = normalizeUsername(players.white);
  const black = normalizeUsername(players.black);

  // Format date as YYYY-MM-DD
  const dateStr = date.toISOString().split('T')[0];

  return `${white}-vs-${black}-${dateStr}`;
}

/**
 * Normalize a username for use in table ID
 * - Converts to lowercase
 * - Preserves hyphens (valid in GitHub usernames)
 * - Removes any other special characters
 *
 * @param {string} username - The username to normalize
 * @returns {string} Normalized username
 */
function normalizeUsername(username) {
  return username
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
}
