/**
 * Game State Module
 * Main entry point for all game state-related functionality
 * @module state
 */

// Schema exports
export { gameStateSchema, getGameStateSchema } from './schema/index.js';

// Type guards and constants
export {
  PLAYER_COLORS,
  GAME_STATUSES,
  MESSAGE_TYPES,
  PIECES_PER_PLAYER,
  BOARD_POINTS,
  isValidPlayer,
  isValidStatus,
  isValidMessageType,
  isValidDieValue
} from './constants.js';

// Initial state
export {
  INITIAL_BOARD,
  createInitialState,
  countBoardPieces,
  countTotalPieces
} from './initial.js';

// Validation functions
export {
  validateSchema,
  validatePieceCount,
  validateDiceConsistency,
  validateStatusWinner,
  validateBoard,
  validateState
} from './validation.js';

// Example state loaders
export {
  getInitialStateExample,
  getMidGameStateExample,
  getCompletedGameStateExample,
  getAllExamples
} from './examples/index.js';
