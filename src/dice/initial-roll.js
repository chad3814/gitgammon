/**
 * Initial Game Roll Module
 * Determines which player goes first using standard backgammon rules
 * @module dice/initial-roll
 */

import { rollDie } from './roll.js';
import { createInitialRollResult } from './result.js';
import { MAX_TIE_BREAK_ITERATIONS } from './constants.js';

/**
 * Roll for starting player using standard backgammon rules
 * Each player conceptually rolls one die, higher roll goes first
 * Ties are re-rolled until resolved
 *
 * @returns {import('./types.js').InitialRollResult} Starting player and winning dice
 * @throws {Error} If tie-breaking exceeds safety limit (should never happen)
 */
export function rollForStart() {
  let whiteDie;
  let blackDie;
  let iterations = 0;

  // Keep rolling until we get different values (no tie)
  do {
    whiteDie = rollDie();
    blackDie = rollDie();
    iterations++;

    if (iterations > MAX_TIE_BREAK_ITERATIONS) {
      throw new Error('Initial roll tie-breaking exceeded safety limit');
    }
  } while (whiteDie === blackDie);

  // Determine winner - higher die wins
  const whiteWins = whiteDie > blackDie;
  const startingPlayer = whiteWins ? 'white' : 'black';

  // Return dice ordered high to low (winner's die first)
  const dice = whiteWins
    ? [whiteDie, blackDie]
    : [blackDie, whiteDie];

  return createInitialRollResult(startingPlayer, dice);
}
