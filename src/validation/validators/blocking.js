/**
 * Point Blocking Validation
 * Validates that moves don't land on blocked points
 * @module validation/validators/blocking
 */

import { createValidResult, createInvalidResult } from '../result.js';
import { BEAR_OFF_POSITION, isOpponentPiece, getOpponent } from '../constants.js';

/**
 * Validate that the destination point is not blocked by opponent
 * A point with 2+ opponent pieces is blocked and cannot be landed on
 *
 * @param {import('../../state/types.js').GameState} gameState - Current game state
 * @param {import('../types.js').SingleMove} move - The move to validate
 * @param {import('../types.js').PlayerColor} player - The player making the move
 * @returns {import('../types.js').MoveValidationResult} Validation result
 */
export function validatePointBlocking(gameState, move, player) {
  // Bear-off is never blocked
  if (move.to === BEAR_OFF_POSITION) {
    return createValidResult();
  }

  const pointValue = gameState.board[move.to];

  // Check if it's opponent's pieces and there are 2 or more
  if (isOpponentPiece(pointValue, player) && Math.abs(pointValue) >= 2) {
    const opponentColor = getOpponent(player);
    const pieceCount = Math.abs(pointValue);
    return createInvalidResult(
      `Point ${move.to} is blocked by ${opponentColor} (${pieceCount} pieces)`
    );
  }

  return createValidResult();
}
