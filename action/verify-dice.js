/**
 * Dice Verification Module
 * Verifies that move file dice match server-controlled state dice
 * @module action/verify-dice
 */

/**
 * Verify that the move file's dice roll matches the state dice
 * @param {object} state - Current game state
 * @param {object} moveFile - Move file being submitted
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function verifyDice(state, moveFile) {
  const errors = [];

  const stateDice = [...state.dice].sort((a, b) => a - b);
  const moveDice = [...moveFile.diceRoll].sort((a, b) => a - b);

  const diceMatch =
    stateDice.length === moveDice.length &&
    stateDice.every((die, index) => die === moveDice[index]);

  if (!diceMatch) {
    errors.push(
      `Dice mismatch: state has [${stateDice.join(', ')}] but move claims [${moveDice.join(', ')}]`
    );
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}
