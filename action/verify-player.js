/**
 * Player Identity Verification Module
 * Verifies commit author matches player in move file
 * @module action/verify-player
 */

/**
 * Verify that the commit author is authorized to make this move
 * @param {string} actor - GitHub actor (commit author username)
 * @param {object} state - Current game state
 * @param {object} moveFile - Move file being submitted
 * @returns {{ valid: boolean, errors: string[], playerColor: string | null }}
 */
export function verifyPlayer(actor, state, moveFile) {
  const errors = [];
  let playerColor = null;

  // Find what color the actor plays
  if (state.players.white === actor) {
    playerColor = 'white';
  } else if (state.players.black === actor) {
    playerColor = 'black';
  }

  // Check if actor is a registered player
  if (!playerColor) {
    errors.push(
      `User "${actor}" is not a registered player in this game. ` +
      `Players are: white=${state.players.white}, black=${state.players.black}`
    );
    return { valid: false, errors, playerColor: null };
  }

  // Check if actor is playing as their own color
  if (playerColor !== moveFile.player) {
    errors.push(
      `User "${actor}" plays as ${playerColor} but cannot play as ${moveFile.player}`
    );
    return { valid: false, errors, playerColor };
  }

  return { valid: true, errors: [], playerColor };
}
