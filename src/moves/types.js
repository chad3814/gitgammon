/**
 * Move File Type Definitions
 * JSDoc type definitions for GitGammon move files
 * @module moves/types
 */

/**
 * Player color identifier
 * @typedef {'white' | 'black'} PlayerColor
 */

/**
 * Single move within a turn
 * @typedef {Object} SingleMove
 * @property {number} from - Source: -1 for bar, 0-23 for board points
 * @property {number} to - Destination: 0-23 for board points, 24 for bear-off
 * @property {number} die - Die value used for this move (1-6)
 */

/**
 * Complete move file object
 * @typedef {Object} MoveFile
 * @property {PlayerColor} player - Player making the move
 * @property {SingleMove[]} moves - Array of 1-4 individual moves
 * @property {string} timestamp - ISO 8601 timestamp when move was submitted
 * @property {string} expectedState - 16-char truncated SHA-256 of state.json before move
 * @property {number[]} diceRoll - Dice values being used (2 for normal, 4 for doubles)
 * @property {string | null} comment - Optional player comment (max 280 chars) or null
 * @property {string | null} commitSha - Full 40-char git commit SHA, null until GitHub Action commits
 */

/**
 * Parsed filename components
 * @typedef {Object} FilenameComponents
 * @property {number} sequence - Move sequence number (1-indexed, 1-9999)
 * @property {PlayerColor} player - Player who made the move
 * @property {string} sha - 6-character truncated SHA from filename
 */

/**
 * Validation result object
 * @typedef {Object} MoveValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string[]} errors - Array of error messages (empty if valid)
 */

/**
 * Options for creating a move file
 * @typedef {Object} CreateMoveFileOptions
 * @property {PlayerColor} player - Player making the move
 * @property {SingleMove[]} moves - Array of individual moves
 * @property {number[]} diceRoll - Dice values being used
 * @property {string} expectedState - Hash of current state
 * @property {string | null} [comment] - Optional player comment
 * @property {string} [timestamp] - Optional timestamp (defaults to now)
 */

export {};
