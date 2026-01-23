/**
 * Tests for Table Creation and State Generation
 * Task Group 3: Table Creation and State Generation
 * @module tests/table/create
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validatePlayers, createTable } from '../../src/table/index.js';
import { JSON_INDENT } from '../../src/table/constants.js';

describe('Player Validation', () => {
  describe('validatePlayers', () => {
    it('should reject missing white player', () => {
      const result = validatePlayers({ black: 'bob' });

      expect(result.valid).toBe(false);
      expect(result.error.toLowerCase()).toContain('white');
    });

    it('should reject missing black player', () => {
      const result = validatePlayers({ white: 'alice' });

      expect(result.valid).toBe(false);
      expect(result.error.toLowerCase()).toContain('black');
    });

    it('should reject empty string usernames for white', () => {
      const result = validatePlayers({ white: '', black: 'bob' });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject empty string usernames for black', () => {
      const result = validatePlayers({ white: 'alice', black: '' });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject null players object', () => {
      const result = validatePlayers(null);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject undefined players object', () => {
      const result = validatePlayers(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should accept valid players', () => {
      const result = validatePlayers({ white: 'alice', black: 'bob' });

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should preserve username case sensitivity', () => {
      const result = validatePlayers({ white: 'Alice', black: 'BOB' });

      expect(result.valid).toBe(true);
    });
  });
});

describe('Table Creation', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'gitgammon-create-'));
  });

  afterEach(() => {
    if (tempDir && existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('createTable', () => {
    it('should generate valid state.json', () => {
      const options = {
        white: 'alice',
        black: 'bob',
        basePath: tempDir
      };

      const result = createTable(options);

      expect(result.success).toBe(true);
      expect(existsSync(result.statePath)).toBe(true);

      const stateContent = readFileSync(result.statePath, 'utf-8');
      const state = JSON.parse(stateContent);

      expect(state).toHaveProperty('turn', 1);
      expect(state).toHaveProperty('activePlayer');
      expect(state).toHaveProperty('dice');
      expect(state).toHaveProperty('board');
      expect(state).toHaveProperty('players');
      expect(state.players.white).toBe('alice');
      expect(state.players.black).toBe('bob');
    });

    it('should use rollForStart for dice', () => {
      const options = {
        white: 'alice',
        black: 'bob',
        basePath: tempDir
      };

      const result = createTable(options);
      const stateContent = readFileSync(result.statePath, 'utf-8');
      const state = JSON.parse(stateContent);

      // Dice should have 2 values, 1-6 each, and be different (not a tie)
      expect(state.dice.length).toBe(2);
      expect(state.dice[0]).toBeGreaterThanOrEqual(1);
      expect(state.dice[0]).toBeLessThanOrEqual(6);
      expect(state.dice[1]).toBeGreaterThanOrEqual(1);
      expect(state.dice[1]).toBeLessThanOrEqual(6);
      // After rollForStart, dice[0] > dice[1] (higher die first)
      expect(state.dice[0]).toBeGreaterThan(state.dice[1]);
    });

    it('should write formatted JSON (2-space indent)', () => {
      const options = {
        white: 'alice',
        black: 'bob',
        basePath: tempDir
      };

      const result = createTable(options);
      const stateContent = readFileSync(result.statePath, 'utf-8');

      // Check for 2-space indentation (line should start with two spaces for nested properties)
      expect(stateContent).toContain('\n  ');

      // Re-parse and re-stringify with expected formatting should match
      const state = JSON.parse(stateContent);
      const expectedContent = JSON.stringify(state, null, JSON_INDENT);
      expect(stateContent).toBe(expectedContent);
    });

    it('should return success result with paths', () => {
      const options = {
        white: 'alice',
        black: 'bob',
        basePath: tempDir
      };

      const result = createTable(options);

      expect(result.success).toBe(true);
      expect(result.tableId).toBeDefined();
      expect(result.tablePath).toBeDefined();
      expect(result.statePath).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should use custom tableId when provided', () => {
      const options = {
        white: 'alice',
        black: 'bob',
        tableId: 'custom-game-2026',
        basePath: tempDir
      };

      const result = createTable(options);

      expect(result.success).toBe(true);
      expect(result.tableId).toBe('custom-game-2026');
      expect(result.tablePath).toContain('custom-game-2026');
    });

    it('should auto-generate tableId when not provided', () => {
      const options = {
        white: 'alice',
        black: 'bob',
        basePath: tempDir
      };

      const result = createTable(options);

      expect(result.success).toBe(true);
      expect(result.tableId).toContain('alice');
      expect(result.tableId).toContain('bob');
      expect(result.tableId).toContain('-vs-');
    });

    it('should clean up on failure (invalid players)', () => {
      const options = {
        white: '',
        black: 'bob',
        basePath: tempDir
      };

      const result = createTable(options);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // No directory should be created
      const tablesDir = join(tempDir, 'tables');
      expect(existsSync(tablesDir)).toBe(false);
    });

    it('should fail for existing table', () => {
      const options = {
        white: 'alice',
        black: 'bob',
        tableId: 'existing-game',
        basePath: tempDir
      };

      // Create the table first time
      const first = createTable(options);
      expect(first.success).toBe(true);

      // Try to create again - should fail
      const second = createTable(options);
      expect(second.success).toBe(false);
      expect(second.error).toContain('already exists');
    });

    it('should create moves directory', () => {
      const options = {
        white: 'alice',
        black: 'bob',
        basePath: tempDir
      };

      const result = createTable(options);
      const movesDir = join(result.tablePath, 'moves');

      expect(existsSync(movesDir)).toBe(true);
    });
  });
});
