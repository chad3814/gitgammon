# Task Breakdown: GitHub Action Workflow

## Overview
Total Tasks: 32 (across 5 task groups)

This spec creates the GitHub Action workflow (`.github/workflows/process-move.yml`) and supporting action code (`action/`) that triggers on move file pushes, validates moves against game state, applies valid moves with dice rolls, or rejects invalid moves with error messages in state.

## Task List

### Workflow Configuration

#### Task Group 1: GitHub Action Workflow YAML
**Dependencies:** None

- [x] 1.0 Complete workflow configuration
  - [x] 1.1 Write 3-5 focused tests for workflow configuration validation
    - Test workflow YAML is valid syntax
    - Test path filter matches `tables/*/moves/*.json` pattern
    - Test concurrency group uses correct pattern
    - Test bot actor check conditional is present
  - [x] 1.2 Create `.github/workflows/process-move.yml` workflow file
    - Trigger on push to `main` branch only
    - Filter paths to `tables/*/moves/*.json`
    - Set concurrency group: `gitgammon-${{ github.ref }}`
    - Set `cancel-in-progress: false` to queue moves
    - Configure permissions for `contents: write`
  - [x] 1.3 Add bot commit detection step
    - Add conditional: `if: github.actor != 'github-actions[bot]'`
    - Exit early with success for bot commits
    - Log skip reason for debugging
  - [x] 1.4 Add Node.js environment setup
    - Use `actions/checkout@v4` with full history
    - Use `actions/setup-node@v4` with Node.js 20
    - Cache npm dependencies
  - [x] 1.5 Add action invocation step
    - Configure git user for commits
    - Invoke main action script with `GITHUB_TOKEN`
    - Pass event context to action
  - [x] 1.6 Ensure workflow configuration tests pass
    - Run ONLY the 3-5 tests written in 1.1
    - Verify YAML syntax is valid

**Acceptance Criteria:**
- The 3-5 tests written in 1.1 pass
- Workflow triggers only on move file pushes
- Bot commits are detected and skipped
- Concurrency prevents race conditions

---

### Action Entry Point

#### Task Group 2: Action Core and Move Discovery
**Dependencies:** Task Group 1

- [x] 2.0 Complete action entry point and move discovery
  - [x] 2.1 Write 4-6 focused tests for move discovery
    - Test extracting changed files from git diff
    - Test filtering to only `tables/*/moves/*.json` files
    - Test parsing table name from file path
    - Test loading corresponding state.json
    - Test handling of multiple move files (process first, warn)
  - [x] 2.2 Create `action/index.js` as action entry point
    - Import required modules (moves, validation, dice, state)
    - Set up error handling wrapper for entire action
    - Export main `run()` function
    - Call `run()` when executed directly
  - [x] 2.3 Implement move file discovery in `action/discovery.js`
    - Run `git diff --name-only HEAD~1 HEAD` to get changed files
    - Filter to files matching `tables/*/moves/*.json`
    - Extract table name from path using regex
    - Return `{ moveFilePath, tableName }` or null if no moves
  - [x] 2.4 Implement state loading in `action/state-loader.js`
    - Load `tables/{tableName}/state.json`
    - Parse JSON with error handling for malformed files
    - Return parsed state object
    - Throw descriptive error if state file missing
  - [x] 2.5 Implement move file loading in `action/move-loader.js`
    - Load move file JSON from discovered path
    - Parse with error handling for malformed JSON
    - Return parsed move file object
    - Extract filename from path for validation
  - [x] 2.6 Ensure move discovery tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Verify file discovery works correctly

**Acceptance Criteria:**
- The 4-6 tests written in 2.1 pass
- Move files discovered from git diff
- Table name correctly parsed from path
- State and move files loaded with error handling

---

### Validation Pipeline

#### Task Group 3: Player Verification and Move Validation
**Dependencies:** Task Group 2

