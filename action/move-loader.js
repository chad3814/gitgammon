/**
 * Move Loader Module
 * Loads and parses move files
 * @module action/move-loader
 */

import { readFileSync, existsSync } from 'fs';
import { basename } from 'path';

/**
 * Load a move file
 * @param {string} moveFilePath - Path to the move file
 * @returns {{ moveFile: object, filename: string }} Parsed move file and filename
 * @throws {Error} If move file is missing or malformed
 */
export function loadMoveFile(moveFilePath) {
  if (!existsSync(moveFilePath)) {
    throw new Error(`Move file not found at path: ${moveFilePath}`);
  }

  const filename = basename(moveFilePath);

  try {
    const content = readFileSync(moveFilePath, 'utf-8');
    const moveFile = JSON.parse(content);
    return { moveFile, filename };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Malformed JSON in move file "${filename}": ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Extract sequence number from move filename
 * @param {string} filename - Move filename (e.g., "0001-white-a1b2c3.json")
 * @returns {number} Sequence number
 */
export function extractSequence(filename) {
  const match = filename.match(/^(\d{4})-/);
  if (!match) {
    return 0;
  }
  return parseInt(match[1], 10);
}
