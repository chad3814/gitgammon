/**
 * Result Factory Functions for Dice Operations
 * @module dice/result
 */

/**
 * Create a DiceRollResult object with sensible defaults
 * @param {number[]} dice - The dice values rolled
 * @param {Object} [options={}] - Optional overrides
 * @param {number[]} [options.diceUsed=[]] - Dice values already used
 * @param {boolean} [options.autoPass=false] - Whether turn was auto-passed
 * @param {import('../state/types.js').Message[]} [options.messages=[]] - Messages to include
 * @param {import('../state/types.js').PlayerColor} [options.activePlayer] - Active player (if auto-pass)
 * @returns {import('./types.js').DiceRollResult} Dice roll result object
 */
export function createDiceResult(dice, options = {}) {
  const result = {
    dice,
    diceUsed: options.diceUsed ?? [],
    autoPass: options.autoPass ?? false,
    messages: options.messages ?? []
  };

  // Only include activePlayer if provided (indicates auto-pass occurred)
  if (options.activePlayer !== undefined) {
    result.activePlayer = options.activePlayer;
  }

  return result;
}

/**
 * Create an InitialRollResult object
 * @param {import('../state/types.js').PlayerColor} startingPlayer - Player who goes first
 * @param {number[]} dice - The winning dice roll
 * @returns {import('./types.js').InitialRollResult} Initial roll result
 */
export function createInitialRollResult(startingPlayer, dice) {
  return {
    startingPlayer,
    dice
  };
}
