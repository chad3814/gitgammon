# Task Breakdown: Table Initialization

## Overview
Total Tasks: 18 (across 4 task groups)

This spec creates a `src/table/` module for programmatically initializing new game tables with proper directory structure, initial game state, player assignment, and starting player determination via dice roll.

## Task List

### Foundation Layer

#### Task Group 1: Types, Constants, and Validation Utilities
**Dependencies:** None

- [x] 1.0 Complete table module foundation
  - [x] 1.1 Write 4-6 focused tests for validation utilities
    - Test `validateTableId()` accepts valid slugs like "alice-vs-bob-2026-01-23"
    - Test `validateTableId()` rejects uppercase characters
    - Test `validateTableId()` rejects special characters (underscore, spaces)
    - Test `validateTableId()` rejects empty strings
    - Test `generateTableId()` produces valid slug from player names and date
    - Test `generateTableId()` handles player names with uppercase
  - [x] 1.2 Create `src/table/types.js` with JSDoc type definitions
    - Define `TableCreationOptions` type: `{ white: string, black: string, tableId?: string, basePath?: string }`
    - Define `TableCreationResult` type: `{ success: boolean, tableId: string, tablePath: string, statePath: string }`
    - Define `TableValidationResult` type: `{ valid: boolean, error?: string }`
    - Follow documentation style from `src/state/types.js`
  - [x] 1.3 Create `src/table/constants.js` with table-specific constants
    - `TABLES_DIRECTORY = 'tables'`
    - `MOVES_DIRECTORY = 'moves'`
    - `STATE_FILENAME = 'state.json'`
    - `TABLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/`
    - `JSON_INDENT = 2` for formatted output
  - [x] 1.4 Create `src/table/validate.js` with validation utilities
    - Implement `validateTableId(tableId)` returning `{ valid, error? }`
    - Validate lowercase letters, numbers, and hyphens only
    - Reject empty strings with descriptive error
    - Reject patterns starting/ending with hyphens
  - [x] 1.5 Create `src/table/generate.js` with ID generation utilities
    - Implement `generateTableId(players, date?)` function
    - Format: `{player1}-vs-{player2}-{YYYY-MM-DD}`
    - Normalize usernames to lowercase
    - Use current date if not provided
    - Return valid slug conforming to TABLE_ID_PATTERN
  - [x] 1.6 Ensure foundation tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify exports are accessible

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- Validation rejects invalid table ID formats
- ID generator produces conformant slugs
- Constants match spec requirements

---

### File System Layer

#### Task Group 2: Directory Operations and Collision Detection
**Dependencies:** Task Group 1

- [x] 2.0 Complete file system operations
  - [x] 2.1 Write 4-6 focused tests for file system utilities
    - Test `tableExists()` returns false for non-existent table
    - Test `tableExists()` returns true for existing table directory
    - Test `createTableDirectory()` creates tables/{id}/ structure
    - Test `createTableDirectory()` creates moves/ subdirectory
    - Test `createTableDirectory()` throws on existing directory
    - Test cleanup removes partial state on failure
  - [x] 2.2 Create `src/table/filesystem.js` with directory operations
    - Import `fs` from Node.js (both sync and promises)
    - Import `path` from Node.js
    - Implement `tableExists(tableId, basePath?)` checking directory exists
    - Implement `getTablePath(tableId, basePath?)` returning full path
    - Implement `createTableDirectory(tableId, basePath?)` creating structure
    - Create `tables/{id}/` directory
    - Create `tables/{id}/moves/` subdirectory
    - Throw descriptive error if directory already exists
  - [x] 2.3 Add cleanup utility for partial state recovery
    - Implement `cleanupTableDirectory(tableId, basePath?)` for error recovery
    - Remove partially created directories on failure
    - Handle case where directory doesn't exist gracefully
  - [x] 2.4 Ensure file system tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Use temporary directories for testing
    - Verify cleanup after test completion

**Acceptance Criteria:**
- The 4-6 tests written in 2.1 pass
- Directory structure matches spec requirements
- Collision detection prevents overwrites
- Cleanup handles partial failures gracefully

---

### State Generation Layer

#### Task Group 3: Table Creation and State Generation
**Dependencies:** Task Groups 1 and 2

