/**
 * Move Validation Constants and Helpers
 * @module validation/constants
 */

import { BAR_POSITION, BEAR_OFF_POSITION } from '../moves/constants.js';

// Re-export from moves/constants for convenience
export { BAR_POSITION, BEAR_OFF_POSITION };

/**
 * White's home board range (points 0-5)
 * @type {[number, number]}
 */
export const WHITE_HOME_RANGE = [0, 5];

/**
 * Black's home board range (points 18-23)
 * @type {[number, number]}
 */
export const BLACK_HOME_RANGE = [18, 23];

/**
 * White's bar entry range (points 18-23)
 * White pieces on bar re-enter on opponent's home board
 * @type {[number, number]}
 */
export const WHITE_BAR_ENTRY_RANGE = [18, 23];

/**
 * Black's bar entry range (points 0-5)
 * Black pieces on bar re-enter on opponent's home board
 * @type {[number, number]}
 */
export const BLACK_BAR_ENTRY_RANGE = [0, 5];

/**
 * Check if a point is in the player's home board
 * @param {number} point - Board point to check (0-23)
 * @param {import('./types.js').PlayerColor} player - Player color
 * @returns {boolean} True if point is in player's home board
 */
export function isInHomeBoard(point, player) {
  if (player === 'white') {
    return point >= WHITE_HOME_RANGE[0] && point <= WHITE_HOME_RANGE[1];
  }
  return point >= BLACK_HOME_RANGE[0] && point <= BLACK_HOME_RANGE[1];
}

/**
 * Get the bar entry point for a given die value and player
 * White enters at 24 - die (points 18-23)
 * Black enters at die - 1 (points 0-5)
 * @param {number} die - Die value (1-6)
 * @param {import('./types.js').PlayerColor} player - Player color
 * @returns {number} Board point for bar entry
 */
export function getBarEntryPoint(die, player) {
  if (player === 'white') {
    return 24 - die;
  }
  return die - 1;
}

/**
 * Get the home board range for a player
 * @param {import('./types.js').PlayerColor} player - Player color
 * @returns {[number, number]} [min, max] range of home board points
 */
export function getHomeRange(player) {
  return player === 'white' ? WHITE_HOME_RANGE : BLACK_HOME_RANGE;
}

/**
 * Get the bar entry range for a player
 * @param {import('./types.js').PlayerColor} player - Player color
 * @returns {[number, number]} [min, max] range of bar entry points
 */
export function getBarEntryRange(player) {
  return player === 'white' ? WHITE_BAR_ENTRY_RANGE : BLACK_BAR_ENTRY_RANGE;
}

/**
 * Check if a move is a bar entry
 * @param {import('./types.js').SingleMove} move - Move to check
 * @returns {boolean} True if move is from the bar
 */
export function isBarEntry(move) {
  return move.from === BAR_POSITION;
}

/**
 * Check if a move is bearing off
 * @param {import('./types.js').SingleMove} move - Move to check
 * @returns {boolean} True if move is bearing off
 */
export function isBearOff(move) {
  return move.to === BEAR_OFF_POSITION;
}

/**
 * Get the opponent's color
 * @param {import('./types.js').PlayerColor} player - Player color
 * @returns {import('./types.js').PlayerColor} Opponent's color
 */
export function getOpponent(player) {
  return player === 'white' ? 'black' : 'white';
}

/**
 * Check if a board value represents the given player's pieces
 * Positive values = white, negative values = black
 * @param {number} boardValue - Value at a board point
 * @param {import('./types.js').PlayerColor} player - Player color
 * @returns {boolean} True if the pieces belong to the player
 */
export function isPlayerPiece(boardValue, player) {
  if (player === 'white') {
    return boardValue > 0;
  }
  return boardValue < 0;
}

/**
 * Check if a board value represents opponent's pieces
 * @param {number} boardValue - Value at a board point
 * @param {import('./types.js').PlayerColor} player - Player color
 * @returns {boolean} True if the pieces belong to the opponent
 */
export function isOpponentPiece(boardValue, player) {
  if (player === 'white') {
    return boardValue < 0;
  }
  return boardValue > 0;
}
