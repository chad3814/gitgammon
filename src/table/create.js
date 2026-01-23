/**
 * Table Creation Module
 * Main table creation logic
 * @module table/create
 */

import { writeFileSync } from 'node:fs';
import { createInitialState } from '../state/initial.js';
import { rollForStart } from '../dice/initial-roll.js';
import { validateTableId } from './validate.js';
import { validatePlayers } from './players.js';
import { generateTableId } from './generate.js';
import {
  tableExists,
  createTableDirectory,
  cleanupTableDirectory,
  getTablePath,
  getStatePath
} from './filesystem.js';
import { JSON_INDENT } from './constants.js';

/**
 * Create a new game table with initial state
 *
 * @param {import('./types.js').TableCreationOptions} options - Table creation options
 * @returns {import('./types.js').TableCreationResult} Result of table creation
 */
export function createTable(options) {
  const { white, black, basePath } = options;
  let tableId = options.tableId;

  // Validate players first (before any file operations)
  const playersValidation = validatePlayers({ white, black });
  if (!playersValidation.valid) {
    return {
      success: false,
      tableId: tableId || '',
      tablePath: '',
      statePath: '',
      error: playersValidation.error
    };
  }

  // Generate table ID if not provided
  if (!tableId) {
    tableId = generateTableId({ white, black });
  }

  // Validate table ID format
  const idValidation = validateTableId(tableId);
  if (!idValidation.valid) {
    return {
      success: false,
      tableId,
      tablePath: '',
      statePath: '',
      error: idValidation.error
    };
  }

  // Check for existing table
  if (tableExists(tableId, basePath)) {
    return {
      success: false,
      tableId,
      tablePath: getTablePath(tableId, basePath),
      statePath: getStatePath(tableId, basePath),
      error: `Table already exists: ${tableId}`
    };
  }

  try {
    // Create directory structure
    createTableDirectory(tableId, basePath);

    // Roll for starting player
    const rollResult = rollForStart();

    // Create initial state
    const state = createInitialState(
      { white, black },
      rollResult.dice
    );

    // Write state.json with formatted output
    const statePath = getStatePath(tableId, basePath);
    const stateJson = JSON.stringify(state, null, JSON_INDENT);
    writeFileSync(statePath, stateJson, 'utf-8');

    return {
      success: true,
      tableId,
      tablePath: getTablePath(tableId, basePath),
      statePath
    };
  } catch (error) {
    // Clean up on failure
    cleanupTableDirectory(tableId, basePath);

    return {
      success: false,
      tableId,
      tablePath: '',
      statePath: '',
      error: error.message
    };
  }
}
