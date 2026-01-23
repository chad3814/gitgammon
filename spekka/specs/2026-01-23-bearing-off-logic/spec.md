# Specification: Bearing Off Logic Integration Tests

## Goal
Add integration tests to verify the complete bearing off flow from move validation through win detection, ensuring all existing implementation modules work correctly together.

## User Stories
- As a player, I want bearing off moves to be validated correctly so that illegal bear-off attempts are rejected
- As a player, I want the game to detect my win immediately after I bear off my 15th piece

## Specific Requirements

**Integration Test Suite for Bearing Off**
- Create `/tests/action/bearoff-integration.test.js` following existing test patterns in `/tests/action/`
- Use `vitest` with `describe/it/expect` matching `turn-management.test.js` conventions
- Include `createTestState()` helper for bearing-off scenarios (all pieces in home board)
- Include `createTestMoveFile()` helper for bear-off move files

**Complete Bear-Off Validation Flow Tests**
- Test that `runValidationPipeline` accepts valid bear-off moves when all pieces in home
- Test that pipeline rejects bear-off when pieces exist outside home board
- Test that pipeline rejects bear-off when pieces remain on bar
- Verify validation error messages include point/bar location of blocking pieces

**Win Detection After Final Bear-Off**
- Test full flow: validation -> `applyMoves` -> `detectWin` returns `won: true` when 15th piece borne off
- Verify state transitions to `status: 'completed'` and `winner` is set correctly
- Test that bearing off 14th piece does not trigger win detection

**Overshoot Rule Integration**
- Test that overshoot from highest occupied point is allowed (with `allowBearOffOvershoot: false`)
- Test that overshoot is blocked when higher points have pieces (with `allowBearOffOvershoot: false`)
- Test that overshoot is always allowed when `allowBearOffOvershoot: true` (default)

**Doubles During Bearing Off**
- Test bearing off multiple pieces with doubles (4 moves)
- Verify forced move rules apply correctly during bear-off phase
- Test partial doubles usage when only some bear-off moves are legal

**Forced Moves During Bearing Off**
- Test that `buildMoveTree` correctly calculates maximum dice usage during bear-off
- Test that partial bear-off is rejected when more moves were available
- Verify that forced move violations produce clear error messages

## Visual Design
N/A - No visual mockups for test implementation.

## Existing Code to Leverage

**`/tests/action/turn-management.test.js`**
- Provides test structure pattern with `createTestState()` and `createTestMoveFile()` helpers
- Shows how to use `runValidationPipeline`, `applyMoves`, and `finalizeState` together
- Demonstrates assertion patterns for validation results and state changes

**`/tests/action/state-updates.test.js`**
- Contains existing `detectWin` tests verifying 15 pieces = win condition
- Shows test patterns for `applyMoves` board state verification
- Provides fixture setup/teardown patterns with `beforeEach`/`afterEach`

**`/tests/validation/board-validators.test.js`**
- Contains 6 existing unit tests for `validateBearingOff()` function
- Shows test patterns for overshoot scenarios and error message verification
- Provides home board setup patterns (white: points 0-5, black: points 18-23)

**`/src/validation/validators/bearoff.js`**
- `validateBearingOff(gameState, move, player)` - main validation to exercise
- `checkAllPiecesInHome()` - verifies bar and all points checked
- `getHighestPointWithPieces()` - for overshoot rule logic

**`/src/validation/forced-moves.js`**
- `buildMoveTree()` and `calculateLegalMoves()` for forced move analysis
- `isValidBearOff()` - internal bear-off validation used in move tree
- `allPiecesInHome()` - duplicate home check used in legal move calculation

## Out of Scope
- Modifying existing validation modules in `/src/validation/`
- Modifying action modules in `/action/`
- Adding new game rules or validation logic
- UI or visual components
- Performance optimization of bearing off calculations
- Gammon/backgammon scoring (double/triple stakes)
- Undo/redo functionality for bear-off moves
- Network or multiplayer synchronization
- Documentation updates outside of test files
- Changes to state.json schema or move file format
