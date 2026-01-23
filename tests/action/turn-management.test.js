/**
 * Tests for Turn Management Integration
 * Task Group 3: Turn Management Integration Tests
 * @module tests/action/turn-management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyDice } from '../../action/verify-dice.js';
import { verifyTurn } from '../../action/verify-turn.js';
import { runValidationPipeline } from '../../action/validation-pipeline.js';
import { applyMoves } from '../../action/apply-move.js';
import { finalizeState } from '../../action/finalize-state.js';
import { rollDiceForNextTurn, mergeDiceResult } from '../../action/roll-dice.js';
import { checkForLegalMoves, rollForNextTurn } from '../../src/dice/turn-roll.js';
import { computeStateHash } from '../../src/moves/hash.js';

/**
 * Create a test game state
 * Standard opening position:
 * - Point 0:  2 white
 * - Point 5:  5 black (-5)
 * - Point 7:  3 black (-3)
 * - Point 11: 5 white
 * - Point 12: 5 black (-5)
 * - Point 16: 3 white
 * - Point 18: 5 white
 * - Point 23: 2 black (-2)
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
 * Create a test move file with valid moves from point 11 (which has 5 white pieces)
 * @param {object} overrides
 * @returns {object}
 */
function createTestMoveFile(overrides = {}) {
  return {
    player: 'white',
    moves: [
      { from: 11, to: 8, die: 3 },  // Move from point 11 (5 white) to point 8
      { from: 11, to: 6, die: 5 }   // Move from point 11 to point 6
    ],
    timestamp: '2025-01-21T12:01:00Z',
    expectedState: 'a3b4c5d6e7f89a0b',
    diceRoll: [3, 5],
    comment: null,
    commitSha: null,
    ...overrides
  };
}

