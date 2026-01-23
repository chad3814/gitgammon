/**
 * Win Detection Tests
 * Tests for win type detection including helper functions and enhanced detectWin
 * @module tests/action/win-detection
 */

import { describe, it, expect } from 'vitest';
import {
  detectWin,
  getWinnerHomeRange,
  hasOpponentPiecesInWinnerHome,
  calculateWinType
} from '../../action/detect-win.js';

/**
 * Create a test game state with configurable pieces
 * @param {object} overrides
 * @returns {object}
 */
function createTestState(overrides = {}) {
  return {
    turn: 10,
    activePlayer: 'white',
    dice: [3, 4],
    diceUsed: [],
    board: [
      3, 3, 3, 3, 2, 1,  // White home: 15 pieces (points 0-5)
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      -3, -3, -3, -3, -2, -1 // Black home: 15 pieces (points 18-23)
    ],
    bar: { white: 0, black: 0 },
    home: { white: 0, black: 0 },
    lastMove: null,
    status: 'playing',
    winner: null,
    players: { white: 'alice', black: 'bob' },
    messages: [],
    updatedAt: '2025-01-21T12:00:00Z',
    ...overrides
  };
}

describe('Win Detection Helper Functions', () => {
  describe('getWinnerHomeRange', () => {
    it('should return [0, 5] for white winner', () => {
      const range = getWinnerHomeRange('white');
      expect(range).toEqual([0, 5]);
    });

    it('should return [18, 23] for black winner', () => {
      const range = getWinnerHomeRange('black');
      expect(range).toEqual([18, 23]);
    });
  });

  describe('hasOpponentPiecesInWinnerHome', () => {
    it('should return true when opponent pieces exist in winner home board', () => {
      // White wins, check for black pieces (negative) in white's home (0-5)
      const state = createTestState({
        board: [
          2, -1, 3, 3, 2, 1,  // Black piece at point 1 (in white's home)
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -2, -3, -3, -3, -2, -1
        ],
        home: { white: 15, black: 0 }
      });

      const result = hasOpponentPiecesInWinnerHome(state, 'white');
      expect(result).toBe(true);
    });

    it('should return false when no opponent pieces in winner home board', () => {
      const state = createTestState({
        board: [
          0, 0, 0, 0, 0, 0,  // White's home is empty (all borne off)
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -3, 0
        ],
        home: { white: 15, black: 0 }
      });

      const result = hasOpponentPiecesInWinnerHome(state, 'white');
      expect(result).toBe(false);
    });
  });

  describe('calculateWinType', () => {
    it('should return single win when opponent has borne off pieces', () => {
      const state = createTestState({
        home: { white: 15, black: 3 }  // Black has borne off 3 pieces
      });

      const result = calculateWinType(state, 'white');
      expect(result.winType).toBe('single');
      expect(result.multiplier).toBe(1);
    });

    it('should return correct winType and multiplier tuple for gammon', () => {
      const state = createTestState({
        board: [
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -3, 0  // 15 black pieces in black's home, none in white's home
        ],
        bar: { white: 0, black: 0 },
        home: { white: 15, black: 0 }  // Black has 0 pieces borne off
      });

      const result = calculateWinType(state, 'white');
      expect(result.winType).toBe('gammon');
      expect(result.multiplier).toBe(2);
    });
  });
});

describe('Enhanced detectWin Function', () => {
  describe('Return type with win type', () => {
    it('should return winType: null and multiplier: 1 when no win', () => {
      const state = createTestState({
        home: { white: 10, black: 0 }  // White hasn't won yet
      });

      const result = detectWin(state, 'white');
      expect(result.won).toBe(false);
      expect(result.winType).toBeNull();
      expect(result.multiplier).toBe(1);
    });

    it('should return winType: single when opponent has borne off pieces', () => {
      const state = createTestState({
        home: { white: 15, black: 5 }  // Black has borne off 5 pieces
      });

      const result = detectWin(state, 'white');
      expect(result.won).toBe(true);
      expect(result.winner).toBe('white');
      expect(result.winType).toBe('single');
      expect(result.multiplier).toBe(1);
    });

    it('should return winType: gammon when opponent has 0 home and no pieces in winner home', () => {
      const state = createTestState({
        board: [
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -3, 0  // All black pieces in their home board
        ],
        bar: { white: 0, black: 0 },
        home: { white: 15, black: 0 }
      });

      const result = detectWin(state, 'white');
      expect(result.won).toBe(true);
      expect(result.winType).toBe('gammon');
      expect(result.multiplier).toBe(2);
    });

    it('should return winType: backgammon when opponent has pieces on bar', () => {
      const state = createTestState({
        board: [
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, 0  // 14 black pieces in their home
        ],
        bar: { white: 0, black: 1 },  // 1 black piece on bar
        home: { white: 15, black: 0 }
      });

      const result = detectWin(state, 'white');
      expect(result.won).toBe(true);
      expect(result.winType).toBe('backgammon');
      expect(result.multiplier).toBe(3);
    });

    it('should return winType: backgammon when opponent has pieces in winner home board', () => {
      const state = createTestState({
        board: [
          -2, 0, 0, 0, 0, 0,  // Black pieces in white's home (point 0)
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, 0  // 13 black pieces in black's home
        ],
        bar: { white: 0, black: 0 },
        home: { white: 15, black: 0 }
      });

      const result = detectWin(state, 'white');
      expect(result.won).toBe(true);
      expect(result.winType).toBe('backgammon');
      expect(result.multiplier).toBe(3);
    });

    it('should maintain backward compatibility with won, winner, and state fields', () => {
      const state = createTestState({
        home: { white: 15, black: 3 }
      });

      const result = detectWin(state, 'white');

      // Original fields must be present and correct
      expect(result).toHaveProperty('won');
      expect(result).toHaveProperty('winner');
      expect(result).toHaveProperty('state');
      expect(result.won).toBe(true);
      expect(result.winner).toBe('white');
      expect(result.state.status).toBe('completed');
      expect(result.state.winner).toBe('white');

      // New fields also present
      expect(result).toHaveProperty('winType');
      expect(result).toHaveProperty('multiplier');
    });
  });
});

