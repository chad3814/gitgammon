/**
 * State Finalization Module
 * Finalizes state after move application
 * @module action/finalize-state
 */

import { validateState } from '../src/state/validation.js';

/**
 * Finalize game state after move application
 * @param {object} state - Current game state
 * @param {object} params
 * @param {string} params.player - Player who made the move
 * @param {number} params.sequence - Move sequence number
 * @param {string} params.filename - Move filename
 * @returns {object} Finalized state
 * @throws {Error} If final state is invalid
 */
export function finalizeState(state, { player, sequence, filename }) {
  const finalState = {
    ...state,
    lastMove: {
      sequence,
      player,
      file: filename  // Schema uses 'file' not 'filename'
    },
    turn: state.turn + 1,
    updatedAt: new Date().toISOString()
  };

  // Validate final state
  const validation = validateState(finalState);
  if (!validation.valid) {
    throw new Error(`Invalid state after move: ${validation.errors.join(', ')}`);
  }

  return finalState;
}
