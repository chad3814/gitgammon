import { describe, it, expect } from 'vitest';
import {
  INITIAL_BOARD,
  createInitialState,
  countBoardPieces,
  countTotalPieces
} from '../../src/state/initial.js';
import { BOARD_POINTS, PIECES_PER_PLAYER } from '../../src/state/constants.js';

/**
 * Task Group 3: Initial State Tests
 * Tests for INITIAL_BOARD and createInitialState
 */

describe('Initial Board State', () => {
  describe('INITIAL_BOARD', () => {
    it('should have exactly 24 elements', () => {
      expect(INITIAL_BOARD).toHaveLength(BOARD_POINTS);
    });

    it('should have 15 white pieces on the board', () => {
      const whitePieces = countBoardPieces(INITIAL_BOARD, 'white');
      expect(whitePieces).toBe(PIECES_PER_PLAYER);
    });

    it('should have 15 black pieces on the board', () => {
      const blackPieces = countBoardPieces(INITIAL_BOARD, 'black');
      expect(blackPieces).toBe(PIECES_PER_PLAYER);
    });

    it('should be immutable', () => {
      expect(Object.isFrozen(INITIAL_BOARD)).toBe(true);
    });
  });

  describe('createInitialState', () => {
    const players = { white: 'alice', black: 'bob' };
    const dice = [3, 5];

    it('should return a valid GameState structure', () => {
      const state = createInitialState(players, dice);

      expect(state).toHaveProperty('turn', 1);
      expect(state).toHaveProperty('activePlayer');
      expect(state).toHaveProperty('dice');
      expect(state).toHaveProperty('diceUsed');
      expect(state).toHaveProperty('board');
      expect(state).toHaveProperty('bar');
      expect(state).toHaveProperty('home');
      expect(state).toHaveProperty('lastMove', null);
      expect(state).toHaveProperty('status', 'playing');
      expect(state).toHaveProperty('winner', null);
      expect(state).toHaveProperty('players');
      expect(state).toHaveProperty('messages');
      expect(state).toHaveProperty('updatedAt');
    });

    it('should set activePlayer based on higher dice roll', () => {
      const stateWhiteFirst = createInitialState(players, [5, 3]);
      expect(stateWhiteFirst.activePlayer).toBe('white');

      const stateBlackFirst = createInitialState(players, [2, 6]);
      expect(stateBlackFirst.activePlayer).toBe('black');
    });

    it('should create a copy of INITIAL_BOARD (not reference)', () => {
      const state = createInitialState(players, dice);
      expect(state.board).toEqual([...INITIAL_BOARD]);
      expect(state.board).not.toBe(INITIAL_BOARD);
    });

    it('should initialize bar and home with zero pieces', () => {
      const state = createInitialState(players, dice);
      expect(state.bar).toEqual({ white: 0, black: 0 });
      expect(state.home).toEqual({ white: 0, black: 0 });
    });

    it('should include game started message', () => {
      const state = createInitialState(players, dice);
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].type).toBe('info');
      expect(state.messages[0].text).toMatch(/Game started/);
    });

    it('should throw error when players are missing', () => {
      expect(() => createInitialState(null, dice)).toThrow();
      expect(() => createInitialState({ white: 'alice' }, dice)).toThrow();
    });

    it('should throw error when dice are invalid', () => {
      expect(() => createInitialState(players, null)).toThrow();
      expect(() => createInitialState(players, [3])).toThrow();
    });
  });

  describe('countTotalPieces', () => {
    it('should count 15 total pieces per color for initial state', () => {
      const state = createInitialState({ white: 'alice', black: 'bob' }, [3, 5]);
      expect(countTotalPieces(state, 'white')).toBe(PIECES_PER_PLAYER);
      expect(countTotalPieces(state, 'black')).toBe(PIECES_PER_PLAYER);
    });
  });
});
