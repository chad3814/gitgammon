/**
 * Tests for Forced Move Calculation and Integration
 * @module tests/validation/forced-moves
 */

import { describe, it, expect } from 'vitest';
import {
  calculateLegalMoves,
  buildMoveTree,
  analyzeForcedMoves,
  validateMove,
  validateMoves,
  hasLegalMoves
} from '../../src/validation/index.js';

/** Create a basic game state for testing */
function createTestState() {
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
    tableOptions: { allowBearOffOvershoot: true }
  };
}

describe('Forced Move Calculation', () => {
  describe('calculateLegalMoves', () => {
    it('should find all legal moves for simple position', () => {
      const state = createTestState();
      state.board[12] = 2; // White pieces on point 12

      const moves = calculateLegalMoves(state, [3, 5], 'white');

      // Should find moves with die 3 and die 5
      expect(moves.length).toBeGreaterThan(0);
      expect(moves.some(m => m.die === 3)).toBe(true);
      expect(moves.some(m => m.die === 5)).toBe(true);
    });

    it('should enforce bar re-entry when pieces on bar', () => {
      const state = createTestState();
      state.bar.white = 1;
      state.board[12] = 2;

      const moves = calculateLegalMoves(state, [3, 5], 'white');

      // All moves should be bar entry (from -1)
      expect(moves.every(m => m.from === -1)).toBe(true);
    });

    it('should not find moves to blocked points', () => {
      const state = createTestState();
      state.board[12] = 2; // White pieces
      state.board[9] = -3; // Black blocking point 9

      const moves = calculateLegalMoves(state, [3], 'white');

      // Should not have move to blocked point 9
      expect(moves.some(m => m.to === 9)).toBe(false);
    });
  });

  describe('buildMoveTree', () => {
    it('should find maximum dice usage through tree search', () => {
      const state = createTestState();
      state.board[12] = 3; // White pieces

      // No blocking, should use both dice
      const result = buildMoveTree(
        { board: [...state.board], bar: { ...state.bar }, home: { ...state.home } },
        [3, 5],
        'white'
      );

      expect(result.maxDice).toBe(2);
    });

    it('should handle partial blocking where only one die is usable', () => {
      const state = createTestState();
      state.board[5] = 1; // One white piece on point 5
      // Block both possible destinations
      state.board[2] = -2; // Block point 2 (5-3)
      state.board[0] = -2; // Block point 0 (5-5)

      // With dice [3, 5], from point 5:
      // - 5-3=2 blocked
      // - 5-5=0 blocked
      // No moves possible at all

      const result = buildMoveTree(
        { board: [...state.board], bar: { ...state.bar }, home: { ...state.home } },
        [3, 5],
        'white'
      );

      expect(result.maxDice).toBe(0);
    });

    it('should correctly explore when first move enables second', () => {
      const state = createTestState();
      state.board[10] = 1; // One white piece at point 10

      // With dice [3, 5]:
      // Move 1: 10->5 (die 5)
      // Move 2: 5->2 (die 3)
      // Total: 2 dice

      const result = buildMoveTree(
        { board: [...state.board], bar: { ...state.bar }, home: { ...state.home } },
        [3, 5],
        'white'
      );

      expect(result.maxDice).toBe(2);
    });

    it('should handle doubles correctly (4 moves possible)', () => {
      const state = createTestState();
      state.board[12] = 4; // 4 white pieces

      const result = buildMoveTree(
        { board: [...state.board], bar: { ...state.bar }, home: { ...state.home } },
        [3, 3, 3, 3],
        'white'
      );

      expect(result.maxDice).toBe(4);
    });
  });

  describe('analyzeForcedMoves', () => {
    it('should detect when more dice could be used', () => {
      const state = createTestState();
      state.board[12] = 2;
      state.dice = [3, 5];

      // Only use 1 die when 2 could be used
      const moves = [{ from: 12, to: 9, die: 3 }];
      const analysis = analyzeForcedMoves(state, moves, 'white');

      expect(analysis.moreMovesAvailable).toBe(true);
      expect(analysis.maxDiceUsable).toBe(2);
      expect(analysis.diceUsed).toBe(1);
    });

    it('should pass when all usable dice are used', () => {
      const state = createTestState();
      state.board[12] = 2;
      state.dice = [3, 5];

      // Use both dice
      const moves = [
        { from: 12, to: 9, die: 3 },
        { from: 12, to: 7, die: 5 }
      ];
      const analysis = analyzeForcedMoves(state, moves, 'white');

      expect(analysis.moreMovesAvailable).toBe(false);
      expect(analysis.diceUsed).toBe(2);
    });
  });
});

