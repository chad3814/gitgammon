/**
 * Initial Game State Module
 * Factory functions for creating new game states
 * @module state/initial
 */

import { PIECES_PER_PLAYER, BOARD_POINTS } from './constants.js';

/**
 * Standard backgammon initial board position
 * 24-element array where:
 * - Positive integers = white pieces
 * - Negative integers = black pieces
 * - Zero = empty point
 * - Index 0 = Point 1 (white's home board corner)
 * - Index 23 = Point 24 (black's home board corner)
 *
 * @type {readonly number[]}
 */
export const INITIAL_BOARD = Object.freeze([
  2, 0, 0, 0, 0, -5,   // Points 1-6
  0, -3, 0, 0, 0, 5,   // Points 7-12
  -5, 0, 0, 0, 3, 0,   // Points 13-18
  5, 0, 0, 0, 0, -2    // Points 19-24
]);

/**
 * Create a new initial game state
 * @param {import('./types.js').Players} players - Player GitHub usernames
 * @param {number[]} dice - Initial dice roll (determines starting player)
 * @returns {import('./types.js').GameState} Complete initial game state
 */
export function createInitialState(players, dice) {
  if (!players || !players.white || !players.black) {
    throw new Error('Players object with white and black usernames is required');
  }

  if (!Array.isArray(dice) || dice.length < 2) {
    throw new Error('Dice array with at least 2 values is required');
  }

  const now = new Date().toISOString();

  // Determine starting player from dice roll
  // Higher die goes first; if equal, convention is white starts
  const activePlayer = dice[0] >= dice[1] ? 'white' : 'black';

  // Check for doubles (all dice same value)
  const isDoubles = dice.length === 4 && dice.every(d => d === dice[0]);
  const normalizedDice = isDoubles ? dice : dice.slice(0, 2);

  return {
    turn: 1,
    activePlayer,
    dice: normalizedDice,
    diceUsed: [],
    board: [...INITIAL_BOARD],
    bar: { white: 0, black: 0 },
    home: { white: 0, black: 0 },
    lastMove: null,
    status: 'playing',
    winner: null,
    players: {
      white: players.white,
      black: players.black
    },
    messages: [
      {
        type: 'info',
        text: `Game started. ${activePlayer.charAt(0).toUpperCase() + activePlayer.slice(1)} to move.`,
        timestamp: now
      }
    ],
    updatedAt: now
  };
}

/**
 * Count pieces of a specific color on the board
 * @param {number[]} board - The board array
 * @param {'white' | 'black'} color - The color to count
 * @returns {number} Number of pieces on the board
 */
export function countBoardPieces(board, color) {
  if (color === 'white') {
    return board.reduce((sum, point) => sum + (point > 0 ? point : 0), 0);
  }
  return board.reduce((sum, point) => sum + (point < 0 ? Math.abs(point) : 0), 0);
}

/**
 * Count total pieces for a color (board + bar + home)
 * @param {import('./types.js').GameState} state - The game state
 * @param {'white' | 'black'} color - The color to count
 * @returns {number} Total pieces for the color
 */
export function countTotalPieces(state, color) {
  const boardPieces = countBoardPieces(state.board, color);
  const barPieces = state.bar[color];
  const homePieces = state.home[color];
  return boardPieces + barPieces + homePieces;
}
