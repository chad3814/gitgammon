/**
 * Invalid Move Handler Module
 * Handles invalid moves by deleting and recording error
 * @module action/commit-invalid
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { logError, logInfo } from './logger.js';

/**
 * Handle an invalid move
 * @param {object} params
 * @param {string} params.moveFilePath - Path to the invalid move file
 * @param {string} params.tableName - Table name
 * @param {string} params.reason - Reason for rejection
 * @param {object} params.state - Current game state
 * @param {string} [params.basePath] - Base path (defaults to cwd)
 */
export function handleInvalidMove({ moveFilePath, tableName, reason, state, basePath = process.cwd() }) {
  const statePath = join(basePath, 'tables', tableName, 'state.json');

  // Add error message to state
  const errorMessage = {
    type: 'error',
    text: `Invalid move rejected: ${reason}`,
    timestamp: new Date().toISOString()
  };
  state.messages.push(errorMessage);

  // Write updated state with error message
  writeFileSync(statePath, JSON.stringify(state, null, 2));
  logInfo(`Added error message to state: ${reason}`);

  // Delete the invalid move file using git rm
  try {
    execSync(`git rm -f "${moveFilePath}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    logInfo(`Deleted invalid move file: ${moveFilePath}`);
  } catch (error) {
    // File may not be tracked yet, try regular delete
    if (existsSync(moveFilePath)) {
      unlinkSync(moveFilePath);
      logInfo(`Deleted untracked move file: ${moveFilePath}`);
    }
  }

  // Stage state changes
  execSync(`git add "${statePath}"`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Create commit with rejection message
  const truncatedReason = reason.length > 50 ? reason.slice(0, 47) + '...' : reason;
  const commitMessage = `[GitGammon] Reject invalid move: ${truncatedReason}`;

  execSync(`git commit -m "${commitMessage}"`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  logError(`Rejected move: ${reason}`);
}

/**
 * Create an error message object
 * @param {string} reason - Error reason
 * @returns {object} Error message object
 */
export function createErrorMessage(reason) {
  return {
    type: 'error',
    text: `Invalid move rejected: ${reason}`,
    timestamp: new Date().toISOString()
  };
}
