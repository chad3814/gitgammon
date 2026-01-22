/**
 * Tests for Turn-End Roll and No-Move Detection
 * Task Group 3: Turn-End Roll and No-Move Detection
 * @module tests/dice/turn-roll
 */

import { describe, it, expect } from 'vitest';
import { rollForNextTurn, checkForLegalMoves, createAutoPassMessage } from '../../src/dice/index.js';
import { isValidDieValue } from '../../src/state/constants.js';

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

describe('Turn-End Roll', () => {
  describe('rollForNextTurn', () => {
    it('should return new dice and empty diceUsed', () => {
      const state = createTestState();
      state.board[12] = 2; // White pieces so there are legal moves

      const result = rollForNextTurn(state);

      expect(result.dice).toHaveLength(2);
      expect(isValidDieValue(result.dice[0])).toBe(true);
      expect(isValidDieValue(result.dice[1])).toBe(true);
      expect(result.diceUsed).toEqual([]);
    });

    it('should set activePlayer to opponent by default', () => {
      const state = createTestState({ activePlayer: 'white' });
      // Put black pieces on the board so they have moves
      state.board[12] = -2;

      const result = rollForNextTurn(state);

      // Should switch to black (opponent of white)
      expect(result.activePlayer).toBe('black');
    });

    it('should have autoPass false when next player has legal moves', () => {
      const state = createTestState({ activePlayer: 'white' });
      state.board[12] = -2; // Black pieces for next player to move

      const result = rollForNextTurn(state);

      expect(result.autoPass).toBe(false);
    });
  });

  describe('checkForLegalMoves', () => {
    it('should return true when moves exist', () => {
      const state = createTestState();
      state.board[12] = 2; // White pieces on point 12

      const hasLegal = checkForLegalMoves(state, [3, 5], 'white');

      expect(hasLegal).toBe(true);
    });

    it('should return false when player is completely blocked', () => {
      const state = createTestState();
      state.bar.white = 1; // White has piece on bar

      // Block all bar entry points (18-23 for white)
      for (let i = 18; i <= 23; i++) {
        state.board[i] = -2; // Black blocking
      }

      const hasLegal = checkForLegalMoves(state, [3, 5], 'white');

      expect(hasLegal).toBe(false);
    });
  });

  describe('Auto-pass scenarios', () => {
    it('should auto-pass and switch player when no moves available', () => {
      const state = createTestState({ activePlayer: 'white' });
      // Next player is black, put black on bar
      state.bar.black = 1;

      // Block all bar entry points for black (0-5)
      for (let i = 0; i <= 5; i++) {
        state.board[i] = 2; // White blocking
      }

      // Also add white pieces so when it passes back to white, white can move
      state.board[12] = 2;

      const result = rollForNextTurn(state);

      // Should auto-pass since black can't move, back to white
      expect(result.autoPass).toBe(true);
      expect(result.activePlayer).toBe('white');
      expect(result.messages.length).toBeGreaterThan(0);
    });

    it('should include auto-pass message with correct format', () => {
      const state = createTestState({ activePlayer: 'white' });
      state.bar.black = 1;

      // Block all bar entry points for black (0-5)
      for (let i = 0; i <= 5; i++) {
        state.board[i] = 2;
      }
      // White can move
      state.board[12] = 2;

      const result = rollForNextTurn(state);

      // Should have an auto-pass message
      const autoPassMsg = result.messages.find(m =>
        m.text.includes('cannot move') && m.text.includes('turn passes')
      );
      expect(autoPassMsg).toBeDefined();
      expect(autoPassMsg.type).toBe('info');
    });

    it('should handle double auto-pass (both players blocked)', () => {
      const state = createTestState({ activePlayer: 'white' });

      // Both players on bar
      state.bar.white = 1;
      state.bar.black = 1;

      // Block all bar entry points for BOTH players
      // White enters at 18-23, Black enters at 0-5
      for (let i = 18; i <= 23; i++) {
        state.board[i] = -2; // Block white's entry
      }
      for (let i = 0; i <= 5; i++) {
        state.board[i] = 2; // Block black's entry
      }

      const result = rollForNextTurn(state);

      // Should have tried both players and ended up back where we started
      // With 2 auto-pass messages
      expect(result.autoPass).toBe(true);
      expect(result.messages.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('createAutoPassMessage', () => {
    it('should create message with correct format', () => {
      const msg = createAutoPassMessage('black', [3, 5]);

      expect(msg.type).toBe('info');
      expect(msg.text).toBe('Player black cannot move with roll [3, 5], turn passes');
    });

    it('should have valid ISO 8601 timestamp', () => {
      const msg = createAutoPassMessage('white', [4, 2]);

      // Check timestamp is a valid ISO 8601 date string
      const parsed = Date.parse(msg.timestamp);
      expect(isNaN(parsed)).toBe(false);

      // Should be recent (within last minute)
      const now = Date.now();
      expect(Math.abs(now - parsed)).toBeLessThan(60000);
    });
  });
});
