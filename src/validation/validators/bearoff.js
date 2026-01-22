/**
 * Bearing Off Validation
 * Validates bearing off moves according to backgammon rules
 * @module validation/validators/bearoff
 */

import { createValidResult, createInvalidResult } from '../result.js';
import { BEAR_OFF_POSITION, isInHomeBoard, isPlayerPiece, getHomeRange } from '../constants.js';

/**
 * Check if all player's pieces are in their home board (or already borne off)
 * @param {import('../../state/types.js').GameState} gameState - Current game state
 * @param {import('../types.js').PlayerColor} player - The player to check
 * @returns {{ allHome: boolean, outsidePoint: number | null }} Check result with first outside point if any
 */
function checkAllPiecesInHome(gameState, player) {
  // Check bar first - any pieces on bar means not all home
  if (gameState.bar[player] > 0) {
    return { allHome: false, outsidePoint: -1 }; // Bar is represented as -1
  }

  // Check each board point
  for (let point = 0; point < 24; point++) {
    const pointValue = gameState.board[point];

    // If this is the player's piece and not in home board
    if (isPlayerPiece(pointValue, player) && !isInHomeBoard(point, player)) {
      return { allHome: false, outsidePoint: point };
    }
  }

  return { allHome: true, outsidePoint: null };
}

/**
 * Get the highest point (furthest from bearing off) with player's pieces in home board
 * For white: highest point index (closer to 5)
 * For black: lowest point index (closer to 18)
 *
 * @param {import('../../state/types.js').GameState} gameState - Current game state
 * @param {import('../types.js').PlayerColor} player - The player to check
 * @returns {number | null} Highest point with pieces, or null if no pieces in home
 */
function getHighestPointWithPieces(gameState, player) {
  const [homeStart, homeEnd] = getHomeRange(player);

  if (player === 'white') {
    // White bears off toward lower indices, so check from highest to lowest in home
    for (let point = homeEnd; point >= homeStart; point--) {
      if (gameState.board[point] > 0) {
        return point;
      }
    }
  } else {
    // Black bears off toward higher indices, so check from lowest to highest in home
    for (let point = homeStart; point <= homeEnd; point++) {
      if (gameState.board[point] < 0) {
        return point;
      }
    }
  }

  return null;
}

/**
 * Calculate the exact die needed to bear off from a point
 * @param {number} point - The board point
 * @param {import('../types.js').PlayerColor} player - The player
 * @returns {number} The exact die value needed
 */
function getExactBearOffDie(point, player) {
  if (player === 'white') {
    return point + 1; // From point 0, need 1; from point 5, need 6
  }
  return 24 - point; // From point 23, need 1; from point 18, need 6
}

/**
 * Validate a bearing off move
 * - All pieces must be in home board
 * - Overshoot handling depends on tableOptions.allowBearOffOvershoot
 * - When overshoot disabled: exact roll required unless no pieces on higher points
 *
 * @param {import('../../state/types.js').GameState} gameState - Current game state
 * @param {import('../types.js').SingleMove} move - The move to validate
 * @param {import('../types.js').PlayerColor} player - The player making the move
 * @returns {import('../types.js').MoveValidationResult} Validation result
 */
export function validateBearingOff(gameState, move, player) {
  // Only validate bear-off moves
  if (move.to !== BEAR_OFF_POSITION) {
    return createValidResult();
  }

  // Check all pieces are in home board
  const homeCheck = checkAllPiecesInHome(gameState, player);
  if (!homeCheck.allHome) {
    const pointDesc = homeCheck.outsidePoint === -1 ? 'bar' : `point ${homeCheck.outsidePoint}`;
    return createInvalidResult(
      `Cannot bear off: pieces exist outside home board (${pointDesc})`
    );
  }

  // Calculate the exact die needed for this bear-off
  const exactDie = getExactBearOffDie(move.from, player);

  // If using exact die, always valid
  if (move.die === exactDie) {
    return createValidResult();
  }

  // Die is not exact - check if overshoot is allowed
  const allowOvershoot = gameState.tableOptions?.allowBearOffOvershoot ?? true;

  if (move.die < exactDie) {
    // Die is too small - this is never valid for bear-off
    return createInvalidResult(
      `Cannot bear off from point ${move.from}: die ${move.die} is less than required ${exactDie}`
    );
  }

  // Die is larger than exact (overshoot scenario)
  if (!allowOvershoot) {
    // Check if there are any pieces on higher points
    const highestPoint = getHighestPointWithPieces(gameState, player);

    // Overshoot is only allowed when bearing off from the highest point
    if (highestPoint !== null && move.from !== highestPoint) {
      return createInvalidResult(
        `Cannot bear off from point ${move.from} with die ${move.die}: higher pieces exist on point ${highestPoint}`
      );
    }
  }

  return createValidResult();
}
