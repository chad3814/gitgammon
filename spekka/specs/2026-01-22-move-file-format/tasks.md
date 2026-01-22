# Task Breakdown: Move File Format

## Overview
Total Tasks: 34
Estimated Total Effort: M-L (following existing `src/state/` patterns closely)

## Task List

### Foundation Layer

#### Task Group 1: Constants and Type Definitions
**Dependencies:** None
**Effort:** S

- [x] 1.0 Complete constants and type definitions
  - [x] 1.1 Write 4 focused tests for constants and type guards
    - Test `PLAYER_COLORS` constant value and immutability
    - Test `isValidPlayer()` with valid/invalid inputs
    - Test point range constants (BAR, BEAR_OFF, board bounds)
    - Test filename regex pattern matching
  - [x] 1.2 Create `src/moves/constants.js` with move-specific constants
    - `PLAYER_COLORS` - reuse pattern from `src/state/constants.js`
    - `BAR_POSITION = -1` - bar re-entry source
    - `BEAR_OFF_POSITION = 24` - bear-off destination
    - `MIN_BOARD_POINT = 0`, `MAX_BOARD_POINT = 23`
    - `MIN_DIE_VALUE = 1`, `MAX_DIE_VALUE = 6`
    - `MAX_MOVES_PER_TURN = 4` - doubles limit
    - `MAX_COMMENT_LENGTH = 280`
    - `EXPECTED_STATE_HASH_LENGTH = 16`
    - `COMMIT_SHA_LENGTH = 40`
    - `FILENAME_SHA_LENGTH = 6`
    - `SEQUENCE_DIGITS = 4`
    - `FILENAME_PATTERN` - regex for filename validation
    - Type guard functions: `isValidPlayer()`, `isValidDieValue()`, `isValidPoint()`
  - [x] 1.3 Create `src/moves/types.js` with JSDoc type definitions
    - `@typedef SingleMove` with `{from, to, die}` structure
    - `@typedef MoveFile` with all 7 required fields
    - `@typedef FilenameComponents` with `{sequence, player, sha}`
    - `@typedef MoveValidationResult` with `{valid, errors}`
    - Follow documentation style from `src/state/types.js`
  - [x] 1.4 Ensure constants tests pass
    - Run ONLY the 4 tests written in 1.1
    - Verify type guards return correct boolean values

**Acceptance Criteria:**
- The 4 tests written in 1.1 pass
- Constants match spec values exactly
- Type guards correctly validate inputs
- JSDoc types are well-documented

---

### Schema Layer

#### Task Group 2: JSON Schema Definition
**Dependencies:** Task Group 1
**Effort:** S

- [x] 2.0 Complete JSON schema
  - [x] 2.1 Write 4 focused tests for schema validation
    - Test valid move file passes schema
    - Test missing required field fails
    - Test invalid `expectedState` pattern (not 16 hex chars) fails
    - Test `moves` array bounds (0 items, 5 items) fail
  - [x] 2.2 Create `src/moves/schema/move.schema.json`
    - Use JSON Schema draft 2020-12 (match `src/state/schema/game-state.schema.json`)
    - Define `$id`: `https://gitgammon.github.io/schemas/move.json`
    - Include all 7 required properties from spec
    - Define `$defs/SingleMove` with `from`, `to`, `die` constraints
    - Add `additionalProperties: false` for strictness
    - Add proper regex patterns for `expectedState`, `commitSha`
  - [x] 2.3 Create `src/moves/schema/index.js` for schema export
    - Export schema with JSON import (match `src/state/schema/index.js` pattern)
    - Export `getMoveSchema()` function for programmatic access
  - [x] 2.4 Ensure schema tests pass
    - Run ONLY the 4 tests written in 2.1
    - Verify schema matches spec exactly

**Acceptance Criteria:**
- The 4 tests written in 2.1 pass
- Schema validates all example moves from spec
- Schema rejects invalid structures
- Follows existing schema organization pattern

---

### Utility Layer

#### Task Group 3: Filename Utilities
**Dependencies:** Task Group 1
**Effort:** S

