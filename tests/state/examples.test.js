import { describe, it, expect } from 'vitest';
import {
  getInitialStateExample,
  getMidGameStateExample,
  getCompletedGameStateExample,
  getAllExamples
} from '../../src/state/examples/index.js';
import { validateState } from '../../src/state/validation.js';

/**
 * Task Group 5: Example State Tests
 * Tests for example state files
 */

describe('Example State Files', () => {
  describe('initial-state.json', () => {
    it('should pass schema validation', () => {
      const state = getInitialStateExample();
      const result = validateState(state);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should have turn 1 and null lastMove', () => {
      const state = getInitialStateExample();
      expect(state.turn).toBe(1);
      expect(state.lastMove).toBeNull();
    });
  });

  describe('mid-game-state.json', () => {
    it('should pass schema validation', () => {
      const state = getMidGameStateExample();
      const result = validateState(state);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should have turn 12 and valid lastMove', () => {
      const state = getMidGameStateExample();
      expect(state.turn).toBe(12);
      expect(state.lastMove).not.toBeNull();
      expect(state.lastMove.sequence).toBe(11);
    });
  });

  describe('completed-game-state.json', () => {
    it('should pass schema validation', () => {
      const state = getCompletedGameStateExample();
      const result = validateState(state);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should have completed status and winner', () => {
      const state = getCompletedGameStateExample();
      expect(state.status).toBe('completed');
      expect(state.winner).toBe('white');
    });
  });

  describe('getAllExamples', () => {
    it('should return all three examples', () => {
      const examples = getAllExamples();
      expect(examples).toHaveProperty('initial');
      expect(examples).toHaveProperty('midGame');
      expect(examples).toHaveProperty('completed');
    });

    it('should return deep copies (not references)', () => {
      const examples1 = getAllExamples();
      const examples2 = getAllExamples();
      expect(examples1.initial).not.toBe(examples2.initial);
      expect(examples1.initial).toEqual(examples2.initial);
    });
  });
});
