import { describe, it, expect } from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import gameStateSchema from '../../src/state/schema/game-state.schema.json' with { type: 'json' };

/**
 * Task Group 1: JSON Schema Validation Tests
 * Tests for game-state.schema.json validation
 */

const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);
const validate = ajv.compile(gameStateSchema);

/** Valid initial game state for testing */
const validInitialState = {
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
  players: {
    white: 'alice',
    black: 'bob'
  },
  messages: [
    {
      type: 'info',
      text: 'Game started. White to move.',
      timestamp: '2025-01-21T12:00:00Z'
    }
  ],
  updatedAt: '2025-01-21T12:00:00Z'
};

/** Valid mid-game state for testing */
const validMidGameState = {
  turn: 12,
  activePlayer: 'black',
  dice: [4, 2],
  diceUsed: [],
  board: [
    0, 0, 2, 0, 0, -4,
    0, -2, 0, 0, 1, 4,
    -4, 0, 0, 1, 2, 0,
    4, 0, 0, -1, 0, 0
  ],
  bar: { white: 1, black: 0 },
  home: { white: 0, black: 4 },
  lastMove: {
    sequence: 11,
    player: 'white',
    file: '0011-white-a3f2e1.json'
  },
  status: 'playing',
  winner: null,
  players: {
    white: 'alice',
    black: 'bob'
  },
  messages: [
    {
      type: 'info',
      text: 'Game started. White to move.',
      timestamp: '2025-01-21T12:00:00Z'
    },
    {
      type: 'info',
      text: 'White piece hit on point 21.',
      timestamp: '2025-01-21T12:15:32Z'
    }
  ],
  updatedAt: '2025-01-21T12:15:32Z'
};

describe('Game State Schema Validation', () => {
  it('should validate a valid initial game state', () => {
    const isValid = validate(validInitialState);
    expect(isValid).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it('should validate a valid mid-game state', () => {
    const isValid = validate(validMidGameState);
    expect(isValid).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it('should reject state with missing required field', () => {
    const invalidState = { ...validInitialState };
    delete invalidState.turn;

    const isValid = validate(invalidState);
    expect(isValid).toBe(false);
    expect(validate.errors).not.toBeNull();
    expect(validate.errors.some(e => e.keyword === 'required' && e.params.missingProperty === 'turn')).toBe(true);
  });

  it('should reject state with wrong type', () => {
    const invalidState = {
      ...validInitialState,
      turn: 'one' // should be integer, not string
    };

    const isValid = validate(invalidState);
    expect(isValid).toBe(false);
    expect(validate.errors).not.toBeNull();
    expect(validate.errors.some(e => e.instancePath === '/turn' && e.keyword === 'type')).toBe(true);
  });
});
