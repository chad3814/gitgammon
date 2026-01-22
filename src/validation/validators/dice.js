/**
 * Dice Consumption Validation
 * Validates that moves use available dice correctly
 * @module validation/validators/dice
 */

import { createValidResult, createInvalidResult } from '../result.js';
import { BAR_POSITION, BEAR_OFF_POSITION, getBarEntryPoint } from '../constants.js';

/**
 * Calculate the die value required for a move
 * Handles special cases for bar entry and bear-off
 *
 * @param {import('../types.js').SingleMove} move - The move
 * @param {import('../types.js').PlayerColor} player - The player making the move
 * @returns {number} The required die value
 */
export function calculateRequiredDie(move, player) {
  // Bar entry: calculate from entry point
  if (move.from === BAR_POSITION) {
    // For white: entry at (24 - die), so die = 24 - to
    // For black: entry at (die - 1), so die = to + 1
    if (player === 'white') {
      return 24 - move.to;
    }
    return move.to + 1;
  }

  // Bear-off: calculate distance from point to bear-off
  // Note: Exact bear-off validation is handled in bearoff.js
  // Here we just calculate the minimum distance
  if (move.to === BEAR_OFF_POSITION) {
    // For white: pieces bear off from low indices (0-5)
    // die value = from + 1 (from point 0, need a 1; from point 5, need a 6)
    if (player === 'white') {
      return move.from + 1;
    }
    // For black: pieces bear off from high indices (18-23)
    // die value = 24 - from (from point 23, need a 1; from point 18, need a 6)
    return 24 - move.from;
  }

  // Normal move: absolute difference between from and to
  return Math.abs(move.to - move.from);
}

/**
 * Validate that a move uses the correct die and the die is available
 *
 * @param {import('../types.js').SingleMove} move - The move to validate
 * @param {number[]} remainingDice - Array of remaining die values
 * @param {import('../types.js').PlayerColor} player - The player making the move
 * @returns {import('../types.js').MoveValidationResult} Validation result
 */
export function validateDiceConsumption(move, remainingDice, player) {
  const requiredDie = calculateRequiredDie(move, player);

  // First check if the move's die matches the required distance
  // For bear-off with overshoot, the die might be larger than required - this is handled in bearoff.js
  // Here we check the basic constraint that the used die should achieve the move
  if (move.to !== BEAR_OFF_POSITION && move.die !== requiredDie) {
    return createInvalidResult(
      `Move ${move.from} to ${move.to} requires die ${requiredDie} but used ${move.die}`
    );
  }

  // Check that the die is available in remaining dice
  if (!remainingDice.includes(move.die)) {
    return createInvalidResult(
      `Die value ${move.die} is not available in remaining dice [${remainingDice.join(', ')}]`
    );
  }

  return createValidResult();
}

/**
 * Get remaining dice after consuming one die
 * @param {number[]} dice - Current dice array
 * @param {number} usedDie - Die value to consume
 * @returns {number[]} New array with one instance of usedDie removed
 */
export function consumeDie(dice, usedDie) {
  const remaining = [...dice];
  const index = remaining.indexOf(usedDie);
  if (index !== -1) {
    remaining.splice(index, 1);
  }
  return remaining;
}
