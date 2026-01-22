/**
 * Dice Rolling Integration Module
 * Rolls dice for the next turn
 * @module action/roll-dice
 */

import { rollForNextTurn } from '../src/dice/turn-roll.js';

/**
 * Roll dice for the next turn
 * @param {object} state - Current game state (after move applied)
 * @returns {{ dice: number[], diceUsed: number[], autoPass: boolean, messages: object[], activePlayer: string }}
 */
export function rollDiceForNextTurn(state) {
  const result = rollForNextTurn(state);

  return {
    dice: result.dice,
    diceUsed: result.diceUsed,
    autoPass: result.autoPass,
    messages: result.messages || [],
    activePlayer: result.activePlayer
  };
}

/**
 * Merge dice roll result into state
 * @param {object} state - Current game state
 * @param {object} diceResult - Result from rollDiceForNextTurn
 * @returns {object} State with dice info merged
 */
export function mergeDiceResult(state, diceResult) {
  const newState = {
    ...state,
    dice: diceResult.dice,
    diceUsed: diceResult.diceUsed,
    activePlayer: diceResult.activePlayer,
    messages: [...state.messages, ...diceResult.messages]
  };

  return newState;
}
