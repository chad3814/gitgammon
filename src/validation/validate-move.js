/**
 * Main Move Validation Entry Point
 * Aggregates all validators into unified validation functions
 * @module validation/validate-move
 */

import {
  createValidResult,
  createInvalidResult,
  combineValidationResults,
  addHitInfo,
  addForcedMoveInfo
} from './result.js';
import { BAR_POSITION } from './constants.js';
import {
  validateTurn,
  validateMoveDirection,
  validateDiceConsumption,
  validateBarReentry,
  validatePointBlocking,
  detectBlotHit,
  validateBearingOff,
  consumeDie
} from './validators/index.js';
import { analyzeForcedMoves, getForcedMoveError, calculateLegalMoves } from './forced-moves.js';

/**
 * Copy game state with move applied (for sequential validation)
 * Does NOT mutate original state
 * @param {import('../state/types.js').GameState} gameState - Current state
 * @param {import('./types.js').SingleMove} move - Move to apply
 * @param {import('./types.js').PlayerColor} player - Player making move
 * @returns {import('../state/types.js').GameState} New state with move applied
 */
function applyMoveToState(gameState, move, player) {
  const newState = {
    ...gameState,
    board: [...gameState.board],
    bar: { ...gameState.bar },
    home: { ...gameState.home },
    dice: [...gameState.dice],
    diceUsed: [...gameState.diceUsed]
  };

  // Remove piece from source
  if (move.from === BAR_POSITION) {
    newState.bar[player]--;
  } else {
    if (player === 'white') {
      newState.board[move.from]--;
    } else {
      newState.board[move.from]++;
    }
  }

  // Handle destination
  if (move.to === 24) {
    // Bear off
    newState.home[player]++;
  } else {
    // Check for hit (opponent has exactly 1 piece)
    const destValue = newState.board[move.to];
    const isOpponent = player === 'white' ? destValue < 0 : destValue > 0;
    if (isOpponent && Math.abs(destValue) === 1) {
      const opponent = player === 'white' ? 'black' : 'white';
      newState.bar[opponent]++;
      newState.board[move.to] = 0;
    }

    // Add piece to destination
    if (player === 'white') {
      newState.board[move.to]++;
    } else {
      newState.board[move.to]--;
    }
  }

  // Update dice
  const dieIndex = newState.dice.indexOf(move.die);
  if (dieIndex !== -1) {
    newState.dice.splice(dieIndex, 1);
    newState.diceUsed.push(move.die);
  }

  return newState;
}

/**
 * Validate a single move against game state
 * Runs validators in order: turn, bar, direction, dice, blocking, bearoff
 * Also detects blot hits
 *
 * @param {import('../state/types.js').GameState} gameState - Current game state
 * @param {import('./types.js').SingleMove} move - Move to validate
 * @param {import('./types.js').PlayerColor} [player] - Player making move (defaults to activePlayer)
 * @param {number[]} [remainingDice] - Remaining dice (defaults to gameState.dice minus diceUsed)
 * @returns {import('./types.js').MoveValidationResult} Validation result
 */
export function validateMove(gameState, move, player, remainingDice) {
  const movePlayer = player || gameState.activePlayer;
  const dice = remainingDice || getRemainingDice(gameState);

  // Run turn validation first - return early on failure
  const turnResult = validateTurn(gameState, move, movePlayer);
  if (!turnResult.valid) {
    return turnResult;
  }

  // Collect results from all validators
  const results = [];

  // Bar re-entry validation
  results.push(validateBarReentry(gameState, move, movePlayer));

  // Direction validation
  results.push(validateMoveDirection(move, movePlayer));

  // Dice consumption validation
  results.push(validateDiceConsumption(move, dice, movePlayer));

  // Point blocking validation
  results.push(validatePointBlocking(gameState, move, movePlayer));

  // Bearing off validation
  results.push(validateBearingOff(gameState, move, movePlayer));

  // Combine all validation results
  let combined = combineValidationResults(results);

  // If valid, check for blot hit
  if (combined.valid) {
    const blotResult = detectBlotHit(gameState, move, movePlayer);
    if (blotResult.hitInfo) {
      combined = addHitInfo(combined, blotResult.hitInfo);
    }
  }

  return combined;
}