- [x] 3.0 Complete filename utilities
  - [x] 3.1 Write 5 focused tests for filename functions
    - Test `parseFilename()` extracts correct components from valid filename
    - Test `parseFilename()` returns null for invalid format
    - Test `createFilename()` generates correct format with padding
    - Test `validateFilename()` returns valid for correct format
    - Test filename regex matches/rejects edge cases
  - [x] 3.2 Create `src/moves/filename.js`
    - `parseFilename(filename)` - extract `{sequence, player, sha}` or null
    - `createFilename(sequence, player, sha)` - build filename string
    - `validateFilename(filename)` - return `{valid, errors}`
    - `padSequence(num)` - zero-pad to 4 digits
    - Use `FILENAME_PATTERN` regex from constants
  - [x] 3.3 Ensure filename tests pass
    - Run ONLY the 5 tests written in 3.1
    - Test edge cases: sequence 1, 9999, invalid player

**Acceptance Criteria:**
- The 5 tests written in 3.1 pass
- Parse and create are inverse operations
- Validation catches all format errors
- Handles edge cases (sequence boundaries)

---

#### Task Group 4: State Hash Utility
**Dependencies:** Task Group 1
**Effort:** S

- [x] 4.0 Complete state hash utility
  - [x] 4.1 Write 3 focused tests for hash function
    - Test `computeStateHash()` returns 16-char lowercase hex string
    - Test same input produces same hash (deterministic)
    - Test different inputs produce different hashes
  - [x] 4.2 Create `src/moves/hash.js`
    - `computeStateHash(stateJson)` - compute SHA-256, truncate to 16 chars
    - Use Node.js built-in `crypto` module
    - Ensure consistent JSON serialization (sorted keys or canonical form)
    - Return lowercase hexadecimal string
  - [x] 4.3 Ensure hash tests pass
    - Run ONLY the 3 tests written in 4.1
    - Verify hash format matches `expectedState` pattern

**Acceptance Criteria:**
- The 3 tests written in 4.1 pass
- Hash is deterministic for same input
- Hash format matches schema pattern `^[a-f0-9]{16}$`
- Uses standard SHA-256 algorithm

---

### Factory Layer

#### Task Group 5: Move File Factory
**Dependencies:** Task Groups 1, 3, 4
**Effort:** M

- [x] 5.0 Complete move file factory
  - [x] 5.1 Write 4 focused tests for factory function
    - Test `createMoveFile()` returns valid structure with all fields
    - Test timestamp is valid ISO 8601 format
    - Test `commitSha` defaults to null
    - Test generated filename matches expected format
  - [x] 5.2 Create `src/moves/create.js`
    - `createMoveFile(options)` - build complete move file object
      - Input: `{player, moves, diceRoll, expectedState, comment?, sequence}`
      - Auto-generate timestamp if not provided
      - Set `commitSha` to null (populated later by Action)
    - `createSingleMove(from, to, die)` - helper for move objects
    - `generateFileSha(moveFile)` - create 6-char SHA for filename
  - [x] 5.3 Ensure factory tests pass
    - Run ONLY the 4 tests written in 5.1
    - Verify all required fields are present

**Acceptance Criteria:**
- The 4 tests written in 5.1 pass
- Factory produces schema-valid objects
- All required fields populated correctly
- Filename SHA derived from move content

---

### Validation Layer

#### Task Group 6: Schema Validation
**Dependencies:** Task Groups 2, 5
**Effort:** M

- [x] 6.0 Complete schema validation
  - [x] 6.1 Write 4 focused tests for validation function
    - Test valid move file passes validation
    - Test validation returns detailed error messages for failures
    - Test `validateSchema()` catches type errors
    - Test `validateMoveFile()` combines schema + business rules
  - [x] 6.2 Create `src/moves/validation.js`
    - Initialize AJV validator (match `src/state/validation.js` pattern)
    - `validateSchema(moveFile)` - JSON schema validation only
    - `validateFilenameMatch(filename, moveFile)` - player/sequence consistency
    - `validateDiceUsage(moveFile)` - dice values used match diceRoll
    - `validateMoveFile(moveFile, filename?)` - combined validation
    - Return `{valid, errors}` result objects
  - [x] 6.3 Ensure validation tests pass
    - Run ONLY the 4 tests written in 6.1
    - Verify error messages are descriptive

