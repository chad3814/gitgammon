/**
 * Tests for Core Validation Infrastructure
 * @module tests/validation/core
 */

import { describe, it, expect } from 'vitest';
import {
  createValidResult,
  createInvalidResult,
  createResultWithHit,
  createResultWithForcedMoveInfo,
  combineValidationResults,
  isInHomeBoard,
  getBarEntryPoint
} from '../../src/validation/index.js';

describe('Core Validation Infrastructure', () => {
  describe('createValidResult', () => {
    it('should return valid=true with empty errors array', () => {
      const result = createValidResult();
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('createInvalidResult', () => {
    it('should return valid=false with provided error messages', () => {
      const errors = ['Error 1', 'Error 2'];
      const result = createInvalidResult(errors);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(errors);
    });

    it('should wrap single error string in array', () => {
      const result = createInvalidResult('Single error');
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['Single error']);
    });
  });

  describe('createResultWithHit', () => {
    it('should return valid result with hitInfo structure', () => {
      const hitInfo = { point: 12, player: 'black' };
      const result = createResultWithHit(hitInfo);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.hitInfo).toEqual({ point: 12, player: 'black' });
    });
  });

  describe('createResultWithForcedMoveInfo', () => {
    it('should return result with forcedMoveInfo structure', () => {
      const forcedMoveInfo = {
        moreMovesAvailable: true,
        maxDiceUsable: 2,
        diceUsed: 1
      };
      const result = createResultWithForcedMoveInfo(false, ['Forced move violation'], forcedMoveInfo);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['Forced move violation']);
      expect(result.forcedMoveInfo).toEqual({
        moreMovesAvailable: true,
        maxDiceUsable: 2,
        diceUsed: 1
      });
    });
  });

  describe('combineValidationResults', () => {
    it('should combine multiple valid results into valid result', () => {
      const results = [
        { valid: true, errors: [] },
        { valid: true, errors: [] }
      ];
      const combined = combineValidationResults(results);

      expect(combined.valid).toBe(true);
      expect(combined.errors).toEqual([]);
    });

    it('should combine errors from multiple invalid results', () => {
      const results = [
        { valid: false, errors: ['Error A'] },
        { valid: false, errors: ['Error B', 'Error C'] }
      ];
      const combined = combineValidationResults(results);

      expect(combined.valid).toBe(false);
      expect(combined.errors).toEqual(['Error A', 'Error B', 'Error C']);
    });

    it('should preserve hitInfo when present', () => {
      const hitInfo = { point: 5, player: 'white' };
      const results = [
        { valid: true, errors: [] },
        { valid: true, errors: [], hitInfo }
      ];
      const combined = combineValidationResults(results);

      expect(combined.hitInfo).toEqual(hitInfo);
    });

    it('should preserve forcedMoveInfo when present', () => {
      const forcedMoveInfo = { moreMovesAvailable: false, maxDiceUsable: 2, diceUsed: 2 };
      const results = [
        { valid: true, errors: [], forcedMoveInfo }
      ];
      const combined = combineValidationResults(results);

      expect(combined.forcedMoveInfo).toEqual(forcedMoveInfo);
    });

    it('should return valid result for empty array', () => {
      const combined = combineValidationResults([]);
      expect(combined.valid).toBe(true);
      expect(combined.errors).toEqual([]);
    });
  });

  describe('isInHomeBoard', () => {
    it('should return true for white pieces in points 0-5', () => {
      expect(isInHomeBoard(0, 'white')).toBe(true);
      expect(isInHomeBoard(3, 'white')).toBe(true);
      expect(isInHomeBoard(5, 'white')).toBe(true);
    });

    it('should return false for white pieces outside home', () => {
      expect(isInHomeBoard(6, 'white')).toBe(false);
      expect(isInHomeBoard(18, 'white')).toBe(false);
    });

    it('should return true for black pieces in points 18-23', () => {
      expect(isInHomeBoard(18, 'black')).toBe(true);
      expect(isInHomeBoard(20, 'black')).toBe(true);
      expect(isInHomeBoard(23, 'black')).toBe(true);
    });

    it('should return false for black pieces outside home', () => {
      expect(isInHomeBoard(0, 'black')).toBe(false);
      expect(isInHomeBoard(17, 'black')).toBe(false);
    });
  });

  describe('getBarEntryPoint', () => {
    it('should calculate white bar entry correctly (24 - die)', () => {
      expect(getBarEntryPoint(1, 'white')).toBe(23);
      expect(getBarEntryPoint(3, 'white')).toBe(21);
      expect(getBarEntryPoint(6, 'white')).toBe(18);
    });

    it('should calculate black bar entry correctly (die - 1)', () => {
      expect(getBarEntryPoint(1, 'black')).toBe(0);
      expect(getBarEntryPoint(3, 'black')).toBe(2);
      expect(getBarEntryPoint(6, 'black')).toBe(5);
    });
  });
});
