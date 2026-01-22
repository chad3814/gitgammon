/**
 * State Loader Module
 * Loads and parses game state files
 * @module action/state-loader
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Load state.json for a table
 * @param {string} tableName - Name of the table
 * @param {string} [basePath] - Base path (defaults to cwd)
 * @returns {object} Parsed state object
 * @throws {Error} If state file is missing or malformed
 */
export function loadState(tableName, basePath = process.cwd()) {
  const statePath = join(basePath, 'tables', tableName, 'state.json');

  if (!existsSync(statePath)) {
    throw new Error(
      `state.json not found for table "${tableName}" at path: ${statePath}`
    );
  }

  try {
    const content = readFileSync(statePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Malformed JSON in state.json for table "${tableName}": ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Get the path to a table's state file
 * @param {string} tableName - Name of the table
 * @param {string} [basePath] - Base path (defaults to cwd)
 * @returns {string} Full path to state.json
 */
export function getStatePath(tableName, basePath = process.cwd()) {
  return join(basePath, 'tables', tableName, 'state.json');
}
