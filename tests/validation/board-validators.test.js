/**
 * Tests for Board State Validators (Bar, Blocking, Blot, Bearing Off)
 * @module tests/validation/board-validators
 */

import { describe, it, expect } from 'vitest';
import { validateBarReentry } from '../../src/validation/validators/bar.js';
import { validatePointBlocking } from '../../src/validation/validators/blocking.js';
import { detectBlotHit } from '../../src/validation/validators/blot.js';
import { validateBearingOff } from '../../src/validation/validators/bearoff.js';

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

describe('Bar Re-entry Validation', () => {
  describe('validateBarReentry', () => {
    it('should pass when no pieces on bar', () => {
      const state = createTestState();
      const move = { from: 12, to: 7, die: 5 };

      const result = validateBarReentry(state, move, 'white');

      expect(result.valid).toBe(true);
    });

    it('should fail when pieces on bar but move is not from bar', () => {
      const state = createTestState();
      state.bar.white = 2;
      const move = { from: 12, to: 7, die: 5 }; // Not from bar

      const result = validateBarReentry(state, move, 'white');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Must re-enter from bar');
      expect(result.errors[0]).toContain('2 pieces on bar');
    });

    it('should calculate white bar entry point correctly (24 - die)', () => {
      const state = createTestState();
      state.bar.white = 1;
      const move = { from: -1, to: 20, die: 4 }; // 24 - 4 = 20

      const result = validateBarReentry(state, move, 'white');

      expect(result.valid).toBe(true);
    });

    it('should calculate black bar entry point correctly (die - 1)', () => {
      const state = createTestState();
      state.bar.black = 1;
      const move = { from: -1, to: 3, die: 4 }; // 4 - 1 = 3

      const result = validateBarReentry(state, move, 'black');

      expect(result.valid).toBe(true);
    });

    it('should fail when entry point does not match die', () => {
      const state = createTestState();
      state.bar.white = 1;
      const move = { from: -1, to: 19, die: 4 }; // Should be 20 (24-4)

      const result = validateBarReentry(state, move, 'white');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('must be to point 20');
    });
  });
});

describe('Point Blocking Validation', () => {
  describe('validatePointBlocking', () => {
    it('should pass when landing on empty point', () => {
      const state = createTestState();
      const move = { from: 12, to: 7, die: 5 };

      const result = validatePointBlocking(state, move, 'white');

      expect(result.valid).toBe(true);
    });

    it('should pass when landing on own pieces', () => {
      const state = createTestState();
      state.board[7] = 3; // 3 white pieces
      const move = { from: 12, to: 7, die: 5 };

      const result = validatePointBlocking(state, move, 'white');

      expect(result.valid).toBe(true);
    });

    it('should fail when point blocked by 2+ opponent pieces', () => {
      const state = createTestState();
      state.board[7] = -3; // 3 black pieces (negative = black)
      const move = { from: 12, to: 7, die: 5 };

      const result = validatePointBlocking(state, move, 'white');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toBe('Point 7 is blocked by black (3 pieces)');
    });

    it('should pass when landing on single opponent piece (blot)', () => {
      const state = createTestState();
      state.board[7] = -1; // 1 black piece (blot)
      const move = { from: 12, to: 7, die: 5 };

      const result = validatePointBlocking(state, move, 'white');

      expect(result.valid).toBe(true); // Can hit a blot
    });

    it('should allow bear-off (never blocked)', () => {
      const state = createTestState();
      const move = { from: 2, to: 24, die: 3 };

      const result = validatePointBlocking(state, move, 'white');

      expect(result.valid).toBe(true);
    });
  });
});

describe('Blot Hit Detection', () => {
  describe('detectBlotHit', () => {
    it('should not detect hit on empty point', () => {
      const state = createTestState();
      const move = { from: 12, to: 7, die: 5 };

      const result = detectBlotHit(state, move, 'white');

      expect(result.valid).toBe(true);
      expect(result.hitInfo).toBeUndefined();
    });

    it('should detect blot hit with correct hitInfo', () => {
      const state = createTestState();
      state.board[7] = -1; // Single black piece (blot)
      const move = { from: 12, to: 7, die: 5 };

      const result = detectBlotHit(state, move, 'white');

      expect(result.valid).toBe(true);
      expect(result.hitInfo).toEqual({ point: 7, player: 'black' });
    });

    it('should not detect hit on multiple opponent pieces (not a blot)', () => {
      const state = createTestState();
      state.board[7] = -2; // 2 black pieces (not a blot)
      const move = { from: 12, to: 7, die: 5 };

      const result = detectBlotHit(state, move, 'white');

      expect(result.hitInfo).toBeUndefined();
    });

    it('should not detect hit on own pieces', () => {
      const state = createTestState();
      state.board[7] = 1; // Single white piece (own)
      const move = { from: 12, to: 7, die: 5 };

      const result = detectBlotHit(state, move, 'white');

      expect(result.hitInfo).toBeUndefined();
    });

    it('should not mutate game state', () => {
      const state = createTestState();
      state.board[7] = -1;
      const originalBoard = [...state.board];
      const move = { from: 12, to: 7, die: 5 };

      detectBlotHit(state, move, 'white');

      expect(state.board).toEqual(originalBoard);
    });
  });
});

describe('Bearing Off Validation', () => {
  describe('validateBearingOff', () => {
    it('should pass when all pieces in home board', () => {
      const state = createTestState();
      // Put some white pieces in home board (0-5)
      state.board[0] = 2;
      state.board[3] = 3;
      state.board[5] = 2;
      const move = { from: 3, to: 24, die: 4 }; // Need 3+1=4

      const result = validateBearingOff(state, move, 'white');

      expect(result.valid).toBe(true);
    });

    it('should fail when pieces exist outside home board', () => {
      const state = createTestState();
      state.board[0] = 2;
      state.board[10] = 1; // Piece outside home
      const move = { from: 0, to: 24, die: 1 };

      const result = validateBearingOff(state, move, 'white');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('pieces exist outside home board');
      expect(result.errors[0]).toContain('point 10');
    });

    it('should fail when pieces on bar', () => {
      const state = createTestState();
      state.board[0] = 2;
      state.bar.white = 1;
      const move = { from: 0, to: 24, die: 1 };

      const result = validateBearingOff(state, move, 'white');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('bar');
    });

    it('should allow overshoot when tableOptions.allowBearOffOvershoot is true', () => {
      const state = createTestState();
      state.tableOptions = { allowBearOffOvershoot: true };
      state.board[2] = 2; // Pieces on point 2
      const move = { from: 2, to: 24, die: 6 }; // Exact would be 3

      const result = validateBearingOff(state, move, 'white');

      expect(result.valid).toBe(true);
    });

    it('should block overshoot when option disabled and higher pieces exist', () => {
      const state = createTestState();
      state.tableOptions = { allowBearOffOvershoot: false };
      state.board[2] = 2; // Pieces on point 2
      state.board[4] = 1; // Higher piece on point 4
      const move = { from: 2, to: 24, die: 6 }; // Overshoot from point 2

      const result = validateBearingOff(state, move, 'white');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('higher pieces exist on point 4');
    });

    it('should allow overshoot from highest point even when option disabled', () => {
      const state = createTestState();
      state.tableOptions = { allowBearOffOvershoot: false };
      state.board[3] = 2; // Highest point with pieces
      const move = { from: 3, to: 24, die: 6 }; // Overshoot allowed

      const result = validateBearingOff(state, move, 'white');

      expect(result.valid).toBe(true);
    });
  });
});
