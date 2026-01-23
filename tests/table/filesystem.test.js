/**
 * Tests for Table File System Operations
 * Task Group 2: Directory Operations and Collision Detection
 * @module tests/table/filesystem
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  tableExists,
  createTableDirectory,
  cleanupTableDirectory,
  getTablePath,
  getStatePath,
  getMovesPath
} from '../../src/table/index.js';

describe('Table File System Operations', () => {
  let tempDir;

  beforeEach(() => {
    // Create a unique temp directory for each test
    tempDir = mkdtempSync(join(tmpdir(), 'gitgammon-test-'));
  });

  afterEach(() => {
    // Clean up temp directory after each test
    if (tempDir && existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('tableExists', () => {
    it('should return false for non-existent table', () => {
      const result = tableExists('non-existent-table', tempDir);

      expect(result).toBe(false);
    });

    it('should return true for existing table directory', () => {
      // Create a table directory manually
      const tablesDir = join(tempDir, 'tables');
      const tableDir = join(tablesDir, 'existing-table');
      mkdirSync(tableDir, { recursive: true });

      const result = tableExists('existing-table', tempDir);

      expect(result).toBe(true);
    });
  });

  describe('createTableDirectory', () => {
    it('should create tables/{id}/ structure', () => {
      const tableId = 'alice-vs-bob-2026-01-23';

      createTableDirectory(tableId, tempDir);

      const tableDir = join(tempDir, 'tables', tableId);
      expect(existsSync(tableDir)).toBe(true);
    });

    it('should create moves/ subdirectory', () => {
      const tableId = 'alice-vs-bob-2026-01-23';

      createTableDirectory(tableId, tempDir);

      const movesDir = join(tempDir, 'tables', tableId, 'moves');
      expect(existsSync(movesDir)).toBe(true);
    });

    it('should throw on existing directory', () => {
      const tableId = 'existing-game';

      // Create the table directory first
      const tableDir = join(tempDir, 'tables', tableId);
      mkdirSync(tableDir, { recursive: true });

      // Attempting to create again should throw
      expect(() => createTableDirectory(tableId, tempDir)).toThrow(
        'Table already exists'
      );
    });

    it('should create tables directory if it does not exist', () => {
      const tableId = 'first-table';
      const tablesDir = join(tempDir, 'tables');

      // Ensure tables directory does not exist
      expect(existsSync(tablesDir)).toBe(false);

      createTableDirectory(tableId, tempDir);

      expect(existsSync(tablesDir)).toBe(true);
      expect(existsSync(join(tablesDir, tableId))).toBe(true);
    });
  });

  describe('cleanupTableDirectory', () => {
    it('should remove partially created directories on failure', () => {
      const tableId = 'partial-table';

      // Create a partial table directory
      const tableDir = join(tempDir, 'tables', tableId);
      mkdirSync(tableDir, { recursive: true });

      cleanupTableDirectory(tableId, tempDir);

      expect(existsSync(tableDir)).toBe(false);
    });

    it('should handle case where directory does not exist gracefully', () => {
      const tableId = 'non-existent-table';

      // Should not throw
      expect(() => cleanupTableDirectory(tableId, tempDir)).not.toThrow();
    });

    it('should remove nested moves directory', () => {
      const tableId = 'table-with-moves';

      // Create full table structure
      const tableDir = join(tempDir, 'tables', tableId);
      const movesDir = join(tableDir, 'moves');
      mkdirSync(movesDir, { recursive: true });

      cleanupTableDirectory(tableId, tempDir);

      expect(existsSync(tableDir)).toBe(false);
      expect(existsSync(movesDir)).toBe(false);
    });
  });

  describe('Path utilities', () => {
    it('getTablePath should return correct path', () => {
      const tableId = 'test-table';
      const path = getTablePath(tableId, tempDir);

      expect(path).toBe(join(tempDir, 'tables', tableId));
    });

    it('getStatePath should return correct path', () => {
      const tableId = 'test-table';
      const path = getStatePath(tableId, tempDir);

      expect(path).toBe(join(tempDir, 'tables', tableId, 'state.json'));
    });

    it('getMovesPath should return correct path', () => {
      const tableId = 'test-table';
      const path = getMovesPath(tableId, tempDir);

      expect(path).toBe(join(tempDir, 'tables', tableId, 'moves'));
    });
  });
});
