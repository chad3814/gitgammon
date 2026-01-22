/**
 * Move Direction Validation
 * Validates that moves go in the correct direction for each player
 * @module validation/validators/direction
 */

import { createValidResult, createInvalidResult } from '../result.js';
import { BAR_POSITION, BEAR_OFF_POSITION } from '../constants.js';

/**
 * Validate that a move is in the correct direction for the player
 * - White moves from higher indices to lower (towards home at 0-5)
 * - Black moves from lower indices to higher (towards home at 18-23)
 * - Bar entry (from: -1) and bear-off (to: 24) are exempt from standard direction rules
 *
 * @param {import('../types.js').SingleMove} move - The move to validate
 * @param {import('../types.js').PlayerColor} player - The player making the move
 * @returns {import('../types.js').MoveValidationResult} Validation result
 */
export function validateMoveDirection(move, player) {
  // Skip direction validation for bar entry and bear-off
  if (move.from === BAR_POSITION || move.to === BEAR_OFF_POSITION) {
    return createValidResult();
  }

  // White moves from higher to lower indices
  if (player === 'white' && move.from < move.to) {
    return createInvalidResult(
      `white must move from higher to lower indices (attempted ${move.from} to ${move.to})`
    );
  }

  // Black moves from lower to higher indices
  if (player === 'black' && move.from > move.to) {
    return createInvalidResult(
      `black must move from lower to higher indices (attempted ${move.from} to ${move.to})`
    );
  }

  return createValidResult();
}
