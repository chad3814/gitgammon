/**
 * Forced Move Calculation Module
 * Calculates all possible legal moves and analyzes forced move compliance
 * @module validation/forced-moves
 */

import {
  BAR_POSITION,
  BEAR_OFF_POSITION,
  isInHomeBoard,
  getBarEntryPoint,
  isPlayerPiece,
  isOpponentPiece,
  getOpponent
} from './constants.js';

/**
 * Create a deep copy of relevant game state for tree exploration
 * Only copies what's needed for move validation
 * @param {import('../state/types.js').GameState} gameState - State to copy
 * @returns {object} Minimal state copy
 */
function copyGameState(gameState) {
  return {
    board: [...gameState.board],
    bar: { ...gameState.bar },
    home: { ...gameState.home },
    tableOptions: gameState.tableOptions
  };
}

/**
 * Check if a point is blocked for a player
 * @param {number[]} board - Board array
 * @param {number} point - Point to check
 * @param {import('./types.js').PlayerColor} player - Player to check for
 * @returns {boolean} True if point is blocked
 */
function isPointBlocked(board, point, player) {
  if (point === BEAR_OFF_POSITION) return false;
  const value = board[point];
  return isOpponentPiece(value, player) && Math.abs(value) >= 2;
}

/**
 * Check if all player pieces are in home board
 * @param {object} state - Game state
 * @param {import('./types.js').PlayerColor} player - Player to check
 * @returns {boolean} True if all pieces in home
 */
function allPiecesInHome(state, player) {
  if (state.bar[player] > 0) return false;

  for (let point = 0; point < 24; point++) {
    if (isPlayerPiece(state.board[point], player) && !isInHomeBoard(point, player)) {
      return false;
    }
  }
  return true;
}

/**
 * Get all points where a player has pieces
 * @param {number[]} board - Board array
 * @param {import('./types.js').PlayerColor} player - Player color
 * @returns {number[]} Array of point indices
 */
function getPlayerPoints(board, player) {
  const points = [];
  for (let i = 0; i < 24; i++) {
    if (isPlayerPiece(board[i], player)) {
      points.push(i);
    }
  }
  return points;
}

/**
 * Calculate destination point for a move
 * @param {number} from - Source point
 * @param {number} die - Die value
 * @param {import('./types.js').PlayerColor} player - Player color
 * @returns {number} Destination point (may be negative for white bear-off or >23 for black)
 */
function calculateDestination(from, die, player) {
  if (from === BAR_POSITION) {
    return getBarEntryPoint(die, player);
  }

  if (player === 'white') {
    return from - die;
  }
  return from + die;
}

/**
 * Check if a destination is valid for bearing off
 * @param {number} dest - Calculated destination
 * @param {number} from - Source point
 * @param {number} die - Die value used
 * @param {import('./types.js').PlayerColor} player - Player color
 * @param {object} state - Game state
 * @returns {boolean} True if bear-off is valid
 */
function isValidBearOff(dest, from, die, player, state) {
  // Check if destination would be bear-off
  const isBearOff = (player === 'white' && dest < 0) || (player === 'black' && dest > 23);
  if (!isBearOff) return false;

  // Must have all pieces in home
  if (!allPiecesInHome(state, player)) return false;

  // Calculate exact die needed
  const exactDie = player === 'white' ? from + 1 : 24 - from;

  // Exact is always valid
  if (die === exactDie) return true;

  // Overshoot - check if there are higher pieces
  const homePoints = getPlayerPoints(state.board, player);
  const homeOnlyPoints = homePoints.filter(p => isInHomeBoard(p, player));

  if (player === 'white') {
    // Higher means higher index for white
    const highestPoint = Math.max(...homeOnlyPoints);
    return from === highestPoint;
  } else {
    // Higher means lower index for black
    const lowestPoint = Math.min(...homeOnlyPoints);
    return from === lowestPoint;
  }
}

/**
 * Generate all legal moves for a single die
 * @param {object} state - Game state (board, bar, home)
 * @param {number} die - Die value
 * @param {import('./types.js').PlayerColor} player - Player color
 * @returns {import('./types.js').LegalMove[]} Array of legal moves
 */
function generateMovesForDie(state, die, player) {
  const moves = [];

  // If pieces on bar, must re-enter
  if (state.bar[player] > 0) {
    const entryPoint = getBarEntryPoint(die, player);
    if (!isPointBlocked(state.board, entryPoint, player)) {
      moves.push({ from: BAR_POSITION, to: entryPoint, die });
    }
    return moves; // Can only do bar entry when pieces on bar
  }

  // Check all points with player's pieces
  const playerPoints = getPlayerPoints(state.board, player);

  for (const from of playerPoints) {
    const dest = calculateDestination(from, die, player);

    // Check for bear-off
    if ((player === 'white' && dest < 0) || (player === 'black' && dest > 23)) {
      if (isValidBearOff(dest, from, die, player, state)) {
        moves.push({ from, to: BEAR_OFF_POSITION, die });
      }
      continue;
    }

    // Normal move - check if destination is valid and not blocked
    if (dest >= 0 && dest <= 23 && !isPointBlocked(state.board, dest, player)) {
      moves.push({ from, to: dest, die });
    }
  }

  return moves;
}

