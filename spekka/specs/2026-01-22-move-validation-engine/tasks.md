# Task Breakdown: Move Validation Engine

## Overview
Total Tasks: 24 (across 4 task groups)

This spec creates a pure JavaScript validation module (`src/validation/`) that validates proposed backgammon moves against game state, returning detailed validation results without mutating state.

## Task List

### Validation Core Layer

#### Task Group 1: Core Types, Constants, and Result Pattern
**Dependencies:** None

- [x] 1.0 Complete core validation infrastructure
  - [x] 1.1 Write 4-6 focused tests for core validation infrastructure
    - Test MoveValidationResult creation with valid=true returns empty errors
    - Test MoveValidationResult creation with valid=false includes error messages
    - Test hitInfo property structure when blot hit detected
    - Test forcedMoveInfo property structure
    - Test combineValidationResults merges multiple results correctly
    - Test error message formatting follows spec patterns
  - [x] 1.2 Create `src/validation/types.js` with JSDoc type definitions
    - Define `MoveValidationResult` extending base ValidationResult with optional `hitInfo` and `forcedMoveInfo`
    - Define `HitInfo` type: `{point: number, player: PlayerColor}`
    - Define `ForcedMoveInfo` type: `{moreMovesAvailable: boolean, maxDiceUsable: number, diceUsed: number}`
    - Define `ValidatorFunction` type for validator array pattern
    - Follow existing pattern from `src/state/types.js` and `src/moves/types.js`
  - [x] 1.3 Create `src/validation/constants.js` with validation constants
    - Define WHITE_HOME_RANGE: `[0, 5]` and BLACK_HOME_RANGE: `[18, 23]`
    - Define WHITE_BAR_ENTRY_RANGE: `[18, 23]` and BLACK_BAR_ENTRY_RANGE: `[0, 5]`
    - Export helper functions: `isInHomeBoard(point, player)`, `getBarEntryPoint(die, player)`
    - Reuse `BAR_POSITION`, `BEAR_OFF_POSITION` from `src/moves/constants.js`
  - [x] 1.4 Create `src/validation/result.js` with result factory functions
    - Implement `createValidResult()` returning `{valid: true, errors: []}`
    - Implement `createInvalidResult(errors)` returning `{valid: false, errors}`
    - Implement `createResultWithHit(hitInfo)` for blot hit scenarios
    - Implement `combineValidationResults(results[])` to merge multiple validator outputs
  - [x] 1.5 Create `src/validation/index.js` as module entry point
    - Export all types, constants, and result utilities
    - Establish public API surface for the validation module
  - [x] 1.6 Ensure core infrastructure tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify all exports are accessible from index.js

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- Type definitions follow JSDoc patterns from existing codebase
- Result factory functions produce correctly structured objects
- Module exports are accessible via `src/validation/index.js`

---

### Basic Move Validators

#### Task Group 2: Turn, Direction, and Dice Validators
**Dependencies:** Task Group 1

- [x] 2.0 Complete basic move validation functions
  - [x] 2.1 Write 6-8 focused tests for basic validators
    - Test turn validation passes when move player matches activePlayer
    - Test turn validation fails with correct error format when players mismatch
    - Test white direction validation (higher to lower indices)
    - Test black direction validation (lower to higher indices)
    - Test dice consumption validates die matches move distance
    - Test dice consumption error when die not available in remaining dice
    - Test bar entry and bear-off are exempt from standard direction rules
    - Test move distance calculation for both players
  - [x] 2.2 Create `src/validation/validators/turn.js`
    - Implement `validateTurn(gameState, move)` function
    - Check `move.player === gameState.activePlayer`
    - Error format: "Not your turn: expected {activePlayer} but got {movePlayer}"
    - Return early with this error (runs before other validations)
  - [x] 2.3 Create `src/validation/validators/direction.js`
    - Implement `validateMoveDirection(move, player)` function
    - White: `from > to` (higher to lower, towards 0-5 home)
    - Black: `from < to` (lower to higher, towards 18-23 home)
    - Skip validation for bar entry (`from === -1`) and bear-off (`to === 24`)
    - Error format: "{color} must move from {expected direction} (attempted {from} to {to})"
    - Build on existing pattern from `src/moves/validation.js`
  - [x] 2.4 Create `src/validation/validators/dice.js`
    - Implement `validateDiceConsumption(move, remainingDice, player)` function
    - Calculate required die: `Math.abs(to - from)` (with special handling for bar/bear-off)
    - Verify `move.die` matches calculated distance
    - Verify `move.die` exists in `remainingDice` array
    - Error format: "Move {from} to {to} requires die {required} but used {actual}"
    - Build on existing `validateDiceUsage` pattern from `src/moves/validation.js`
  - [x] 2.5 Create `src/validation/validators/index.js` to export all validators
    - Re-export validateTurn, validateMoveDirection, validateDiceConsumption
  - [x] 2.6 Ensure basic validator tests pass
    - Run ONLY the 6-8 tests written in 2.1
    - Verify validators integrate with result factory functions

