/**
 * Tests for Error Handling and Integration
 * Task Group 5: Error Handling and Integration Testing
 * @module tests/action/integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';

// Mock child_process for git commands
vi.mock('child_process', async () => {
  const actual = await vi.importActual('child_process');
  return {
    ...actual,
    execSync: vi.fn()
  };
});

import { execSync } from 'child_process';
import { handleError, wrapWithErrorHandler } from '../../action/error-handler.js';
import { run } from '../../action/index.js';
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
    it('should process valid move end-to-end', async () => {
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

      writeFileSync(
        join(TEST_TABLE_PATH, 'moves', '0001-white-a1b2c3.json'),
        JSON.stringify(moveFile, null, 2)
      );

      // Mock git commands
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('git diff --name-only')) {
          return 'tables/test-game/moves/0001-white-a1b2c3.json\n';
        }
        return '';
      });

      // Mock environment
      process.env.GITHUB_ACTOR = 'alice';

      // Run the action - suppress console output
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await run({ basePath: TEST_DIR });

      // Verify git commit was called
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('git commit'),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
      delete process.env.GITHUB_ACTOR;
    });

    it('should reject invalid move end-to-end', async () => {
      // Setup test state
      const state = createTestState({ activePlayer: 'black' }); // Wrong turn

      writeFileSync(
        join(TEST_TABLE_PATH, 'state.json'),
        JSON.stringify(state, null, 2)
      );

      const moveFile = createTestMoveFile(); // Claims to be white's move

      writeFileSync(
        join(TEST_TABLE_PATH, 'moves', '0001-white-a1b2c3.json'),
        JSON.stringify(moveFile, null, 2)
      );

      // Mock git commands
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('git diff --name-only')) {
          return 'tables/test-game/moves/0001-white-a1b2c3.json\n';
        }
        return '';
      });

      // Mock environment
      process.env.GITHUB_ACTOR = 'alice';

      // Run the action - suppress console output
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await run({ basePath: TEST_DIR });

      // Verify git rm was called (for invalid move deletion)
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('git rm'),
        expect.any(Object)
      );

      // Verify commit message contains rejection
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('[GitGammon] Reject invalid move'),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
      delete process.env.GITHUB_ACTOR;
    });
  });
});
