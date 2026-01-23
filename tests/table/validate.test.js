/**
 * Tests for Table ID Validation Utilities
 * Task Group 1: Types, Constants, and Validation Utilities
 * @module tests/table/validate
 */

import { describe, it, expect } from 'vitest';
import { validateTableId, generateTableId } from '../../src/table/index.js';

describe('Table ID Validation', () => {
  describe('validateTableId', () => {
    it('should accept valid slugs like "alice-vs-bob-2026-01-23"', () => {
      const result = validateTableId('alice-vs-bob-2026-01-23');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept slugs with numbers', () => {
      const result = validateTableId('player1-vs-player2-2026-01-23');

      expect(result.valid).toBe(true);
    });

    it('should reject uppercase characters', () => {
      const result = validateTableId('Alice-vs-Bob-2026-01-23');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('lowercase');
    });

    it('should reject special characters like underscores', () => {
      const result = validateTableId('alice_vs_bob_2026_01_23');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('lowercase letters, numbers, and hyphens');
    });

    it('should reject spaces', () => {
      const result = validateTableId('alice vs bob 2026-01-23');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('lowercase letters, numbers, and hyphens');
    });

    it('should reject empty strings', () => {
      const result = validateTableId('');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject IDs starting with a hyphen', () => {
      const result = validateTableId('-alice-vs-bob');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('start or end with a hyphen');
    });

    it('should reject IDs ending with a hyphen', () => {
      const result = validateTableId('alice-vs-bob-');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('start or end with a hyphen');
    });

    it('should reject single character IDs', () => {
      const result = validateTableId('a');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 2 characters');
    });
  });

  describe('generateTableId', () => {
    it('should produce valid slug from player names and date', () => {
      const players = { white: 'alice', black: 'bob' };
      const tableId = generateTableId(players, new Date('2026-01-23'));

      expect(tableId).toBe('alice-vs-bob-2026-01-23');
    });

    it('should handle player names with uppercase', () => {
      const players = { white: 'Alice', black: 'BOB' };
      const tableId = generateTableId(players, new Date('2026-01-23'));

      expect(tableId).toBe('alice-vs-bob-2026-01-23');
    });

    it('should use current date if not provided', () => {
      const players = { white: 'alice', black: 'bob' };
      const tableId = generateTableId(players);

      // Should contain the current date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      expect(tableId).toBe(`alice-vs-bob-${today}`);
    });

    it('should produce a valid slug that passes validation', () => {
      const players = { white: 'TestUser123', black: 'another-user' };
      const tableId = generateTableId(players);

      const validation = validateTableId(tableId);
      expect(validation.valid).toBe(true);
    });

    it('should handle player names with numbers', () => {
      const players = { white: 'player1', black: 'player2' };
      const tableId = generateTableId(players, new Date('2026-01-23'));

      expect(tableId).toBe('player1-vs-player2-2026-01-23');
    });

    it('should handle GitHub usernames with hyphens', () => {
      const players = { white: 'alice-smith', black: 'bob-jones' };
      const tableId = generateTableId(players, new Date('2026-01-23'));

      // Should normalize double hyphens
      const validation = validateTableId(tableId);
      expect(validation.valid).toBe(true);
    });
  });
});
