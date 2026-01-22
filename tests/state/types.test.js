import { describe, it, expect } from 'vitest';
import {
  PLAYER_COLORS,
  GAME_STATUSES,
  MESSAGE_TYPES,
  PIECES_PER_PLAYER,
  BOARD_POINTS,
  isValidPlayer,
  isValidStatus,
  isValidMessageType,
  isValidDieValue
} from '../../src/state/constants.js';

/**
 * Task Group 2: Type Definition Tests
 * Tests for type guards and constants
 */

describe('Type Guards and Constants', () => {
  describe('Constants', () => {
    it('should have correct constant values', () => {
      expect(PLAYER_COLORS).toEqual(['white', 'black']);
      expect(GAME_STATUSES).toEqual(['playing', 'completed']);
      expect(MESSAGE_TYPES).toEqual(['error', 'info', 'warning']);
      expect(PIECES_PER_PLAYER).toBe(15);
      expect(BOARD_POINTS).toBe(24);
    });

    it('should have immutable constants', () => {
      expect(Object.isFrozen(PLAYER_COLORS)).toBe(true);
      expect(Object.isFrozen(GAME_STATUSES)).toBe(true);
      expect(Object.isFrozen(MESSAGE_TYPES)).toBe(true);
    });
  });

  describe('isValidPlayer', () => {
    it('should return true for valid player colors', () => {
      expect(isValidPlayer('white')).toBe(true);
      expect(isValidPlayer('black')).toBe(true);
    });

    it('should return false for invalid player colors', () => {
      expect(isValidPlayer('red')).toBe(false);
      expect(isValidPlayer('')).toBe(false);
      expect(isValidPlayer('WHITE')).toBe(false);
    });
  });

  describe('isValidStatus', () => {
    it('should return true for valid game statuses', () => {
      expect(isValidStatus('playing')).toBe(true);
      expect(isValidStatus('completed')).toBe(true);
    });

    it('should return false for invalid game statuses', () => {
      expect(isValidStatus('started')).toBe(false);
      expect(isValidStatus('')).toBe(false);
      expect(isValidStatus('PLAYING')).toBe(false);
    });
  });

  describe('isValidDieValue', () => {
    it('should return true for valid die values 1-6', () => {
      for (let i = 1; i <= 6; i++) {
        expect(isValidDieValue(i)).toBe(true);
      }
    });

    it('should return false for invalid die values', () => {
      expect(isValidDieValue(0)).toBe(false);
      expect(isValidDieValue(7)).toBe(false);
      expect(isValidDieValue(-1)).toBe(false);
      expect(isValidDieValue(3.5)).toBe(false);
    });
  });
});
