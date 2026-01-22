import { describe, it, expect } from 'vitest';
import * as StateModule from '../../src/state/index.js';

/**
 * Task Group 6: Module Integration Tests
 * Tests for main module exports
 */

describe('State Module Exports', () => {
  describe('Schema exports', () => {
    it('should export schema-related functions', () => {
      expect(StateModule.gameStateSchema).toBeDefined();
      expect(typeof StateModule.getGameStateSchema).toBe('function');
    });
  });

  describe('Constants exports', () => {
    it('should export all constants', () => {
      expect(StateModule.PLAYER_COLORS).toBeDefined();
      expect(StateModule.GAME_STATUSES).toBeDefined();
      expect(StateModule.MESSAGE_TYPES).toBeDefined();
      expect(StateModule.PIECES_PER_PLAYER).toBe(15);
      expect(StateModule.BOARD_POINTS).toBe(24);
    });

    it('should export type guard functions', () => {
      expect(typeof StateModule.isValidPlayer).toBe('function');
      expect(typeof StateModule.isValidStatus).toBe('function');
      expect(typeof StateModule.isValidMessageType).toBe('function');
      expect(typeof StateModule.isValidDieValue).toBe('function');
    });
  });

  describe('Initial state exports', () => {
    it('should export initial state functions', () => {
      expect(StateModule.INITIAL_BOARD).toBeDefined();
      expect(typeof StateModule.createInitialState).toBe('function');
      expect(typeof StateModule.countBoardPieces).toBe('function');
      expect(typeof StateModule.countTotalPieces).toBe('function');
    });
  });

  describe('Validation exports', () => {
    it('should export all validation functions', () => {
      expect(typeof StateModule.validateSchema).toBe('function');
      expect(typeof StateModule.validatePieceCount).toBe('function');
      expect(typeof StateModule.validateDiceConsistency).toBe('function');
      expect(typeof StateModule.validateStatusWinner).toBe('function');
      expect(typeof StateModule.validateBoard).toBe('function');
      expect(typeof StateModule.validateState).toBe('function');
    });
  });

  describe('Example state exports', () => {
    it('should export example state loaders', () => {
      expect(typeof StateModule.getInitialStateExample).toBe('function');
      expect(typeof StateModule.getMidGameStateExample).toBe('function');
      expect(typeof StateModule.getCompletedGameStateExample).toBe('function');
      expect(typeof StateModule.getAllExamples).toBe('function');
    });
  });

  describe('Integration', () => {
    it('should work together: create state, validate, and compare with examples', () => {
      // Create initial state
      const state = StateModule.createInitialState(
        { white: 'alice', black: 'bob' },
        [3, 5]
      );

      // Validate it
      const result = StateModule.validateState(state);
      expect(result.valid).toBe(true);

      // Verify piece counts
      const whitePieces = StateModule.countTotalPieces(state, 'white');
      const blackPieces = StateModule.countTotalPieces(state, 'black');
      expect(whitePieces).toBe(StateModule.PIECES_PER_PLAYER);
      expect(blackPieces).toBe(StateModule.PIECES_PER_PLAYER);
    });
  });
});
