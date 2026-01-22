/**
 * Tests for Move Constants and Type Guards
 * @module tests/moves/constants
 */

import { describe, it, expect } from 'vitest';
import {
  PLAYER_COLORS,
  BAR_POSITION,
  BEAR_OFF_POSITION,
  MIN_BOARD_POINT,
  MAX_BOARD_POINT,
  FILENAME_PATTERN,
  isValidPlayer,
  isValidDieValue,
  isValidBoardPoint,
  isValidSourcePoint,
  isValidDestinationPoint
} from '../../src/moves/constants.js';

describe('Move Constants', () => {
  describe('PLAYER_COLORS', () => {
    it('should contain white and black', () => {
      expect(PLAYER_COLORS).toEqual(['white', 'black']);
    });

    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(PLAYER_COLORS)).toBe(true);
    });
  });

  describe('Point Range Constants', () => {
    it('should have BAR_POSITION as -1', () => {
      expect(BAR_POSITION).toBe(-1);
    });

    it('should have BEAR_OFF_POSITION as 24', () => {
      expect(BEAR_OFF_POSITION).toBe(24);
    });

    it('should have MIN_BOARD_POINT as 0', () => {
      expect(MIN_BOARD_POINT).toBe(0);
    });

    it('should have MAX_BOARD_POINT as 23', () => {
      expect(MAX_BOARD_POINT).toBe(23);
    });
  });

  describe('FILENAME_PATTERN', () => {
    it('should match valid filenames', () => {
      expect(FILENAME_PATTERN.test('0001-white-a1b2c3.json')).toBe(true);
      expect(FILENAME_PATTERN.test('0012-black-f7e2a9.json')).toBe(true);
      expect(FILENAME_PATTERN.test('9999-white-000000.json')).toBe(true);
    });

    it('should reject invalid filenames', () => {
      expect(FILENAME_PATTERN.test('001-white-a1b2c3.json')).toBe(false); // 3 digits
      expect(FILENAME_PATTERN.test('0001-red-a1b2c3.json')).toBe(false); // invalid player
      expect(FILENAME_PATTERN.test('0001-white-a1b2c.json')).toBe(false); // 5 char sha
      expect(FILENAME_PATTERN.test('0001-white-A1B2C3.json')).toBe(false); // uppercase
    });
  });
});

describe('Type Guards', () => {
  describe('isValidPlayer', () => {
    it('should return true for valid players', () => {
      expect(isValidPlayer('white')).toBe(true);
      expect(isValidPlayer('black')).toBe(true);
    });

    it('should return false for invalid players', () => {
      expect(isValidPlayer('red')).toBe(false);
      expect(isValidPlayer('')).toBe(false);
      expect(isValidPlayer('WHITE')).toBe(false);
    });
  });

  describe('isValidDieValue', () => {
    it('should return true for valid die values (1-6)', () => {
      for (let i = 1; i <= 6; i++) {
        expect(isValidDieValue(i)).toBe(true);
      }
    });

    it('should return false for invalid die values', () => {
      expect(isValidDieValue(0)).toBe(false);
      expect(isValidDieValue(7)).toBe(false);
      expect(isValidDieValue(-1)).toBe(false);
      expect(isValidDieValue(3.5)).toBe(false);
    });
  });

  describe('isValidBoardPoint', () => {
    it('should return true for valid board points (0-23)', () => {
      expect(isValidBoardPoint(0)).toBe(true);
      expect(isValidBoardPoint(12)).toBe(true);
      expect(isValidBoardPoint(23)).toBe(true);
    });

    it('should return false for invalid board points', () => {
      expect(isValidBoardPoint(-1)).toBe(false);
      expect(isValidBoardPoint(24)).toBe(false);
      expect(isValidBoardPoint(1.5)).toBe(false);
    });
  });

  describe('isValidSourcePoint', () => {
    it('should return true for bar (-1) and board points (0-23)', () => {
      expect(isValidSourcePoint(-1)).toBe(true);
      expect(isValidSourcePoint(0)).toBe(true);
      expect(isValidSourcePoint(23)).toBe(true);
    });

    it('should return false for bear-off and out of range', () => {
      expect(isValidSourcePoint(24)).toBe(false);
      expect(isValidSourcePoint(-2)).toBe(false);
    });
  });

  describe('isValidDestinationPoint', () => {
    it('should return true for board points (0-23) and bear-off (24)', () => {
      expect(isValidDestinationPoint(0)).toBe(true);
      expect(isValidDestinationPoint(23)).toBe(true);
      expect(isValidDestinationPoint(24)).toBe(true);
    });

    it('should return false for bar and out of range', () => {
      expect(isValidDestinationPoint(-1)).toBe(false);
      expect(isValidDestinationPoint(25)).toBe(false);
    });
  });
});
