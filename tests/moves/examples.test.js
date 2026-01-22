/**
 * Tests for Example Move Files
 * @module tests/moves/examples
 */

import { describe, it, expect } from 'vitest';
import {
  getOpeningMoveExample,
  getMidGameMoveExample,
  getBarEntryMoveExample,
  getBearingOffMoveExample,
  getAllMoveExamples
} from '../../src/moves/examples/index.js';
import { validateSchema } from '../../src/moves/validation.js';

describe('Example Move Files', () => {
  describe('Schema Validation', () => {
    it('should validate all example files against schema', () => {
      const examples = getAllMoveExamples();

      for (const [name, example] of Object.entries(examples)) {
        const result = validateSchema(example);
        expect(result.valid, `${name} example should be valid: ${result.errors.join(', ')}`).toBe(true);
      }
    });

    it('should have valid opening move example', () => {
      const opening = getOpeningMoveExample();
      const result = validateSchema(opening);
      expect(result.valid).toBe(true);
      expect(opening.player).toBe('white');
      expect(opening.moves.length).toBe(2);
    });

    it('should have valid mid-game move example with comment', () => {
      const midGame = getMidGameMoveExample();
      const result = validateSchema(midGame);
      expect(result.valid).toBe(true);
      expect(midGame.player).toBe('black');
      expect(midGame.comment).toBe('Running for safety!');
      expect(midGame.commitSha).not.toBeNull();
    });

    it('should have valid bar entry example', () => {
      const barEntry = getBarEntryMoveExample();
      const result = validateSchema(barEntry);
      expect(result.valid).toBe(true);
      expect(barEntry.moves[0].from).toBe(-1); // Bar entry
    });

    it('should have valid bearing off example with doubles', () => {
      const bearingOff = getBearingOffMoveExample();
      const result = validateSchema(bearingOff);
      expect(result.valid).toBe(true);
      expect(bearingOff.moves.length).toBe(4); // Doubles
      expect(bearingOff.diceRoll).toEqual([3, 3, 3, 3]);
      expect(bearingOff.moves.every(m => m.to === 24)).toBe(true); // All bear-off
    });
  });

  describe('Loader Functions', () => {
    it('should return correct structure from getOpeningMoveExample', () => {
      const example = getOpeningMoveExample();
      expect(example).toHaveProperty('player');
      expect(example).toHaveProperty('moves');
      expect(example).toHaveProperty('timestamp');
      expect(example).toHaveProperty('expectedState');
      expect(example).toHaveProperty('diceRoll');
      expect(example).toHaveProperty('comment');
      expect(example).toHaveProperty('commitSha');
    });

    it('should return cloned objects (not references)', () => {
      const example1 = getOpeningMoveExample();
      const example2 = getOpeningMoveExample();

      // Should be equal in value
      expect(example1).toEqual(example2);

      // Should not be the same reference
      expect(example1).not.toBe(example2);

      // Modifying one shouldn't affect the other
      example1.comment = 'modified';
      expect(example2.comment).toBeNull();
    });

    it('should return all examples from getAllMoveExamples', () => {
      const all = getAllMoveExamples();
      expect(all).toHaveProperty('opening');
      expect(all).toHaveProperty('midGame');
      expect(all).toHaveProperty('barEntry');
      expect(all).toHaveProperty('bearingOff');
    });
  });
});
