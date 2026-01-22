/**
 * Win Detection Module
 * Detects if a player has won the game
 * @module action/detect-win
 */

const PIECES_PER_PLAYER = 15;

/**
 * Detect if a player has won the game
 * @param {object} state - Current game state
 * @param {string} player - Player to check for win
 * @returns {{ won: boolean, winner: string | null, state: object }}
 */
export function detectWin(state, player) {
  const piecesHome = state.home[player];
  const won = piecesHome === PIECES_PER_PLAYER;

  if (won) {
    return {
      won: true,
      winner: player,
      state: {
        ...state,
        status: 'completed',
        winner: player
      }
    };
  }

  return {
    won: false,
    winner: null,
    state
  };
}
