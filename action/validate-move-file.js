/**
 * Move File Schema Validation Module
 * Validates move file against schema and format rules
 * @module action/validate-move-file
 */

import { validateMoveFile } from '../src/moves/validation.js';

/**
 * Validate move file against schema and format rules
 * @param {object} moveFile - Move file to validate
 * @param {string} filename - Move filename for validation
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateMoveFileSchema(moveFile, filename) {
  const result = validateMoveFile(moveFile, filename);
  return {
    valid: result.valid,
    errors: result.errors
  };
}
