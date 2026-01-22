/**
 * Tests for Move File Validation
 * @module tests/moves/validation
 */

import { describe, it, expect } from 'vitest';
import {
  validateSchema,
  validateFilenameMatch,
  validateDiceUsage,
  validateMoveDirection,
  validateMoveFile
} from '../../src/moves/validation.js';

/**
 * Create a valid move file for testing
 * @returns {object} Valid move file object
 */
function createValidMoveFile() {
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
    commitSha: null
  };
}

describe('Move File Validation', () => {
  describe('validateSchema', () => {
    it('should pass for valid move file', () => {
      const moveFile = createValidMoveFile();
      const result = validateSchema(moveFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should catch type errors', () => {
      const moveFile = createValidMoveFile();
      moveFile.player = 123; // Should be string
      const result = validateSchema(moveFile);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should catch missing required fields', () => {
      const moveFile = createValidMoveFile();
      delete moveFile.expectedState;
      const result = validateSchema(moveFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('expectedState'))).toBe(true);
    });

    it('should catch invalid expectedState pattern', () => {
      const moveFile = createValidMoveFile();
      moveFile.expectedState = 'too-short';
      const result = validateSchema(moveFile);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateFilenameMatch', () => {
    it('should pass when filename matches move file', () => {
      const moveFile = createValidMoveFile();
      const result = validateFilenameMatch('0001-white-a1b2c3.json', moveFile);
      expect(result.valid).toBe(true);
    });

    it('should fail when player does not match', () => {
      const moveFile = createValidMoveFile();
      const result = validateFilenameMatch('0001-black-a1b2c3.json', moveFile);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('player');
    });

    it('should fail for invalid filename format', () => {
      const moveFile = createValidMoveFile();
      const result = validateFilenameMatch('bad-filename.json', moveFile);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid filename format');
    });
  });

  describe('validateDiceUsage', () => {
    it('should pass when dice usage matches diceRoll', () => {
      const moveFile = createValidMoveFile();
      const result = validateDiceUsage(moveFile);
      expect(result.valid).toBe(true);
    });

    it('should fail when using unavailable die value', () => {
      const moveFile = createValidMoveFile();
      moveFile.moves[0].die = 6; // 6 not in [3, 5]
      const result = validateDiceUsage(moveFile);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('not available');
    });

    it('should fail when using same die twice (non-doubles)', () => {
      const moveFile = createValidMoveFile();
      moveFile.moves = [
        { from: 5, to: 2, die: 3 },
        { from: 7, to: 4, die: 3 } // Using 3 twice
      ];
      const result = validateDiceUsage(moveFile);
      expect(result.valid).toBe(false);
    });

    it('should pass for doubles with 4 of same die', () => {
      const moveFile = {
        player: 'white',
        moves: [
          { from: 2, to: 24, die: 3 },
          { from: 2, to: 24, die: 3 },
          { from: 0, to: 24, die: 3 },
          { from: 0, to: 24, die: 3 }
        ],
        timestamp: '2025-01-21T18:20:45Z',
        expectedState: '0123456789abcdef',
        diceRoll: [3, 3, 3, 3],
        comment: null,
        commitSha: null
      };
      const result = validateDiceUsage(moveFile);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateMoveDirection', () => {
    it('should pass for correct white direction (higher to lower)', () => {
      const moveFile = createValidMoveFile();
      const result = validateMoveDirection(moveFile);
      expect(result.valid).toBe(true);
    });

    it('should fail for wrong white direction', () => {
      const moveFile = createValidMoveFile();
      moveFile.moves = [{ from: 2, to: 5, die: 3 }]; // Wrong direction for white
      const result = validateMoveDirection(moveFile);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('white must move from higher to lower');
    });

    it('should pass for correct black direction (lower to higher)', () => {
      const moveFile = {
        player: 'black',
        moves: [{ from: 12, to: 16, die: 4 }],
        timestamp: '2025-01-21T12:01:00Z',
        expectedState: 'a3b4c5d6e7f89a0b',
        diceRoll: [4, 2],
        comment: null,
        commitSha: null
      };
      const result = validateMoveDirection(moveFile);
      expect(result.valid).toBe(true);
    });

    it('should allow bar entry (from: -1)', () => {
      const moveFile = createValidMoveFile();
      moveFile.moves = [{ from: -1, to: 20, die: 4 }]; // Bar entry
      const result = validateMoveDirection(moveFile);
      expect(result.valid).toBe(true);
    });

    it('should allow bear-off (to: 24)', () => {
      const moveFile = createValidMoveFile();
      moveFile.moves = [{ from: 2, to: 24, die: 3 }]; // Bear-off
      const result = validateMoveDirection(moveFile);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateMoveFile', () => {
    it('should pass for valid move file', () => {
      const moveFile = createValidMoveFile();
      const result = validateMoveFile(moveFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return detailed error messages for failures', () => {
      const moveFile = createValidMoveFile();
      delete moveFile.player;
      const result = validateMoveFile(moveFile);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      // Should have descriptive messages
      expect(result.errors.some(e => e.includes('player') || e.includes('required'))).toBe(true);
    });

    it('should combine schema and business rule validation', () => {
      const moveFile = createValidMoveFile();
      // Valid schema but wrong dice usage
      moveFile.moves[0].die = 6; // 6 not in [3, 5]
      const result = validateMoveFile(moveFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('not available'))).toBe(true);
    });

    it('should validate filename when provided', () => {
      const moveFile = createValidMoveFile();
      const result = validateMoveFile(moveFile, '0001-black-a1b2c3.json');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('player'))).toBe(true);
    });
  });
});
