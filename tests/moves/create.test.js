/**
 * Tests for Move File Factory
 * @module tests/moves/create
 */

import { describe, it, expect } from 'vitest';
import {
  createSingleMove,
  createMoveFile,
  generateFileSha,
  createMoveFileWithFilename
} from '../../src/moves/create.js';

describe('Move File Factory', () => {
  describe('createSingleMove', () => {
    it('should create a single move object', () => {
      const move = createSingleMove(5, 2, 3);
      expect(move).toEqual({ from: 5, to: 2, die: 3 });
    });

    it('should handle bar entry (from: -1)', () => {
      const move = createSingleMove(-1, 20, 4);
      expect(move).toEqual({ from: -1, to: 20, die: 4 });
    });

    it('should handle bear-off (to: 24)', () => {
      const move = createSingleMove(2, 24, 3);
      expect(move).toEqual({ from: 2, to: 24, die: 3 });
    });
  });

  describe('createMoveFile', () => {
    it('should return valid structure with all fields', () => {
      const moveFile = createMoveFile({
        player: 'white',
        moves: [createSingleMove(5, 2, 3)],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b'
      });

      expect(moveFile.player).toBe('white');
      expect(moveFile.moves).toHaveLength(1);
      expect(moveFile.timestamp).toBeDefined();
      expect(moveFile.expectedState).toBe('a3b4c5d6e7f89a0b');
      expect(moveFile.diceRoll).toEqual([3, 5]);
      expect(moveFile.comment).toBeNull();
      expect(moveFile.commitSha).toBeNull();
    });

    it('should have valid ISO 8601 timestamp format', () => {
      const moveFile = createMoveFile({
        player: 'white',
        moves: [createSingleMove(5, 2, 3)],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b'
      });

      // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
      expect(moveFile.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      // Should be parseable
      const date = new Date(moveFile.timestamp);
      expect(date.toISOString()).toBeTruthy();
    });

    it('should set commitSha to null by default', () => {
      const moveFile = createMoveFile({
        player: 'black',
        moves: [createSingleMove(12, 16, 4)],
        diceRoll: [4, 2],
        expectedState: '1234567890abcdef'
      });

      expect(moveFile.commitSha).toBeNull();
    });

    it('should accept optional comment', () => {
      const moveFile = createMoveFile({
        player: 'white',
        moves: [createSingleMove(5, 2, 3)],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b',
        comment: 'Great move!'
      });

      expect(moveFile.comment).toBe('Great move!');
    });

    it('should accept custom timestamp', () => {
      const customTimestamp = '2025-01-21T12:01:00Z';
      const moveFile = createMoveFile({
        player: 'white',
        moves: [createSingleMove(5, 2, 3)],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b',
        timestamp: customTimestamp
      });

      expect(moveFile.timestamp).toBe(customTimestamp);
    });
  });

  describe('generateFileSha', () => {
    it('should generate 6-character hex string', () => {
      const moveFile = createMoveFile({
        player: 'white',
        moves: [createSingleMove(5, 2, 3)],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b'
      });

      const sha = generateFileSha(moveFile);
      expect(sha).toMatch(/^[a-f0-9]{6}$/);
      expect(sha.length).toBe(6);
    });

    it('should be deterministic', () => {
      const options = {
        player: 'white',
        moves: [createSingleMove(5, 2, 3)],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b',
        timestamp: '2025-01-21T12:01:00Z'
      };

      const moveFile1 = createMoveFile(options);
      const moveFile2 = createMoveFile(options);
      expect(generateFileSha(moveFile1)).toBe(generateFileSha(moveFile2));
    });

    it('should produce different SHAs for different moves', () => {
      const moveFile1 = createMoveFile({
        player: 'white',
        moves: [createSingleMove(5, 2, 3)],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b',
        timestamp: '2025-01-21T12:01:00Z'
      });

      const moveFile2 = createMoveFile({
        player: 'black',
        moves: [createSingleMove(12, 16, 4)],
        diceRoll: [4, 2],
        expectedState: '1234567890abcdef',
        timestamp: '2025-01-21T12:01:00Z'
      });

      expect(generateFileSha(moveFile1)).not.toBe(generateFileSha(moveFile2));
    });
  });

  describe('createMoveFileWithFilename', () => {
    it('should generate filename matching expected format', () => {
      const { moveFile, filename } = createMoveFileWithFilename({
        sequence: 1,
        player: 'white',
        moves: [createSingleMove(5, 2, 3)],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b'
      });

      expect(filename).toMatch(/^0001-white-[a-f0-9]{6}\.json$/);
      expect(moveFile.player).toBe('white');
    });

    it('should include correct sequence padding', () => {
      const { filename } = createMoveFileWithFilename({
        sequence: 15,
        player: 'black',
        moves: [createSingleMove(12, 16, 4)],
        diceRoll: [4, 2],
        expectedState: '1234567890abcdef'
      });

      expect(filename).toMatch(/^0015-black-[a-f0-9]{6}\.json$/);
    });
  });
});
