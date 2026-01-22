/**
 * Dice Module
 * Server-side dice rolling for GitGammon
 * @module dice
 */

// Core types (via JSDoc imports)
export * from './types.js';

// Core dice rolling
export { rollDie, rollDice, isDoubles } from './roll.js';

// Result factory functions
export { createDiceResult, createInitialRollResult } from './result.js';

// Initial game roll (starting player determination)
export { rollForStart } from './initial-roll.js';

// Turn-end roll with no-move detection
export { rollForNextTurn, checkForLegalMoves } from './turn-roll.js';

// Message generation
export { createAutoPassMessage } from './messages.js';
