# Task Breakdown: Bearing Off Logic Integration Tests

## Overview
Total Tasks: 8 (across 1 task group)

This spec adds integration tests to verify the complete bearing off flow from move validation through win detection. The core bearing off implementation already exists - this spec focuses exclusively on integration testing.

## Task List

### Integration Testing

#### Task Group 1: Bearing Off Integration Tests
**Dependencies:** None (tests existing implementation)

- [x] 1.0 Complete bearing off integration test suite
  - [x] 1.1 Create test file and helpers
    - Create `tests/action/bearoff-integration.test.js`
    - Implement `createTestState()` helper for bearing-off scenarios (all pieces in home board)
    - Implement `createTestMoveFile()` helper for bear-off move files
    - Follow test patterns from `tests/action/turn-management.test.js`
    - Import: `runValidationPipeline`, `applyMoves`, `finalizeState` from action modules
  - [x] 1.2 Write 2-3 tests for bear-off validation in action pipeline
    - Test `runValidationPipeline` accepts valid bear-off moves when all pieces in home
    - Test pipeline rejects bear-off when pieces exist outside home board
    - Test pipeline rejects bear-off when pieces remain on bar
    - Verify validation error messages include point/bar location of blocking pieces
  - [x] 1.3 Write 2-3 tests for win detection after final bear-off
    - Test full flow: validation -> `applyMoves` -> `detectWin` returns `won: true` when 15th piece borne off
    - Verify state transitions to `status: 'completed'` and `winner` is set correctly
    - Test that bearing off 14th piece does not trigger win detection
  - [x] 1.4 Write 2-3 tests for overshoot rule integration
    - Test that overshoot from highest occupied point is allowed (with `allowBearOffOvershoot: false`)
    - Test that overshoot is blocked when higher points have pieces (with `allowBearOffOvershoot: false`)
    - Test that overshoot is always allowed when `allowBearOffOvershoot: true` (default)
  - [x] 1.5 Write 2-3 tests for doubles with bearing off
    - Test bearing off multiple pieces with doubles (4 moves)
    - Verify forced move rules apply correctly during bear-off phase
    - Test partial doubles usage when only some bear-off moves are legal
  - [x] 1.6 Write 2-3 tests for forced moves during bearing off
    - Test that `buildMoveTree` correctly calculates maximum dice usage during bear-off
    - Test that partial bear-off is rejected when more moves were available
    - Verify that forced move violations produce clear error messages
  - [x] 1.7 Run all bearing off integration tests
    - Run tests in `tests/action/bearoff-integration.test.js`
    - Verify all tests pass (approximately 12-15 tests total)
    - Ensure no regressions in existing bearing off unit tests in `tests/validation/board-validators.test.js`
  - [x] 1.8 Verify test coverage completeness
    - Confirm all spec requirements have corresponding tests
    - Verify tests exercise full integration flow (validation -> apply -> finalize)
    - Check that error message assertions match expected formats

**Acceptance Criteria:**
- All bearing off integration tests pass (approximately 12-15 tests)
- Tests cover complete validation pipeline flow for bear-off scenarios
- Win detection correctly triggers on 15th piece bear-off
- Overshoot rules are tested for both configuration options
- Doubles and forced move scenarios during bear-off are verified
- No regressions in existing unit tests

---

## Execution Order

Recommended implementation sequence:

1. **Task 1.1**: Create test file and helpers first
2. **Tasks 1.2-1.6**: Write tests in any order (can be parallelized)
3. **Tasks 1.7-1.8**: Run and verify all tests after completion

## File Structure

After completion, changes include:

```
tests/action/
  bearoff-integration.test.js   # NEW: Integration tests for bearing off flow
```

## Dependencies Graph

```
Task 1.1 (File Setup)
    |
    v
Tasks 1.2-1.6 (Test Writing - parallelizable)
    |
    v
Tasks 1.7-1.8 (Verification)
```

## Reference Files

**Test Patterns to Follow:**
- `tests/action/turn-management.test.js` - Test structure, helper patterns
- `tests/action/state-updates.test.js` - `detectWin` test patterns, `applyMoves` verification
- `tests/validation/board-validators.test.js` - Existing `validateBearingOff` unit tests

**Modules Under Test:**
- `action/validation-pipeline.js` - `runValidationPipeline()`
- `action/state-updates.js` - `applyMoves()`, `detectWin()`
- `action/finalize-state.js` - `finalizeState()`
- `src/validation/validators/bearoff.js` - `validateBearingOff()`
- `src/validation/forced-moves.js` - `buildMoveTree()`, `calculateLegalMoves()`

## Notes

- This spec creates integration tests only - no modifications to source modules
- Tests should use `vitest` with `describe/it/expect` matching existing test conventions
- White home board: points 0-5, Black home board: points 18-23
- Bar re-entry must be checked before bearing off is allowed
- Default `allowBearOffOvershoot: true` matches standard backgammon rules
- Win condition: player has borne off all 15 pieces (0 on board, 0 on bar)
- Test helpers should create realistic board positions for bear-off scenarios
