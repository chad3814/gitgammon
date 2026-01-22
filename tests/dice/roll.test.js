/**
 * Tests for Core Dice Rolling Functions
 * Task Group 1: Types, Constants, and Core Dice Rolling
 * @module tests/dice/roll
 */

import { describe, it, expect } from 'vitest';
import { rollDie, rollDice, isDoubles, createDiceResult } from '../../src/dice/index.js';
import { isValidDieValue } from '../../src/state/constants.js';

describe('Core Dice Rolling', () => {
  describe('rollDie', () => {
    it('should return an integer between 1 and 6', () => {
      const result = rollDie();

      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    });

    it('should return valid die values that pass isValidDieValue check', () => {
      // Roll multiple times to verify consistency
      for (let i = 0; i < 10; i++) {
        const result = rollDie();
        expect(isValidDieValue(result)).toBe(true);
      }
    });
  });

  describe('rollDice', () => {
    it('should return an array of exactly two valid dice values', () => {
      const result = rollDice();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(isValidDieValue(result[0])).toBe(true);
      expect(isValidDieValue(result[1])).toBe(true);
    });

    it('should produce variation over multiple rolls (not all same)', () => {
      const rolls = [];
      for (let i = 0; i < 20; i++) {
        rolls.push(rollDice().join(','));
      }

      // At least some rolls should be different (highly unlikely all 20 are same)
      const uniqueRolls = new Set(rolls);
      expect(uniqueRolls.size).toBeGreaterThan(1);
    });
  });

  describe('isDoubles', () => {
    it('should return true when both dice match', () => {
      expect(isDoubles([3, 3])).toBe(true);
      expect(isDoubles([6, 6])).toBe(true);
      expect(isDoubles([1, 1])).toBe(true);
    });

    it('should return false when dice do not match', () => {
      expect(isDoubles([3, 5])).toBe(false);
      expect(isDoubles([1, 6])).toBe(false);
      expect(isDoubles([2, 4])).toBe(false);
    });
  });

  describe('createDiceResult', () => {
    it('should return correct structure with defaults', () => {
      const result = createDiceResult([3, 5]);

      expect(result).toEqual({
        dice: [3, 5],
        diceUsed: [],
        autoPass: false,
        messages: []
      });
    });

    it('should allow overriding defaults with options', () => {
      const messages = [{ type: 'info', text: 'Test message', timestamp: '2025-01-21T12:00:00Z' }];
      const result = createDiceResult([4, 4], {
        diceUsed: [4],
        autoPass: true,
        messages,
        activePlayer: 'black'
      });

      expect(result).toEqual({
        dice: [4, 4],
        diceUsed: [4],
        autoPass: true,
        messages,
        activePlayer: 'black'
      });
    });
  });
});
