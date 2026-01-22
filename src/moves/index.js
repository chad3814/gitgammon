/**
 * Move File Module
 * Main entry point for all move file-related functionality
 * @module moves
 */

// Schema exports
export { moveSchema, getMoveSchema } from './schema/index.js';

// Constants and type guards
export {
  PLAYER_COLORS,
  BAR_POSITION,
  BEAR_OFF_POSITION,
  MIN_BOARD_POINT,
  MAX_BOARD_POINT,
  MIN_DIE_VALUE,
  MAX_DIE_VALUE,
  MAX_MOVES_PER_TURN,
  MAX_COMMENT_LENGTH,
  EXPECTED_STATE_HASH_LENGTH,
  COMMIT_SHA_LENGTH,
  FILENAME_SHA_LENGTH,
  SEQUENCE_DIGITS,
  FILENAME_PATTERN,
  isValidPlayer,
  isValidDieValue,
  isValidBoardPoint,
  isValidSourcePoint,
  isValidDestinationPoint
} from './constants.js';

// Filename utilities
export {
  parseFilename,
  createFilename,
  validateFilename,
  padSequence
} from './filename.js';

// Hash utilities
export {
  computeStateHash,
  isValidStateHash
} from './hash.js';

// Factory functions
export {
  createSingleMove,
  createMoveFile,
  generateFileSha,
  createMoveFileWithFilename
} from './create.js';

// Validation functions
export {
  validateSchema,
  validateFilenameMatch,
  validateDiceUsage,
  validateMoveDirection,
  validateMoveFile
} from './validation.js';

// Example move loaders
export {
  getOpeningMoveExample,
  getMidGameMoveExample,
  getBarEntryMoveExample,
  getBearingOffMoveExample,
  getAllMoveExamples
} from './examples/index.js';
