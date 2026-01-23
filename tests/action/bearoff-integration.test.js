/**
 * Integration Tests for Bearing Off Flow
 * Tests complete bearing off flow from move validation through win detection
 * @module tests/action/bearoff-integration
 */

import { describe, it, expect } from 'vitest';
import { runValidationPipeline } from '../../action/validation-pipeline.js';
import { applyMoves } from '../../action/apply-move.js';
import { detectWin } from '../../action/detect-win.js';
import { finalizeState } from '../../action/finalize-state.js';
import { validateGameRules } from '../../action/validate-rules.js';
import { buildMoveTree, analyzeForcedMoves } from '../../src/validation/forced-moves.js';
import { computeStateHash } from '../../src/moves/hash.js';
import { BEAR_OFF_POSITION } from '../../src/moves/constants.js';

/**
 * Create a test game state with pieces in bearing off position
 * All white pieces in home board (points 0-5)
 * @param {object} overrides
 * @returns {object}
 */
function createBearOffState(overrides = {}) {
  return {
    turn: 10,
    activePlayer: 'white',
    dice: [3, 4],
    diceUsed: [],
    board: [
      3, 3, 3, 3, 2, 1,  // White home: 15 pieces (points 0-5)
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      -3, -3, -3, -3, -2, -1 // Black home: 15 pieces (points 18-23)
    ],
    bar: { white: 0, black: 0 },
    home: { white: 0, black: 0 },
    lastMove: null,
    status: 'playing',
    winner: null,
    players: { white: 'alice', black: 'bob' },
    messages: [],
    updatedAt: '2025-01-21T12:00:00Z',
    tableOptions: { allowBearOffOvershoot: true },
    ...overrides
  };
}

/**
 * Create a test move file for bear-off moves
 * @param {object} overrides
 * @returns {object}
 */
function createBearOffMoveFile(overrides = {}) {
  return {
    player: 'white',
    moves: [
      { from: 2, to: BEAR_OFF_POSITION, die: 3 },
      { from: 3, to: BEAR_OFF_POSITION, die: 4 }
    ],
    timestamp: '2025-01-21T12:01:00Z',
    expectedState: 'placeholder12345',
    diceRoll: [3, 4],
    comment: null,
    commitSha: null,
    ...overrides
  };
}

