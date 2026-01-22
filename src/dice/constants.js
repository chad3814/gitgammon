/**
 * Dice Module Constants
 * @module dice/constants
 */

/**
 * Minimum valid die value
 * @type {number}
 */
export const MIN_DIE_VALUE = 1;

/**
 * Maximum valid die value
 * @type {number}
 */
export const MAX_DIE_VALUE = 6;

/**
 * Number of dice rolled per turn
 * @type {number}
 */
export const DICE_COUNT = 2;

/**
 * Maximum iterations for tie-breaking in initial roll
 * Safety limit to prevent infinite loops
 * @type {number}
 */
export const MAX_TIE_BREAK_ITERATIONS = 100;

/**
 * Maximum auto-pass iterations (both players blocked scenario)
 * @type {number}
 */
export const MAX_AUTO_PASS_ITERATIONS = 2;

// Re-export isValidDieValue from state/constants for convenience
export { isValidDieValue } from '../state/constants.js';
