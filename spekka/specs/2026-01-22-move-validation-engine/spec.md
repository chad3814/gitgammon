# Specification: Move Validation Engine

## Goal
Create a pure JavaScript validation module that validates proposed backgammon moves against game state, returning detailed validation results without mutating state.

## User Stories
- As a player, I want clear error messages when my move is invalid so I can understand what went wrong and correct it
- As the game engine, I need to validate moves according to standard backgammon rules before applying them to ensure game integrity

## Specific Requirements

**ValidationResult Return Pattern**
- Return `{valid: boolean, errors: string[]}` structure matching existing codebase pattern
- Include optional `hitInfo` property when a blot is hit: `{point: number, player: PlayerColor}`
- Include optional `forcedMoveInfo` property with analysis of whether more moves were possible
- Empty errors array when valid is true
- Multiple errors collected when multiple validation failures occur

**Turn Validation**
- Verify that the move's player matches `gameState.activePlayer`
- Error message format: "Not your turn: expected {activePlayer} but got {movePlayer}"
- This check runs first before any move-specific validation

**Bar Re-entry Validation**
- White pieces on bar must re-enter on points 18-23 (indices 18-23)
- Black pieces on bar must re-enter on points 0-5 (indices 0-5)
- Entry point calculated as: white enters at `24 - dieValue`, black enters at `dieValue - 1`
- If player has pieces on bar, all moves MUST be bar re-entries until bar is empty
- Error format: "Must re-enter from bar before moving other pieces ({count} pieces on bar)"

**Point Blocking Validation**
- A point with 2+ opponent pieces is blocked and cannot be landed on
- Opponent pieces: positive values are white, negative values are black
- Error format: "Point {index} is blocked by {color} ({count} pieces)"
- Check applies to both normal moves and bar re-entries

**Blot Hit Detection**
- A blot is a single opponent piece on a point (board value of 1 or -1 for opponent)
- When landing on a blot, return `hitInfo: {point: number, player: PlayerColor}`
- Validation passes for hitting a blot (it is a legal move)
- Do NOT mutate state - just report that a hit would occur

**Bearing Off Validation**
- White bears off when moving past index -1 (to position 24 or conceptually below 0)
- Black bears off when moving past index 24 (to position 24)
- Bearing off only allowed when ALL player pieces are in home board (white: 0-5, black: 18-23)
- Overshoot rule is configurable via `gameState.tableOptions.allowBearOffOvershoot`
- When overshoot disabled: exact roll required unless no pieces on higher points
- Error format: "Cannot bear off: pieces exist outside home board (point {index})"

**Forced Move Calculation**
- Calculate all possible legal moves given current board state and remaining dice
- If player could use more dice than they did, return `forcedMoveInfo.moreMovesAvailable: true`
- If only one die is playable and player used the smaller one when larger was playable, flag it
- Full tree search required: consider that making move A might enable/disable move B
- Error format: "Forced move violation: {n} dice could be used but only {m} were used"

**Dice Consumption Validation**
- Each move must use exactly one die value from remaining dice
- Verify die value matches the move distance (to - from for black, from - to for white)
- Build on existing `validateDiceUsage` pattern in `src/moves/validation.js`
- Error format: "Move {from} to {to} requires die {required} but used {actual}"

**Move Direction Validation**
- White moves from higher indices to lower (towards home at 0-5, bears off below 0)
- Black moves from lower indices to higher (towards home at 18-23, bears off at 24)
- Build on existing `validateMoveDirection` in `src/moves/validation.js`
- Error format: "{color} must move from {expected direction} (attempted {from} to {to})"

**Table Options Support**
- Read table options from `gameState.tableOptions` object
- Support `allowBearOffOvershoot: boolean` option
- Default to standard backgammon rules if option not present
- Design for future extensibility of additional table options

## Visual Design
No visual assets provided.

## Existing Code to Leverage

**src/state/validation.js**
- Reuse ValidationResult pattern: `{valid: boolean, errors: string[]}`
- Follow the validator array pattern for running multiple validations
- Use similar error message formatting with specific context
- Reference `validateDiceConsistency` for dice-related validation approach

**src/moves/validation.js**
- Extend `validateDiceUsage` logic for die consumption checks
- Extend `validateMoveDirection` logic for directional validation
- Follow the combined `validateMoveFile` pattern for aggregating results
- Use existing `isValidDieValue`, `isValidBoardPoint` helper functions

**src/moves/constants.js**
- Use `BAR_POSITION = -1` and `BEAR_OFF_POSITION = 24` constants
- Use `isValidSourcePoint`, `isValidDestinationPoint` helper functions
- Reference `MAX_MOVES_PER_TURN = 4` for doubles handling

**src/state/types.js and src/moves/types.js**
- Use existing `SingleMove` type: `{from, to, die}`
- Use existing `GameState` type for input parameter typing
- Use existing `PlayerColor` type for player identification

**src/state/constants.js**
- Use `BOARD_POINTS = 24` for board size validation
- Use `isValidPlayer` type guard for player color validation

## Out of Scope
- Doubling cube validation or cube-related rules
- Match rules, scoring, or multi-game sequences
- Game history tracking or move replay
- State mutation (GitHub Action handles state changes)
- UI/visual components or rendering
- Network validation or API concerns
- Player authentication or authorization
- Move suggestion or AI assistance
- Undo/redo functionality
- Time controls or clock management
