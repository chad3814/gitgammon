# Spec Requirements: Table Initialization

## Initial Description

Create system for starting new tables:
- Create `tables/{id}/` directory
- Initial `state.json`
- Empty `moves/` directory
- Assign players
- First dice roll for starting player

Source: GitGammon Roadmap Item #8

## Requirements Discussion

### First Round Questions

**Q1:** What format should be used for table IDs?
**Answer:** Use descriptive slug format with human-readable identifiers (e.g., "alice-vs-bob-2026-01-23"). This aligns with GitGammon's philosophy of making everything transparent and auditable via Git history. Slugs should be lowercase, use hyphens as separators, and include player names for easy identification.

**Q2:** Should the system validate that the table ID doesn't already exist?
**Answer:** Yes, the initialization function must check if a table directory already exists and reject the creation with a clear error if so. This prevents accidental overwrites of in-progress games.

**Q3:** How should player assignment work - passed as parameters or configured elsewhere?
**Answer:** Players are passed as parameters to the initialization function. The function receives an object with `white` and `black` properties containing GitHub usernames. This matches the existing `createInitialState()` pattern in `src/state/initial.js`.

**Q4:** Should the starting player be determined by the existing `rollForStart()` function from the dice module?
**Answer:** Yes, use the existing `rollForStart()` function from `src/dice/initial-roll.js`. This function handles tie-breaking automatically and returns both the starting player and the dice values to use for the first turn.

**Q5:** Where should the table initialization module be located?
**Answer:** Create a new `src/table/` module for table operations. This follows the existing module organization pattern (`src/state/`, `src/dice/`, `src/validation/`, `src/moves/`).

**Q6:** Should the initialization create a Git commit, or just prepare the files?
**Answer:** The module should prepare the files and directory structure. The actual commit will be handled by the caller (GitHub Action workflow or CLI tool). This maintains separation of concerns and allows flexibility in how the initialization is triggered.

**Q7:** What validation should be performed on player usernames?
**Answer:** Validate that both player usernames are provided and are non-empty strings. GitHub username format validation (alphanumeric with hyphens, 1-39 characters) can be added but basic presence validation is required.

**Q8:** Is there anything that should explicitly NOT be included in this feature?
**Answer:** Out of scope: Challenge system UI, player invitation workflow, matchmaking, GitHub issue integration for challenges, match play configuration. This spec focuses only on the programmatic creation of a new table given valid parameters.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Initial State Creation - Path: `src/state/initial.js`
  - Contains `createInitialState()` function that generates the game state object
  - Uses `INITIAL_BOARD` constant for standard starting position
  - Pattern for player assignment and initial messages

- Feature: Dice Initial Roll - Path: `src/dice/initial-roll.js`
  - Contains `rollForStart()` function for determining starting player
  - Handles tie-breaking automatically
  - Returns starting player and dice values

- Feature: Game State Schema - Path: `src/state/schema/game-state.schema.json`
  - JSON Schema defining all required fields for state.json
  - Validation patterns to follow

- Feature: State Module Structure - Path: `src/state/`
  - Module organization pattern with index.js, constants.js, types.js
  - JSDoc annotation conventions
  - Export patterns to follow

### Follow-up Questions

No follow-up questions needed. The existing codebase provides clear patterns for implementation.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
Not applicable - this is a backend/data initialization feature with no UI components.

## Requirements Summary

### Functional Requirements

1. **Table Directory Creation**
   - Create `tables/{id}/` directory where `{id}` is a human-readable slug
   - Create empty `moves/` subdirectory within the table directory
   - Validate table ID format (lowercase, hyphens, alphanumeric)

2. **Initial State Generation**
   - Generate `state.json` using existing `createInitialState()` function
   - Include all required fields per `game-state.schema.json`:
     - turn: 1
     - activePlayer: determined by initial dice roll
     - dice: from initial roll result
     - diceUsed: empty array
     - board: standard starting position
     - bar: { white: 0, black: 0 }
     - home: { white: 0, black: 0 }
     - lastMove: null
     - status: "playing"
     - winner: null
     - players: { white: username, black: username }
     - messages: initial game start message
     - updatedAt: ISO 8601 timestamp

3. **Starting Player Determination**
   - Use `rollForStart()` from dice module
   - Higher die wins (ties re-rolled automatically)
   - Winner's die listed first in dice array
   - Starting player uses both dice for first move

4. **Collision Detection**
   - Check if table directory already exists before creation
   - Return clear error if table ID is already in use
   - Do not modify existing tables

5. **Player Validation**
   - Require both white and black player usernames
   - Reject empty or missing usernames
   - Usernames stored as-is (case-sensitive GitHub usernames)

### Reusability Opportunities

- Reuse `createInitialState()` from `src/state/initial.js` for state object creation
- Reuse `rollForStart()` from `src/dice/initial-roll.js` for starting player determination
- Reuse `INITIAL_BOARD` constant from `src/state/initial.js` for board setup
- Follow module structure pattern from `src/state/` and `src/dice/`
- Use existing JSDoc typing conventions and type imports

### Scope Boundaries

**In Scope:**
- `src/table/` module with table initialization functions
- `createTable()` main function for full table setup
- `generateTableId()` utility for creating slug-format IDs
- `validateTableId()` utility for ID format validation
- `tableExists()` utility to check for existing tables
- Unit tests for all new functions
- JSDoc type definitions

**Out of Scope:**
- Challenge system or invitation UI
- GitHub issue integration for starting games
- Match play or multi-game configuration
- Player matchmaking or discovery
- Git commit automation (handled by caller)
- CLI tool for table creation (separate spec)
- GitHub Action workflow for table creation (separate spec)

### Technical Considerations

1. **Module Location**: `src/table/` following existing conventions
   - `index.js` - main exports
   - `constants.js` - table-related constants
   - `types.js` - JSDoc type definitions
   - `create.js` - table creation logic
   - `validate.js` - validation utilities

2. **File System Operations**
   - Use Node.js `fs` module for directory/file operations
   - All paths should be relative to repository root
   - Handle both sync and async operations appropriately

3. **Integration Points**
   - Import from `src/state/` for initial state creation
   - Import from `src/dice/` for starting player roll
   - Exports should be consumable by GitHub Actions

4. **Error Handling**
   - Throw descriptive errors for validation failures
   - Return structured results for success/failure states
   - Errors should include actionable information

5. **Testing**
   - Unit tests for each function
   - Integration test for full table creation flow
   - Test collision detection behavior
   - Mock file system operations in unit tests
