/**
 * Tests for Module Integration and Entry Point
 * Task Group 4: Module Integration and Entry Point
 * @module tests/dice/integration
 */

import { describe, it, expect } from 'vitest';
import * as dice from '../../src/dice/index.js';

/**
 * Create a basic game state for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Test game state
 */
function createTestState(overrides = {}) {
  return {
    turn: 1,
    activePlayer: 'white',
    dice: [3, 5],
    diceUsed: [],
    board: Array(24).fill(0),
    bar: { white: 0, black: 0 },
    home: { white: 0, black: 0 },
    status: 'playing',
    winner: null,
    players: { white: 'alice', black: 'bob' },
    tableOptions: { allowBearOffOvershoot: true },
    ...overrides
  };
}

describe('Dice Module Integration', () => {
  describe('Public API exports', () => {
    it('should export all core dice rolling functions', () => {
      expect(typeof dice.rollDie).toBe('function');
      expect(typeof dice.rollDice).toBe('function');
      expect(typeof dice.isDoubles).toBe('function');
    });

    it('should export rollForStart from initial-roll.js', () => {
      expect(typeof dice.rollForStart).toBe('function');
    });

    it('should export rollForNextTurn and checkForLegalMoves from turn-roll.js', () => {
      expect(typeof dice.rollForNextTurn).toBe('function');
      expect(typeof dice.checkForLegalMoves).toBe('function');
    });

    it('should export result factory functions', () => {
      expect(typeof dice.createDiceResult).toBe('function');
      expect(typeof dice.createInitialRollResult).toBe('function');
    });

    it('should export message functions', () => {
      expect(typeof dice.createAutoPassMessage).toBe('function');
    });
  });

  describe('Integration flow: rollForStart -> rollForNextTurn', () => {
    it('should work together for complete game start flow', () => {
      // Step 1: Roll for starting player
      const startResult = dice.rollForStart();

      expect(startResult).toHaveProperty('startingPlayer');
      expect(startResult).toHaveProperty('dice');
      expect(['white', 'black']).toContain(startResult.startingPlayer);

      // Step 2: Create initial state with starting player
      const state = createTestState({
        activePlayer: startResult.startingPlayer,
        dice: startResult.dice
      });

      // Add pieces for both players
      state.board[12] = 2;  // White
      state.board[11] = -2; // Black

      // Step 3: Roll for next turn after first player moves
      const nextTurnResult = dice.rollForNextTurn(state);

      expect(nextTurnResult).toHaveProperty('dice');
      expect(nextTurnResult).toHaveProperty('diceUsed');
      expect(nextTurnResult).toHaveProperty('autoPass');
      expect(nextTurnResult).toHaveProperty('activePlayer');
      expect(nextTurnResult.diceUsed).toEqual([]);
    });
  });

  describe('Result objects compatibility with state.json', () => {
    it('should produce DiceRollResult compatible with state update', () => {
      const result = dice.createDiceResult([4, 2], {
        autoPass: true,
        messages: [{ type: 'info', text: 'Test', timestamp: '2025-01-21T12:00:00Z' }],
        activePlayer: 'black'
      });

      // Should have all fields needed for state update merge
      expect(result.dice).toEqual([4, 2]);
      expect(result.diceUsed).toEqual([]);
      expect(result.autoPass).toBe(true);
      expect(Array.isArray(result.messages)).toBe(true);
      expect(result.activePlayer).toBe('black');

      // Dice values should be valid for schema
      result.dice.forEach(d => {
        expect(d).toBeGreaterThanOrEqual(1);
        expect(d).toBeLessThanOrEqual(6);
      });
    });

    it('should produce InitialRollResult compatible with initial state setup', () => {
      const result = dice.createInitialRollResult('white', [5, 3]);

      // Should have all fields needed for initial state setup
      expect(result.startingPlayer).toBe('white');
      expect(result.dice).toEqual([5, 3]);
      expect(['white', 'black']).toContain(result.startingPlayer);
    });
  });

  describe('No circular dependencies', () => {
    it('should import module without errors', async () => {
      // If there were circular dependencies, the import would fail
      // This test verifies the module loads correctly
      const diceModule = await import('../../src/dice/index.js');

      expect(diceModule).toBeDefined();
      expect(typeof diceModule.rollDice).toBe('function');
    });
  });

  describe('Doubles handling', () => {
    it('should correctly identify doubles through isDoubles', () => {
      expect(dice.isDoubles([3, 3])).toBe(true);
      expect(dice.isDoubles([3, 5])).toBe(false);
    });

    it('should store doubles as [n, n] (two values)', () => {
      // Generate many rolls and check any doubles
      for (let i = 0; i < 50; i++) {
        const roll = dice.rollDice();
        expect(roll.length).toBe(2);

        if (dice.isDoubles(roll)) {
          // Doubles should still be exactly 2 values
          expect(roll.length).toBe(2);
          expect(roll[0]).toBe(roll[1]);
        }
      }
    });
  });
});
