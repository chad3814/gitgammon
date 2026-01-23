/**
 * Table Module Constants
 * @module table/constants
 */

/**
 * Directory name for all game tables
 * @type {string}
 */
export const TABLES_DIRECTORY = 'tables';

/**
 * Directory name for move files within a table
 * @type {string}
 */
export const MOVES_DIRECTORY = 'moves';

/**
 * Filename for game state
 * @type {string}
 */
export const STATE_FILENAME = 'state.json';

/**
 * Regular expression pattern for valid table IDs
 * Allows lowercase letters, numbers, and hyphens
 * Must not start or end with a hyphen
 * @type {RegExp}
 */
export const TABLE_ID_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

/**
 * Minimum length for table IDs
 * @type {number}
 */
export const MIN_TABLE_ID_LENGTH = 2;

/**
 * JSON indentation for formatted output (Git readability)
 * @type {number}
 */
export const JSON_INDENT = 2;
