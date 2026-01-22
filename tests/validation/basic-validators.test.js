/**
 * Tests for Basic Validators (Turn, Direction, Dice)
 * @module tests/validation/basic-validators
 */

import { describe, it, expect } from 'vitest';
import { validateTurn } from '../../src/validation/validators/turn.js';
import { validateMoveDirection } from '../../src/validation/validators/direction.js';
import {
  validateDiceConsumption,
  calculateRequiredDie,
  consumeDie
} from '../../src/validation/validators/dice.js';

/** Create a basic game state for testing */
function createTestState(activePlayer = 'white') {
  return {
    turn: 1,
    activePlayer,
    dice: [3, 5],
    diceUsed: [],
    board: Array(24).fill(0),
    bar: { white: 0, black: 0 },
    home: { white: 0, black: 0 },
    status: 'playing',
    winner: null,
    players: { white: 'alice', black: 'bob' }
  };
}

describe('Turn Validation', () => {
  describe('validateTurn', () => {
    it('should pass when move player matches activePlayer', () => {
      const state = createTestState('white');
      const move = { from: 5, to: 2, die: 3 };

      const result = validateTurn(state, move, 'white');

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should fail with correct error format when players mismatch', () => {
      const state = createTestState('white');
      const move = { from: 12, to: 16, die: 4 };

      const result = validateTurn(state, move, 'black');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toBe('Not your turn: expected white but got black');
    });

    it('should work for black as active player', () => {
      const state = createTestState('black');
      const move = { from: 12, to: 16, die: 4 };

      const result = validateTurn(state, move, 'black');

      expect(result.valid).toBe(true);
    });
  });
});

describe('Direction Validation', () => {
  describe('validateMoveDirection', () => {
    it('should pass for white moving from higher to lower indices', () => {
      const move = { from: 12, to: 7, die: 5 };
      const result = validateMoveDirection(move, 'white');

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should fail for white moving from lower to higher indices', () => {
      const move = { from: 7, to: 12, die: 5 };
      const result = validateMoveDirection(move, 'white');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('white must move from higher to lower');
      expect(result.errors[0]).toContain('7 to 12');
    });

    it('should pass for black moving from lower to higher indices', () => {
      const move = { from: 7, to: 12, die: 5 };
      const result = validateMoveDirection(move, 'black');

      expect(result.valid).toBe(true);
    });

    it('should fail for black moving from higher to lower indices', () => {
      const move = { from: 12, to: 7, die: 5 };
      const result = validateMoveDirection(move, 'black');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('black must move from lower to higher');
    });

    it('should allow bar entry (from: -1) for any player', () => {
      const whiteBarEntry = { from: -1, to: 20, die: 4 };
      const blackBarEntry = { from: -1, to: 3, die: 4 };

      expect(validateMoveDirection(whiteBarEntry, 'white').valid).toBe(true);
      expect(validateMoveDirection(blackBarEntry, 'black').valid).toBe(true);
    });

    it('should allow bear-off (to: 24) for any player', () => {
      const whiteBearOff = { from: 2, to: 24, die: 3 };
      const blackBearOff = { from: 21, to: 24, die: 3 };

      expect(validateMoveDirection(whiteBearOff, 'white').valid).toBe(true);
      expect(validateMoveDirection(blackBearOff, 'black').valid).toBe(true);
    });
  });
});

describe('Dice Validation', () => {
  describe('calculateRequiredDie', () => {
    it('should calculate normal move distance correctly', () => {
      expect(calculateRequiredDie({ from: 12, to: 7, die: 5 }, 'white')).toBe(5);
      expect(calculateRequiredDie({ from: 7, to: 12, die: 5 }, 'black')).toBe(5);
    });

    it('should calculate bar entry die for white (24 - to)', () => {
      expect(calculateRequiredDie({ from: -1, to: 23, die: 1 }, 'white')).toBe(1);
      expect(calculateRequiredDie({ from: -1, to: 20, die: 4 }, 'white')).toBe(4);
      expect(calculateRequiredDie({ from: -1, to: 18, die: 6 }, 'white')).toBe(6);
    });

    it('should calculate bar entry die for black (to + 1)', () => {
      expect(calculateRequiredDie({ from: -1, to: 0, die: 1 }, 'black')).toBe(1);
      expect(calculateRequiredDie({ from: -1, to: 3, die: 4 }, 'black')).toBe(4);
      expect(calculateRequiredDie({ from: -1, to: 5, die: 6 }, 'black')).toBe(6);
    });

    it('should calculate bear-off die for white (from + 1)', () => {
      expect(calculateRequiredDie({ from: 0, to: 24, die: 1 }, 'white')).toBe(1);
      expect(calculateRequiredDie({ from: 5, to: 24, die: 6 }, 'white')).toBe(6);
    });

    it('should calculate bear-off die for black (24 - from)', () => {
      expect(calculateRequiredDie({ from: 23, to: 24, die: 1 }, 'black')).toBe(1);
      expect(calculateRequiredDie({ from: 18, to: 24, die: 6 }, 'black')).toBe(6);
    });
  });

  describe('validateDiceConsumption', () => {
    it('should pass when die matches move distance and is available', () => {
      const move = { from: 12, to: 7, die: 5 };
      const remainingDice = [3, 5];

      const result = validateDiceConsumption(move, remainingDice, 'white');

      expect(result.valid).toBe(true);
    });

    it('should fail when die does not match move distance', () => {
      const move = { from: 12, to: 7, die: 3 }; // Distance is 5, not 3
      const remainingDice = [3, 5];

      const result = validateDiceConsumption(move, remainingDice, 'white');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('requires die 5 but used 3');
    });

    it('should fail when die is not available in remaining dice', () => {
      const move = { from: 10, to: 6, die: 4 };
      const remainingDice = [3, 5]; // 4 not available

      const result = validateDiceConsumption(move, remainingDice, 'white');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('not available');
    });
  });

  describe('consumeDie', () => {
    it('should remove one instance of die from array', () => {
      expect(consumeDie([3, 5], 3)).toEqual([5]);
      expect(consumeDie([3, 5], 5)).toEqual([3]);
    });

    it('should only remove one instance for doubles', () => {
      expect(consumeDie([4, 4, 4, 4], 4)).toEqual([4, 4, 4]);
    });

    it('should return unchanged array if die not found', () => {
      expect(consumeDie([3, 5], 6)).toEqual([3, 5]);
    });
  });
});
