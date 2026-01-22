/**
 * Dice Module Type Definitions
 * JSDoc type definitions for dice rolling operations
 * @module dice/types
 */

/**
 * Result of a dice roll operation
 * @typedef {Object} DiceRollResult
 * @property {number[]} dice - The dice values rolled (2 values, 1-6 each)
 * @property {number[]} diceUsed - Dice values already used (empty for new roll)
 * @property {boolean} autoPass - Whether turn was auto-passed due to no legal moves
 * @property {import('../state/types.js').Message[]} messages - Messages generated during roll
 * @property {import('../state/types.js').PlayerColor} [activePlayer] - Only set if autoPass occurred
 */

/**
 * Result of initial game roll to determine starting player
 * @typedef {Object} InitialRollResult
 * @property {import('../state/types.js').PlayerColor} startingPlayer - Player who goes first
 * @property {number[]} dice - The winning dice roll (higher value first)
 */

export {};