**Acceptance Criteria:**
- The 4 tests written in 6.1 pass
- Schema validation catches all structural errors
- Business rule validation enforces spec constraints
- Error messages aid debugging

---

### Examples Layer

#### Task Group 7: Example Move Files
**Dependencies:** Task Groups 5, 6
**Effort:** S

- [x] 7.0 Complete example move files
  - [x] 7.1 Write 2 focused tests for examples
    - Test all example files pass schema validation
    - Test example loader functions return correct structure
  - [x] 7.2 Create example move files in `src/moves/examples/`
    - `0001-white-f7e2a9.json` - opening move (from spec)
    - `0015-black-c4d5e6.json` - mid-game with comment (from spec)
    - `0023-white-b5c6d7.json` - bar entry (from spec)
    - `0047-white-e8f9a0.json` - bearing off doubles (from spec)
  - [x] 7.3 Create `src/moves/examples/index.js`
    - Export loader functions for each example
    - `getOpeningMoveExample()`, `getMidGameMoveExample()`, etc.
    - `getAllMoveExamples()` - return array of all examples
    - Follow pattern from `src/state/examples/index.js`
  - [x] 7.4 Ensure example tests pass
    - Run ONLY the 2 tests written in 7.1
    - Verify examples match spec exactly

**Acceptance Criteria:**
- The 2 tests written in 7.1 pass
- All examples from spec are included
- Examples demonstrate all special cases (bar, bear-off, doubles)
- Loader functions work correctly

---

### Integration Layer

#### Task Group 8: Module Index
**Dependencies:** Task Groups 1-7
**Effort:** XS

- [x] 8.0 Complete module integration
  - [x] 8.1 Write 2 focused tests for module exports
    - Test all public functions are exported from `src/moves/index.js`
    - Test imports work correctly in consuming code
  - [x] 8.2 Create `src/moves/index.js`
    - Export schema: `moveSchema`, `getMoveSchema`
    - Export constants: all constants and type guards
    - Export filename utilities: `parseFilename`, `createFilename`, `validateFilename`
    - Export hash utility: `computeStateHash`
    - Export factory: `createMoveFile`, `createSingleMove`
    - Export validation: `validateSchema`, `validateMoveFile`
    - Export examples: all example loaders
    - Follow export pattern from `src/state/index.js`
  - [x] 8.3 Ensure module tests pass
    - Run ONLY the 2 tests written in 8.1
    - Verify clean import/export interface

**Acceptance Criteria:**
- The 2 tests written in 8.1 pass
- All public API functions exported
- Module is usable as single import point
- No circular dependencies

---

### Testing Layer

#### Task Group 9: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-8
**Effort:** S

- [x] 9.0 Review existing tests and fill critical gaps only
  - [x] 9.1 Review tests from Task Groups 1-8
    - Review the 4 tests from Task Group 1 (constants)
    - Review the 4 tests from Task Group 2 (schema)
    - Review the 5 tests from Task Group 3 (filename)
    - Review the 3 tests from Task Group 4 (hash)
    - Review the 4 tests from Task Group 5 (factory)
    - Review the 4 tests from Task Group 6 (validation)
    - Review the 2 tests from Task Group 7 (examples)
    - Review the 2 tests from Task Group 8 (module)
    - Total existing tests: approximately 28 tests
  - [x] 9.2 Analyze test coverage gaps for move file format only
    - Identify critical workflows that lack test coverage
    - Focus ONLY on move file format feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
  - [x] 9.3 Write up to 6 additional strategic tests maximum
    - Integration test: full workflow from create to validate
    - Edge case: maximum sequence number (9999)
    - Edge case: all 4 moves with doubles
    - Edge case: comment at exactly 280 characters
    - Edge case: whitespace handling in comment field
    - Consistency test: filename SHA matches content hash
  - [x] 9.4 Run feature-specific tests only
    - Run ONLY tests in `tests/moves/` directory
    - Expected total: approximately 34 tests maximum
    - Do NOT run the entire application test suite
    - Verify all move file format features work correctly

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 34 tests total)
- Critical move file workflows are covered
- No more than 6 additional tests added
- Testing focused exclusively on move file format requirements

