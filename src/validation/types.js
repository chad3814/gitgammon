/**
 * Move Validation Type Definitions
 * JSDoc type definitions for move validation module
 * @module validation/types
 */

/**
 * Player color identifier
 * @typedef {'white' | 'black'} PlayerColor
 */

/**
 * Information about a blot hit during a move
 * @typedef {Object} HitInfo
 * @property {number} point - Board point where the hit occurred (0-23)
 * @property {PlayerColor} player - Color of the player whose piece was hit
 */

/**
 * Information about forced move analysis
 * @typedef {Object} ForcedMoveInfo
 * @property {boolean} moreMovesAvailable - Whether more moves could have been made
 * @property {number} maxDiceUsable - Maximum dice that could be used from this position
 * @property {number} diceUsed - Number of dice actually used in the moves
 */

/**
 * Extended validation result for move validation
 * @typedef {Object} MoveValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string[]} errors - Array of error messages (empty if valid)
 * @property {HitInfo} [hitInfo] - Information about blot hit, if one occurred
 * @property {ForcedMoveInfo} [forcedMoveInfo] - Information about forced move analysis
 */

/**
 * Single move within a turn
 * @typedef {Object} SingleMove
 * @property {number} from - Source: -1 for bar, 0-23 for board points
 * @property {number} to - Destination: 0-23 for board points, 24 for bear-off
 * @property {number} die - Die value used for this move (1-6)
 */

/**
 * Validator function signature
 * @callback ValidatorFunction
 * @param {import('../state/types.js').GameState} gameState - Current game state
 * @param {SingleMove} move - The move to validate
 * @param {PlayerColor} player - The player making the move
 * @returns {MoveValidationResult} Validation result
 */

/**
 * Legal move with its associated die value
 * @typedef {Object} LegalMove
 * @property {number} from - Source point
 * @property {number} to - Destination point
 * @property {number} die - Die value used
 */

/**
 * Move tree node for forced move calculation
 * @typedef {Object} MoveTreeNode
 * @property {LegalMove} move - The move at this node
 * @property {number[]} remainingDice - Dice remaining after this move
 * @property {MoveTreeNode[]} children - Child nodes representing subsequent moves
 */

export {};
