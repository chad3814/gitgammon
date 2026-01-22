/**
 * Integration and Edge Case Tests for Move File Format
 * Strategic gap tests for Task Group 9
 * @module tests/moves/integration
 */

import { describe, it, expect } from 'vitest';
import {
  createMoveFile,
  createSingleMove,
  createMoveFileWithFilename,
  generateFileSha,
  validateMoveFile,
  parseFilename,
  createFilename,
  padSequence,
  computeStateHash,
  MAX_COMMENT_LENGTH
} from '../../src/moves/index.js';

describe('Integration Tests', () => {
  describe('Full Workflow: Create to Validate', () => {
    it('should complete full workflow from create to validate', () => {
      // 1. Create a move file
      const moveFile = createMoveFile({
        player: 'white',
        moves: [
          createSingleMove(5, 2, 3),
          createSingleMove(7, 2, 5)
        ],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b',
        comment: 'Opening move'
      });

      // 2. Validate it
      const validation = validateMoveFile(moveFile);
      expect(validation.valid).toBe(true);

      // 3. Generate filename
      const sha = generateFileSha(moveFile);
      const filename = createFilename(1, moveFile.player, sha);

      // 4. Validate with filename
      const fullValidation = validateMoveFile(moveFile, filename);
      expect(fullValidation.valid).toBe(true);

      // 5. Parse filename back
      const parsed = parseFilename(filename);
      expect(parsed.sequence).toBe(1);
      expect(parsed.player).toBe('white');
      expect(parsed.sha).toBe(sha);
    });

    it('should work with createMoveFileWithFilename helper', () => {
      const { moveFile, filename } = createMoveFileWithFilename({
        sequence: 42,
        player: 'black',
        moves: [createSingleMove(12, 16, 4)],
        diceRoll: [4, 2],
        expectedState: '0123456789abcdef'
      });

      expect(filename).toMatch(/^0042-black-[a-f0-9]{6}\.json$/);

      const validation = validateMoveFile(moveFile, filename);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle maximum sequence number (9999)', () => {
      const filename = createFilename(9999, 'white', 'abcdef');
      expect(filename).toBe('9999-white-abcdef.json');

      const parsed = parseFilename(filename);
      expect(parsed.sequence).toBe(9999);
    });

    it('should handle minimum sequence number (1)', () => {
      const filename = createFilename(1, 'black', '000000');
      expect(filename).toBe('0001-black-000000.json');

      const parsed = parseFilename(filename);
      expect(parsed.sequence).toBe(1);
    });

    it('should handle all 4 moves with doubles', () => {
      const moveFile = createMoveFile({
        player: 'white',
        moves: [
          createSingleMove(2, 24, 3),
          createSingleMove(2, 24, 3),
          createSingleMove(0, 24, 3),
          createSingleMove(0, 24, 3)
        ],
        diceRoll: [3, 3, 3, 3],
        expectedState: '0123456789abcdef',
        comment: 'Four off!'
      });

      const validation = validateMoveFile(moveFile);
      expect(validation.valid).toBe(true);
      expect(moveFile.moves.length).toBe(4);
      expect(moveFile.diceRoll.length).toBe(4);
    });

    it('should handle comment at exactly 280 characters', () => {
      const maxComment = 'A'.repeat(MAX_COMMENT_LENGTH);
      expect(maxComment.length).toBe(280);

      const moveFile = createMoveFile({
        player: 'white',
        moves: [createSingleMove(5, 2, 3)],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b',
        comment: maxComment
      });

      const validation = validateMoveFile(moveFile);
      expect(validation.valid).toBe(true);
      expect(moveFile.comment.length).toBe(280);
    });

    it('should handle whitespace in comment field', () => {
      const commentWithWhitespace = '  leading and trailing spaces  ';

      const moveFile = createMoveFile({
        player: 'white',
        moves: [createSingleMove(5, 2, 3)],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b',
        comment: commentWithWhitespace
      });

      const validation = validateMoveFile(moveFile);
      expect(validation.valid).toBe(true);
      // Comment should preserve whitespace
      expect(moveFile.comment).toBe(commentWithWhitespace);
    });

    it('should handle empty string comment (different from null)', () => {
      const moveFile = createMoveFile({
        player: 'white',
        moves: [createSingleMove(5, 2, 3)],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b',
        comment: ''
      });

      const validation = validateMoveFile(moveFile);
      expect(validation.valid).toBe(true);
      expect(moveFile.comment).toBe('');
    });
  });

  describe('Consistency Tests', () => {
    it('should have filename SHA consistent with content hash', () => {
      const options = {
        player: 'white',
        moves: [createSingleMove(5, 2, 3)],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b',
        timestamp: '2025-01-21T12:00:00Z'
      };

      const moveFile1 = createMoveFile(options);
      const moveFile2 = createMoveFile(options);

      const sha1 = generateFileSha(moveFile1);
      const sha2 = generateFileSha(moveFile2);

      expect(sha1).toBe(sha2);
    });

    it('should have different SHAs for different content', () => {
      const baseOptions = {
        player: 'white',
        moves: [createSingleMove(5, 2, 3)],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b',
        timestamp: '2025-01-21T12:00:00Z'
      };

      const moveFile1 = createMoveFile(baseOptions);
      const moveFile2 = createMoveFile({
        ...baseOptions,
        player: 'black'
      });

      const sha1 = generateFileSha(moveFile1);
      const sha2 = generateFileSha(moveFile2);

      expect(sha1).not.toBe(sha2);
    });

    it('should have consistent state hash regardless of property order', () => {
      const state1 = { turn: 1, player: 'white', dice: [3, 5] };
      const state2 = { dice: [3, 5], turn: 1, player: 'white' };

      const hash1 = computeStateHash(state1);
      const hash2 = computeStateHash(state2);

      expect(hash1).toBe(hash2);
    });
  });

  describe('Sequence Number Edge Cases', () => {
    it('should pad sequence numbers correctly', () => {
      expect(padSequence(1)).toBe('0001');
      expect(padSequence(10)).toBe('0010');
      expect(padSequence(100)).toBe('0100');
      expect(padSequence(1000)).toBe('1000');
      expect(padSequence(9999)).toBe('9999');
    });

    it('should parse leading zeros correctly', () => {
      const parsed = parseFilename('0001-white-aaaaaa.json');
      expect(parsed.sequence).toBe(1);

      const parsed2 = parseFilename('0010-black-bbbbbb.json');
      expect(parsed2.sequence).toBe(10);
    });
  });
});