---

## Execution Order

Recommended implementation sequence:

1. **Foundation Layer** (Task Group 1)
   - Constants and types establish shared vocabulary
   - No dependencies, enables all other groups

2. **Schema Layer** (Task Group 2)
   - JSON schema defines structure contract
   - Depends on constants for values

3. **Utility Layer** (Task Groups 3-4, parallel)
   - Filename and hash utilities are independent
   - Both depend only on constants
   - Can be developed in parallel

4. **Factory Layer** (Task Group 5)
   - Depends on filename (for SHA) and hash utilities
   - Creates move file objects

5. **Validation Layer** (Task Group 6)
   - Depends on schema and factory
   - Validates created objects

6. **Examples Layer** (Task Group 7)
   - Depends on factory and validation
   - Demonstrates correct usage

7. **Integration Layer** (Task Group 8)
   - Depends on all previous groups
   - Exposes public API

8. **Testing Layer** (Task Group 9)
   - Final review and gap analysis
   - Ensures complete coverage

---

## File Summary

| File Path | Task Group | Purpose |
|-----------|------------|---------|
| `src/moves/constants.js` | 1 | Move-specific constants and type guards |
| `src/moves/types.js` | 1 | JSDoc type definitions |
| `src/moves/schema/move.schema.json` | 2 | JSON Schema definition |
| `src/moves/schema/index.js` | 2 | Schema exports |
| `src/moves/filename.js` | 3 | Filename parse/create/validate |
| `src/moves/hash.js` | 4 | State hash computation |
| `src/moves/create.js` | 5 | Move file factory functions |
| `src/moves/validation.js` | 6 | Validation functions |
| `src/moves/examples/*.json` | 7 | Example move files |
| `src/moves/examples/index.js` | 7 | Example loaders |
| `src/moves/index.js` | 8 | Main module entry point |
| `tests/moves/*.test.js` | 1-9 | Test files |

---

## Dependencies Graph

```
Task Group 1 (Constants/Types)
     |
     v
Task Group 2 (Schema)
     |
     +-------+-------+
     |               |
     v               v
Task Group 3    Task Group 4
(Filename)        (Hash)
     |               |
     +-------+-------+
             |
             v
     Task Group 5 (Factory)
             |
             v
     Task Group 6 (Validation)
             |
             v
     Task Group 7 (Examples)
             |
             v
     Task Group 8 (Module Index)
             |
             v
     Task Group 9 (Test Review)
```

---

## Implementation Summary

**Completed:** 2026-01-22

**Files Created:**
- `src/moves/constants.js` - Constants and type guards
- `src/moves/types.js` - JSDoc type definitions
- `src/moves/schema/move.schema.json` - JSON Schema
- `src/moves/schema/index.js` - Schema exports
- `src/moves/filename.js` - Filename utilities
- `src/moves/hash.js` - State hash utility
- `src/moves/create.js` - Move file factory
- `src/moves/validation.js` - Validation functions
- `src/moves/examples/0001-white-f7e2a9.json` - Opening move example
- `src/moves/examples/0015-black-c4d5e6.json` - Mid-game example
- `src/moves/examples/0023-white-b5c6d7.json` - Bar entry example
- `src/moves/examples/0047-white-e8f9a0.json` - Bearing off example
- `src/moves/examples/index.js` - Example loaders
- `src/moves/index.js` - Module entry point

**Test Files Created:**
- `tests/moves/constants.test.js` - 18 tests
- `tests/moves/schema.test.js` - 19 tests
- `tests/moves/filename.test.js` - 11 tests
- `tests/moves/hash.test.js` - 7 tests
- `tests/moves/create.test.js` - 13 tests
- `tests/moves/validation.test.js` - 20 tests
- `tests/moves/examples.test.js` - 8 tests
- `tests/moves/index.test.js` - 4 tests
- `tests/moves/integration.test.js` - 13 tests

**Total Tests:** 113 tests in `tests/moves/` directory
**Total Project Tests:** 258 tests (all passing)
