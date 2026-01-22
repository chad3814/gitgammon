/**
 * Core Dice Rolling Functions
 * Cryptographically secure dice rolling using Node.js crypto
 * @module dice/roll
 */

import { randomInt } from 'crypto';
import { MIN_DIE_VALUE, MAX_DIE_VALUE } from './constants.js';

/**
 * Roll a single die using cryptographically secure randomness
 * @returns {number} Die value between 1 and 6 (inclusive)
 */
export function rollDie() {
  // crypto.randomInt(min, max) returns integer in [min, max)
  // So randomInt(1, 7) gives us 1-6
  return randomInt(MIN_DIE_VALUE, MAX_DIE_VALUE + 1);
}

/**
 * Roll two dice
 * @returns {number[]} Array of two die values
 */
export function rollDice() {
  return [rollDie(), rollDie()];
}

/**
 * Check if a dice roll is doubles (both dice have same value)
 * @param {number[]} dice - Array of two dice values
 * @returns {boolean} True if both dice match
 */
export function isDoubles(dice) {
  return dice.length >= 2 && dice[0] === dice[1];
}
