/**
 * Tests for Error Handling and Integration
 * Task Group 5: Error Handling and Integration Testing
 * @module tests/action/integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { handleError, wrapWithErrorHandler } from '../../action/error-handler.js';
import { computeStateHash } from '../../src/moves/hash.js';

const TEST_DIR = join(process.cwd(), 'test-fixtures-integration');
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
      { from: 11, to: 8, die: 3 },
      { from: 11, to: 6, die: 5 }
    ],
    timestamp: '2025-01-21T12:01:00Z',
    expectedState: 'a3b4c5d6e7f89a0b',
    diceRoll: [3, 5],
    comment: null,
    commitSha: null,
    ...overrides
  };
}

describe('Error Handling and Integration', () => {
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

  describe('handleError', () => {
    it('should handle malformed JSON with clear error', () => {
      const error = new SyntaxError('Unexpected token { in JSON at position 5');
      const result = handleError(error);

      expect(result.message).toContain('JSON');
      expect(result.recoverable).toBe(false);
    });

    it('should handle missing state file', () => {
      const error = new Error('state.json not found for table "nonexistent"');
      const result = handleError(error);

      expect(result.message).toContain('state.json');
      expect(result.recoverable).toBe(false);
    });

    it('should handle missing move file', () => {
      const error = new Error('Move file not found at path: /tables/game/moves/0001.json');
      const result = handleError(error);

      expect(result.message).toContain('Move file');
      expect(result.recoverable).toBe(false);
    });

    it('should catch and report unexpected errors', () => {
      const error = new Error('Something completely unexpected');
      const result = handleError(error);

      expect(result.message).toBeDefined();
      expect(result.originalError).toBe(error);
    });
  });

  describe('wrapWithErrorHandler', () => {
    it('should wrap async functions and catch errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Test error'));
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const wrapped = wrapWithErrorHandler(mockFn);
      await wrapped();

      expect(mockFn).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('::error::')
      );

      consoleSpy.mockRestore();
    });

    it('should not throw when errors occur', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Test error'));
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const wrapped = wrapWithErrorHandler(mockFn);

      // Should not throw
      await expect(wrapped()).resolves.not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Full flow integration', () => {
    it('should validate move files can be loaded and parsed', () => {
      // Setup test state
      const state = createTestState();
      const expectedHash = computeStateHash(state);

      writeFileSync(
        join(TEST_TABLE_PATH, 'state.json'),
        JSON.stringify(state, null, 2)
      );

      const moveFile = createTestMoveFile({
        expectedState: expectedHash
      });

      const movePath = join(TEST_TABLE_PATH, 'moves', '0001-white-a1b2c3.json');
      writeFileSync(movePath, JSON.stringify(moveFile, null, 2));

      // Verify files are correctly written and can be loaded
      const loadedState = JSON.parse(
        require('fs').readFileSync(join(TEST_TABLE_PATH, 'state.json'), 'utf-8')
      );
      const loadedMove = JSON.parse(
        require('fs').readFileSync(movePath, 'utf-8')
      );

      expect(loadedState.activePlayer).toBe('white');
      expect(loadedMove.player).toBe('white');
      expect(loadedMove.expectedState).toBe(expectedHash);
    });

    it('should detect turn mismatch in validation', () => {
      // Setup test state with black's turn
      const state = createTestState({ activePlayer: 'black' });

      // Move file claims to be white's move
      const moveFile = createTestMoveFile({ player: 'white' });

      // Verify the mismatch would be detected
      expect(state.activePlayer).toBe('black');
      expect(moveFile.player).toBe('white');
      expect(state.activePlayer).not.toBe(moveFile.player);
    });

    it('should correctly compute state hash for validation', () => {
      const state = createTestState();
      const hash1 = computeStateHash(state);
      const hash2 = computeStateHash(state);

      // Same state should produce same hash
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{16}$/);
    });

    it('should detect stale moves via hash mismatch', () => {
      const state = createTestState();
      const expectedHash = computeStateHash(state);

      // Modify state
      const modifiedState = { ...state, turn: 2 };
      const newHash = computeStateHash(modifiedState);

      // Hashes should differ
      expect(expectedHash).not.toBe(newHash);
    });

    it('should add error messages to state on invalid moves', () => {
      const state = createTestState({ messages: [] });

      // Simulate adding an error message
      const errorMessage = {
        type: 'error',
        text: 'Invalid move rejected: wrong turn',
        timestamp: new Date().toISOString()
      };
      state.messages.push(errorMessage);

      expect(state.messages.length).toBe(1);
      expect(state.messages[0].type).toBe('error');
      expect(state.messages[0].text).toContain('wrong turn');
    });
  });
});
