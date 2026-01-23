/**
 * Validation Pipeline Module
 * Orchestrates all validation steps
 * @module action/validation-pipeline
 */

import { verifyPlayer } from './verify-player.js';
import { verifyTurn } from './verify-turn.js';
import { verifyDice } from './verify-dice.js';
import { verifyStateHash } from './verify-hash.js';
import { validateMoveFileSchema } from './validate-move-file.js';
import { validateGameRules } from './validate-rules.js';

/**
 * Run the complete validation pipeline
 * @param {object} params
 * @param {string} params.actor - GitHub actor username
 * @param {object} params.state - Current game state
 * @param {object} params.moveFile - Move file to validate
 * @param {string} params.filename - Move filename
 * @returns {Promise<{ valid: boolean, errors: string[], playerColor: string | null }>}
 */
export async function runValidationPipeline({ actor, state, moveFile, filename }) {
  const allErrors = [];
  let playerColor = null;

  // 1. Verify player identity
  const playerResult = verifyPlayer(actor, state, moveFile);
  if (!playerResult.valid) {
    allErrors.push(...playerResult.errors);
  }
  playerColor = playerResult.playerColor;

  // 2. Verify it's the correct player's turn
  const turnResult = verifyTurn(state, moveFile);
  if (!turnResult.valid) {
    allErrors.push(...turnResult.errors);
  }

  // 2.5. Verify dice match between state and move file
  const diceResult = verifyDice(state, moveFile);
  if (!diceResult.valid) {
    allErrors.push(...diceResult.errors);
  }

  // 3. Verify state hash (move is not stale)
  const hashResult = verifyStateHash(state, moveFile);
  if (!hashResult.valid) {
    allErrors.push(...hashResult.errors);
  }

  // 4. Validate move file schema and format
  const schemaResult = validateMoveFileSchema(moveFile, filename);
  if (!schemaResult.valid) {
    allErrors.push(...schemaResult.errors);
  }

  // 5. Validate game rules (only if schema is valid)
  if (schemaResult.valid) {
    const rulesResult = validateGameRules(state, moveFile);
    if (!rulesResult.valid) {
      allErrors.push(...rulesResult.errors);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    playerColor
  };
}
