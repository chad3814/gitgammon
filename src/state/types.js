/**
 * Game State Type Definitions
 * JSDoc type definitions for GitGammon game state
 * @module state/types
 */

/**
 * Player color identifier
 * @typedef {'white' | 'black'} PlayerColor
 */

/**
 * Game status indicator
 * @typedef {'playing' | 'completed'} GameStatus
 */

/**
 * Message type indicator
 * @typedef {'error' | 'info' | 'warning'} MessageType
 */

/**
 * Player pieces count (for bar/home)
 * @typedef {Object} PlayerPieces
 * @property {number} white - Count of white pieces (0-15)
 * @property {number} black - Count of black pieces (0-15)
 */

/**
 * Player identity mapping
 * @typedef {Object} Players
 * @property {string} white - GitHub username of white player
 * @property {string} black - GitHub username of black player
 */

/**
 * Reference to the last applied move
 * @typedef {Object} LastMove
 * @property {number} sequence - Move sequence number (1-indexed)
 * @property {PlayerColor} player - Player who made the move
 * @property {string} file - Filename of the move file (e.g., "0011-white-a3f2e1.json")
 */

/**
 * System message entry
 * @typedef {Object} Message
 * @property {MessageType} type - Type of message
 * @property {string} text - Message content
 * @property {string} timestamp - ISO 8601 timestamp
 */

/**
 * Complete game state object
 * @typedef {Object} GameState
 * @property {number} turn - Current turn number (1-indexed)
 * @property {PlayerColor} activePlayer - Player whose turn it is to move
 * @property {number[]} dice - Current dice values (2-4 elements, values 1-6)
 * @property {number[]} diceUsed - Dice values already used this turn
 * @property {number[]} board - 24-element array (positive=white, negative=black)
 * @property {PlayerPieces} bar - Pieces on the bar waiting to re-enter
 * @property {PlayerPieces} home - Pieces successfully borne off
 * @property {LastMove | null} lastMove - Reference to last applied move, null for initial state
 * @property {GameStatus} status - Current game status
 * @property {PlayerColor | null} winner - Winner of the game, null while playing
 * @property {Players} players - Player identity mapping
 * @property {Message[]} messages - System messages and error notifications
 * @property {string} updatedAt - ISO 8601 timestamp of last state update
 */

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string[]} errors - Array of error messages (empty if valid)
 */

export {};