- [x] 3.0 Complete table creation functionality
  - [x] 3.1 Write 6-8 focused tests for table creation
    - Test `validatePlayers()` rejects missing white player
    - Test `validatePlayers()` rejects missing black player
    - Test `validatePlayers()` rejects empty string usernames
    - Test `createTable()` generates valid state.json
    - Test `createTable()` calls rollForStart for dice
    - Test `createTable()` writes formatted JSON (2-space indent)
    - Test `createTable()` returns success result with paths
    - Test `createTable()` cleans up on failure
  - [x] 3.2 Create `src/table/players.js` with player validation
    - Implement `validatePlayers(players)` function
    - Validate both `white` and `black` properties exist
    - Validate usernames are non-empty strings
    - Return `{ valid, error? }` structure
    - Store usernames case-sensitively
  - [x] 3.3 Create `src/table/create.js` with main creation logic
    - Import `createInitialState` from `src/state/initial.js`
    - Import `rollForStart` from `src/dice/initial-roll.js`
    - Import validation and filesystem utilities
    - Implement `createTable(options)` main function
      - Validate players using `validatePlayers()`
      - Generate or validate tableId
      - Check for existing table using `tableExists()`
      - Create directory structure
      - Roll for starting player using `rollForStart()`
      - Generate initial state using `createInitialState(players, dice)`
      - Write state.json with 2-space indentation
      - Return `TableCreationResult` on success
    - Implement cleanup on any failure
  - [x] 3.4 Ensure table creation tests pass
    - Run ONLY the 6-8 tests written in 3.1
    - Mock file system operations where appropriate
    - Verify integration with dice and state modules

**Acceptance Criteria:**
- The 6-8 tests written in 3.1 pass
- Player validation catches all invalid inputs
- State generation uses existing module functions
- Cleanup recovers from partial failures

---

### Integration Layer

#### Task Group 4: Module Integration and Entry Point
**Dependencies:** Task Groups 1, 2, and 3

- [x] 4.0 Complete module integration
  - [x] 4.1 Write 4-6 focused tests for module integration
    - Test all public functions exported from `src/table/index.js`
    - Test end-to-end: createTable with valid inputs produces complete table
    - Test integration: generated state passes schema validation
    - Test no circular dependencies
    - Test result paths are correct relative to basePath
  - [x] 4.2 Create `src/table/index.js` as module entry point
    - Export types from types.js
    - Export `validateTableId`, `tableExists` from validate.js
    - Export `generateTableId` from generate.js
    - Export `createTable` from create.js
    - Export constants from constants.js
    - Add module JSDoc header following dice/state pattern
  - [x] 4.3 Ensure all tests pass
    - Run ONLY tests in `tests/table/` directory
    - Verify module works end-to-end
    - Confirm integration with existing modules

**Acceptance Criteria:**
- The 4-6 tests written in 4.1 pass
- All public API functions exported
- Module is usable as single import point
- Generated state validates against schema
- No circular dependencies

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Foundation Layer**
   - Types, constants, and validation utilities
   - ID generation for slug format
   - No dependencies on other groups

2. **Task Group 2: File System Layer**
   - Depends on constants from Group 1
   - Directory creation and collision detection
   - Cleanup utilities for error recovery

3. **Task Group 3: State Generation Layer**
   - Depends on Groups 1 and 2
   - Integrates with dice and state modules
   - Main createTable function

4. **Task Group 4: Module Integration**
   - Depends on all other groups
   - Exposes public API
   - Final integration testing

## File Structure

After completion, `src/table/` should contain:

```
src/table/
  index.js              # Module entry point and public API
  types.js              # JSDoc type definitions
  constants.js          # Table-specific constants
  validate.js           # Table ID validation
  generate.js           # Table ID generation from players
  players.js            # Player validation utilities
  filesystem.js         # Directory operations
  create.js             # Main table creation logic
```

## Notes

- Uses existing `createInitialState()` from state module
- Uses existing `rollForStart()` from dice module
- All paths relative to repository root (or provided basePath)
- JSON formatted with 2-space indentation for Git readability
- No Git commit automation - handled by caller (GitHub Action/CLI)
- Cleanup ensures no partial state left on errors
- Module runs in Node.js environment (GitHub Actions)
