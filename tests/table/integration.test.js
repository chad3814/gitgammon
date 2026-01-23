/**
 * Tests for Table Module Integration
 * Task Group 4: Module Integration and Entry Point
 * @module tests/table/integration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Import all public API from module entry point
import {
  // Types are imported for JSDoc
  // Constants
  TABLES_DIRECTORY,
  MOVES_DIRECTORY,
  STATE_FILENAME,
  TABLE_ID_PATTERN,
  MIN_TABLE_ID_LENGTH,
  JSON_INDENT,
  // Validation
  validateTableId,
  // Generation
  generateTableId,
  // Player validation
  validatePlayers,
  // File system
  tableExists,
  createTableDirectory,
  cleanupTableDirectory,
  getTablePath,
  getStatePath,
  getMovesPath,
  // Main creation
  createTable
} from '../../src/table/index.js';

// Import schema validation from state module
import { validateSchema, getGameStateSchema } from '../../src/state/index.js';

describe('Table Module Integration', () => {
  describe('Public API Exports', () => {
    it('should export all public functions from src/table/index.js', () => {
      // Constants
      expect(TABLES_DIRECTORY).toBe('tables');
      expect(MOVES_DIRECTORY).toBe('moves');
      expect(STATE_FILENAME).toBe('state.json');
      expect(TABLE_ID_PATTERN).toBeInstanceOf(RegExp);
      expect(MIN_TABLE_ID_LENGTH).toBe(2);
      expect(JSON_INDENT).toBe(2);

      // Functions
      expect(typeof validateTableId).toBe('function');
      expect(typeof generateTableId).toBe('function');
      expect(typeof validatePlayers).toBe('function');
      expect(typeof tableExists).toBe('function');
      expect(typeof createTableDirectory).toBe('function');
      expect(typeof cleanupTableDirectory).toBe('function');
      expect(typeof getTablePath).toBe('function');
      expect(typeof getStatePath).toBe('function');
      expect(typeof getMovesPath).toBe('function');
      expect(typeof createTable).toBe('function');
    });
  });

  describe('End-to-End Table Creation', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'gitgammon-integration-'));
    });

    afterEach(() => {
      if (tempDir && existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should create complete table with valid inputs', () => {
      const options = {
        white: 'player-one',
        black: 'player-two',
        basePath: tempDir
      };

      const result = createTable(options);

      // Verify success
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // Verify directory structure
      expect(existsSync(result.tablePath)).toBe(true);
      expect(existsSync(result.statePath)).toBe(true);
      expect(existsSync(join(result.tablePath, 'moves'))).toBe(true);

      // Verify state content
      const stateContent = readFileSync(result.statePath, 'utf-8');
      const state = JSON.parse(stateContent);

      expect(state.turn).toBe(1);
      expect(state.status).toBe('playing');
      expect(state.players.white).toBe('player-one');
      expect(state.players.black).toBe('player-two');
      expect(state.board.length).toBe(24);
      expect(state.dice.length).toBe(2);
      expect(['white', 'black']).toContain(state.activePlayer);
    });

    it('should generate state that passes schema validation', async () => {
      const options = {
        white: 'alice',
        black: 'bob',
        basePath: tempDir
      };

      const result = createTable(options);
      const stateContent = readFileSync(result.statePath, 'utf-8');
      const state = JSON.parse(stateContent);

      // Validate against the game state schema
      const schema = await getGameStateSchema();
      const validation = validateSchema(state, schema);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should produce consistent results with paths relative to basePath', () => {
      const options = {
        white: 'alice',
        black: 'bob',
        tableId: 'test-table-123',
        basePath: tempDir
      };

      const result = createTable(options);

      // Paths should be correct relative to basePath
      expect(result.tablePath).toBe(join(tempDir, 'tables', 'test-table-123'));
      expect(result.statePath).toBe(join(tempDir, 'tables', 'test-table-123', 'state.json'));

      // Path utilities should return same paths
      expect(getTablePath('test-table-123', tempDir)).toBe(result.tablePath);
      expect(getStatePath('test-table-123', tempDir)).toBe(result.statePath);
      expect(getMovesPath('test-table-123', tempDir)).toBe(join(result.tablePath, 'moves'));
    });

    it('should have no circular dependencies', async () => {
      // If there were circular dependencies, the import at the top would fail
      // This test validates the module loaded successfully
      const tableModule = await import('../../src/table/index.js');

      expect(tableModule.createTable).toBeDefined();
      expect(tableModule.validateTableId).toBeDefined();
      expect(tableModule.generateTableId).toBeDefined();
    });
  });

  describe('Integration with Existing Modules', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'gitgammon-int-'));
    });

    afterEach(() => {
      if (tempDir && existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should use rollForStart correctly (dice values not equal)', () => {
      const options = {
        white: 'alice',
        black: 'bob',
        basePath: tempDir
      };

      // Run multiple times to verify rollForStart behavior
      for (let i = 0; i < 5; i++) {
        const tableId = `game-${i}`;
        const result = createTable({ ...options, tableId });

        const stateContent = readFileSync(result.statePath, 'utf-8');
        const state = JSON.parse(stateContent);

        // Dice values should never be equal (rollForStart re-rolls ties)
        expect(state.dice[0]).not.toBe(state.dice[1]);

        // Higher die should be first
        expect(state.dice[0]).toBeGreaterThan(state.dice[1]);
      }
    });

    it('should use createInitialState correctly (standard board position)', () => {
      const options = {
        white: 'alice',
        black: 'bob',
        basePath: tempDir
      };

      const result = createTable(options);
      const stateContent = readFileSync(result.statePath, 'utf-8');
      const state = JSON.parse(stateContent);

      // Verify standard backgammon starting position
      // Point 1 (index 0): 2 white pieces
      expect(state.board[0]).toBe(2);
      // Point 6 (index 5): 5 black pieces
      expect(state.board[5]).toBe(-5);
      // Point 24 (index 23): 2 black pieces
      expect(state.board[23]).toBe(-2);

      // Verify initial state fields
      expect(state.bar).toEqual({ white: 0, black: 0 });
      expect(state.home).toEqual({ white: 0, black: 0 });
      expect(state.diceUsed).toEqual([]);
      expect(state.lastMove).toBeNull();
      expect(state.winner).toBeNull();
    });
  });
});
