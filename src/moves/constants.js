/**
 * Move File Constants and Type Guards
 * @module moves/constants
 */

/**
 * Valid player colors
 * @type {readonly ['white', 'black']}
 */
export const PLAYER_COLORS = Object.freeze(['white', 'black']);

/**
 * Bar position (source for re-entry moves)
 * @type {number}
 */
export const BAR_POSITION = -1;

/**
 * Bear-off position (destination for bearing off)
 * @type {number}
 */
export const BEAR_OFF_POSITION = 24;

/**
 * Minimum valid board point index
 * @type {number}
 */
export const MIN_BOARD_POINT = 0;

/**
 * Maximum valid board point index
 * @type {number}
 */
export const MAX_BOARD_POINT = 23;

/**
 * Minimum die value
 * @type {number}
 */
export const MIN_DIE_VALUE = 1;

/**
 * Maximum die value
 * @type {number}
 */
export const MAX_DIE_VALUE = 6;

/**
 * Maximum moves per turn (doubles)
 * @type {number}
 */
export const MAX_MOVES_PER_TURN = 4;

/**
 * Maximum comment length in characters
 * @type {number}
 */
export const MAX_COMMENT_LENGTH = 280;

/**
 * Expected state hash length (truncated SHA-256)
 * @type {number}
 */
export const EXPECTED_STATE_HASH_LENGTH = 16;

/**
 * Full git commit SHA length
 * @type {number}
 */
export const COMMIT_SHA_LENGTH = 40;

/**
 * SHA length in filename
 * @type {number}
 */
export const FILENAME_SHA_LENGTH = 6;

/**
 * Number of digits in sequence number
 * @type {number}
 */
export const SEQUENCE_DIGITS = 4;

/**
 * Regex pattern for valid move filenames
 * Format: {4-digit sequence}-{player}-{6-char hex}.json
 * @type {RegExp}
 */
export const FILENAME_PATTERN = /^([0-9]{4})-(white|black)-([a-f0-9]{6})\.json$/;

/**
 * Check if a value is a valid player color
 * @param {string} color - The color to check
 * @returns {color is import('./types.js').PlayerColor} True if valid player color
 */
export function isValidPlayer(color) {
  return PLAYER_COLORS.includes(color);
}

/**
 * Check if a value is a valid die value (1-6)
 * @param {number} value - The die value to check
 * @returns {boolean} True if valid die value
 */
export function isValidDieValue(value) {
  return Number.isInteger(value) && value >= MIN_DIE_VALUE && value <= MAX_DIE_VALUE;
}

/**
 * Check if a value is a valid board point (0-23)
 * @param {number} point - The point to check
 * @returns {boolean} True if valid board point
 */
export function isValidBoardPoint(point) {
  return Number.isInteger(point) && point >= MIN_BOARD_POINT && point <= MAX_BOARD_POINT;
}

/**
 * Check if a value is a valid move source (-1 for bar, or 0-23)
 * @param {number} point - The point to check
 * @returns {boolean} True if valid source point
 */
export function isValidSourcePoint(point) {
  return point === BAR_POSITION || isValidBoardPoint(point);
}

/**
 * Check if a value is a valid move destination (0-23 or 24 for bear-off)
 * @param {number} point - The point to check
 * @returns {boolean} True if valid destination point
 */
export function isValidDestinationPoint(point) {
  return isValidBoardPoint(point) || point === BEAR_OFF_POSITION;
}
