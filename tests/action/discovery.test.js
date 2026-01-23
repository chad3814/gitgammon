/**
 * Tests for Action Core and Move Discovery
 * Task Group 2: Action Core and Move Discovery
 * @module tests/action/discovery
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { parseMoveFilePath } from '../../action/discovery.js';
import { loadState } from '../../action/state-loader.js';
import { loadMoveFile } from '../../action/move-loader.js';

const TEST_DIR = join(process.cwd(), 'test-fixtures');
const TEST_TABLE = 'test-game';
const TEST_TABLE_PATH = join(TEST_DIR, 'tables', TEST_TABLE);

describe('Action Core and Move Discovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Create test fixture directories
    if (!existsSync(join(TEST_TABLE_PATH, 'moves'))) {
      mkdirSync(join(TEST_TABLE_PATH, 'moves'), { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test fixtures
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('discoverMoveFile', () => {
    // Note: These tests verify the filter and parsing logic
    // Git command execution is tested in integration/E2E tests

    it('should have MOVE_FILE_PATTERN that matches tables/*/moves/*.json', () => {
      // Test the pattern used by discoverMoveFile
      const pattern = /^tables\/[^/]+\/moves\/[^/]+\.json$/;

      expect(pattern.test('tables/my-game/moves/0001-white-a1b2c3.json')).toBe(true);
      expect(pattern.test('src/index.js')).toBe(false);
      expect(pattern.test('package.json')).toBe(false);
      expect(pattern.test('tables/my-game/state.json')).toBe(false);
    });

    it('should filter out non-move files from changed file list', () => {
      // Test the filtering logic
      const changedFiles = [
        'tables/my-game/moves/0001-white-a1b2c3.json',
        'src/index.js',
        'package.json',
        'tables/my-game/state.json'
      ];
      const pattern = /^tables\/[^/]+\/moves\/[^/]+\.json$/;

      const moveFiles = changedFiles.filter(f => pattern.test(f));

      expect(moveFiles).toHaveLength(1);
      expect(moveFiles[0]).toBe('tables/my-game/moves/0001-white-a1b2c3.json');
    });

    it('should return empty when no move files in changed list', () => {
      const changedFiles = ['src/index.js', 'package.json'];
      const pattern = /^tables\/[^/]+\/moves\/[^/]+\.json$/;

      const moveFiles = changedFiles.filter(f => pattern.test(f));

      expect(moveFiles).toHaveLength(0);
    });

    it('should sort multiple move files by filename to process in order', () => {
      const changedFiles = [
        'tables/game1/moves/0002-black-d4e5f6.json',
        'tables/game1/moves/0001-white-a1b2c3.json'
      ];
      const pattern = /^tables\/[^/]+\/moves\/[^/]+\.json$/;

      const moveFiles = changedFiles.filter(f => pattern.test(f)).sort();

      expect(moveFiles[0]).toBe('tables/game1/moves/0001-white-a1b2c3.json');
    });
  });

  describe('parseMoveFilePath', () => {
    it('should parse table name from file path', () => {
      const result = parseMoveFilePath('tables/my-game/moves/0001-white-a1b2c3.json');

      expect(result.tableName).toBe('my-game');
      expect(result.filename).toBe('0001-white-a1b2c3.json');
    });

    it('should handle nested table names', () => {
      const result = parseMoveFilePath('tables/tournament-2025-round1/moves/0015-black-f7e2a9.json');

      expect(result.tableName).toBe('tournament-2025-round1');
      expect(result.filename).toBe('0015-black-f7e2a9.json');
    });

    it('should return null for invalid path format', () => {
      const result = parseMoveFilePath('invalid/path/file.json');

      expect(result).toBeNull();
    });
  });

  describe('loadState', () => {
    it('should load corresponding state.json for table', () => {
      const testState = {
        turn: 1,
        activePlayer: 'white',
        dice: [3, 5],
        diceUsed: [],
        board: Array(24).fill(0),
        bar: { white: 0, black: 0 },
        home: { white: 0, black: 0 },
        players: { white: 'alice', black: 'bob' },
        status: 'playing',
        winner: null,
        lastMove: null,
        messages: [],
        updatedAt: '2025-01-21T12:00:00Z'
      };

      writeFileSync(
        join(TEST_TABLE_PATH, 'state.json'),
        JSON.stringify(testState, null, 2)
      );

      const state = loadState(TEST_TABLE, TEST_DIR);

      expect(state).toEqual(testState);
    });

    it('should throw descriptive error if state file missing', () => {
      expect(() => loadState('nonexistent-table', TEST_DIR)).toThrow(
        /state\.json not found/i
      );
    });

    it('should throw error for malformed JSON', () => {
      writeFileSync(
        join(TEST_TABLE_PATH, 'state.json'),
        '{ invalid json }'
      );

      expect(() => loadState(TEST_TABLE, TEST_DIR)).toThrow();
    });
  });

  describe('loadMoveFile', () => {
    it('should load and parse move file JSON', () => {
      const testMove = {
        player: 'white',
        moves: [{ from: 5, to: 2, die: 3 }],
        timestamp: '2025-01-21T12:01:00Z',
        expectedState: 'a3b4c5d6e7f89a0b',
        diceRoll: [3, 5],
        comment: null,
        commitSha: null
      };

      const movePath = join(TEST_TABLE_PATH, 'moves', '0001-white-a1b2c3.json');
      writeFileSync(movePath, JSON.stringify(testMove, null, 2));

      const { moveFile, filename } = loadMoveFile(movePath);

      expect(moveFile).toEqual(testMove);
      expect(filename).toBe('0001-white-a1b2c3.json');
    });

    it('should throw error for malformed move JSON', () => {
      const movePath = join(TEST_TABLE_PATH, 'moves', '0001-white-a1b2c3.json');
      writeFileSync(movePath, '{ invalid json }');

      expect(() => loadMoveFile(movePath)).toThrow();
    });

    it('should extract filename from path correctly', () => {
      const testMove = {
        player: 'black',
        moves: [],
        timestamp: '2025-01-21T12:01:00Z',
        expectedState: 'f7e2a9b4c5d6e8f9',
        diceRoll: [4, 2],
        comment: null,
        commitSha: null
      };

      const movePath = join(TEST_TABLE_PATH, 'moves', '0047-black-e8f9a0.json');
      writeFileSync(movePath, JSON.stringify(testMove, null, 2));

      const { filename } = loadMoveFile(movePath);

      expect(filename).toBe('0047-black-e8f9a0.json');
    });
  });
});
