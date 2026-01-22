/**
 * Move Validation Module
 * Pure validation layer for backgammon moves
 * @module validation
 */

// Core types (via JSDoc imports)
export * from './types.js';

// Constants and helpers
export {
  BAR_POSITION,
  BEAR_OFF_POSITION,
  WHITE_HOME_RANGE,
  BLACK_HOME_RANGE,
  WHITE_BAR_ENTRY_RANGE,
  BLACK_BAR_ENTRY_RANGE,
  isInHomeBoard,
  getBarEntryPoint,
  getHomeRange,
  getBarEntryRange,
  isBarEntry,
  isBearOff,
  getOpponent,
  isPlayerPiece,
  isOpponentPiece
} from './constants.js';

// Result factory functions
export {
  createValidResult,
  createInvalidResult,
  createResultWithHit,
  createResultWithForcedMoveInfo,
  combineValidationResults,
  addHitInfo,
  addForcedMoveInfo
} from './result.js';

// Individual validators (for advanced usage)
export {
  validateTurn,
  validateMoveDirection,
  validateDiceConsumption,
  calculateRequiredDie,
  consumeDie,
  validateBarReentry,
  validatePointBlocking,
  detectBlotHit,
  validateBearingOff
} from './validators/index.js';

// Forced move calculation (for advanced usage)
export {
  calculateLegalMoves,
  buildMoveTree,
  analyzeForcedMoves,
  getForcedMoveError
} from './forced-moves.js';

// Primary API - main entry points
export {
  validateMove,
  validateMoves,
  hasLegalMoves
} from './validate-move.js';
