/**
 * Valid Move Commit Module
 * Commits valid moves to the repository
 * @module action/commit-valid
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { log, logInfo } from './logger.js';

/**
 * Commit a valid move
 * @param {object} params
 * @param {string} params.tableName - Table name
 * @param {number} params.sequence - Move sequence number
 * @param {string} params.player - Player who made the move
 * @param {object} params.state - Updated game state
 * @param {string} [params.basePath] - Base path (defaults to cwd)
 */
export function commitValidMove({ tableName, sequence, player, state, basePath = process.cwd() }) {
  const statePath = join(basePath, 'tables', tableName, 'state.json');

  // Write updated state
  writeFileSync(statePath, JSON.stringify(state, null, 2));
  logInfo(`Updated state.json for table: ${tableName}`);

  // Stage the state file
  execSync(`git add "${statePath}"`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Create commit
  const commitMessage = `[GitGammon] Apply move ${sequence} by ${player}`;
  execSync(`git commit -m "${commitMessage}"`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  logInfo(`Committed: ${commitMessage}`);
}

/**
 * Write state to file without committing
 * @param {string} tableName - Table name
 * @param {object} state - Game state
 * @param {string} [basePath] - Base path
 */
export function writeState(tableName, state, basePath = process.cwd()) {
  const statePath = join(basePath, 'tables', tableName, 'state.json');
  writeFileSync(statePath, JSON.stringify(state, null, 2));
}
