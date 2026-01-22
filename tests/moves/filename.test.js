/**
 * Tests for Move Filename Utilities
 * @module tests/moves/filename
 */

import { describe, it, expect } from 'vitest';
import {
  parseFilename,
  createFilename,
  validateFilename,
  padSequence
} from '../../src/moves/filename.js';

describe('Filename Utilities', () => {
  describe('parseFilename', () => {
    it('should extract correct components from valid filename', () => {
      const result = parseFilename('0001-white-a1b2c3.json');
      expect(result).toEqual({
        sequence: 1,
        player: 'white',
        sha: 'a1b2c3'
      });
    });

    it('should parse black player correctly', () => {
      const result = parseFilename('0015-black-c4d5e6.json');
      expect(result).toEqual({
        sequence: 15,
        player: 'black',
        sha: 'c4d5e6'
      });
    });

    it('should handle maximum sequence number', () => {
      const result = parseFilename('9999-white-000000.json');
      expect(result).toEqual({
        sequence: 9999,
        player: 'white',
        sha: '000000'
      });
    });

    it('should return null for invalid format', () => {
      expect(parseFilename('001-white-a1b2c3.json')).toBeNull(); // 3 digits
      expect(parseFilename('0001-red-a1b2c3.json')).toBeNull(); // invalid player
      expect(parseFilename('0001-white-a1b2c.json')).toBeNull(); // 5 char sha
      expect(parseFilename('0001-white-A1B2C3.json')).toBeNull(); // uppercase
      expect(parseFilename('0001-WHITE-a1b2c3.json')).toBeNull(); // uppercase player
      expect(parseFilename('notafile.txt')).toBeNull();
      expect(parseFilename('')).toBeNull();
    });
  });

  describe('createFilename', () => {
    it('should generate correct format with padding', () => {
      expect(createFilename(1, 'white', 'a1b2c3')).toBe('0001-white-a1b2c3.json');
      expect(createFilename(12, 'black', 'f7e2a9')).toBe('0012-black-f7e2a9.json');
      expect(createFilename(123, 'white', 'abcdef')).toBe('0123-white-abcdef.json');
      expect(createFilename(9999, 'black', '123456')).toBe('9999-black-123456.json');
    });

    it('should be inverse of parseFilename', () => {
      const original = { sequence: 42, player: 'white', sha: 'abc123' };
      const filename = createFilename(original.sequence, original.player, original.sha);
      const parsed = parseFilename(filename);
      expect(parsed).toEqual(original);
    });
  });

  describe('validateFilename', () => {
    it('should return valid for correct format', () => {
      const result = validateFilename('0001-white-a1b2c3.json');
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return invalid with errors for incorrect format', () => {
      const result = validateFilename('bad-filename.json');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('does not match expected format');
    });

    it('should validate edge case: sequence 1', () => {
      const result = validateFilename('0001-white-aaaaaa.json');
      expect(result.valid).toBe(true);
    });

    it('should validate edge case: sequence 9999', () => {
      const result = validateFilename('9999-black-ffffff.json');
      expect(result.valid).toBe(true);
    });
  });

  describe('padSequence', () => {
    it('should zero-pad to 4 digits', () => {
      expect(padSequence(1)).toBe('0001');
      expect(padSequence(12)).toBe('0012');
      expect(padSequence(123)).toBe('0123');
      expect(padSequence(1234)).toBe('1234');
      expect(padSequence(9999)).toBe('9999');
    });
  });
});
