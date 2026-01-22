/**
 * Blot Hit Detection
 * Detects when a move would hit an opponent's blot
 * @module validation/validators/blot
 */

import { createValidResult, createResultWithHit } from '../result.js';
import { BEAR_OFF_POSITION, isOpponentPiece, getOpponent } from '../constants.js';

/**
 * Detect if a move hits an opponent's blot (single piece)
 * Returns hit information without mutating state
 *
 * A blot is exactly 1 opponent piece on a point
 * - For white player: opponent blot is board[to] === -1
 * - For black player: opponent blot is board[to] === 1
 *
 * @param {import('../../state/types.js').GameState} gameState - Current game state
 * @param {import('../types.js').SingleMove} move - The move to validate
 * @param {import('../types.js').PlayerColor} player - The player making the move
 * @returns {import('../types.js').MoveValidationResult} Validation result with hitInfo if blot detected
 */
export function detectBlotHit(gameState, move, player) {
  // Bear-off doesn't hit anything
  if (move.to === BEAR_OFF_POSITION) {
    return createValidResult();
  }

  const pointValue = gameState.board[move.to];

  // Check if there's exactly one opponent piece (a blot)
  if (isOpponentPiece(pointValue, player) && Math.abs(pointValue) === 1) {
    const hitPlayer = getOpponent(player);
    return createResultWithHit({
      point: move.to,
      player: hitPlayer
    });
  }

  return createValidResult();
}
