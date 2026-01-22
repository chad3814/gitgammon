import { describe, it, expect } from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import gameStateSchema from '../../src/state/schema/game-state.schema.json' with { type: 'json' };
import { validateState, validateDiceConsistency } from '../../src/state/validation.js';
import { createInitialState, INITIAL_BOARD } from '../../src/state/initial.js';

/**
 * Task Group 7: Gap Analysis Tests
 * Additional strategic tests for edge cases
 */

const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);
const validate = ajv.compile(gameStateSchema);

/** Create a valid state for testing */
function createValidState() {
  return createInitialState({ white: 'alice', black: 'bob' }, [3, 5]);
}

describe('Edge Cases and Gap Analysis', () => {
  describe('Doubles dice handling', () => {
    it('should validate state with doubles (4 dice)', () => {
      const state = createValidState();
      state.dice = [3, 3, 3, 3];
      state.diceUsed = [];

      const isValid = validate(state);
      expect(isValid).toBe(true);
    });

    it('should validate diceUsed with partial doubles usage', () => {
      const state = createValidState();
      state.dice = [4, 4, 4, 4];
      state.diceUsed = [4, 4];

      const result = validateDiceConsistency(state);
      expect(result.valid).toBe(true);
    });
  });

  describe('Empty diceUsed array', () => {
    it('should accept empty diceUsed at turn start', () => {
      const state = createValidState();
      state.diceUsed = [];

      const result = validateState(state);
      expect(result.valid).toBe(true);
    });
  });

  describe('lastMove null handling', () => {
    it('should accept null lastMove for turn 1', () => {
      const state = createValidState();
      expect(state.lastMove).toBeNull();

      const isValid = validate(state);
      expect(isValid).toBe(true);
    });

    it('should validate lastMove object with proper file pattern', () => {
      const state = createValidState();
      state.turn = 2;
      state.lastMove = {
        sequence: 1,
        player: 'white',
        file: '0001-white-abc123.json'
      };

      const isValid = validate(state);
      expect(isValid).toBe(true);
    });

    it('should reject lastMove with invalid file pattern', () => {
      const state = createValidState();
      state.turn = 2;
      state.lastMove = {
        sequence: 1,
        player: 'white',
        file: 'invalid-filename.json'  // wrong pattern
      };

      const isValid = validate(state);
      expect(isValid).toBe(false);
    });
  });

  describe('Message array validation', () => {
    it('should accept empty messages array', () => {
      const state = {
        ...createValidState(),
        messages: []
      };

      const isValid = validate(state);
      expect(isValid).toBe(true);
    });

    it('should reject message with invalid type', () => {
      const state = createValidState();
      state.messages = [
        {
          type: 'debug', // invalid type
          text: 'Test message',
          timestamp: '2025-01-21T12:00:00Z'
        }
      ];

      const isValid = validate(state);
      expect(isValid).toBe(false);
    });

    it('should require all message fields', () => {
      const state = createValidState();
      state.messages = [
        {
          type: 'info',
          text: 'Missing timestamp'
          // timestamp is missing
        }
      ];

      const isValid = validate(state);
      expect(isValid).toBe(false);
    });
  });

  describe('Board boundary values', () => {
    it('should accept maximum pieces on single point (15)', () => {
      const state = createValidState();
      // Put all 15 white pieces on one point (unlikely but valid)
      state.board = [15, 0, 0, 0, 0, -5, 0, -3, 0, 0, 0, 0, -5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -2];

      const isValid = validate(state);
      expect(isValid).toBe(true);
    });

    it('should reject pieces count exceeding 15', () => {
      const state = createValidState();
      state.board[0] = 16; // Invalid: exceeds maximum

      const isValid = validate(state);
      expect(isValid).toBe(false);
    });
  });

  describe('Error message quality', () => {
    it('should provide descriptive error for piece count mismatch', () => {
      const state = createValidState();
      state.board[0] = 1; // Remove a piece

      const result = validateState(state);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('white') && e.includes('14 pieces'))).toBe(true);
    });
  });
});