/**
 * Get remaining dice (dice minus diceUsed)
 * @param {import('../state/types.js').GameState} gameState - Game state
 * @returns {number[]} Remaining dice values
 */
function getRemainingDice(gameState) {
  const remaining = [...gameState.dice];
  for (const used of gameState.diceUsed) {
    const index = remaining.indexOf(used);
    if (index !== -1) {
      remaining.splice(index, 1);
    }
  }
  return remaining;
}

/**
 * Validate multiple moves for a complete turn
 * Validates each move in sequence, simulating state changes
 * Also performs forced move analysis
 *
 * @param {import('../state/types.js').GameState} gameState - Initial game state
 * @param {import('./types.js').SingleMove[]} moves - Array of moves to validate
 * @param {import('./types.js').PlayerColor} [player] - Player making moves (defaults to activePlayer)
 * @returns {import('./types.js').MoveValidationResult} Combined validation result
 */
export function validateMoves(gameState, moves, player) {
  const movePlayer = player || gameState.activePlayer;

  if (!moves || moves.length === 0) {
    // Empty moves - analyze if any moves were possible
    const forcedMoveInfo = analyzeForcedMoves(gameState, [], movePlayer);
    const error = getForcedMoveError(forcedMoveInfo);

    if (error) {
      const result = createInvalidResult([error]);
      return addForcedMoveInfo(result, forcedMoveInfo);
    }

    const result = createValidResult();
    return addForcedMoveInfo(result, forcedMoveInfo);
  }

  // Validate each move in sequence
  const allErrors = [];
  const hitInfos = [];
  let currentState = gameState;
  let remainingDice = getRemainingDice(gameState);

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const result = validateMove(currentState, move, movePlayer, remainingDice);

    if (!result.valid) {
      // Prefix errors with move number
      const prefixedErrors = result.errors.map(err => `Move ${i + 1}: ${err}`);
      allErrors.push(...prefixedErrors);
    } else {
      // Track hit info
      if (result.hitInfo) {
        hitInfos.push(result.hitInfo);
      }

      // Apply move to get state for next move validation
      currentState = applyMoveToState(currentState, move, movePlayer);
      remainingDice = consumeDie(remainingDice, move.die);
    }
  }

  // If there were validation errors, return them
  if (allErrors.length > 0) {
    return createInvalidResult(allErrors);
  }

  // All moves valid - perform forced move analysis
  const forcedMoveInfo = analyzeForcedMoves(gameState, moves, movePlayer);
  const forcedError = getForcedMoveError(forcedMoveInfo);

  /** @type {import('./types.js').MoveValidationResult} */
  let finalResult;

  if (forcedError) {
    finalResult = createInvalidResult([forcedError]);
  } else {
    finalResult = createValidResult();
  }

  // Add forced move info
  finalResult = addForcedMoveInfo(finalResult, forcedMoveInfo);

  // Add last hit info if any
  if (hitInfos.length > 0) {
    finalResult = addHitInfo(finalResult, hitInfos[hitInfos.length - 1]);
  }

  return finalResult;
}

/**
 * Check if any legal moves exist for a player
 * @param {import('../state/types.js').GameState} gameState - Game state
 * @param {import('./types.js').PlayerColor} [player] - Player to check (defaults to activePlayer)
 * @returns {boolean} True if legal moves exist
 */
export function hasLegalMoves(gameState, player) {
  const movePlayer = player || gameState.activePlayer;
  const remainingDice = getRemainingDice(gameState);
  const legalMoves = calculateLegalMoves(gameState, remainingDice, movePlayer);
  return legalMoves.length > 0;
}
