/**
 * Turn-End Roll Module
 * Handles dice rolling for next turn with no-move detection
 * @module dice/turn-roll
 */

import { calculateLegalMoves } from '../validation/forced-moves.js';
import { getOpponent } from '../validation/constants.js';
import { rollDice } from './roll.js';
import { createDiceResult } from './result.js';
import { createAutoPassMessage } from './messages.js';
import { MAX_AUTO_PASS_ITERATIONS } from './constants.js';

/**
 * Check if a player has any legal moves with given dice
 * @param {import('../state/types.js').GameState} gameState - Current game state
 * @param {number[]} dice - Dice to check moves for
 * @param {import('../state/types.js').PlayerColor} player - Player to check
 * @returns {boolean} True if at least one legal move exists
 */
export function checkForLegalMoves(gameState, dice, player) {
  const legalMoves = calculateLegalMoves(gameState, dice, player);
  return legalMoves.length > 0;
}

/**
 * Roll dice for the next turn, handling auto-pass if no legal moves
 * @param {import('../state/types.js').GameState} gameState - Current game state
 * @returns {import('./types.js').DiceRollResult} Result with new dice and any auto-pass info
 */
export function rollForNextTurn(gameState) {
  const messages = [];
  let autoPass = false;
  let iterations = 0;

  // Start with opponent of current active player
  let nextPlayer = getOpponent(gameState.activePlayer);
  let dice = rollDice();

  // Check for legal moves, auto-pass if none
  while (iterations < MAX_AUTO_PASS_ITERATIONS) {
    const hasLegal = checkForLegalMoves(gameState, dice, nextPlayer);

    if (hasLegal) {
      // Player can move, we're done
      break;
    }

    // No legal moves - auto-pass
    autoPass = true;
    messages.push(createAutoPassMessage(nextPlayer, dice));

    // Switch to other player and roll new dice
    nextPlayer = getOpponent(nextPlayer);
    dice = rollDice();
    iterations++;
  }

  // After max iterations, just return current state (both players blocked)
  // This is a very rare case but we need to handle it
  if (iterations >= MAX_AUTO_PASS_ITERATIONS) {
    // Check if the final player has moves
    const finalHasLegal = checkForLegalMoves(gameState, dice, nextPlayer);
    if (!finalHasLegal) {
      // Both players truly blocked - add final message
      messages.push(createAutoPassMessage(nextPlayer, dice));
    }
  }

  return createDiceResult(dice, {
    autoPass,
    messages,
    activePlayer: nextPlayer
  });
}
