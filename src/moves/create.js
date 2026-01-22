/**
 * Move File Factory
 * Create move file objects and related helpers
 * @module moves/create
 */

import { createHash } from 'node:crypto';
import { FILENAME_SHA_LENGTH } from './constants.js';
import { createFilename } from './filename.js';

/**
 * Create a single move object
 * @param {number} from - Source point (-1 for bar, 0-23 for board)
 * @param {number} to - Destination point (0-23 for board, 24 for bear-off)
 * @param {number} die - Die value used (1-6)
 * @returns {import('./types.js').SingleMove} Single move object
 */
export function createSingleMove(from, to, die) {
  return { from, to, die };
}

/**
 * Create a complete move file object
 * @param {import('./types.js').CreateMoveFileOptions} options - Move file options
 * @returns {import('./types.js').MoveFile} Complete move file object
 */
export function createMoveFile(options) {
  const {
    player,
    moves,
    diceRoll,
    expectedState,
    comment = null,
    timestamp = new Date().toISOString()
  } = options;

  return {
    player,
    moves,
    timestamp,
    expectedState,
    diceRoll,
    comment,
    commitSha: null
  };
}

/**
 * Generate a 6-character SHA for use in filename
 * Derived from the move file content for uniqueness
 * @param {import('./types.js').MoveFile} moveFile - The move file object
 * @returns {string} 6-character lowercase hexadecimal string
 */
export function generateFileSha(moveFile) {
  // Create a deterministic string from move content
  const contentString = JSON.stringify({
    player: moveFile.player,
    moves: moveFile.moves,
    timestamp: moveFile.timestamp,
    expectedState: moveFile.expectedState,
    diceRoll: moveFile.diceRoll
  });

  const hash = createHash('sha256')
    .update(contentString)
    .digest('hex');

  return hash.slice(0, FILENAME_SHA_LENGTH);
}

/**
 * Create a move file with its associated filename
 * @param {import('./types.js').CreateMoveFileOptions & { sequence: number }} options - Options including sequence number
 * @returns {{ moveFile: import('./types.js').MoveFile, filename: string }} Move file and filename
 */
export function createMoveFileWithFilename(options) {
  const { sequence, ...moveOptions } = options;
  const moveFile = createMoveFile(moveOptions);
  const sha = generateFileSha(moveFile);
  const filename = createFilename(sequence, moveFile.player, sha);

  return { moveFile, filename };
}