**Acceptance Criteria:**
- The 6-8 tests written in 2.1 pass
- Turn validation runs first and returns early on failure
- Direction validation handles all edge cases (bar, bear-off)
- Dice consumption integrates with existing codebase patterns

---

### Board State Validators

#### Task Group 3: Bar, Blocking, Blot, and Bearing Off Validators
**Dependencies:** Task Groups 1 and 2

- [x] 3.0 Complete board state validation functions
  - [x] 3.1 Write 6-8 focused tests for board state validators
    - Test bar re-entry enforced when player has pieces on bar
    - Test bar entry point calculation (white: 24-die, black: die-1)
    - Test point blocking validation (2+ opponent pieces blocks)
    - Test blot detection returns correct hitInfo without mutation
    - Test bearing off allowed only when all pieces in home board
    - Test bearing off overshoot when tableOptions.allowBearOffOvershoot is true
    - Test bearing off overshoot blocked when option is false
    - Test exact roll requirement when higher pieces exist
  - [x] 3.2 Create `src/validation/validators/bar.js`
    - Implement `validateBarReentry(gameState, move, player)` function
    - Check `gameState.bar[player] > 0` requires bar re-entry
    - Validate entry point: white enters at `24 - die`, black enters at `die - 1`
    - Ensure `move.from === -1` (BAR_POSITION) when pieces on bar
    - Error format: "Must re-enter from bar before moving other pieces ({count} pieces on bar)"
  - [x] 3.3 Create `src/validation/validators/blocking.js`
    - Implement `validatePointBlocking(gameState, move, player)` function
    - Opponent detection: white pieces are positive, black pieces are negative
    - Blocked when `Math.abs(board[to]) >= 2` and sign indicates opponent
    - Error format: "Point {index} is blocked by {color} ({count} pieces)"
  - [x] 3.4 Create `src/validation/validators/blot.js`
    - Implement `detectBlotHit(gameState, move, player)` function
    - Blot detection: exactly 1 opponent piece (`board[to] === 1` or `-1` for opponent)
    - Return `hitInfo: {point: number, player: PlayerColor}` when blot detected
    - DO NOT mutate state - detection only
  - [x] 3.5 Create `src/validation/validators/bearoff.js`
    - Implement `validateBearingOff(gameState, move, player)` function
    - Check all player pieces in home board (white: 0-5, black: 18-23)
    - Read `gameState.tableOptions.allowBearOffOvershoot` (default: true for standard rules)
    - When overshoot disabled: exact roll required unless no pieces on higher points
    - Error format: "Cannot bear off: pieces exist outside home board (point {index})"
  - [x] 3.6 Update `src/validation/validators/index.js` with new exports
    - Add validateBarReentry, validatePointBlocking, detectBlotHit, validateBearingOff
  - [x] 3.7 Ensure board state validator tests pass
    - Run ONLY the 6-8 tests written in 3.1
    - Verify hitInfo is correctly structured when blot detected
    - Verify no state mutation occurs in any validator

**Acceptance Criteria:**
- The 6-8 tests written in 3.1 pass
- Bar re-entry is enforced before other moves
- Blot detection returns hitInfo without mutating state
- Bearing off respects tableOptions configuration

---

### Forced Move Calculator and Integration

#### Task Group 4: Forced Move Calculation and Main Validation Entry Point
**Dependencies:** Task Groups 1, 2, and 3

