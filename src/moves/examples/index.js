/**
 * Example Move Loaders
 * Utility functions to load example move files
 * @module moves/examples
 */

import openingMove from './0001-white-f7e2a9.json' with { type: 'json' };
import midGameMove from './0015-black-c4d5e6.json' with { type: 'json' };
import barEntryMove from './0023-white-b5c6d7.json' with { type: 'json' };
import bearingOffMove from './0047-white-e8f9a0.json' with { type: 'json' };

/**
 * Get an opening move example (white's first move)
 * @returns {import('../types.js').MoveFile} Opening move example
 */
export function getOpeningMoveExample() {
  return structuredClone(openingMove);
}

/**
 * Get a mid-game move example with comment
 * @returns {import('../types.js').MoveFile} Mid-game move example
 */
export function getMidGameMoveExample() {
  return structuredClone(midGameMove);
}

/**
 * Get a bar entry move example
 * @returns {import('../types.js').MoveFile} Bar entry move example
 */
export function getBarEntryMoveExample() {
  return structuredClone(barEntryMove);
}

/**
 * Get a bearing off move example with doubles
 * @returns {import('../types.js').MoveFile} Bearing off move example
 */
export function getBearingOffMoveExample() {
  return structuredClone(bearingOffMove);
}

/**
 * Get all example move files
 * @returns {{ opening: import('../types.js').MoveFile, midGame: import('../types.js').MoveFile, barEntry: import('../types.js').MoveFile, bearingOff: import('../types.js').MoveFile }}
 */
export function getAllMoveExamples() {
  return {
    opening: getOpeningMoveExample(),
    midGame: getMidGameMoveExample(),
    barEntry: getBarEntryMoveExample(),
    bearingOff: getBearingOffMoveExample()
  };
}

export { openingMove, midGameMove, barEntryMove, bearingOffMove };
