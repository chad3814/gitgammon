/**
 * Win Detection Module
 * Detects if a player has won the game and calculates win type
 * @module action/detect-win
 */

import {
  getOpponent,
  isOpponentPiece,
  WHITE_HOME_RANGE,
  BLACK_HOME_RANGE
} from '../src/validation/constants.js';

const PIECES_PER_PLAYER = 15;

/**
 * Get the home board range for the winner
 * The winner's home board is where opponent pieces would need to be
 * for a backgammon to occur
 * @param {import('../src/state/types.js').PlayerColor} winner - Winner player color
 * @returns {[number, number]} Tuple of [start, end] point indices for winner's home board
 */
export function getWinnerHomeRange(winner) {
  return winner === 'white' ? WHITE_HOME_RANGE : BLACK_HOME_RANGE;
}

/**
 * Check if opponent has pieces in the winner's home board
 * This is one condition for a backgammon win
 * @param {object} state - Current game state
 * @param {import('../src/state/types.js').PlayerColor} winner - Winner player color
 * @returns {boolean} True if opponent has pieces in winner's home board
 */
export function hasOpponentPiecesInWinnerHome(state, winner) {
  const [start, end] = getWinnerHomeRange(winner);

  for (let point = start; point <= end; point++) {
    const boardValue = state.board[point];
    if (isOpponentPiece(boardValue, winner)) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate the win type based on opponent's position
 * @param {object} state - Current game state
 * @param {import('../src/state/types.js').PlayerColor} winner - Winner player color
 * @returns {{ winType: 'single' | 'gammon' | 'backgammon', multiplier: number }}
 */
export function calculateWinType(state, winner) {
  const opponent = getOpponent(winner);
  const opponentHome = state.home[opponent];

  // Single win: opponent has borne off at least one piece
  if (opponentHome >= 1) {
    return { winType: 'single', multiplier: 1 };
  }

  // Opponent has 0 pieces home - check for backgammon conditions
  const opponentOnBar = state.bar[opponent] > 0;
  const opponentInWinnerHome = hasOpponentPiecesInWinnerHome(state, winner);

  // Backgammon: opponent has pieces on bar OR in winner's home board
  if (opponentOnBar || opponentInWinnerHome) {
    return { winType: 'backgammon', multiplier: 3 };
  }

  // Gammon: opponent has 0 home, no pieces on bar, no pieces in winner's home
  return { winType: 'gammon', multiplier: 2 };
}

/**
 * Detect if a player has won the game and determine win type
 * @param {object} state - Current game state
 * @param {import('../src/state/types.js').PlayerColor} player - Player to check for win
 * @returns {{
 *   won: boolean,
 *   winner: import('../src/state/types.js').PlayerColor | null,
 *   winType: 'single' | 'gammon' | 'backgammon' | null,
 *   multiplier: number,
 *   state: object
 * }} Win detection result with type and multiplier
 */
export function detectWin(state, player) {
  const piecesHome = state.home[player];
  const won = piecesHome === PIECES_PER_PLAYER;

  if (won) {
    const { winType, multiplier } = calculateWinType(state, player);

    return {
      won: true,
      winner: player,
      winType,
      multiplier,
      state: {
        ...state,
        status: 'completed',
        winner: player,
        winType
      }
    };
  }

  return {
    won: false,
    winner: null,
    winType: null,
    multiplier: 1,
    state
  };
}
