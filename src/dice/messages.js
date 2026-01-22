/**
 * Message Generation for Dice Events
 * @module dice/messages
 */

/**
 * Create an auto-pass message when a player cannot make any legal moves
 * @param {import('../state/types.js').PlayerColor} player - Player who cannot move
 * @param {number[]} dice - The dice roll that had no legal moves
 * @returns {import('../state/types.js').Message} Message object
 */
export function createAutoPassMessage(player, dice) {
  return {
    type: 'info',
    text: `Player ${player} cannot move with roll [${dice[0]}, ${dice[1]}], turn passes`,
    timestamp: new Date().toISOString()
  };
}
