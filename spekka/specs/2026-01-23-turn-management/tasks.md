# Task Breakdown: Turn Management - Dice Verification Security Fix

## Overview
Total Tasks: 16 (across 3 task groups)

This spec closes a critical security gap where players can submit moves claiming different dice than the server-controlled state. It creates a new `verify-dice.js` module and adds comprehensive integration tests for turn management flows.

## Task List

### Verification Layer

#### Task Group 1: Dice Verification Module
**Dependencies:** None

- [x] 1.0 Complete dice verification module
  - [x] 1.1 Write 4-6 focused tests for dice verification
    - Test `verifyDice()` passes when moveFile.diceRoll matches state.dice exactly
    - Test `verifyDice()` passes with reversed order ([3,5] matches [5,3])
    - Test `verifyDice()` fails when dice values differ (e.g., [3,5] vs [4,6])
    - Test `verifyDice()` handles doubles correctly ([3,3] must match [3,3])
    - Test `verifyDice()` returns proper error message format with sorted arrays
    - Test `verifyDice()` returns `{ valid, errors }` matching existing patterns
  - [x] 1.2 Create `action/verify-dice.js` module
    - Follow exact pattern from `action/verify-turn.js` and `action/verify-hash.js`
    - Implement `verifyDice(state, moveFile)` function
    - Compare `moveFile.diceRoll` against `state.dice`
    - Use order-independent comparison (sort both arrays before comparing)
    - Return `{ valid: boolean, errors: string[] }`
    - Error format: "Dice mismatch: state has [X,Y] but move claims [A,B]"
    - Sort dice values in error message for consistent output
  - [x] 1.3 Export verifyDice from module
    - Add JSDoc type annotations matching existing modules
    - Document function signature: `(state, moveFile) => { valid, errors }`
  - [x] 1.4 Ensure dice verification tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify error messages are clear and actionable

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- Module follows exact patterns from verify-turn.js and verify-hash.js
- Order-independent dice comparison works correctly
- Error messages include both expected and actual dice values

---

### Pipeline Integration

#### Task Group 2: Validation Pipeline Update
**Dependencies:** Task Group 1

- [x] 2.0 Complete pipeline integration
  - [x] 2.1 Write 3-4 focused tests for pipeline dice verification
    - Test pipeline rejects move when dice mismatch (state [3,5], move [4,6])
    - Test pipeline accepts move when dice match in same order
    - Test pipeline accepts move when dice match in reversed order
    - Test dice verification runs before game rules validation (fail fast)
  - [x] 2.2 Update `action/validation-pipeline.js`
    - Import `verifyDice` from `./verify-dice.js`
    - Add step 2.5: Verify dice match between step 2 (turn) and step 3 (hash)
    - Call `verifyDice(state, moveFile)` following existing verification pattern
    - Aggregate errors with `allErrors.push(...diceResult.errors)`
    - Maintain existing step numbering in comments (2.5 between 2 and 3)
  - [x] 2.3 Ensure pipeline integration tests pass
    - Run ONLY the 3-4 tests written in 2.1
    - Verify pipeline order: player -> turn -> dice -> hash -> schema -> rules

**Acceptance Criteria:**
- The 3-4 tests written in 2.1 pass
- Dice verification runs at step 2.5 in the pipeline
- Existing pipeline behavior unchanged for valid moves
- Pipeline fails fast on dice mismatch

---

### Integration Testing

#### Task Group 3: Turn Management Integration Tests
**Dependencies:** Task Groups 1 and 2

- [x] 3.0 Complete turn management integration tests
  - [x] 3.1 Analyze existing tests for coverage gaps
    - Review existing tests in `tests/action/validation.test.js`
    - Review existing tests in `tests/action/integration.test.js`
    - Identify critical turn management flows lacking coverage
    - Focus ONLY on turn management feature requirements
  - [x] 3.2 Write 6-8 focused integration tests for turn management
    - Test: Complete turn flow - player submits valid move, turn counter increments
    - Test: Turn validation rejects wrong player's moves with clear error
    - Test: Dice verification rejects mismatched dice with expected/actual values
    - Test: Dice verification accepts matching dice regardless of order
    - Test: Auto-pass triggers when player has no legal moves (use blocked board state)
    - Test: activePlayer alternates correctly after successful move
    - Test: Dice roll happens only after move acceptance (not on rejection)
    - Test: Full validation pipeline respects step order (turn -> dice -> hash -> rules)
  - [x] 3.3 Add tests to `tests/action/turn-management.test.js`
    - Create new test file for turn management specific tests
    - Reuse `createTestState()` and `createTestMoveFile()` helpers from validation.test.js
    - Import necessary modules: verifyDice, verifyTurn, runValidationPipeline
    - Follow existing test structure patterns from validation.test.js
  - [x] 3.4 Ensure all turn management tests pass
    - Run tests in `tests/action/turn-management.test.js`
    - Run tests in `tests/action/validation.test.js` to ensure no regressions
    - Verify total test count: approximately 20-24 tests for turn management

**Acceptance Criteria:**
- All turn management tests pass (approximately 20-24 tests)
- Complete turn flow is verified end-to-end
- Dice mismatch scenarios properly tested
- Auto-pass behavior verified
- No regressions in existing validation tests

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Verification Layer**
   - Create verify-dice.js module
   - Follow existing verification module patterns
   - No dependencies on other new code

2. **Task Group 2: Pipeline Integration**
   - Depends on verify-dice.js from Group 1
   - Minimal changes to existing pipeline
   - Maintains backward compatibility

3. **Task Group 3: Integration Testing**
   - Depends on Groups 1 and 2
   - Comprehensive end-to-end verification
   - Validates all turn management flows

## File Structure

After completion, changes include:

```
action/
  verify-dice.js              # NEW: Dice verification module
  validation-pipeline.js      # UPDATED: Add step 2.5

tests/action/
  verify-dice.test.js         # NEW: Unit tests for dice verification
  turn-management.test.js     # NEW: Turn management integration tests
  validation.test.js          # UPDATED: Added pipeline dice verification tests
```

## Dependencies Graph

```
Task Group 1 (Dice Verification)
         |
         v
Task Group 2 (Pipeline Integration)
         |
         v
Task Group 3 (Integration Tests)
```

## Notes

- Security fix: closes vulnerability where moveFile.diceRoll was trusted without verification
- Order-independent comparison: [3,5] and [5,3] are equivalent rolls
- Doubles handling: [3,3] must match exactly (same values, same count)
- Error messages include both expected (state.dice) and actual (moveFile.diceRoll) values
- Existing validation.test.js has helpers that can be reused
- Auto-pass logic already exists in src/dice/turn-roll.js (checkForLegalMoves)
- Fail fast: dice mismatch should stop validation early (before expensive game rules check)
