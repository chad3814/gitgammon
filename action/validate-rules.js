/**
 * Game Rule Validation Module
 * Validates moves against backgammon rules
 * @module action/validate-rules
 */

import { validateMoves } from '../src/validation/validate-move.js';

/**
 * Validate moves against game rules
 * @param {object} state - Current game state
 * @param {object} moveFile - Move file to validate
 * @returns {{ valid: boolean, errors: string[], hitInfo?: object, forcedMoveInfo?: object }}
 */
export function validateGameRules(state, moveFile) {
  // Create state with current dice from move file
  const stateWithDice = {
    ...state,
    dice: moveFile.diceRoll,
    diceUsed: []
  };

  const result = validateMoves(stateWithDice, moveFile.moves, moveFile.player);

  return {
    valid: result.valid,
    errors: result.errors || [],
    hitInfo: result.hitInfo,
    forcedMoveInfo: result.forcedMoveInfo
  };
}
