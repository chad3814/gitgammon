/**
 * Move Schema Module
 * Exports the JSON schema for move file validation
 * @module moves/schema
 */

import moveSchema from './move.schema.json' with { type: 'json' };

/**
 * JSON Schema for GitGammon move files
 * @type {object}
 */
export { moveSchema };

/**
 * Load the move schema for use with validation libraries
 * @returns {object} The JSON Schema object
 */
export function getMoveSchema() {
  return moveSchema;
}

export default moveSchema;