- [x] 3.0 Complete validation pipeline
  - [x] 3.1 Write 6-8 focused tests for validation pipeline
    - Test commit author matches player in move file
    - Test active player check rejects wrong player's move
    - Test state hash verification catches stale moves
    - Test move file schema validation
    - Test game rule validation integration
    - Test error collection aggregates all validation failures
  - [x] 3.2 Implement player identity verification in `action/verify-player.js`
    - Get commit author from `GITHUB_ACTOR` environment variable
    - Compare against `state.players.white` and `state.players.black`
    - Verify author matches the `player` field in move file
    - Return `{ valid, errors, playerColor }` result
  - [x] 3.3 Implement active player check in `action/verify-turn.js`
    - Compare `state.activePlayer` against move file's `player` field
    - Reject if move is from non-active player
    - Return descriptive error: "It is {color}'s turn, not {color}'s"
  - [x] 3.4 Implement state hash verification in `action/verify-hash.js`
    - Import `computeStateHash` from `src/moves/hash.js`
    - Compare move file's `stateHash` against computed hash
    - Reject if hashes don't match (stale move)
    - Return descriptive error with hash mismatch details
  - [x] 3.5 Implement move file validation in `action/validate-move-file.js`
    - Import `validateMoveFile` from `src/moves/validation.js`
    - Validate move file against schema
    - Validate filename matches move content
    - Validate dice usage and move direction
    - Collect all validation errors
  - [x] 3.6 Implement game rule validation in `action/validate-rules.js`
    - Import `validateMoves` from `src/validation/validate-move.js`
    - Validate complete turn against backgammon rules
    - Return `valid` boolean and `errors` array
    - Include forced move analysis in validation
  - [x] 3.7 Create `action/validation-pipeline.js` to orchestrate validation
    - Run all validators in sequence
    - Collect errors from all validation stages
    - Return combined `{ valid, errors }` result
    - Short-circuit on critical errors (missing files)
  - [x] 3.8 Ensure validation pipeline tests pass
    - Run ONLY the 6-8 tests written in 3.1
    - Verify all validators integrate correctly

**Acceptance Criteria:**
- The 6-8 tests written in 3.1 pass
- Player identity verified against commit author
- Active player turn enforced
- State hash prevents stale moves
- All validation errors collected and reported

---

### State Update and Git Operations

#### Task Group 4: Apply Moves, Roll Dice, Commit Changes
**Dependencies:** Task Group 3

- [x] 4.0 Complete state update and git operations
  - [x] 4.1 Write 6-8 focused tests for state updates and git operations
    - Test move application updates board state correctly
    - Test dice roll integration after valid move
    - Test win detection sets status and winner
    - Test lastMove updated with correct sequence and player
    - Test valid move commit message format
    - Test invalid move deletion and error message in state
  - [x] 4.2 Implement move application in `action/apply-move.js`
    - Apply each move in sequence to game state
    - Update board positions, bar, and home counts
    - Track captured pieces (hits)
    - Return updated state object
  - [x] 4.3 Implement dice roll integration in `action/roll-dice.js`
    - Import `rollForNextTurn` from `src/dice/turn-roll.js`
    - Call after move application
    - Handle auto-pass scenarios
    - Merge dice result into state
  - [x] 4.4 Implement win detection in `action/detect-win.js`
    - Check if `state.home[player] === 15`
    - Set `state.status = 'completed'` on win
    - Set `state.winner = player` on win
    - Return win detection result
  - [x] 4.5 Implement state finalization in `action/finalize-state.js`
    - Update `state.lastMove` with sequence, player, filename
    - Increment `state.turn` counter
    - Update `state.updatedAt` timestamp (ISO 8601)
    - Validate final state with `validateState()`
  - [x] 4.6 Implement valid move commit in `action/commit-valid.js`
    - Write updated state.json to file
    - Stage state.json changes
    - Commit with message: `[GitGammon] Apply move {sequence} by {color}`
    - Use git user: `github-actions[bot]`
  - [x] 4.7 Implement invalid move handling in `action/commit-invalid.js`
    - Delete invalid move file from filesystem
    - Add error message to `state.messages` array
    - Message format: `{ type: 'error', text: reason, timestamp }`
    - Stage both file deletion and state update
    - Commit with message: `[GitGammon] Reject invalid move: {reason}`
  - [x] 4.8 Ensure state update tests pass
    - Run ONLY the 6-8 tests written in 4.1
    - Verify state updates and commits work correctly