/**
 * Apply a move to a state copy (mutates the copy)
 * @param {object} state - State to modify
 * @param {import('./types.js').LegalMove} move - Move to apply
 * @param {import('./types.js').PlayerColor} player - Player making move
 */
function applyMove(state, move, player) {
  // Remove piece from source
  if (move.from === BAR_POSITION) {
    state.bar[player]--;
  } else {
    if (player === 'white') {
      state.board[move.from]--;
    } else {
      state.board[move.from]++;
    }
  }

  // Add piece to destination
  if (move.to === BEAR_OFF_POSITION) {
    state.home[player]++;
  } else {
    // Check for hit
    if (isOpponentPiece(state.board[move.to], player) && Math.abs(state.board[move.to]) === 1) {
      const opponent = getOpponent(player);
      state.bar[opponent]++;
      state.board[move.to] = 0;
    }

    if (player === 'white') {
      state.board[move.to]++;
    } else {
      state.board[move.to]--;
    }
  }
}

/**
 * Calculate all possible legal moves given current state and remaining dice
 * @param {import('../state/types.js').GameState} gameState - Current game state
 * @param {number[]} remainingDice - Remaining dice values
 * @param {import('./types.js').PlayerColor} player - Player making moves
 * @returns {import('./types.js').LegalMove[]} Array of legal moves for first die
 */
export function calculateLegalMoves(gameState, remainingDice, player) {
  if (remainingDice.length === 0) return [];

  const state = copyGameState(gameState);
  const allMoves = [];

  // Get unique dice values to avoid duplicates
  const uniqueDice = [...new Set(remainingDice)];

  for (const die of uniqueDice) {
    const moves = generateMovesForDie(state, die, player);
    allMoves.push(...moves);
  }

  return allMoves;
}

/**
 * Recursively build move tree to find maximum dice usage
 * @param {object} state - Current state (will be copied for exploration)
 * @param {number[]} remainingDice - Remaining dice
 * @param {import('./types.js').PlayerColor} player - Player color
 * @param {number} depth - Current depth
 * @returns {{ maxDice: number, paths: import('./types.js').LegalMove[][] }} Max dice usable and paths
 */
export function buildMoveTree(state, remainingDice, player, depth = 0) {
  if (remainingDice.length === 0) {
    return { maxDice: 0, paths: [[]] };
  }

  // Generate all possible moves
  const uniqueDice = [...new Set(remainingDice)];
  let maxDice = 0;
  let bestPaths = [[]];

  for (const die of uniqueDice) {
    const moves = generateMovesForDie(state, die, player);

    for (const move of moves) {
      // Create state copy and apply move
      const stateCopy = copyGameState(state);
      applyMove(stateCopy, move, player);

      // Remove used die
      const newDice = [...remainingDice];
      const dieIndex = newDice.indexOf(die);
      newDice.splice(dieIndex, 1);

      // Recursively explore
      const result = buildMoveTree(stateCopy, newDice, player, depth + 1);
      const totalDice = 1 + result.maxDice;

      if (totalDice > maxDice) {
        maxDice = totalDice;
        bestPaths = result.paths.map(path => [move, ...path]);
      } else if (totalDice === maxDice) {
        bestPaths.push(...result.paths.map(path => [move, ...path]));
      }
    }
  }

  return { maxDice, paths: bestPaths };
}

/**
 * Analyze forced move compliance for a set of played moves
 * @param {import('../state/types.js').GameState} gameState - Initial game state
 * @param {import('./types.js').SingleMove[]} movesPlayed - Moves that were played
 * @param {import('./types.js').PlayerColor} player - Player who made moves
 * @returns {import('./types.js').ForcedMoveInfo} Forced move analysis
 */
export function analyzeForcedMoves(gameState, movesPlayed, player) {
  // Get remaining dice (all dice that haven't been used)
  const allDice = gameState.dice || [];
  const remainingDice = [...allDice];

  // Build tree from initial state to find max possible
  const state = copyGameState(gameState);
  const treeResult = buildMoveTree(state, remainingDice, player);

  const maxDiceUsable = treeResult.maxDice;
  const diceUsed = movesPlayed.length;

  return {
    moreMovesAvailable: diceUsed < maxDiceUsable,
    maxDiceUsable,
    diceUsed
  };
}

/**
 * Create forced move violation error if applicable
 * @param {import('./types.js').ForcedMoveInfo} forcedMoveInfo - Forced move analysis
 * @returns {string | null} Error message or null if no violation
 */
export function getForcedMoveError(forcedMoveInfo) {
  if (forcedMoveInfo.moreMovesAvailable) {
    return `Forced move violation: ${forcedMoveInfo.maxDiceUsable} dice could be used but only ${forcedMoveInfo.diceUsed} were used`;
  }
  return null;
}