describe('Main Validation Entry Point', () => {
  describe('validateMove', () => {
    it('should aggregate all validators correctly', () => {
      const state = createTestState();
      state.board[12] = 2;
      const move = { from: 12, to: 7, die: 5 };

      const result = validateMove(state, move, 'white', [3, 5]);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return combined errors from multiple failures', () => {
      const state = createTestState();
      state.activePlayer = 'black'; // Wrong turn
      const move = { from: 12, to: 7, die: 5 };

      const result = validateMove(state, move, 'white', [3, 5]);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Not your turn');
    });

    it('should return hitInfo when blot hit in valid move', () => {
      const state = createTestState();
      state.board[12] = 2;
      state.board[7] = -1; // Black blot
      const move = { from: 12, to: 7, die: 5 };

      const result = validateMove(state, move, 'white', [3, 5]);

      expect(result.valid).toBe(true);
      expect(result.hitInfo).toEqual({ point: 7, player: 'black' });
    });
  });

  describe('validateMoves', () => {
    it('should validate multiple moves in sequence', () => {
      const state = createTestState();
      state.board[12] = 3;
      const moves = [
        { from: 12, to: 9, die: 3 },
        { from: 12, to: 7, die: 5 }
      ];

      const result = validateMoves(state, moves, 'white');

      expect(result.valid).toBe(true);
      expect(result.forcedMoveInfo).toBeDefined();
      expect(result.forcedMoveInfo.diceUsed).toBe(2);
    });

    it('should return forcedMoveInfo for valid moves', () => {
      const state = createTestState();
      state.board[12] = 2;
      const moves = [
        { from: 12, to: 9, die: 3 },
        { from: 12, to: 7, die: 5 }
      ];

      const result = validateMoves(state, moves, 'white');

      expect(result.forcedMoveInfo).toBeDefined();
      expect(result.forcedMoveInfo.moreMovesAvailable).toBe(false);
    });

    it('should fail with forced move violation when not using all dice', () => {
      const state = createTestState();
      state.board[12] = 2;
      const moves = [{ from: 12, to: 9, die: 3 }]; // Only using 1 of 2 dice

      const result = validateMoves(state, moves, 'white');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Forced move violation');
      expect(result.errors[0]).toContain('2 dice could be used but only 1 were used');
    });

    it('should handle empty moves when no moves possible', () => {
      const state = createTestState();
      // All entry points blocked
      for (let i = 18; i <= 23; i++) {
        state.board[i] = -2;
      }
      state.bar.white = 1;

      const result = validateMoves(state, [], 'white');

      expect(result.valid).toBe(true);
      expect(result.forcedMoveInfo.maxDiceUsable).toBe(0);
    });
  });

  describe('hasLegalMoves', () => {
    it('should return true when moves available', () => {
      const state = createTestState();
      state.board[12] = 2;

      expect(hasLegalMoves(state, 'white')).toBe(true);
    });

    it('should return false when all moves blocked', () => {
      const state = createTestState();
      state.bar.white = 1;
      // Block all entry points
      for (let i = 18; i <= 23; i++) {
        state.board[i] = -2;
      }

      expect(hasLegalMoves(state, 'white')).toBe(false);
    });
  });
});
