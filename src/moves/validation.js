/**
 * Move File Validation Module
 * Validation functions for move file integrity
 * @module moves/validation
 */

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import moveSchema from './schema/move.schema.json' with { type: 'json' };
import { parseFilename } from './filename.js';
import { isValidDieValue } from './constants.js';

// Initialize AJV validator
const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);
const schemaValidator = ajv.compile(moveSchema);

/**
 * Validate move file against JSON schema
 * @param {object} moveFile - The move file to validate
 * @returns {import('./types.js').MoveValidationResult} Validation result
 */
export function validateSchema(moveFile) {
  const valid = schemaValidator(moveFile);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = schemaValidator.errors.map(err => {
    const path = err.instancePath || 'root';
    return `${path}: ${err.message}`;
  });

  return { valid: false, errors };
}

/**
 * Validate that filename matches move file content
 * @param {string} filename - The filename to check
 * @param {object} moveFile - The move file to check against
 * @returns {import('./types.js').MoveValidationResult} Validation result
 */
export function validateFilenameMatch(filename, moveFile) {
  const errors = [];
  const parsed = parseFilename(filename);

  if (!parsed) {
    errors.push(`Invalid filename format: ${filename}`);
    return { valid: false, errors };
  }

  if (parsed.player !== moveFile.player) {
    errors.push(`Filename player "${parsed.player}" does not match move file player "${moveFile.player}"`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate that dice usage in moves matches diceRoll
 * @param {object} moveFile - The move file to validate
 * @returns {import('./types.js').MoveValidationResult} Validation result
 */
export function validateDiceUsage(moveFile) {
  const errors = [];
  const availableDice = [...moveFile.diceRoll];

  for (let i = 0; i < moveFile.moves.length; i++) {
    const move = moveFile.moves[i];

    // Check die value is valid
    if (!isValidDieValue(move.die)) {
      errors.push(`Move ${i + 1}: die value ${move.die} is not valid (must be 1-6)`);
      continue;
    }

    // Check die is available
    const dieIndex = availableDice.indexOf(move.die);
    if (dieIndex === -1) {
      errors.push(
        `Move ${i + 1}: die value ${move.die} is not available in diceRoll [${moveFile.diceRoll.join(', ')}]`
      );
    } else {
      // Remove used die to handle duplicates correctly
      availableDice.splice(dieIndex, 1);
    }
  }

  // Check moves don't exceed available dice
  if (moveFile.moves.length > moveFile.diceRoll.length) {
    errors.push(
      `Move count (${moveFile.moves.length}) exceeds dice count (${moveFile.diceRoll.length})`
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate move direction based on player
 * @param {object} moveFile - The move file to validate
 * @returns {import('./types.js').MoveValidationResult} Validation result
 */
export function validateMoveDirection(moveFile) {
  const errors = [];
  const { player, moves } = moveFile;

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];

    // Skip bar entry and bear-off - they have special rules
    if (move.from === -1 || move.to === 24) {
      continue;
    }

    // White moves from higher to lower indices (or bear-off)
    if (player === 'white' && move.from < move.to) {
      errors.push(
        `Move ${i + 1}: white must move from higher to lower index (${move.from} → ${move.to})`
      );
    }

    // Black moves from lower to higher indices (or bear-off)
    if (player === 'black' && move.from > move.to) {
      errors.push(
        `Move ${i + 1}: black must move from lower to higher index (${move.from} → ${move.to})`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Run all validations on a move file
 * @param {object} moveFile - The move file to validate
 * @param {string} [filename] - Optional filename to validate against
 * @returns {import('./types.js').MoveValidationResult} Combined validation result
 */
export function validateMoveFile(moveFile, filename) {
  const allErrors = [];

  // Run schema validation first
  const schemaResult = validateSchema(moveFile);
  if (!schemaResult.valid) {
    return {
      valid: false,
      errors: schemaResult.errors
    };
  }

  // Run additional validations
  const validators = [
    () => validateDiceUsage(moveFile),
    () => validateMoveDirection(moveFile)
  ];

  // Add filename validation if provided
  if (filename) {
    validators.push(() => validateFilenameMatch(filename, moveFile));
  }

  for (const validator of validators) {
    const result = validator();
    if (!result.valid) {
      allErrors.push(...result.errors);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors
  };
}
