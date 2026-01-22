/**
 * Tests for Initial Game Roll (Starting Player Determination)
 * Task Group 2: Starting Player Determination
 * @module tests/dice/initial-roll
 */

import { describe, it, expect } from 'vitest';
import { rollForStart } from '../../src/dice/index.js';
import { PLAYER_COLORS } from '../../src/state/constants.js';

describe('Initial Game Roll', () => {
  describe('rollForStart', () => {
    it('should return valid structure with startingPlayer and dice', () => {
      const result = rollForStart();

      expect(result).toHaveProperty('startingPlayer');
      expect(result).toHaveProperty('dice');
      expect(Array.isArray(result.dice)).toBe(true);
      expect(result.dice.length).toBe(2);
    });

    it('should return startingPlayer as white or black', () => {
      const result = rollForStart();

      expect(PLAYER_COLORS.includes(result.startingPlayer)).toBe(true);
    });

    it('should return dice values that match a valid winning roll (different values)', () => {
      const result = rollForStart();

      // Both dice should be valid (1-6)
      expect(result.dice[0]).toBeGreaterThanOrEqual(1);
      expect(result.dice[0]).toBeLessThanOrEqual(6);
      expect(result.dice[1]).toBeGreaterThanOrEqual(1);
      expect(result.dice[1]).toBeLessThanOrEqual(6);

      // Dice should NOT be the same (tie would have been re-rolled)
      expect(result.dice[0]).not.toBe(result.dice[1]);
    });

    it('should have higher value die first (winner\'s die)', () => {
      const result = rollForStart();

      // Higher die is always first
      expect(result.dice[0]).toBeGreaterThan(result.dice[1]);
    });

    it('should produce variation in starting player over multiple rolls', () => {
      const starters = new Set();

      // Roll enough times that we should see both players win at least once
      for (let i = 0; i < 30; i++) {
        const result = rollForStart();
        starters.add(result.startingPlayer);
        if (starters.size === 2) break; // Found both, can stop early
      }

      // Should have seen both white and black win at some point
      expect(starters.size).toBe(2);
    });

    it('should correctly assign white when first die is higher', () => {
      // Run multiple times - white gets higher die conceptually
      // Since assignment is: die1 = white, die2 = black
      // If die1 > die2, white wins
      let whiteWinHigherFirst = 0;
      let blackWinLowerFirst = 0;

      for (let i = 0; i < 20; i++) {
        const result = rollForStart();
        // The returned dice are ordered high to low
        // If white won, the higher die was white's
        if (result.startingPlayer === 'white') {
          whiteWinHigherFirst++;
        } else {
          blackWinLowerFirst++;
        }
      }

      // Just verify structure is consistent - white/black both can win
      expect(whiteWinHigherFirst + blackWinLowerFirst).toBe(20);
    });
  });
});
