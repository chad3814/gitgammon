# Task Breakdown: Game State Schema

## Overview
Total Tasks: 16
Estimated Total Effort: S-M (2-4 hours)

## Task List

### Schema Layer

#### Task Group 1: JSON Schema Definition
**Dependencies:** None
**Effort:** S (30-45 min)

- [x] 1.0 Complete JSON Schema definition
  - [x] 1.1 Write 4 focused tests for schema validation
    - Test valid initial game state passes schema
    - Test valid mid-game state passes schema
    - Test invalid state (missing required field) fails
    - Test invalid state (wrong type) fails
  - [x] 1.2 Create JSON Schema file at `src/state/schema/game-state.schema.json`
    - Copy complete schema from spec.md (lines 103-291)
    - Ensure $id reflects actual deployment URL pattern
    - Include all 13 required properties with constraints
  - [x] 1.3 Create schema index for exports at `src/state/schema/index.js`
    - Export schema as ES module
    - Include helper to load schema for validation libraries
  - [x] 1.4 Ensure schema tests pass
    - Run ONLY the 4 tests written in 1.1
    - Verify schema correctly validates/rejects states

**Acceptance Criteria:**
- Schema file matches spec exactly
- Valid states pass validation
- Invalid states are rejected with meaningful errors
- Schema exportable as ES module

---

### Type Definitions Layer

#### Task Group 2: JSDoc Type Definitions
**Dependencies:** Task Group 1
**Effort:** S (20-30 min)

- [x] 2.0 Complete JSDoc type definitions
  - [x] 2.1 Write 3 focused tests for type checking
    - Test that createInitialState returns correct shape
    - Test that type guards work correctly (isValidPlayer, isValidStatus)
    - Test that constants match expected types
  - [x] 2.2 Create type definitions file at `src/state/types.js`
    - Define `@typedef {Object} GameState` with all 13 fields
    - Define `@typedef {Object} Message` for messages array items
    - Define `@typedef {Object} LastMove` for lastMove structure
    - Define `@typedef {Object} PlayerPieces` for bar/home objects
    - Define `@typedef {Object} Players` for player mapping
    - Use `@enum` for status and player color constants
  - [x] 2.3 Create type guards and constants at `src/state/constants.js`
    - Export `PLAYER_COLORS` as frozen array `['white', 'black']`
    - Export `GAME_STATUSES` as frozen array `['playing', 'completed']`
    - Export `MESSAGE_TYPES` as frozen array `['error', 'info', 'warning']`
    - Create `isValidPlayer(color)` type guard
    - Create `isValidStatus(status)` type guard
  - [x] 2.4 Ensure type definition tests pass
    - Run ONLY the 3 tests written in 2.1
    - Verify TypeScript check-only mode passes

**Acceptance Criteria:**
- All types documented with JSDoc
- TypeScript can infer types from JSDoc
- Type guards correctly validate inputs
- Constants are immutable

---

### Initial State Layer

#### Task Group 3: Initial Board State
**Dependencies:** Task Group 2
**Effort:** S (20-30 min)

- [x] 3.0 Complete initial board state implementation
  - [x] 3.1 Write 4 focused tests for initial state
    - Test INITIAL_BOARD has exactly 24 elements
    - Test white pieces sum to 15 on initial board
    - Test black pieces sum to 15 on initial board
    - Test createInitialState returns valid GameState structure
  - [x] 3.2 Create initial state module at `src/state/initial.js`
    - Export `INITIAL_BOARD` constant (24-element array from spec)
      - `[2, 0, 0, 0, 0, -5, 0, -3, 0, 0, 0, 5, -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2]`
    - Export `createInitialState(players, dice)` factory function
      - Parameters: `players: {white: string, black: string}`, `dice: number[]`
      - Returns complete GameState with initial values
      - Sets `updatedAt` to current ISO timestamp
      - Adds "Game started" info message
  - [x] 3.3 Ensure initial state tests pass
    - Run ONLY the 4 tests written in 3.1
    - Verify piece count invariant holds

**Acceptance Criteria:**
- INITIAL_BOARD matches standard backgammon setup
- createInitialState produces schema-valid states
- Piece count invariant: board + bar + home = 15 per color

---

### Validation Utilities Layer

#### Task Group 4: Validation Functions
**Dependencies:** Task Groups 1, 2, 3
**Effort:** M (45-60 min)

- [x] 4.0 Complete validation utility functions
  - [x] 4.1 Write 6 focused tests for validation functions
    - Test validatePieceCount passes for valid state
    - Test validatePieceCount fails when pieces missing
    - Test validateDiceConsistency passes when diceUsed subset of dice
    - Test validateDiceConsistency fails when invalid dice used
    - Test validateStatusWinner passes for consistent states
    - Test validateStatusWinner fails for inconsistent states
  - [x] 4.2 Create validation module at `src/state/validation.js`
    - `validateSchema(state)` - validate against JSON schema
    - `validatePieceCount(state)` - verify 15 pieces per color invariant
    - `validateDiceConsistency(state)` - verify diceUsed is subset of dice
    - `validateStatusWinner(state)` - verify status/winner consistency
    - `validateState(state)` - run all validations, return result object
  - [x] 4.3 Create validation result types
    - Return `{valid: boolean, errors: string[]}` from validators
    - Collect all errors rather than fail-fast for better debugging
  - [x] 4.4 Ensure validation tests pass
    - Run ONLY the 6 tests written in 4.1
    - Verify all validation rules from spec are enforced

