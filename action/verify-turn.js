/**
 * Turn Verification Module
 * Verifies it is the correct player's turn
 * @module action/verify-turn
 */

/**
 * Verify that the move is from the active player
 * @param {object} state - Current game state
 * @param {object} moveFile - Move file being submitted
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function verifyTurn(state, moveFile) {
  const errors = [];

  if (state.activePlayer !== moveFile.player) {
    errors.push(
      `It is ${state.activePlayer}'s turn, not ${moveFile.player}'s`
    );
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}
