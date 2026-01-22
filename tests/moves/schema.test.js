/**
 * Tests for Move Schema Validation
 * @module tests/moves/schema
 */

import { describe, it, expect } from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { moveSchema, getMoveSchema } from '../../src/moves/schema/index.js';

// Initialize AJV validator
const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);
const validate = ajv.compile(moveSchema);

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

describe('Move Schema', () => {
  describe('getMoveSchema', () => {
    it('should return the schema object', () => {
      const schema = getMoveSchema();
      expect(schema).toBe(moveSchema);
      expect(schema.$id).toBe('https://gitgammon.github.io/schemas/move.json');
    });
  });

  describe('Valid Move Files', () => {
    it('should validate a correct move file', () => {
      const moveFile = createValidMoveFile();
      const valid = validate(moveFile);
      expect(valid).toBe(true);
      expect(validate.errors).toBeNull();
    });

    it('should validate move file with comment', () => {
      const moveFile = createValidMoveFile();
      moveFile.comment = 'Running for safety!';
      const valid = validate(moveFile);
      expect(valid).toBe(true);
    });

    it('should validate move file with commitSha', () => {
      const moveFile = createValidMoveFile();
      moveFile.commitSha = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0';
      const valid = validate(moveFile);
      expect(valid).toBe(true);
    });

    it('should validate doubles with 4 moves', () => {
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
        comment: 'Four off! GG',
        commitSha: null
      };
      const valid = validate(moveFile);
      expect(valid).toBe(true);
    });
  });

  describe('Missing Required Fields', () => {
    it('should fail when player is missing', () => {
      const moveFile = createValidMoveFile();
      delete moveFile.player;
      const valid = validate(moveFile);
      expect(valid).toBe(false);
      expect(validate.errors).toContainEqual(
        expect.objectContaining({
          keyword: 'required',
          params: expect.objectContaining({ missingProperty: 'player' })
        })
      );
    });

    it('should fail when moves is missing', () => {
      const moveFile = createValidMoveFile();
      delete moveFile.moves;
      const valid = validate(moveFile);
      expect(valid).toBe(false);
    });

    it('should fail when expectedState is missing', () => {
      const moveFile = createValidMoveFile();
      delete moveFile.expectedState;
      const valid = validate(moveFile);
      expect(valid).toBe(false);
    });
  });

  describe('Invalid expectedState Pattern', () => {
    it('should fail when expectedState is not 16 hex chars', () => {
      const moveFile = createValidMoveFile();
      moveFile.expectedState = 'abc123'; // too short
      const valid = validate(moveFile);
      expect(valid).toBe(false);
    });

    it('should fail when expectedState has uppercase', () => {
      const moveFile = createValidMoveFile();
      moveFile.expectedState = 'A3B4C5D6E7F8G9H0';
      const valid = validate(moveFile);
      expect(valid).toBe(false);
    });

    it('should fail when expectedState has invalid characters', () => {
      const moveFile = createValidMoveFile();
      moveFile.expectedState = 'ghijklmnopqrstuv';
      const valid = validate(moveFile);
      expect(valid).toBe(false);
    });
  });

  describe('Moves Array Bounds', () => {
    it('should fail when moves array is empty', () => {
      const moveFile = createValidMoveFile();
      moveFile.moves = [];
      const valid = validate(moveFile);
      expect(valid).toBe(false);
      expect(validate.errors).toContainEqual(
        expect.objectContaining({
          keyword: 'minItems'
        })
      );
    });

    it('should fail when moves array has more than 4 items', () => {
      const moveFile = createValidMoveFile();
      moveFile.moves = [
        { from: 5, to: 2, die: 3 },
        { from: 7, to: 2, die: 5 },
        { from: 8, to: 4, die: 4 },
        { from: 6, to: 3, die: 3 },
        { from: 9, to: 5, die: 4 } // 5th move - invalid
      ];
      const valid = validate(moveFile);
      expect(valid).toBe(false);
      expect(validate.errors).toContainEqual(
        expect.objectContaining({
          keyword: 'maxItems'
        })
      );
    });
  });

  describe('SingleMove Validation', () => {
    it('should accept bar entry (from: -1)', () => {
      const moveFile = createValidMoveFile();
      moveFile.moves = [{ from: -1, to: 20, die: 4 }];
      const valid = validate(moveFile);
      expect(valid).toBe(true);
    });

    it('should accept bear-off (to: 24)', () => {
      const moveFile = createValidMoveFile();
      moveFile.moves = [{ from: 2, to: 24, die: 3 }];
      const valid = validate(moveFile);
      expect(valid).toBe(true);
    });

    it('should fail when from is less than -1', () => {
      const moveFile = createValidMoveFile();
      moveFile.moves = [{ from: -2, to: 5, die: 3 }];
      const valid = validate(moveFile);
      expect(valid).toBe(false);
    });

    it('should fail when to is greater than 24', () => {
      const moveFile = createValidMoveFile();
      moveFile.moves = [{ from: 5, to: 25, die: 3 }];
      const valid = validate(moveFile);
      expect(valid).toBe(false);
    });

    it('should fail when die is out of range', () => {
      const moveFile = createValidMoveFile();
      moveFile.moves = [{ from: 5, to: 2, die: 7 }];
      const valid = validate(moveFile);
      expect(valid).toBe(false);
    });
  });

  describe('Additional Properties', () => {
    it('should fail when extra properties are present', () => {
      const moveFile = createValidMoveFile();
      moveFile.extraField = 'not allowed';
      const valid = validate(moveFile);
      expect(valid).toBe(false);
    });
  });
});
