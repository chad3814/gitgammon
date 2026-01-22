/**
 * Tests for Move Module Index
 * @module tests/moves/index
 */

import { describe, it, expect } from 'vitest';
import * as movesModule from '../../src/moves/index.js';

describe('Move Module Index', () => {
  describe('Public Exports', () => {
    it('should export all public functions', () => {
      // Schema exports
      expect(movesModule.moveSchema).toBeDefined();
      expect(movesModule.getMoveSchema).toBeTypeOf('function');

      // Constants
      expect(movesModule.PLAYER_COLORS).toBeDefined();
      expect(movesModule.BAR_POSITION).toBe(-1);
      expect(movesModule.BEAR_OFF_POSITION).toBe(24);
      expect(movesModule.MIN_BOARD_POINT).toBe(0);
      expect(movesModule.MAX_BOARD_POINT).toBe(23);
      expect(movesModule.MAX_MOVES_PER_TURN).toBe(4);
      expect(movesModule.FILENAME_PATTERN).toBeInstanceOf(RegExp);

      // Type guards
      expect(movesModule.isValidPlayer).toBeTypeOf('function');
      expect(movesModule.isValidDieValue).toBeTypeOf('function');
      expect(movesModule.isValidBoardPoint).toBeTypeOf('function');
      expect(movesModule.isValidSourcePoint).toBeTypeOf('function');
      expect(movesModule.isValidDestinationPoint).toBeTypeOf('function');

      // Filename utilities
      expect(movesModule.parseFilename).toBeTypeOf('function');
      expect(movesModule.createFilename).toBeTypeOf('function');
      expect(movesModule.validateFilename).toBeTypeOf('function');
      expect(movesModule.padSequence).toBeTypeOf('function');

      // Hash utilities
      expect(movesModule.computeStateHash).toBeTypeOf('function');
      expect(movesModule.isValidStateHash).toBeTypeOf('function');

      // Factory functions
      expect(movesModule.createSingleMove).toBeTypeOf('function');
      expect(movesModule.createMoveFile).toBeTypeOf('function');
      expect(movesModule.generateFileSha).toBeTypeOf('function');
      expect(movesModule.createMoveFileWithFilename).toBeTypeOf('function');

      // Validation functions
      expect(movesModule.validateSchema).toBeTypeOf('function');
      expect(movesModule.validateFilenameMatch).toBeTypeOf('function');
      expect(movesModule.validateDiceUsage).toBeTypeOf('function');
      expect(movesModule.validateMoveDirection).toBeTypeOf('function');
      expect(movesModule.validateMoveFile).toBeTypeOf('function');

      // Example loaders
      expect(movesModule.getOpeningMoveExample).toBeTypeOf('function');
      expect(movesModule.getMidGameMoveExample).toBeTypeOf('function');
      expect(movesModule.getBarEntryMoveExample).toBeTypeOf('function');
      expect(movesModule.getBearingOffMoveExample).toBeTypeOf('function');
      expect(movesModule.getAllMoveExamples).toBeTypeOf('function');
    });

    it('should work correctly in consuming code', () => {
      // Test typical usage pattern
      const {
        createMoveFile,
        createSingleMove,
        validateMoveFile,
        createFilename,
        generateFileSha
      } = movesModule;

      // Create a move
      const moveFile = createMoveFile({
        player: 'white',
        moves: [createSingleMove(5, 2, 3)],
        diceRoll: [3, 5],
        expectedState: 'a3b4c5d6e7f89a0b'
      });

      // Validate it
      const result = validateMoveFile(moveFile);
      expect(result.valid).toBe(true);

      // Generate filename
      const sha = generateFileSha(moveFile);
      const filename = createFilename(1, moveFile.player, sha);
      expect(filename).toMatch(/^0001-white-[a-f0-9]{6}\.json$/);
    });
  });

  describe('Module Integrity', () => {
    it('should not have circular dependency issues', () => {
      // If there were circular dependencies, the import at the top would fail
      expect(movesModule).toBeDefined();
    });

    it('should return consistent schema from getMoveSchema', () => {
      const schema1 = movesModule.getMoveSchema();
      const schema2 = movesModule.getMoveSchema();
      expect(schema1).toBe(schema2);
      expect(schema1).toBe(movesModule.moveSchema);
    });
  });
});
