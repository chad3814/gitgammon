/**
 * Turn Validation
 * Validates that it is the correct player's turn
 * @module validation/validators/turn
 */

import { createValidResult, createInvalidResult } from '../result.js';

/**
 * Validate that the move is being made by the active player
 * This check should run first before any move-specific validation
 *
 * @param {import('../../state/types.js').GameState} gameState - Current game state
 * @param {import('../types.js').SingleMove} _move - The move to validate (unused)
 * @param {import('../types.js').PlayerColor} player - The player attempting the move
 * @returns {import('../types.js').MoveValidationResult} Validation result
 */
export function validateTurn(gameState, _move, player) {
  if (player !== gameState.activePlayer) {
    return createInvalidResult(
      `Not your turn: expected ${gameState.activePlayer} but got ${player}`
    );
  }

  return createValidResult();
}