**Acceptance Criteria:**
- The 6-8 tests written in 4.1 pass
- Moves correctly applied to game state
- Dice rolled for next turn with auto-pass handling
- Win condition detected and state updated
- Valid moves committed with correct format
- Invalid moves deleted with error in state

---

### Integration and Error Handling

#### Task Group 5: Error Handling and Integration Testing
**Dependencies:** Task Groups 1-4

- [x] 5.0 Complete error handling and integration
  - [x] 5.1 Write 6-8 focused tests for error handling and integration
    - Test malformed JSON handling produces clear error
    - Test missing state file handling
    - Test missing move file handling
    - Test unexpected error caught and reported
    - Test full valid move flow end-to-end
    - Test full invalid move flow end-to-end
  - [x] 5.2 Implement global error handler in `action/error-handler.js`
    - Wrap entire action execution in try-catch
    - Convert all errors to invalid move flow
    - Log detailed error for workflow debugging
    - Ensure workflow always completes (no hanging)
  - [x] 5.3 Implement logging utilities in `action/logger.js`
    - Use GitHub Actions log commands (`::error::`, `::warning::`)
    - Log validation stages for debugging
    - Log git operations for audit trail
    - Mask sensitive information
  - [x] 5.4 Create main orchestration in `action/index.js`
    - Discover move files
    - Load state and move file
    - Run validation pipeline
    - Branch on valid/invalid result
    - Apply state updates or reject with error
    - Commit changes
  - [x] 5.5 Add action metadata in `action/action.yml`
    - Define action name and description
    - Specify Node.js 20 runtime
    - Define inputs (none required)
    - Define outputs (success, error message)
  - [x] 5.6 Ensure all action tests pass
    - Run ONLY tests in `tests/action/` directory
    - Verify end-to-end flows work correctly

**Acceptance Criteria:**
- The 6-8 tests written in 5.1 pass
- All errors handled gracefully
- Workflow never hangs on errors
- Valid move flow completes successfully
- Invalid move flow rejects and reports correctly

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Workflow Configuration**
   - GitHub Action YAML setup
   - Trigger and concurrency configuration
   - No dependencies on action code

2. **Task Group 2: Action Entry Point**
   - Core action structure
   - Move file and state discovery
   - Depends on workflow to invoke it

3. **Task Group 3: Validation Pipeline**
   - Player and turn verification
   - Schema and game rule validation
   - Depends on discovery from Group 2

4. **Task Group 4: State Update and Git Operations**
   - Move application and dice rolling
   - Win detection
   - Git commit operations
   - Depends on validation from Group 3

5. **Task Group 5: Error Handling and Integration**
   - Global error handling
   - End-to-end integration
   - Depends on all other groups

## File Structure

After completion, the following files should exist:

```
.github/workflows/
  process-move.yml          # Main workflow trigger and job configuration

action/
  action.yml                # Action metadata
  index.js                  # Action entry point and main orchestration
  discovery.js              # Move file discovery from git diff
  state-loader.js           # Load and parse state.json
  move-loader.js            # Load and parse move file
  verify-player.js          # Player identity verification
  verify-turn.js            # Active player check
  verify-hash.js            # State hash verification
  validate-move-file.js     # Move file schema validation
  validate-rules.js         # Game rule validation
  validation-pipeline.js    # Validation orchestration
  apply-move.js             # Apply moves to state
  roll-dice.js              # Dice rolling integration
  detect-win.js             # Win condition detection
  finalize-state.js         # State finalization
  commit-valid.js           # Commit valid moves
  commit-invalid.js         # Handle invalid moves
  error-handler.js          # Global error handling
  logger.js                 # Logging utilities
```

## Notes

- Action runs in Node.js 20 environment on GitHub Actions
- All git operations use `GITHUB_TOKEN` for authentication
- Commits are made as `github-actions[bot]` user
- Concurrency control prevents race conditions on same table
- Bot commit detection prevents infinite workflow loops
- Move files are preserved as game history (valid) or deleted (invalid)
- State hash ensures moves are based on current game state
- Error messages are stored in state for player visibility
- Existing modules (`src/moves/`, `src/validation/`, `src/dice/`, `src/state/`) are imported and reused
