import { describe, it, expect } from 'vitest';
import {
  validateSchema,
  validatePieceCount,
  validateDiceConsistency,
  validateStatusWinner,
  validateBoard,
  validateState
} from '../../src/state/validation.js';
import { createInitialState } from '../../src/state/initial.js';

/**
 * Task Group 4: Validation Tests
 * Tests for validation utility functions
 */

/** Create a valid state for testing */
function createValidState() {
  return createInitialState({ white: 'alice', black: 'bob' }, [3, 5]);
}

describe('Validation Functions', () => {
  describe('validatePieceCount', () => {
    it('should pass for valid state with 15 pieces per color', () => {
      const state = createValidState();
      const result = validatePieceCount(state);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should fail when pieces are missing from the board', () => {
      const state = createValidState();
      // Remove a white piece (change first position from 2 to 1)
      state.board[0] = 1;

      const result = validatePieceCount(state);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toMatch(/white has 14 pieces/);
    });

    it('should count pieces from bar and home correctly', () => {
      const state = createValidState();
      // Move one white piece from board to bar
      state.board[0] = 1;
      state.bar.white = 1;

      const result = validatePieceCount(state);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateDiceConsistency', () => {
    it('should pass when diceUsed is a subset of dice', () => {
      const state = createValidState();
      state.dice = [3, 5];
      state.diceUsed = [3];

      const result = validateDiceConsistency(state);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should pass when diceUsed is empty', () => {
      const state = createValidState();
      state.dice = [4, 2];
      state.diceUsed = [];

      const result = validateDiceConsistency(state);
      expect(result.valid).toBe(true);
    });

    it('should fail when diceUsed contains value not in dice', () => {
      const state = createValidState();
      state.dice = [3, 5];
      state.diceUsed = [6]; // 6 not in dice

      const result = validateDiceConsistency(state);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toMatch(/diceUsed contains 6/);
    });

    it('should handle doubles correctly', () => {
      const state = createValidState();
      state.dice = [3, 3, 3, 3];
      state.diceUsed = [3, 3, 3];

      const result = validateDiceConsistency(state);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateStatusWinner', () => {
    it('should pass when playing with null winner', () => {
      const state = createValidState();
      state.status = 'playing';
      state.winner = null;

      const result = validateStatusWinner(state);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should pass when completed with valid winner', () => {
      const state = createValidState();
      state.status = 'completed';
      state.winner = 'white';

      const result = validateStatusWinner(state);
      expect(result.valid).toBe(true);
    });

    it('should fail when playing but has winner', () => {
      const state = createValidState();
      state.status = 'playing';
      state.winner = 'white';

      const result = validateStatusWinner(state);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/status is 'playing' but winner/);
    });

    it('should fail when completed but no winner', () => {
      const state = createValidState();
      state.status = 'completed';
      state.winner = null;

      const result = validateStatusWinner(state);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/status is 'completed' but winner is null/);
    });
  });

  describe('validateState', () => {
    it('should pass for completely valid state', () => {
      const state = createValidState();
      const result = validateState(state);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should collect all errors from multiple validators', () => {
      const state = createValidState();
      state.status = 'completed';
      state.winner = null; // Invalid: completed needs winner
      state.board[0] = 1; // Invalid: missing piece

      const result = validateState(state);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
