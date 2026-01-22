/**
 * Tests for State Hash Utility
 * @module tests/moves/hash
 */

import { describe, it, expect } from 'vitest';
import { computeStateHash, isValidStateHash } from '../../src/moves/hash.js';

describe('State Hash Utility', () => {
  describe('computeStateHash', () => {
    it('should return 16-character lowercase hex string', () => {
      const hash = computeStateHash({ turn: 1, player: 'white' });
      expect(hash).toMatch(/^[a-f0-9]{16}$/);
      expect(hash.length).toBe(16);
    });

    it('should be deterministic (same input produces same hash)', () => {
      const state = { turn: 1, activePlayer: 'white', dice: [3, 5] };
      const hash1 = computeStateHash(state);
      const hash2 = computeStateHash(state);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const state1 = { turn: 1, activePlayer: 'white' };
      const state2 = { turn: 2, activePlayer: 'black' };
      const hash1 = computeStateHash(state1);
      const hash2 = computeStateHash(state2);
      expect(hash1).not.toBe(hash2);
    });

    it('should accept JSON string input', () => {
      const state = { turn: 1, activePlayer: 'white' };
      const jsonString = JSON.stringify(state, Object.keys(state).sort());
      const hashFromObject = computeStateHash(state);
      const hashFromString = computeStateHash(jsonString);
      expect(hashFromObject).toBe(hashFromString);
    });

    it('should produce consistent hash regardless of property order', () => {
      const state1 = { a: 1, b: 2, c: 3 };
      const state2 = { c: 3, a: 1, b: 2 };
      const hash1 = computeStateHash(state1);
      const hash2 = computeStateHash(state2);
      expect(hash1).toBe(hash2);
    });
  });

  describe('isValidStateHash', () => {
    it('should return true for valid hash', () => {
      expect(isValidStateHash('a3b4c5d6e7f89a0b')).toBe(true);
      expect(isValidStateHash('0000000000000000')).toBe(true);
      expect(isValidStateHash('ffffffffffffffff')).toBe(true);
    });

    it('should return false for invalid hash', () => {
      expect(isValidStateHash('abc')).toBe(false); // too short
      expect(isValidStateHash('a3b4c5d6e7f89a0b123')).toBe(false); // too long
      expect(isValidStateHash('A3B4C5D6E7F89A0B')).toBe(false); // uppercase
      expect(isValidStateHash('ghijklmnopqrstuv')).toBe(false); // invalid hex chars
      expect(isValidStateHash(123)).toBe(false); // not a string
      expect(isValidStateHash(null)).toBe(false);
      expect(isValidStateHash(undefined)).toBe(false);
    });
  });
});
