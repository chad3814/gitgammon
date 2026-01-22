/**
 * Move File Discovery Module
 * Discovers move files from git diff
 * @module action/discovery
 */

import { execSync } from 'child_process';

/**
 * Regex pattern to match move file paths
 * Format: tables/{table-name}/moves/{filename}.json
 */
const MOVE_FILE_PATTERN = /^tables\/([^/]+)\/moves\/([^/]+\.json)$/;

/**
 * Discover move file from git diff
 * @returns {{ moveFilePath: string, tableName: string, filename: string } | null}
 */
export function discoverMoveFile() {
  const changedFiles = getChangedFiles();
  const moveFiles = filterMoveFiles(changedFiles);

  if (moveFiles.length === 0) {
    return null;
  }

  if (moveFiles.length > 1) {
    console.warn(
      `Multiple move files detected (${moveFiles.length}). Processing first: ${moveFiles[0]}`
    );
  }

  const moveFilePath = moveFiles[0];
  const parsed = parseMoveFilePath(moveFilePath);

  if (!parsed) {
    return null;
  }

  return {
    moveFilePath,
    tableName: parsed.tableName,
    filename: parsed.filename
  };
}

/**
 * Get list of changed files from git diff
 * @returns {string[]} Array of changed file paths
 */
export function getChangedFiles() {
  try {
    const output = execSync('git diff --name-only HEAD~1 HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return output.trim().split('\n').filter(line => line.length > 0);
  } catch (error) {
    console.error('Failed to get changed files from git:', error.message);
    return [];
  }
}

/**
 * Filter files to only move files matching pattern
 * @param {string[]} files - Array of file paths
 * @returns {string[]} Filtered array of move file paths
 */
export function filterMoveFiles(files) {
  return files.filter(file => MOVE_FILE_PATTERN.test(file));
}

/**
 * Parse move file path to extract table name and filename
 * @param {string} filePath - Move file path
 * @returns {{ tableName: string, filename: string } | null}
 */
export function parseMoveFilePath(filePath) {
  const match = filePath.match(MOVE_FILE_PATTERN);

  if (!match) {
    return null;
  }

  return {
    tableName: match[1],
    filename: match[2]
  };
}
