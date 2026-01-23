/**
 * Tests for Dice Verification Module
 * Task Group 1: Dice Verification
 * @module tests/action/verify-dice
 */

import { describe, it, expect } from 'vitest';
import { verifyDice } from '../../action/verify-dice.js';

/**
 * Create a test game state
 * @param {object} overrides
 * @returns {object}
 */
function createTestState(overrides = {}) {
  return {
    turn: 1,
    activePlayer: 'white',
    dice: [3, 5],
    diceUsed: [],
    board: [
      2, 0, 0, 0, 0, -5,
      0, -3, 0, 0, 0, 5,
      -5, 0, 0, 0, 3, 0,
      5, 0, 0, 0, 0, -2
    ],
    bar: { white: 0, black: 0 },
    home: { white: 0, black: 0 },
    lastMove: null,
    status: 'playing',
    winner: null,
    players: { white: 'alice', black: 'bob' },
    messages: [],
    updatedAt: '2025-01-21T12:00:00Z',
    ...overrides
  };
}

/**
 * Create a test move file
 * @param {object} overrides
 * @returns {object}
 */
function createTestMoveFile(overrides = {}) {
  return {
    player: 'white',
    moves: [
      { from: 5, to: 2, die: 3 },
      { from: 7, to: 2, die: 5 }
    ],
    timestamp: '2025-01-21T12:01:00Z',
    expectedState: 'a3b4c5d6e7f89a0b',
    diceRoll: [3, 5],
    comment: null,
    commitSha: null,
    ...overrides
  };
}

describe('Dice Verification', () => {
  describe('verifyDice', () => {
    it('should pass when moveFile.diceRoll matches state.dice exactly', () => {
      const state = createTestState({ dice: [3, 5] });
      const moveFile = createTestMoveFile({ diceRoll: [3, 5] });

      const result = verifyDice(state, moveFile);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should pass when dice match in reversed order ([3,5] matches [5,3])', () => {
      const state = createTestState({ dice: [3, 5] });
      const moveFile = createTestMoveFile({ diceRoll: [5, 3] });

      const result = verifyDice(state, moveFile);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should fail when dice values differ', () => {
      const state = createTestState({ dice: [3, 5] });
      const moveFile = createTestMoveFile({ diceRoll: [4, 6] });

      const result = verifyDice(state, moveFile);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('Dice mismatch');
    });

    it('should handle doubles correctly ([3,3] must match [3,3])', () => {
      const state = createTestState({ dice: [3, 3] });
      const moveFile = createTestMoveFile({ diceRoll: [3, 3] });

      const result = verifyDice(state, moveFile);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should fail when doubles do not match', () => {
      const state = createTestState({ dice: [3, 3] });
      const moveFile = createTestMoveFile({ diceRoll: [5, 5] });

      const result = verifyDice(state, moveFile);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Dice mismatch');
    });

    it('should return proper error message format with sorted arrays', () => {
      const state = createTestState({ dice: [5, 3] });
      const moveFile = createTestMoveFile({ diceRoll: [6, 2] });

      const result = verifyDice(state, moveFile);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(1);
      // Error message should include both expected and actual values
      expect(result.errors[0]).toContain('state has [3, 5]');
      expect(result.errors[0]).toContain('move claims [2, 6]');
    });

    it('should return { valid, errors } matching existing verification patterns', () => {
      const state = createTestState({ dice: [3, 5] });
      const moveFile = createTestMoveFile({ diceRoll: [3, 5] });

      const result = verifyDice(state, moveFile);

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });
});
