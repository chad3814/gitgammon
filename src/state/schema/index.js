/**
 * Game State Schema Module
 * Exports the JSON schema for game state validation
 * @module state/schema
 */

import gameStateSchema from './game-state.schema.json' with { type: 'json' };

/**
 * JSON Schema for GitGammon game state
 * @type {object}
 */
export { gameStateSchema };

/**
 * Load the game state schema for use with validation libraries
 * @returns {object} The JSON Schema object
 */
export function getGameStateSchema() {
  return gameStateSchema;
}

export default gameStateSchema;
