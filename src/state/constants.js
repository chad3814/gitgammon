/**
 * Game State Constants and Type Guards
 * @module state/constants
 */

/**
 * Valid player colors
 * @type {readonly ['white', 'black']}
 */
export const PLAYER_COLORS = Object.freeze(['white', 'black']);

/**
 * Valid game statuses
 * @type {readonly ['playing', 'completed']}
 */
export const GAME_STATUSES = Object.freeze(['playing', 'completed']);

/**
 * Valid message types
 * @type {readonly ['error', 'info', 'warning']}
 */
export const MESSAGE_TYPES = Object.freeze(['error', 'info', 'warning']);

/**
 * Number of pieces each player has
 * @type {number}
 */
export const PIECES_PER_PLAYER = 15;

/**
 * Number of points on the board
 * @type {number}
 */
export const BOARD_POINTS = 24;

/**
 * Check if a value is a valid player color
 * @param {string} color - The color to check
 * @returns {color is import('./types.js').PlayerColor} True if valid player color
 */
export function isValidPlayer(color) {
  return PLAYER_COLORS.includes(color);
}

/**
 * Check if a value is a valid game status
 * @param {string} status - The status to check
 * @returns {status is import('./types.js').GameStatus} True if valid game status
 */
export function isValidStatus(status) {
  return GAME_STATUSES.includes(status);
}

/**
 * Check if a value is a valid message type
 * @param {string} type - The type to check
 * @returns {type is import('./types.js').MessageType} True if valid message type
 */
export function isValidMessageType(type) {
  return MESSAGE_TYPES.includes(type);
}

/**
 * Check if a value is a valid die value (1-6)
 * @param {number} value - The die value to check
 * @returns {boolean} True if valid die value
 */
export function isValidDieValue(value) {
  return Number.isInteger(value) && value >= 1 && value <= 6;
}