describe('Turn Management Integration', () => {
  describe('Complete turn flow', () => {
    it('should increment turn counter after valid move acceptance', async () => {
      const state = createTestState({ turn: 1 });
      const expectedHash = computeStateHash(state);
      const moveFile = createTestMoveFile({ expectedState: expectedHash });

      // Validate move
      const validation = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0001-white-a1b2c3.json'
      });

      expect(validation.valid).toBe(true);

      // Apply moves
      const newState = applyMoves(state, moveFile);

      // Finalize state (increments turn)
      const finalState = finalizeState(newState, {
        player: 'white',
        sequence: 1,
        filename: '0001-white-a1b2c3.json'
      });

      expect(finalState.turn).toBe(2);
    });

    it('should alternate activePlayer after successful move', async () => {
      const state = createTestState({ activePlayer: 'white' });
      const expectedHash = computeStateHash(state);
      const moveFile = createTestMoveFile({ expectedState: expectedHash });

      // Validate move
      const validation = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0001-white-a1b2c3.json'
      });

      expect(validation.valid).toBe(true);

      // Apply moves
      const newState = applyMoves(state, moveFile);

      // Finalize state
      const finalState = finalizeState(newState, {
        player: 'white',
        sequence: 1,
        filename: '0001-white-a1b2c3.json'
      });

      // Roll dice for next turn
      const diceResult = rollDiceForNextTurn(finalState);
      const stateWithDice = mergeDiceResult(finalState, diceResult);

      // Active player should have changed (unless auto-pass occurred)
      expect(stateWithDice.activePlayer).toBe('black');
    });
  });

  describe('Turn validation', () => {
    it('should reject moves from wrong player with clear error', () => {
      const state = createTestState({ activePlayer: 'black' });
      const moveFile = createTestMoveFile({ player: 'white' });

      const result = verifyTurn(state, moveFile);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain("black's turn");
      expect(result.errors[0]).toContain("white");
    });

    it('should accept move from correct player', () => {
      const state = createTestState({ activePlayer: 'white' });
      const moveFile = createTestMoveFile({ player: 'white' });

      const result = verifyTurn(state, moveFile);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('Dice verification', () => {
    it('should reject mismatched dice with expected/actual values in error', () => {
      const state = createTestState({ dice: [3, 5] });
      const moveFile = createTestMoveFile({ diceRoll: [4, 6] });

      const result = verifyDice(state, moveFile);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('state has [3, 5]');
      expect(result.errors[0]).toContain('move claims [4, 6]');
    });

    it('should accept matching dice regardless of order', () => {
      const state = createTestState({ dice: [5, 3] });
      const moveFile = createTestMoveFile({ diceRoll: [3, 5] });

      const result = verifyDice(state, moveFile);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('Auto-pass behavior', () => {
    it('should detect when player has no legal moves (blocked on bar)', () => {
      // Create state where black is on bar and all entry points are blocked
      const state = createTestState();
      state.bar.black = 1;
      // Block all entry points for black (points 0-5)
      for (let i = 0; i <= 5; i++) {
        state.board[i] = 2; // White blocking with 2 pieces each
      }
      const dice = [1, 2];

      // Black cannot move (on bar, all entry points blocked)
      const blackLegalMoves = checkForLegalMoves(state, dice, 'black');

      expect(blackLegalMoves).toBe(false);
    });

    it('should trigger auto-pass when next player has no legal moves', () => {
      // Create a state where black (the next player after white's turn) is blocked
      const state = createTestState();
      state.bar.black = 1;
      // Block all entry points for black (0-5)
      for (let i = 0; i <= 5; i++) {
        state.board[i] = 2; // White blocking
      }
      // Ensure white can move
      state.board[12] = 2;

      const result = rollForNextTurn(state);

      // Black should have been auto-passed
      expect(result.autoPass).toBe(true);
      expect(result.messages.length).toBeGreaterThan(0);
      // Messages are objects with {type, text, timestamp}
      expect(result.messages[0].text).toContain('black');
      expect(result.messages[0].text.toLowerCase()).toContain('cannot move');
    });
  });

  describe('Dice roll timing', () => {
    it('should only roll dice after move acceptance, not on rejection', async () => {
      const state = createTestState({ dice: [3, 5], activePlayer: 'black' });
      const expectedHash = computeStateHash(state);

      // White trying to move on black's turn (invalid)
      const invalidMoveFile = createTestMoveFile({
        expectedState: expectedHash,
        player: 'white'
      });

      // Validate move (should fail)
      const validation = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile: invalidMoveFile,
        filename: '0001-white-a1b2c3.json'
      });

      expect(validation.valid).toBe(false);

      // State dice should remain unchanged (no new dice rolled)
      expect(state.dice).toEqual([3, 5]);
    });

    it('should roll new dice after valid move acceptance', async () => {
      const state = createTestState({ dice: [3, 5], activePlayer: 'white' });
      const expectedHash = computeStateHash(state);

      const validMoveFile = createTestMoveFile({
        expectedState: expectedHash,
        player: 'white'
      });

      // Validate move (should pass)
      const validation = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile: validMoveFile,
        filename: '0001-white-a1b2c3.json'
      });

      expect(validation.valid).toBe(true);

      // Apply and finalize
      const newState = applyMoves(state, validMoveFile);
      const finalState = finalizeState(newState, {
        player: 'white',
        sequence: 1,
        filename: '0001-white-a1b2c3.json'
      });

      // Roll dice for next turn
      const diceResult = rollDiceForNextTurn(finalState);

      // New dice should be rolled (values between 1-6)
      expect(diceResult.dice).toHaveLength(2);
      expect(diceResult.dice[0]).toBeGreaterThanOrEqual(1);
      expect(diceResult.dice[0]).toBeLessThanOrEqual(6);
      expect(diceResult.dice[1]).toBeGreaterThanOrEqual(1);
      expect(diceResult.dice[1]).toBeLessThanOrEqual(6);
    });
  });

  describe('Validation pipeline order', () => {
    it('should respect step order: turn -> dice -> hash -> rules', async () => {
      // Create a state and move file that will fail multiple validations
      const state = createTestState({
        activePlayer: 'black',
        dice: [3, 5]
      });

      const moveFile = createTestMoveFile({
        player: 'white',      // Wrong player (turn check)
        diceRoll: [4, 6],     // Wrong dice (dice check)
        expectedState: 'wronghash1234567', // Wrong hash
        moves: [{ from: 1, to: 0, die: 4 }] // Invalid move (rules check)
      });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0001-white-a1b2c3.json'
      });

      expect(result.valid).toBe(false);

      // Should have multiple errors in the correct order
      // Find error indices
      const turnErrorIndex = result.errors.findIndex(e => e.includes("turn"));
      const diceErrorIndex = result.errors.findIndex(e => e.includes("Dice mismatch"));
      const hashErrorIndex = result.errors.findIndex(e => e.includes("hash") || e.includes("stale"));

      // Turn error should come before dice error
      expect(turnErrorIndex).toBeLessThan(diceErrorIndex);
      // Dice error should come before hash error
      expect(diceErrorIndex).toBeLessThan(hashErrorIndex);
    });

    it('should include dice verification in pipeline (step 2.5)', async () => {
      const state = createTestState({ dice: [3, 5] });
      const expectedHash = computeStateHash(state);

      // Valid turn, wrong dice
      const moveFile = createTestMoveFile({
        player: 'white',
        diceRoll: [2, 4],
        expectedState: expectedHash,
        moves: [
          { from: 11, to: 9, die: 2 },
          { from: 11, to: 7, die: 4 }
        ]
      });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0001-white-a1b2c3.json'
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Dice mismatch'))).toBe(true);
      expect(result.errors.some(e => e.includes('state has [3, 5]'))).toBe(true);
      expect(result.errors.some(e => e.includes('move claims [2, 4]'))).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle doubles correctly in dice verification', () => {
      const state = createTestState({ dice: [4, 4] });
      const moveFile = createTestMoveFile({ diceRoll: [4, 4] });

      const result = verifyDice(state, moveFile);

      expect(result.valid).toBe(true);
    });

    it('should reject when doubles do not match', () => {
      const state = createTestState({ dice: [4, 4] });
      const moveFile = createTestMoveFile({ diceRoll: [5, 5] });

      const result = verifyDice(state, moveFile);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Dice mismatch');
    });

    it('should handle first turn (turn 1) correctly', async () => {
      const state = createTestState({ turn: 1 });
      const expectedHash = computeStateHash(state);
      const moveFile = createTestMoveFile({ expectedState: expectedHash });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0001-white-a1b2c3.json'
      });

      expect(result.valid).toBe(true);
    });
  });
});
