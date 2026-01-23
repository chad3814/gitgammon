# Specification: Turn Management - Dice Verification Security Fix

## Goal
Close a critical security gap where players can submit moves claiming different dice than the server-controlled state, and verify all turn management flows work correctly end-to-end.

## User Stories
- As a player, I want move validation to verify dice match server state so that opponents cannot cheat by claiming different dice
- As a game developer, I want comprehensive integration tests for turn management so that all flows are verified working correctly

## Specific Requirements

**Dice Verification Module**
- Create new `action/verify-dice.js` module following the pattern established by `verify-turn.js` and `verify-hash.js`
- Compare `moveFile.diceRoll` against `state.dice` before any game rules validation occurs
- Use order-independent comparison since [3,5] and [5,3] are equivalent dice rolls
- Return `{ valid: boolean, errors: string[] }` matching existing verification module patterns
- Handle doubles correctly - [3,3] in moveFile must match [3,3] in state (same values, same count)

**Validation Pipeline Integration**
- Add dice verification as step 2.5 in `validation-pipeline.js`, after turn verification (step 2) but before state hash verification (step 3)
- Import and call `verifyDice(state, moveFile)` following the existing pattern for other verification steps
- Aggregate errors into `allErrors` array consistent with existing pipeline behavior
- Fail fast - if dice mismatch, no need to proceed to game rules validation

**Error Message Format**
- Provide clear, actionable error message: "Dice mismatch: state has [X,Y] but move claims [A,B]"
- Sort dice arrays in error message for consistent, readable output
- Include both expected and actual values to aid debugging

**Integration Test Coverage**
- Add tests to `tests/action/` verifying the complete turn management flow
- Test: dice verification rejects mismatched dice
- Test: dice verification accepts matching dice (regardless of order)
- Test: turn validation rejects wrong player's moves
- Test: dice roll happens only after valid move acceptance (not on rejection)
- Test: auto-pass triggers when player has no legal moves
- Test: turn counter increments after successful move
- Test: activePlayer alternates correctly after each turn

## Existing Code to Leverage

**`action/verify-turn.js`**
- Exact pattern to follow for the new verify-dice module
- Simple function signature: `(state, moveFile) => { valid, errors }`
- Early return on failure with descriptive error message
- Clean, single-responsibility implementation

**`action/verify-hash.js`**
- Example of verification with computed/derived values
- Error message format includes both expected and actual values
- Pattern for comparing state-derived data against move file claims

**`action/validation-pipeline.js`**
- Shows import pattern for verification modules
- Demonstrates error aggregation with `allErrors.push(...result.errors)`
- Clear numbered step comments for ordering
- Conditional execution based on previous validation results

**`src/dice/turn-roll.js`**
- Contains auto-pass logic via `checkForLegalMoves`
- Uses `rollForNextTurn` to handle blocked player scenarios
- Pattern for iterating through players when moves are blocked

**`tests/action/validation.test.js`**
- Test helper functions `createTestState()` and `createTestMoveFile()` for reuse
- Testing patterns for each verification module
- Integration test pattern for `runValidationPipeline`

## Out of Scope
- UI indicators for whose turn it is (frontend concern)
- Phase tracking within a turn (dice are server-controlled, no phases needed)
- WebSocket or real-time notifications for turn changes
- Doubling cube integration
- Time limits or turn timers
- Undo/redo functionality
- Move history display
- Spectator mode considerations
- Mobile-specific turn indicators
- Sound effects or animations for turn changes