- [x] 4.0 Complete forced move calculation and integration
  - [x] 4.1 Write 6-8 focused tests for forced move and integration
    - Test forced move calculation finds all legal moves for simple position
    - Test forced move detects when more dice could be used
    - Test higher die rule enforcement (must use larger die if only one playable)
    - Test full tree search considers move sequences (move A enables/disables move B)
    - Test validateMove aggregates all validators correctly
    - Test validateMove returns combined errors from multiple failures
    - Test validateMove returns hitInfo when blot hit in valid move
    - Test validateMove returns forcedMoveInfo for legal moves
  - [x] 4.2 Create `src/validation/forced-moves.js`
    - Implement `calculateLegalMoves(gameState, remainingDice, player)` function
    - Generate all possible SingleMove objects for current position
    - Consider bar re-entry priority
    - Handle doubles (4 moves with same die value)
    - Return array of valid moves with die values
  - [x] 4.3 Implement move tree search in `src/validation/forced-moves.js`
    - Implement `buildMoveTree(gameState, remainingDice, player)` function
    - Recursively explore all move sequences (without mutating original state)
    - Track maximum dice that can be used in any sequence
    - Track whether larger die is playable when only one die works
    - Use temporary board copies for tree exploration
  - [x] 4.4 Implement `analyzeForcedMoves(gameState, movesPlayed, player)` function
    - Compare moves played against calculated legal moves
    - Return `forcedMoveInfo: {moreMovesAvailable, maxDiceUsable, diceUsed}`
    - Error format: "Forced move violation: {n} dice could be used but only {m} were used"
  - [x] 4.5 Create `src/validation/validate-move.js` as main entry point
    - Implement `validateMove(gameState, singleMove)` function
    - Run validators in order: turn, bar, direction, dice, blocking, blot, bearoff
    - Aggregate all errors using combineValidationResults
    - Include hitInfo when blot detected on valid move
    - Include forcedMoveInfo analysis
  - [x] 4.6 Implement `validateMoves(gameState, moves[])` for multi-move turns
    - Validate each move in sequence
    - Track remaining dice after each move
    - Simulate board state changes for subsequent move validation (without mutating original)
    - Return combined result with all errors and hit information
  - [x] 4.7 Update `src/validation/index.js` with final exports
    - Export validateMove, validateMoves as primary API
    - Export calculateLegalMoves, analyzeForcedMoves for advanced usage
  - [x] 4.8 Ensure forced move and integration tests pass
    - Run ONLY the 6-8 tests written in 4.1
    - Verify tree search correctly identifies all move sequences
    - Verify main entry point integrates all validators

**Acceptance Criteria:**
- The 6-8 tests written in 4.1 pass
- Forced move calculation performs full tree search
- Higher die rule is enforced when only one die playable
- Main validateMove function returns complete MoveValidationResult
- No state mutation occurs - all exploration uses temporary copies

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Core Types, Constants, and Result Pattern**
   - Establishes foundation types and utility functions
   - No dependencies on other validation code

2. **Task Group 2: Turn, Direction, and Dice Validators**
   - Simple validators with clear logic
   - Builds on existing codebase patterns from `src/moves/validation.js`

3. **Task Group 3: Bar, Blocking, Blot, and Bearing Off Validators**
   - Board-aware validators requiring game state analysis
   - Depends on core types and result patterns

4. **Task Group 4: Forced Move Calculation and Integration**
   - Most complex component with tree search algorithm
   - Integrates all previous validators into unified API
   - Depends on all other task groups

## File Structure

After completion, `src/validation/` should contain:

```
src/validation/
  index.js              # Module entry point and public API
  types.js              # JSDoc type definitions
  constants.js          # Validation constants and helpers
  result.js             # Result factory functions
  validate-move.js      # Main validation entry points
  forced-moves.js       # Forced move calculation and tree search
  validators/
    index.js            # Validator exports
    turn.js             # Turn validation
    direction.js        # Move direction validation
    dice.js             # Dice consumption validation
    bar.js              # Bar re-entry validation
    blocking.js         # Point blocking validation
    blot.js             # Blot hit detection
    bearoff.js          # Bearing off validation
```

## Notes

- All validators return `MoveValidationResult` objects following existing codebase patterns
- No state mutation - validators are pure functions
- Error messages follow specific formats defined in spec.md
- Table options read from `gameState.tableOptions` with sensible defaults
- Forced move tree search uses temporary board copies, never mutates original
- Integration with existing code via imports from `src/moves/constants.js` and `src/state/constants.js`
