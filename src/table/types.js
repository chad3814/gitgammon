/**
 * Table Module Type Definitions
 * JSDoc type definitions for table operations
 * @module table/types
 */

/**
 * Options for creating a new game table
 * @typedef {Object} TableCreationOptions
 * @property {string} white - GitHub username of white player
 * @property {string} black - GitHub username of black player
 * @property {string} [tableId] - Optional custom table ID (auto-generated if not provided)
 * @property {string} [basePath] - Base path for tables directory (defaults to process.cwd())
 */

/**
 * Result of a successful table creation
 * @typedef {Object} TableCreationResult
 * @property {boolean} success - Whether creation succeeded
 * @property {string} tableId - The table ID used
 * @property {string} tablePath - Path to the table directory
 * @property {string} statePath - Path to the state.json file
 * @property {string} [error] - Error message if success is false
 */

/**
 * Result of table ID validation
 * @typedef {Object} TableValidationResult
 * @property {boolean} valid - Whether the table ID is valid
 * @property {string} [error] - Error message if invalid
 */

/**
 * Result of player validation
 * @typedef {Object} PlayerValidationResult
 * @property {boolean} valid - Whether the players are valid
 * @property {string} [error] - Error message if invalid
 */

export {};
