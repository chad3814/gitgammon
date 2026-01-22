/**
 * Bar Re-entry Validation
 * Validates that pieces on the bar re-enter before other moves
 * @module validation/validators/bar
 */

import { createValidResult, createInvalidResult } from '../result.js';
import { BAR_POSITION, getBarEntryPoint, getBarEntryRange } from '../constants.js';

/**
 * Validate that a player with pieces on the bar makes bar re-entry moves
 * - If player has pieces on bar, all moves MUST be bar re-entries
 * - Validates the entry point is correct for the die used
 *
 * @param {import('../../state/types.js').GameState} gameState - Current game state
 * @param {import('../types.js').SingleMove} move - The move to validate
 * @param {import('../types.js').PlayerColor} player - The player making the move
 * @returns {import('../types.js').MoveValidationResult} Validation result
 */
export function validateBarReentry(gameState, move, player) {
  const piecesOnBar = gameState.bar[player];

  // If no pieces on bar, no bar validation needed
  if (piecesOnBar === 0) {
    return createValidResult();
  }

  // Player has pieces on bar - must re-enter from bar
  if (move.from !== BAR_POSITION) {
    return createInvalidResult(
      `Must re-enter from bar before moving other pieces (${piecesOnBar} pieces on bar)`
    );
  }

  // Validate the entry point is within the valid range
  const entryRange = getBarEntryRange(player);
  if (move.to < entryRange[0] || move.to > entryRange[1]) {
    const rangeStr = player === 'white' ? '18-23' : '0-5';
    return createInvalidResult(
      `Bar entry must be to point ${rangeStr} for ${player} (attempted to ${move.to})`
    );
  }

  // Validate the entry point matches the die
  const expectedEntry = getBarEntryPoint(move.die, player);
  if (move.to !== expectedEntry) {
    return createInvalidResult(
      `Bar entry with die ${move.die} must be to point ${expectedEntry} (attempted to ${move.to})`
    );
  }

  return createValidResult();
}
