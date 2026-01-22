/**
 * Tests for Player Verification and Move Validation
 * Task Group 3: Player Verification and Move Validation
 * @module tests/action/validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyPlayer } from '../../action/verify-player.js';
import { verifyTurn } from '../../action/verify-turn.js';
import { verifyStateHash } from '../../action/verify-hash.js';
import { validateMoveFileSchema } from '../../action/validate-move-file.js';
import { validateGameRules } from '../../action/validate-rules.js';
import { runValidationPipeline } from '../../action/validation-pipeline.js';
import { computeStateHash } from '../../src/moves/hash.js';

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

describe('Player Verification and Move Validation', () => {
  describe('verifyPlayer', () => {
    it('should pass when commit author matches player in move file', () => {
      const state = createTestState();
      const moveFile = createTestMoveFile({ player: 'white' });

      const result = verifyPlayer('alice', state, moveFile);

      expect(result.valid).toBe(true);
      expect(result.playerColor).toBe('white');
    });

    it('should fail when author does not match any player', () => {
      const state = createTestState();
      const moveFile = createTestMoveFile({ player: 'white' });

      const result = verifyPlayer('stranger', state, moveFile);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('not a registered player'))).toBe(true);
    });

    it('should fail when author plays as wrong color', () => {
      const state = createTestState();
      const moveFile = createTestMoveFile({ player: 'white' });

      // Bob (black) trying to submit as white
      const result = verifyPlayer('bob', state, moveFile);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('cannot play as'))).toBe(true);
    });
  });

  describe('verifyTurn', () => {
    it('should pass when active player matches move file player', () => {
      const state = createTestState({ activePlayer: 'white' });
      const moveFile = createTestMoveFile({ player: 'white' });

      const result = verifyTurn(state, moveFile);

      expect(result.valid).toBe(true);
    });

    it('should fail when move is from wrong player\'s turn', () => {
      const state = createTestState({ activePlayer: 'black' });
      const moveFile = createTestMoveFile({ player: 'white' });

      const result = verifyTurn(state, moveFile);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("black's turn");
    });
  });

  describe('verifyStateHash', () => {
    it('should pass when state hash matches', () => {
      const state = createTestState();
      const expectedHash = computeStateHash(state);

      const moveFile = createTestMoveFile({ expectedState: expectedHash });

      const result = verifyStateHash(state, moveFile);

      expect(result.valid).toBe(true);
    });

    it('should fail when state hash does not match (stale move)', () => {
      const state = createTestState();
      const moveFile = createTestMoveFile({ expectedState: 'wronghash1234567' });

      const result = verifyStateHash(state, moveFile);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('stale') || e.includes('hash'))).toBe(true);
    });
  });

  describe('validateMoveFileSchema', () => {
    it('should pass for valid move file schema', () => {
      const moveFile = createTestMoveFile();

      const result = validateMoveFileSchema(moveFile, '0001-white-a1b2c3.json');

      expect(result.valid).toBe(true);
    });

    it('should fail for invalid dice usage', () => {
      const moveFile = createTestMoveFile({
        moves: [{ from: 5, to: 2, die: 6 }], // 6 not in diceRoll [3, 5]
        diceRoll: [3, 5]
      });

      const result = validateMoveFileSchema(moveFile, '0001-white-a1b2c3.json');

      expect(result.valid).toBe(false);
    });

    it('should fail for wrong player in filename', () => {
      const moveFile = createTestMoveFile({ player: 'white' });

      const result = validateMoveFileSchema(moveFile, '0001-black-a1b2c3.json');

      expect(result.valid).toBe(false);
    });
  });

  describe('validateGameRules', () => {
    it('should pass for valid moves according to game rules', () => {
      const state = createTestState({
        dice: [3, 5],
        diceUsed: []
      });
      const moveFile = createTestMoveFile();

      const result = validateGameRules(state, moveFile);

      expect(result.valid).toBe(true);
    });

    it('should fail for moves that violate game rules', () => {
      const state = createTestState({
        dice: [3, 5],
        diceUsed: []
      });
      // Try to move from a point with no pieces
      const moveFile = createTestMoveFile({
        moves: [{ from: 1, to: 0, die: 3 }] // No white pieces on point 1
      });

      const result = validateGameRules(state, moveFile);

      expect(result.valid).toBe(false);
    });
  });

  describe('runValidationPipeline', () => {
    it('should aggregate all validation errors', async () => {
      const state = createTestState({ activePlayer: 'black' });
      const moveFile = createTestMoveFile({
        player: 'white',
        expectedState: 'wronghash1234567'
      });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0001-white-a1b2c3.json'
      });

      expect(result.valid).toBe(false);
      // Should have multiple errors
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
    });

    it('should pass when all validations succeed', async () => {
      const state = createTestState();
      const expectedHash = computeStateHash(state);

      const moveFile = createTestMoveFile({ expectedState: expectedHash });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0001-white-a1b2c3.json'
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
});