describe('Bearing Off Integration Tests', () => {
  describe('Bear-off validation in action pipeline', () => {
    it('should accept valid bear-off move when all pieces in home board', async () => {
      const state = createBearOffState();
      const expectedHash = computeStateHash(state);
      const moveFile = createBearOffMoveFile({ expectedState: expectedHash });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0010-white-a1b2c3.json'
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject bear-off when pieces exist outside home board', async () => {
      const state = createBearOffState({
        board: [
          3, 3, 3, 3, 2, 0,  // 14 in home board
          0, 0, 0, 0, 1, 0,  // 1 white piece on point 10 (outside home)
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ]
      });
      const expectedHash = computeStateHash(state);
      const moveFile = createBearOffMoveFile({ expectedState: expectedHash });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0010-white-a1b2c3.json'
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('pieces exist outside home board'))).toBe(true);
      expect(result.errors.some(e => e.includes('point 10'))).toBe(true);
    });

    it('should reject bear-off when pieces remain on bar', async () => {
      const state = createBearOffState({
        bar: { white: 1, black: 0 },
        board: [
          3, 3, 3, 3, 2, 0,  // 14 in home board, 1 on bar
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ]
      });
      const expectedHash = computeStateHash(state);
      const moveFile = createBearOffMoveFile({ expectedState: expectedHash });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0010-white-a1b2c3.json'
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('bar'))).toBe(true);
    });
  });

  describe('Win detection after final bear-off', () => {
    it('should detect win when 15th piece is borne off', async () => {
      // State with 13 pieces already borne off, 2 pieces left on board
      // Both can be borne off to reach exactly 15
      const state = createBearOffState({
        dice: [2, 3],
        board: [
          0, 1, 1, 0, 0, 0,  // 2 white pieces: point 1 (die 2) and point 2 (die 3)
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ],
        home: { white: 13, black: 0 }
      });
      const expectedHash = computeStateHash(state);
      const moveFile = createBearOffMoveFile({
        expectedState: expectedHash,
        moves: [
          { from: 1, to: BEAR_OFF_POSITION, die: 2 },
          { from: 2, to: BEAR_OFF_POSITION, die: 3 }
        ],
        diceRoll: [2, 3]
      });

      // Validate move
      const validation = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0010-white-a1b2c3.json'
      });

      expect(validation.valid).toBe(true);

      // Apply moves
      const newState = applyMoves(state, moveFile);

      // Detect win
      const winResult = detectWin(newState, 'white');

      expect(winResult.won).toBe(true);
      expect(winResult.winner).toBe('white');
      expect(winResult.state.status).toBe('completed');
      expect(winResult.state.winner).toBe('white');
    });

    it('should not detect win when bearing off 14th piece', async () => {
      // State with 12 pieces already borne off, 3 pieces left on board
      // Can only bear off 2, leaving 1 on board (14 home)
      const state = createBearOffState({
        dice: [2, 3],
        board: [
          1, 1, 1, 0, 0, 0,  // 3 white pieces
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ],
        home: { white: 12, black: 0 }
      });
      const expectedHash = computeStateHash(state);
      const moveFile = createBearOffMoveFile({
        expectedState: expectedHash,
        moves: [
          { from: 1, to: BEAR_OFF_POSITION, die: 2 },
          { from: 2, to: BEAR_OFF_POSITION, die: 3 }
        ],
        diceRoll: [2, 3]
      });

      // Validate and apply
      const validation = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0010-white-a1b2c3.json'
      });

      expect(validation.valid).toBe(true);

      const newState = applyMoves(state, moveFile);
      const winResult = detectWin(newState, 'white');

      expect(winResult.won).toBe(false);
      expect(winResult.winner).toBeNull();
      expect(newState.home.white).toBe(14);
    });

    it('should set status to completed and winner after final bear-off flow', async () => {
      // Complete flow: validate -> apply -> detect win -> finalize
      // 2 pieces left, both will be borne off to win
      const state = createBearOffState({
        dice: [1, 2],
        board: [
          1, 1, 0, 0, 0, 0,  // 2 white pieces: point 0 (die 1) and point 1 (die 2)
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ],
        home: { white: 13, black: 0 }
      });
      const expectedHash = computeStateHash(state);
      const moveFile = createBearOffMoveFile({
        expectedState: expectedHash,
        moves: [
          { from: 0, to: BEAR_OFF_POSITION, die: 1 },
          { from: 1, to: BEAR_OFF_POSITION, die: 2 }
        ],
        diceRoll: [1, 2]
      });

      // Full flow
      const validation = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0010-white-a1b2c3.json'
      });
      expect(validation.valid).toBe(true);

      const newState = applyMoves(state, moveFile);
      const winResult = detectWin(newState, 'white');

      expect(winResult.won).toBe(true);

      // State should have completion status
      expect(winResult.state.status).toBe('completed');
      expect(winResult.state.winner).toBe('white');
      expect(winResult.state.home.white).toBe(15);
    });
  });

  describe('Overshoot rules', () => {
    it('should allow overshoot from highest point when allowBearOffOvershoot is false', async () => {
      // Point 3 is the highest occupied point for white
      // Two dice: one usable (6 for overshoot from point 3), one unusable (1 - no piece on point 0)
      const state = createBearOffState({
        dice: [6, 6],
        tableOptions: { allowBearOffOvershoot: false },
        board: [
          0, 0, 2, 2, 0, 0,  // Point 3 is highest with pieces, point 2 also has pieces
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ],
        home: { white: 11, black: 0 }
      });
      const expectedHash = computeStateHash(state);
      const moveFile = createBearOffMoveFile({
        expectedState: expectedHash,
        moves: [
          { from: 3, to: BEAR_OFF_POSITION, die: 6 },
          { from: 3, to: BEAR_OFF_POSITION, die: 6 }
        ],
        diceRoll: [6, 6]
      });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0010-white-a1b2c3.json'
      });

      expect(result.valid).toBe(true);
    });

    it('should reject overshoot when higher pieces exist (allowBearOffOvershoot: false)', async () => {
      // Trying to bear off from point 2 with die 6, but point 4 has pieces
      // Need to use both dice, so we try two invalid overshoots
      const state = createBearOffState({
        dice: [6, 5],
        tableOptions: { allowBearOffOvershoot: false },
        board: [
          2, 2, 1, 0, 1, 1,  // Point 5 is highest, trying to overshoot from point 2
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ],
        home: { white: 8, black: 0 }
      });
      const expectedHash = computeStateHash(state);
      const moveFile = createBearOffMoveFile({
        expectedState: expectedHash,
        moves: [{ from: 2, to: BEAR_OFF_POSITION, die: 6 }],  // Invalid overshoot
        diceRoll: [6, 5]
      });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0010-white-a1b2c3.json'
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('higher pieces exist'))).toBe(true);
    });

    it('should allow overshoot when allowBearOffOvershoot is true (default)', async () => {
      // Trying to bear off from point 2 with die 6, point 4 has pieces but overshoot is allowed
      const state = createBearOffState({
        dice: [6, 5],
        tableOptions: { allowBearOffOvershoot: true },
        board: [
          0, 0, 1, 0, 1, 0,  // Point 4 is highest, but overshoot is allowed
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ],
        home: { white: 13, black: 0 }
      });
      const expectedHash = computeStateHash(state);
      const moveFile = createBearOffMoveFile({
        expectedState: expectedHash,
        moves: [
          { from: 2, to: BEAR_OFF_POSITION, die: 6 },
          { from: 4, to: BEAR_OFF_POSITION, die: 5 }
        ],
        diceRoll: [6, 5]
      });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0010-white-a1b2c3.json'
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('Doubles with bearing off', () => {
    it('should allow bearing off multiple pieces with doubles (4 moves)', async () => {
      const state = createBearOffState({
        dice: [3, 3, 3, 3], // Doubles give 4 dice
        board: [
          0, 0, 4, 0, 0, 0,  // 4 white pieces on point 2 (need die 3 to bear off)
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ],
        home: { white: 11, black: 0 }
      });
      const expectedHash = computeStateHash(state);
      const moveFile = createBearOffMoveFile({
        expectedState: expectedHash,
        moves: [
          { from: 2, to: BEAR_OFF_POSITION, die: 3 },
          { from: 2, to: BEAR_OFF_POSITION, die: 3 },
          { from: 2, to: BEAR_OFF_POSITION, die: 3 },
          { from: 2, to: BEAR_OFF_POSITION, die: 3 }
        ],
        diceRoll: [3, 3, 3, 3]
      });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0010-white-a1b2c3.json'
      });

      expect(result.valid).toBe(true);

      // Apply and verify
      const newState = applyMoves(state, moveFile);
      expect(newState.home.white).toBe(15);
      expect(newState.board[2]).toBe(0);

      // Should trigger win
      const winResult = detectWin(newState, 'white');
      expect(winResult.won).toBe(true);
    });

    it('should allow partial doubles usage when only some bear-off moves are legal', async () => {
      // Only 2 pieces on a point, rolled doubles of 3
      const state = createBearOffState({
        dice: [3, 3, 3, 3],
        board: [
          0, 0, 2, 0, 0, 0,  // Only 2 pieces on point 2
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ],
        home: { white: 13, black: 0 }
      });
      const expectedHash = computeStateHash(state);
      const moveFile = createBearOffMoveFile({
        expectedState: expectedHash,
        moves: [
          { from: 2, to: BEAR_OFF_POSITION, die: 3 },
          { from: 2, to: BEAR_OFF_POSITION, die: 3 }
        ],
        diceRoll: [3, 3, 3, 3]
      });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0010-white-a1b2c3.json'
      });

      // Should be valid because we used all possible moves
      expect(result.valid).toBe(true);
    });

    it('should verify forced move rules apply correctly during bear-off with doubles', async () => {
      // 4 pieces spread across home, can use all 4 dice
      const state = createBearOffState({
        dice: [2, 2, 2, 2],
        board: [
          0, 4, 0, 0, 0, 0,  // 4 pieces on point 1 (need die 2)
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ],
        home: { white: 11, black: 0 }
      });

      // Build move tree to verify max dice usage
      const treeResult = buildMoveTree(
        { board: [...state.board], bar: { ...state.bar }, home: { ...state.home }, tableOptions: state.tableOptions },
        state.dice,
        'white'
      );

      expect(treeResult.maxDice).toBe(4);
    });
  });

  describe('Forced moves during bearing off', () => {
    it('should correctly calculate maximum dice usage during bear-off', () => {
      const state = createBearOffState({
        dice: [3, 5],
        board: [
          0, 0, 1, 0, 1, 0,  // Pieces on points 2 and 4
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ],
        home: { white: 13, black: 0 }
      });

      const treeResult = buildMoveTree(
        { board: [...state.board], bar: { ...state.bar }, home: { ...state.home }, tableOptions: state.tableOptions },
        state.dice,
        'white'
      );

      // Can use both dice: point 2 with die 3, point 4 with die 5
      expect(treeResult.maxDice).toBe(2);
    });

    it('should reject partial bear-off when more moves were available', async () => {
      const state = createBearOffState({
        dice: [3, 5],
        board: [
          0, 0, 1, 0, 1, 0,  // Can bear off both pieces
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ],
        home: { white: 13, black: 0 }
      });
      const expectedHash = computeStateHash(state);

      // Only using one die when both could be used
      const moveFile = createBearOffMoveFile({
        expectedState: expectedHash,
        moves: [
          { from: 2, to: BEAR_OFF_POSITION, die: 3 }
        ],
        diceRoll: [3, 5]
      });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0010-white-a1b2c3.json'
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Forced move violation'))).toBe(true);
    });

    it('should produce clear error message for forced move violations', async () => {
      const state = createBearOffState({
        dice: [2, 4],
        board: [
          0, 1, 0, 1, 0, 0,  // Can bear off both: point 1 with 2, point 3 with 4
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ],
        home: { white: 13, black: 0 }
      });
      const expectedHash = computeStateHash(state);

      // Only making one move
      const moveFile = createBearOffMoveFile({
        expectedState: expectedHash,
        moves: [
          { from: 1, to: BEAR_OFF_POSITION, die: 2 }
        ],
        diceRoll: [2, 4]
      });

      const result = await runValidationPipeline({
        actor: 'alice',
        state,
        moveFile,
        filename: '0010-white-a1b2c3.json'
      });

      expect(result.valid).toBe(false);
      // Error should mention the number of dice that could vs were used
      const forcedMoveError = result.errors.find(e => e.includes('Forced move'));
      expect(forcedMoveError).toBeDefined();
      expect(forcedMoveError).toContain('2');
      expect(forcedMoveError).toContain('1');
    });

    it('should analyze forced moves correctly with analyzeForcedMoves', () => {
      const state = createBearOffState({
        dice: [3, 4],
        board: [
          0, 0, 1, 1, 0, 0,  // Pieces on points 2 and 3
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1
        ],
        home: { white: 13, black: 0 }
      });

      // Player only made one move
      const movesPlayed = [
        { from: 2, to: BEAR_OFF_POSITION, die: 3 }
      ];

      const analysis = analyzeForcedMoves(state, movesPlayed, 'white');

      expect(analysis.moreMovesAvailable).toBe(true);
      expect(analysis.maxDiceUsable).toBe(2);
      expect(analysis.diceUsed).toBe(1);
    });
  });

  describe('Black player bearing off', () => {
    it('should correctly handle black player bearing off', async () => {
      // Black home board is points 18-23, bears off to values > 23
      const state = createBearOffState({
        activePlayer: 'black',
        dice: [3, 4],
        board: [
          3, 3, 3, 3, 2, 1,  // White home
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0,
          -3, -3, -3, -3, -2, -1 // Black home: points 18-23
        ],
        players: { white: 'alice', black: 'bob' }
      });
      const expectedHash = computeStateHash(state);

      // Black bears off: from point 21 (needs 24-21=3) and point 20 (needs 24-20=4)
      const moveFile = createBearOffMoveFile({
        player: 'black',
        expectedState: expectedHash,
        moves: [
          { from: 21, to: BEAR_OFF_POSITION, die: 3 },
          { from: 20, to: BEAR_OFF_POSITION, die: 4 }
        ],
        diceRoll: [3, 4]
      });

      const result = await runValidationPipeline({
        actor: 'bob',
        state,
        moveFile,
        filename: '0010-black-a1b2c3.json'
      });

      expect(result.valid).toBe(true);
    });
  });
});
