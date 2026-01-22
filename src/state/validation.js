/**
 * Game State Validation Module
 * Validation functions for game state integrity
 * @module state/validation
 */

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import gameStateSchema from './schema/game-state.schema.json' with { type: 'json' };
import { countBoardPieces } from './initial.js';
import { PIECES_PER_PLAYER, BOARD_POINTS, isValidPlayer, isValidStatus } from './constants.js';

// Initialize AJV validator
const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);
const schemaValidator = ajv.compile(gameStateSchema);

/**
 * Validate game state against JSON schema
 * @param {object} state - The state to validate
 * @returns {import('./types.js').ValidationResult} Validation result
 */
export function validateSchema(state) {
  const valid = schemaValidator(state);

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
 * Validate piece count invariant (15 pieces per color)
 * @param {import('./types.js').GameState} state - The state to validate
 * @returns {import('./types.js').ValidationResult} Validation result
 */
export function validatePieceCount(state) {
  const errors = [];

  for (const color of ['white', 'black']) {
    const boardPieces = countBoardPieces(state.board, color);
    const barPieces = state.bar[color];
    const homePieces = state.home[color];
    const total = boardPieces + barPieces + homePieces;

    if (total !== PIECES_PER_PLAYER) {
      errors.push(
        `${color} has ${total} pieces (board: ${boardPieces}, bar: ${barPieces}, home: ${homePieces}), expected ${PIECES_PER_PLAYER}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate dice consistency (diceUsed must be subset of dice)
 * @param {import('./types.js').GameState} state - The state to validate
 * @returns {import('./types.js').ValidationResult} Validation result
 */
export function validateDiceConsistency(state) {
  const errors = [];

  // Check that diceUsed is a valid subset of dice
  const availableDice = [...state.dice];

  for (const used of state.diceUsed) {
    const index = availableDice.indexOf(used);
    if (index === -1) {
      errors.push(
        `diceUsed contains ${used} which is not available in dice [${state.dice.join(', ')}]`
      );
    } else {
      // Remove the used die from available to handle duplicates correctly
      availableDice.splice(index, 1);
    }
  }

  // Check diceUsed doesn't exceed dice length
  if (state.diceUsed.length > state.dice.length) {
    errors.push(
      `diceUsed has ${state.diceUsed.length} values but dice only has ${state.dice.length} values`
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate status/winner consistency
 * @param {import('./types.js').GameState} state - The state to validate
 * @returns {import('./types.js').ValidationResult} Validation result
 */
export function validateStatusWinner(state) {
  const errors = [];

  if (state.status === 'playing' && state.winner !== null) {
    errors.push(`status is 'playing' but winner is '${state.winner}' (should be null)`);
  }

  if (state.status === 'completed' && state.winner === null) {
    errors.push(`status is 'completed' but winner is null (should be 'white' or 'black')`);
  }

  if (state.status === 'completed' && state.winner !== null && !isValidPlayer(state.winner)) {
    errors.push(`winner '${state.winner}' is not a valid player color`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate board array structure
 * @param {import('./types.js').GameState} state - The state to validate
 * @returns {import('./types.js').ValidationResult} Validation result
 */
export function validateBoard(state) {
  const errors = [];

  if (!Array.isArray(state.board)) {
    errors.push('board must be an array');
    return { valid: false, errors };
  }

  if (state.board.length !== BOARD_POINTS) {
    errors.push(`board has ${state.board.length} points, expected ${BOARD_POINTS}`);
  }

  for (let i = 0; i < state.board.length; i++) {
    const point = state.board[i];
    if (!Number.isInteger(point)) {
      errors.push(`board[${i}] is not an integer: ${point}`);
    } else if (point < -PIECES_PER_PLAYER || point > PIECES_PER_PLAYER) {
      errors.push(`board[${i}] value ${point} is out of range [-${PIECES_PER_PLAYER}, ${PIECES_PER_PLAYER}]`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Run all validations on a game state
 * @param {object} state - The state to validate
 * @returns {import('./types.js').ValidationResult} Combined validation result
 */
export function validateState(state) {
  const allErrors = [];

  // Run schema validation first
  const schemaResult = validateSchema(state);
  if (!schemaResult.valid) {
    // If schema fails, other validations may not work properly
    return {
      valid: false,
      errors: schemaResult.errors
    };
  }

  // Run all other validations
  const validators = [
    validatePieceCount,
    validateDiceConsistency,
    validateStatusWinner,
    validateBoard
  ];

  for (const validator of validators) {
    const result = validator(state);
    if (!result.valid) {
      allErrors.push(...result.errors);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors
  };
}
