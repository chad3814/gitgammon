/**
 * Table Module
 * Table creation and management for GitGammon
 * @module table
 */

// Type definitions (via JSDoc imports)
export * from './types.js';

// Constants
export {
  TABLES_DIRECTORY,
  MOVES_DIRECTORY,
  STATE_FILENAME,
  TABLE_ID_PATTERN,
  MIN_TABLE_ID_LENGTH,
  JSON_INDENT
} from './constants.js';

// Validation utilities
export { validateTableId } from './validate.js';

// ID generation
export { generateTableId } from './generate.js';

// Player validation
export { validatePlayers } from './players.js';

// File system operations
export {
  tableExists,
  createTableDirectory,
  cleanupTableDirectory,
  getTablePath,
  getStatePath,
  getMovesPath
} from './filesystem.js';

// Main table creation
export { createTable } from './create.js';