**Acceptance Criteria:**
- All spec validation rules implemented
- Validators return structured error information
- Piece count invariant enforced
- Dice consistency enforced
- Status/winner consistency enforced

---

### Example States Layer

#### Task Group 5: Example State Files
**Dependencies:** Task Groups 3, 4
**Effort:** XS (15-20 min)

- [x] 5.0 Complete example state files
  - [x] 5.1 Write 3 focused tests for example states
    - Test initial-state.json passes schema validation
    - Test mid-game-state.json passes schema validation
    - Test completed-game-state.json passes schema validation
  - [x] 5.2 Create example states directory at `src/state/examples/`
    - Create `initial-state.json` - fresh game from spec (lines 298-328)
    - Create `mid-game-state.json` - turn 12 example from spec (lines 346-386)
    - Create `completed-game-state.json` - game with winner declared
  - [x] 5.3 Create example loader at `src/state/examples/index.js`
    - Export functions to load each example state
    - Useful for testing and documentation
  - [x] 5.4 Ensure example state tests pass
    - Run ONLY the 3 tests written in 5.1
    - Verify all examples are schema-valid

**Acceptance Criteria:**
- All example states match spec examples
- All examples pass schema validation
- Examples demonstrate different game phases

---

### Module Integration Layer

#### Task Group 6: Module Exports and Integration
**Dependencies:** Task Groups 1-5
**Effort:** XS (10-15 min)

- [x] 6.0 Complete module integration
  - [x] 6.1 Write 2 focused tests for module exports
    - Test all expected exports are available from main index
    - Test re-exported types work correctly
  - [x] 6.2 Create main module index at `src/state/index.js`
    - Re-export schema from `./schema/index.js`
    - Re-export types and constants from `./types.js` and `./constants.js`
    - Re-export initial state from `./initial.js`
    - Re-export validation functions from `./validation.js`
  - [x] 6.3 Ensure module integration tests pass
    - Run ONLY the 2 tests written in 6.1
    - Verify clean public API

**Acceptance Criteria:**
- Single entry point for all state-related functionality
- Clean public API with logical groupings
- No circular dependencies

---

### Testing

#### Task Group 7: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-6
**Effort:** S (20-30 min)

- [x] 7.0 Review existing tests and fill critical gaps only
  - [x] 7.1 Review tests from Task Groups 1-6
    - Review 4 schema tests (Task 1.1)
    - Review 3 type definition tests (Task 2.1)
    - Review 4 initial state tests (Task 3.1)
    - Review 6 validation tests (Task 4.1)
    - Review 3 example state tests (Task 5.1)
    - Review 2 module export tests (Task 6.1)
    - Total existing tests: 22 tests
  - [x] 7.2 Analyze test coverage gaps for this feature only
    - Identify any critical validation rules without tests
    - Check edge cases: doubles handling, empty diceUsed, null lastMove
    - Verify message array validation coverage
  - [x] 7.3 Write up to 8 additional strategic tests if needed
    - Focus on integration between validation functions
    - Test edge cases identified in 7.2
    - Test error message quality for debugging
  - [x] 7.4 Run all feature-specific tests
    - Run all tests related to game state schema
    - Expected total: approximately 22-30 tests
    - Verify all tests pass

**Acceptance Criteria:**
- All 22+ feature-specific tests pass
- Critical validation rules have test coverage
- Edge cases from spec are tested
- No more than 8 additional tests added

---

## Execution Order

Recommended implementation sequence:

1. **Schema Layer (Task Group 1)** - Foundation for all validation
2. **Type Definitions (Task Group 2)** - JSDoc types for IDE support
3. **Initial State (Task Group 3)** - Starting point for games
4. **Validation Utilities (Task Group 4)** - Runtime validation
5. **Example States (Task Group 5)** - Test fixtures and documentation
6. **Module Integration (Task Group 6)** - Clean public API
7. **Test Review (Task Group 7)** - Quality assurance

---

## File Structure Summary

```
src/
  state/
    index.js                    # Main module exports
    types.js                    # JSDoc type definitions
    constants.js                # Constants and type guards
    initial.js                  # INITIAL_BOARD and createInitialState
    validation.js               # Validation utility functions
    schema/
      index.js                  # Schema exports
      game-state.schema.json    # JSON Schema definition
    examples/
      index.js                  # Example state loaders
      initial-state.json        # Fresh game example
      mid-game-state.json       # Turn 12 example
      completed-game-state.json # Finished game example

tests/
  state/
    schema.test.js              # Task Group 1 tests
    types.test.js               # Task Group 2 tests
    initial.test.js             # Task Group 3 tests
    validation.test.js          # Task Group 4 tests
    examples.test.js            # Task Group 5 tests
    index.test.js               # Task Group 6 tests
    gaps.test.js                # Task Group 7 tests (edge cases)
```

---

## Effort Summary

| Task Group | Description | Effort | Tests |
|------------|-------------|--------|-------|
| 1 | JSON Schema Definition | S | 4 |
| 2 | JSDoc Type Definitions | S | 8 |
| 3 | Initial Board State | S | 12 |
| 4 | Validation Functions | M | 13 |
| 5 | Example State Files | XS | 8 |
| 6 | Module Integration | XS | 7 |
| 7 | Test Review & Gaps | S | 12 |
| **Total** | | **S-M** | **64** |

**Effort Key:** XS (<15 min), S (15-45 min), M (45-90 min), L (90+ min)
