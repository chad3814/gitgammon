/**
 * Move Application Module
 * Applies validated moves to game state
 * @module action/apply-move
 */

import { BAR_POSITION, BEAR_OFF_POSITION } from '../src/validation/constants.js';

/**
 * Apply moves from move file to game state
 * @param {object} state - Current game state
 * @param {object} moveFile - Move file with moves to apply
 * @returns {object} New state with moves applied
 */
export function applyMoves(state, moveFile) {
  const newState = cloneState(state);
  const player = moveFile.player;

  for (const move of moveFile.moves) {
    applyMove(newState, move, player);
  }

  // Update diceUsed
  newState.diceUsed = moveFile.moves.map(m => m.die);

  return newState;
}

/**
 * Apply a single move to game state (mutates state)
 * @param {object} state - Game state to mutate
 * @param {object} move - Single move to apply
 * @param {string} player - Player making the move
 */
function applyMove(state, move, player) {
  const { from, to } = move;

  // Remove piece from source
  if (from === BAR_POSITION) {
    state.bar[player]--;
  } else {
    if (player === 'white') {
      state.board[from]--;
    } else {
      state.board[from]++;
    }
  }

  // Handle destination
  if (to === BEAR_OFF_POSITION) {
    // Bear off
    state.home[player]++;
  } else {
    // Check for hit (opponent has exactly 1 piece)
    const destValue = state.board[to];
    const isOpponent = player === 'white' ? destValue < 0 : destValue > 0;

    if (isOpponent && Math.abs(destValue) === 1) {
      // Hit opponent's blot
      const opponent = player === 'white' ? 'black' : 'white';
      state.bar[opponent]++;
      state.board[to] = 0;
    }

    // Add piece to destination
    if (player === 'white') {
      state.board[to]++;
    } else {
      state.board[to]--;
    }
  }
}

/**
 * Deep clone a game state
 * @param {object} state - State to clone
 * @returns {object} Cloned state
 */
function cloneState(state) {
  return {
    ...state,
    board: [...state.board],
    bar: { ...state.bar },
    home: { ...state.home },
    dice: [...state.dice],
    diceUsed: [...state.diceUsed],
    messages: [...state.messages]
  };
}
