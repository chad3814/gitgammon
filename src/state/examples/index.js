/**
 * Example State Loaders
 * Utility functions to load example game states
 * @module state/examples
 */

import initialState from './initial-state.json' with { type: 'json' };
import midGameState from './mid-game-state.json' with { type: 'json' };
import completedGameState from './completed-game-state.json' with { type: 'json' };

/**
 * Get an initial game state example
 * @returns {import('../types.js').GameState} Fresh game example
 */
export function getInitialStateExample() {
  return structuredClone(initialState);
}

/**
 * Get a mid-game state example
 * @returns {import('../types.js').GameState} Turn 12 example
 */
export function getMidGameStateExample() {
  return structuredClone(midGameState);
}

/**
 * Get a completed game state example
 * @returns {import('../types.js').GameState} Finished game example
 */
export function getCompletedGameStateExample() {
  return structuredClone(completedGameState);
}

/**
 * Get all example states
 * @returns {{ initial: import('../types.js').GameState, midGame: import('../types.js').GameState, completed: import('../types.js').GameState }}
 */
export function getAllExamples() {
  return {
    initial: getInitialStateExample(),
    midGame: getMidGameStateExample(),
    completed: getCompletedGameStateExample()
  };
}

export { initialState, midGameState, completedGameState };