describe('State Schema with winType', () => {
  it('should include winType field in completed game state', () => {
    const state = createTestState({
      home: { white: 15, black: 2 }
    });

    const result = detectWin(state, 'white');

    expect(result.state).toHaveProperty('winType');
    expect(result.state.winType).toBe('single');
  });

  it('should have winType in correct format for completed state', () => {
    const state = createTestState({
      board: [
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        -3, -3, -3, -3, -3, 0
      ],
      bar: { white: 0, black: 0 },
      home: { white: 15, black: 0 }
    });

    const result = detectWin(state, 'white');

    expect(result.state.status).toBe('completed');
    expect(['single', 'gammon', 'backgammon']).toContain(result.state.winType);
  });
});

describe('Win Type Edge Cases and Integration', () => {
  describe('Black player wins', () => {
    it('should correctly detect black player single win', () => {
      const state = createTestState({
        activePlayer: 'black',
        home: { white: 3, black: 15 }  // White has borne off 3 pieces
      });

      const result = detectWin(state, 'black');
      expect(result.won).toBe(true);
      expect(result.winner).toBe('black');
      expect(result.winType).toBe('single');
      expect(result.multiplier).toBe(1);
    });

    it('should correctly detect black player gammon win', () => {
      const state = createTestState({
        activePlayer: 'black',
        board: [
          3, 3, 3, 3, 2, 1,  // All white pieces in their home board
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0   // Black's home empty (all borne off)
        ],
        bar: { white: 0, black: 0 },
        home: { white: 0, black: 15 }
      });

      const result = detectWin(state, 'black');
      expect(result.won).toBe(true);
      expect(result.winType).toBe('gammon');
      expect(result.multiplier).toBe(2);
    });

    it('should correctly detect black player backgammon win with white pieces in black home', () => {
      const state = createTestState({
        activePlayer: 'black',
        board: [
          3, 3, 3, 3, 2, 0,  // 14 white pieces in white's home
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 1   // 1 white piece in black's home (point 23)
        ],
        bar: { white: 0, black: 0 },
        home: { white: 0, black: 15 }
      });

      const result = detectWin(state, 'black');
      expect(result.won).toBe(true);
      expect(result.winType).toBe('backgammon');
      expect(result.multiplier).toBe(3);
    });
  });

  describe('Edge cases for home count', () => {
    it('should treat exactly 1 piece borne off as single win', () => {
      const state = createTestState({
        home: { white: 15, black: 1 }  // Black has exactly 1 piece borne off
      });

      const result = detectWin(state, 'white');
      expect(result.winType).toBe('single');
    });

    it('should treat exactly 0 pieces borne off as gammon or backgammon', () => {
      const state = createTestState({
        board: [
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -3, 0
        ],
        bar: { white: 0, black: 0 },
        home: { white: 15, black: 0 }  // Black has exactly 0 pieces borne off
      });

      const result = detectWin(state, 'white');
      expect(['gammon', 'backgammon']).toContain(result.winType);
    });
  });

  describe('Backgammon with both bar and home pieces', () => {
    it('should detect backgammon when opponent has pieces on bar AND in winner home', () => {
      const state = createTestState({
        board: [
          -1, 0, 0, 0, 0, 0,  // 1 black piece in white's home
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -1, 0  // 13 black pieces in black's home
        ],
        bar: { white: 0, black: 1 },  // 1 black piece on bar (total 15 black pieces)
        home: { white: 15, black: 0 }
      });

      const result = detectWin(state, 'white');
      expect(result.won).toBe(true);
      expect(result.winType).toBe('backgammon');
      expect(result.multiplier).toBe(3);
    });
  });
});
