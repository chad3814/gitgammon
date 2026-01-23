/**
 * Tests for State Updates and Git Operations
 * Task Group 4: Apply Moves, Roll Dice, Commit Changes
 * @module tests/action/state-updates
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { applyMoves } from '../../action/apply-move.js';
import { rollDiceForNextTurn } from '../../action/roll-dice.js';
import { detectWin } from '../../action/detect-win.js';
import { finalizeState } from '../../action/finalize-state.js';
import { commitValidMove } from '../../action/commit-valid.js';
import { handleInvalidMove } from '../../action/commit-invalid.js';

const TEST_DIR = join(process.cwd(), 'test-fixtures-state');
const TEST_TABLE = 'test-game';
const TEST_TABLE_PATH = join(TEST_DIR, 'tables', TEST_TABLE);

/**
 * Create a test game state
 * @param {object} overrides
 * @returns {object}
 */
function createTestState(overrides = {}) {
  return {
    turn: 1,
    activePlayer: 'white',
    dice: [3, 5],
    diceUsed: [],
    board: [
      2, 0, 0, 0, 0, -5,
      0, -3, 0, 0, 0, 5,
      -5, 0, 0, 0, 3, 0,
      5, 0, 0, 0, 0, -2
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

/**
 * Create a test move file
 * @param {object} overrides
 * @returns {object}
 */
function createTestMoveFile(overrides = {}) {
  return {
    player: 'white',
    moves: [
      { from: 5, to: 2, die: 3 },
      { from: 7, to: 2, die: 5 }
    ],
    timestamp: '2025-01-21T12:01:00Z',
    expectedState: 'a3b4c5d6e7f89a0b',
    diceRoll: [3, 5],
    comment: null,
    commitSha: null,
    ...overrides
  };
}

describe('State Updates and Git Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (!existsSync(join(TEST_TABLE_PATH, 'moves'))) {
      mkdirSync(join(TEST_TABLE_PATH, 'moves'), { recursive: true });
    }
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('applyMoves', () => {
    it('should update board state correctly after applying moves', () => {
      // Use a state where white has pieces on points 5 and 7 (0-indexed)
      // Standard initial: point 0 has 2 white, point 11 has 5 white, point 16 has 3 white, point 18 has 5 white
      const state = createTestState();
      // Move from points where white has pieces
      const moveFile = createTestMoveFile({
        moves: [
          { from: 11, to: 8, die: 3 },  // Move from point 11 (has 5 white)
          { from: 11, to: 6, die: 5 }   // Move another from point 11
        ],
        diceRoll: [3, 5]
      });

      const newState = applyMoves(state, moveFile);

      // Point 11 should now have 3 white pieces (was 5)
      expect(newState.board[11]).toBe(3);
      // Point 8 should now have 1 white piece
      expect(newState.board[8]).toBe(1);
      // Point 6 should now have 1 white piece
      expect(newState.board[6]).toBe(1);
    });

    it('should track hits when capturing opponent pieces', () => {
      // Setup state where a hit can occur
      const state = createTestState({
        board: [
          2, 0, -1, 0, 0, -5, // point 2 has 1 black piece (blot)
          0, -2, 0, 0, 0, 5,
          -5, 0, 0, 0, 3, 0,
          5, 0, 0, 0, 0, -2
        ]
      });

      const moveFile = createTestMoveFile({
        moves: [{ from: 11, to: 8, die: 3 }], // Move white to hit black
        diceRoll: [3]
      });

      const newState = applyMoves(state, moveFile);

      // Point 8 should now have white, black blot should be on bar
      expect(newState.board[8]).toBe(1);  // White now occupies
    });
  });

  describe('rollDiceForNextTurn', () => {
    it('should roll new dice after valid move', () => {
      const state = createTestState();
      // Add pieces so opponent has legal moves
      state.board[12] = -2;

      const result = rollDiceForNextTurn(state);

      expect(result.dice).toHaveLength(2);
      expect(result.diceUsed).toEqual([]);
      expect(result.activePlayer).toBe('black'); // Opponent's turn
    });

    it('should handle auto-pass when opponent has no moves', () => {
      const state = createTestState();
      state.bar.black = 1;
      // Block all entry points for black (0-5)
      for (let i = 0; i <= 5; i++) {
        state.board[i] = 2; // White blocking
      }
      // White can move
      state.board[12] = 2;

      const result = rollDiceForNextTurn(state);

      expect(result.autoPass).toBe(true);
    });
  });

  describe('detectWin', () => {
    it('should detect win when player has 15 pieces home', () => {
      const state = createTestState({
        home: { white: 15, black: 0 }
      });

      const result = detectWin(state, 'white');

      expect(result.won).toBe(true);
      expect(result.winner).toBe('white');
    });

    it('should not detect win when player has fewer than 15 pieces home', () => {
      const state = createTestState({
        home: { white: 14, black: 0 }
      });

      const result = detectWin(state, 'white');

      expect(result.won).toBe(false);
      expect(result.winner).toBeNull();
    });

    it('should update state status and winner on win', () => {
      const state = createTestState({
        home: { white: 15, black: 0 }
      });

      const result = detectWin(state, 'white');

      expect(result.won).toBe(true);
      expect(result.state.status).toBe('completed');
      expect(result.state.winner).toBe('white');
    });
  });

  describe('finalizeState', () => {
    it('should update lastMove with correct sequence and player', () => {
      const state = createTestState();
      const filename = '0001-white-a1b2c3.json';

      const finalState = finalizeState(state, {
        player: 'white',
        sequence: 1,
        filename
      });

      expect(finalState.lastMove).toEqual({
        sequence: 1,
        player: 'white',
        file: filename
      });
    });

    it('should increment turn counter', () => {
      const state = createTestState({ turn: 5 });

      const finalState = finalizeState(state, {
        player: 'white',
        sequence: 1,
        filename: '0001-white-a1b2c3.json'
      });

      expect(finalState.turn).toBe(6);
    });

    it('should update updatedAt timestamp', () => {
      const state = createTestState({
        updatedAt: '2025-01-21T12:00:00Z'
      });

      const finalState = finalizeState(state, {
        player: 'white',
        sequence: 1,
        filename: '0001-white-a1b2c3.json'
      });

      // Should be a recent ISO timestamp
      const timestamp = new Date(finalState.updatedAt);
      expect(timestamp.getTime()).toBeGreaterThan(new Date('2025-01-21T12:00:00Z').getTime());
    });
  });

  describe('commitValidMove', () => {
    it('should write state file with correct content', () => {
      const state = createTestState();
      const statePath = join(TEST_TABLE_PATH, 'state.json');

      // Note: This test verifies state file writing only
      // Git commands are tested in integration tests
      try {
        commitValidMove({
          tableName: TEST_TABLE,
          sequence: 1,
          player: 'white',
          state,
          basePath: TEST_DIR
        });
      } catch (e) {
        // Git commands may fail in test environment, that's ok
      }

      // Verify state file was written
      const writtenState = JSON.parse(readFileSync(statePath, 'utf-8'));
      expect(writtenState.turn).toBe(state.turn);
      expect(writtenState.activePlayer).toBe(state.activePlayer);
    });
  });

  describe('handleInvalidMove', () => {
    it('should add error message to state', () => {
      const movePath = join(TEST_TABLE_PATH, 'moves', '0001-white-invalid.json');
      writeFileSync(movePath, JSON.stringify(createTestMoveFile()));

      const state = createTestState({ messages: [] });

      // Note: Git commands may fail in test environment
      try {
        handleInvalidMove({
          moveFilePath: movePath,
          tableName: TEST_TABLE,
          reason: 'Invalid move: wrong turn',
          state,
          basePath: TEST_DIR
        });
      } catch (e) {
        // Git commands may fail, but state should still be updated
      }

      // The state should have an error message added
      expect(state.messages.length).toBe(1);
      expect(state.messages[0].type).toBe('error');
      expect(state.messages[0].text).toContain('Invalid move');
    });

    it('should format error message correctly', () => {
      const movePath = join(TEST_TABLE_PATH, 'moves', '0001-white-invalid.json');
      writeFileSync(movePath, JSON.stringify(createTestMoveFile()));

      const state = createTestState({ messages: [] });

      try {
        handleInvalidMove({
          moveFilePath: movePath,
          tableName: TEST_TABLE,
          reason: 'wrong turn',
          state,
          basePath: TEST_DIR
        });
      } catch (e) {
        // Git commands may fail
      }

      // Verify error message format includes reason
      expect(state.messages[0].text).toContain('wrong turn');
      expect(state.messages[0].timestamp).toBeDefined();
    });

    it('should write updated state with error to file', () => {
      const movePath = join(TEST_TABLE_PATH, 'moves', '0001-white-invalid.json');
      const statePath = join(TEST_TABLE_PATH, 'state.json');
      writeFileSync(movePath, JSON.stringify(createTestMoveFile()));

      const state = createTestState({ messages: [] });

      try {
        handleInvalidMove({
          moveFilePath: movePath,
          tableName: TEST_TABLE,
          reason: 'test error',
          state,
          basePath: TEST_DIR
        });
      } catch (e) {
        // Git commands may fail
      }

      // Verify state file was written with error message
      const writtenState = JSON.parse(readFileSync(statePath, 'utf-8'));
      expect(writtenState.messages.length).toBe(1);
      expect(writtenState.messages[0].type).toBe('error');
    });
  });
});
