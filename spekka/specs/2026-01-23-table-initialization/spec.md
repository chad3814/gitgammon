# Specification: Table Initialization

## Goal
Create a programmatic system for initializing new game tables with proper directory structure, initial game state, player assignment, and starting player determination via dice roll.

## User Stories
- As the game engine, I want to create table directories with consistent structure so that all games follow the same data organization pattern
- As a developer integrating GitGammon, I want a simple function to initialize tables so I can trigger game creation from GitHub Actions or CLI tools

## Specific Requirements

**Table Directory Creation**
- Create `tables/{id}/` directory where `{id}` is a human-readable slug format
- Create empty `moves/` subdirectory within the table directory for future move files
- Directory path relative to repository root
- Use Node.js `fs` module for file system operations
- Handle both sync and async operations appropriately

**Table ID Format and Validation**
- Use descriptive slug format: `{player1}-vs-{player2}-{date}` (e.g., "alice-vs-bob-2026-01-23")
- Lowercase letters, numbers, and hyphens only
- Validate format before creation with `validateTableId()` utility
- Provide `generateTableId(players)` utility for creating conformant IDs
- Reject invalid formats with descriptive error messages

**Collision Detection**
- Check if table directory already exists before creation using `tableExists()` utility
- Return clear error if table ID is already in use
- Do not modify or overwrite existing tables
- Prevent accidental overwrites of in-progress games

**Initial State Generation**
- Generate `state.json` using existing `createInitialState()` from `src/state/initial.js`
- Pass `rollForStart()` result dice to `createInitialState()`
- State includes all required fields per `game-state.schema.json`
- Write state as formatted JSON (2-space indentation) for Git readability

**Starting Player Determination**
- Use existing `rollForStart()` function from `src/dice/initial-roll.js`
- Higher die wins, ties re-rolled automatically
- Winner's die listed first in dice array
- Starting player uses both dice for first move

**Player Validation**
- Require both `white` and `black` player usernames as input parameters
- Reject empty, null, or missing usernames with descriptive errors
- Store usernames case-sensitively (GitHub usernames)
- Follow existing `Players` type definition from `src/state/types.js`

**Module Organization**
- Create new `src/table/` module following existing conventions
- `index.js` - main exports
- `constants.js` - table-related constants (ID patterns, directory names)
- `types.js` - JSDoc type definitions for table operations
- `create.js` - main `createTable()` function
- `validate.js` - validation utilities (`validateTableId()`, `tableExists()`)

**Error Handling**
- Throw descriptive errors for validation failures
- Include actionable information in error messages
- Return structured results indicating success/failure
- Clean up partial state if creation fails midway

## Existing Code to Leverage

**src/state/initial.js**
- Contains `createInitialState(players, dice)` function for generating game state
- Uses `INITIAL_BOARD` constant for standard starting position
- Pattern for player assignment and initial message generation
- Reuse directly - call with players and dice from `rollForStart()`

**src/dice/initial-roll.js**
- Contains `rollForStart()` function returning `{ startingPlayer, dice }`
- Handles tie-breaking automatically with re-rolls
- Returns dice ordered high-to-low (winner's die first)
- Reuse directly - no modification needed

**src/state/schema/game-state.schema.json**
- JSON Schema defining all required fields for state.json
- Validation patterns for dice, board, players, messages
- Use for validating generated state before writing

**src/dice/index.js and src/state/index.js**
- Export patterns and module organization to follow
- JSDoc annotation conventions
- Re-export pattern for public API surface

## Out of Scope
- Challenge system or invitation UI for starting games
- GitHub issue integration for game challenges
- Match play or multi-game series configuration
- Player matchmaking or discovery features
- Git commit automation (handled by caller/GitHub Action)
- CLI tool for table creation (separate spec)
- GitHub Action workflow for table creation (separate spec)
- Spectator or observer assignment
- Table metadata beyond required state fields
- Table deletion or archival functionality
