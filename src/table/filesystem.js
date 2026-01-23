/**
 * Table File System Operations
 * Directory creation and management for game tables
 * @module table/filesystem
 */

import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import {
  TABLES_DIRECTORY,
  MOVES_DIRECTORY,
  STATE_FILENAME
} from './constants.js';

/**
 * Get the full path to a table directory
 * @param {string} tableId - The table ID
 * @param {string} [basePath] - Base path (defaults to process.cwd())
 * @returns {string} Full path to table directory
 */
export function getTablePath(tableId, basePath = process.cwd()) {
  return join(basePath, TABLES_DIRECTORY, tableId);
}

/**
 * Get the full path to a table's state.json file
 * @param {string} tableId - The table ID
 * @param {string} [basePath] - Base path (defaults to process.cwd())
 * @returns {string} Full path to state.json
 */
export function getStatePath(tableId, basePath = process.cwd()) {
  return join(getTablePath(tableId, basePath), STATE_FILENAME);
}

/**
 * Get the full path to a table's moves directory
 * @param {string} tableId - The table ID
 * @param {string} [basePath] - Base path (defaults to process.cwd())
 * @returns {string} Full path to moves directory
 */
export function getMovesPath(tableId, basePath = process.cwd()) {
  return join(getTablePath(tableId, basePath), MOVES_DIRECTORY);
}

/**
 * Check if a table directory already exists
 * @param {string} tableId - The table ID to check
 * @param {string} [basePath] - Base path (defaults to process.cwd())
 * @returns {boolean} True if table directory exists
 */
export function tableExists(tableId, basePath = process.cwd()) {
  const tablePath = getTablePath(tableId, basePath);
  return existsSync(tablePath);
}

/**
 * Create the directory structure for a new table
 * Creates tables/{id}/ and tables/{id}/moves/ directories
 *
 * @param {string} tableId - The table ID
 * @param {string} [basePath] - Base path (defaults to process.cwd())
 * @throws {Error} If table directory already exists
 */
export function createTableDirectory(tableId, basePath = process.cwd()) {
  const tablePath = getTablePath(tableId, basePath);
  const movesPath = getMovesPath(tableId, basePath);

  // Check for existing directory
  if (existsSync(tablePath)) {
    throw new Error(`Table already exists: ${tableId}`);
  }

  // Create table directory and moves subdirectory
  mkdirSync(movesPath, { recursive: true });
}

/**
 * Clean up a table directory (for error recovery)
 * Removes the table directory and all contents
 *
 * @param {string} tableId - The table ID to clean up
 * @param {string} [basePath] - Base path (defaults to process.cwd())
 */
export function cleanupTableDirectory(tableId, basePath = process.cwd()) {
  const tablePath = getTablePath(tableId, basePath);

  // Only remove if directory exists
  if (existsSync(tablePath)) {
    rmSync(tablePath, { recursive: true, force: true });
  }
}
