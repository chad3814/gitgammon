/**
 * State Hash Verification Module
 * Verifies move file's state hash matches current state
 * @module action/verify-hash
 */

import { computeStateHash } from '../src/moves/hash.js';

/**
 * Verify that the move file's expectedState hash matches current state
 * @param {object} state - Current game state
 * @param {object} moveFile - Move file being submitted
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function verifyStateHash(state, moveFile) {
  const errors = [];
  const currentHash = computeStateHash(state);
  const expectedHash = moveFile.expectedState;

  if (currentHash !== expectedHash) {
    errors.push(
      `State hash mismatch - move is stale. ` +
      `Expected: ${expectedHash}, Current: ${currentHash}. ` +
      `The game state has changed since this move was created.`
    );
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}
