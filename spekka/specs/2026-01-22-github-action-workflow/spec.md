# Specification: GitHub Action Workflow

## Goal
Build the GitHub Action that triggers on move file pushes, validates moves against game state, applies valid moves with dice rolls, or rejects invalid moves with error messages in state.

## User Stories
- As a player, I want my submitted moves to be automatically validated and applied so I can play asynchronously through git commits
- As a player, I want clear error feedback when my move is invalid so I understand what went wrong

## Specific Requirements

**Workflow Trigger Configuration**
- Trigger on push events to `main` branch only
- Filter paths to `tables/*/moves/*.json` pattern (glob matching)
- Use `paths` filter in workflow `on.push` configuration
- Workflow file at `.github/workflows/process-move.yml`

**Bot Commit Detection**
- Check `github.actor` against known bot identifiers (e.g., `github-actions[bot]`)
- Exit early with success status if actor is a bot (prevents infinite loops)
- Use conditional job step: `if: github.actor != 'github-actions[bot]'`

**Move File Discovery**
- Extract changed files from push event using `${{ github.event.commits[*].added }}` or git diff
- Filter to only `.json` files matching `tables/*/moves/*.json` pattern
- Parse table name from path (e.g., `tables/my-game/moves/` yields `my-game`)
- Load corresponding `state.json` from `tables/{table-name}/state.json`

**Player Identity Verification**
- Compare commit author (from `github.actor` or commit metadata) against `state.players.white` and `state.players.black`
- Verify commit author matches the player color specified in the move file
- Reject move if author does not match the player claiming to make the move
- Check `state.activePlayer` matches the move file's `player` field

**Move Validation Pipeline**
- Parse move file JSON and validate against schema using `validateMoveFile()` from `src/moves/validation.js`
- Validate state hash in move file matches current state hash using `computeStateHash()` from `src/moves/hash.js`
- Use `validateMoves()` from `src/validation/validate-move.js` for game rule validation
- Collect all validation errors into a single error message for rejection

**State Update Sequence**
- Apply validated moves to game state (use pattern from `applyMoveToState()` in validate-move.js)
- Call `rollForNextTurn()` from `src/dice/turn-roll.js` to get next dice and handle auto-pass
- Update `state.lastMove` with sequence, player, and filename from processed move
- Increment `state.turn` and update `state.updatedAt` timestamp
- Detect win condition: if `home[player] === 15`, set `status: 'completed'` and `winner: player`

**Valid Move Commit**
- Commit updated `state.json` to main branch using `GITHUB_TOKEN`
- Commit message format: `[GitGammon] Apply move {sequence} by {color}`
- Configure git user as GitHub Actions bot for commit author
- Leave move file in place as game history (do not delete)

**Invalid Move Handling**
- Delete the invalid move file via new commit
- Add error message to `state.messages` array with `type: 'error'` and timestamp
- Commit both file deletion and state update atomically
- Commit message format: `[GitGammon] Reject invalid move: {reason}`

**Error Handling**
- Wrap entire workflow in try-catch to handle unexpected errors (malformed JSON, missing files)
- Treat all unexpected errors as invalid moves with appropriate error message
- Log detailed error information to workflow output for debugging
- Ensure workflow always completes (no hanging on errors)

**Concurrency Control**
- Use workflow concurrency with `group: gitgammon-${{ github.ref }}` to prevent race conditions
- Set `cancel-in-progress: false` to queue moves rather than cancel

## Existing Code to Leverage

**src/moves/validation.js**
- `validateMoveFile(moveFile, filename)` validates move against schema, dice usage, direction
- `validateFilenameMatch(filename, moveFile)` ensures filename matches move content
- Use for initial move file validation before game rule checking

**src/validation/validate-move.js**
- `validateMoves(gameState, moves, player)` validates complete turn against game rules
- Returns `valid` boolean and `errors` array for rejection messages
- `applyMoveToState(gameState, move, player)` pattern for state updates (internal function)

**src/dice/turn-roll.js**
- `rollForNextTurn(gameState)` returns new dice, handles auto-pass, switches player
- Returns `{ dice, diceUsed: [], autoPass, messages, activePlayer }`
- Automatically handles no-move scenarios with message generation

**src/state/validation.js**
- `validateState(state)` validates state.json schema and invariants
- Use to validate state after modifications before commit

**src/moves/hash.js**
- `computeStateHash(gameState)` generates hash for state integrity verification
- Use to verify move file's `stateHash` matches current state

## Out of Scope
- Game initialization (creating new tables and initial state.json)
- Multi-game orchestration (processing multiple tables in parallel)
- Player authentication beyond GitHub username matching
- Branch or PR-based workflow (all commits go directly to main)
- Undo or rollback mechanisms for already-committed valid moves
- Notification system for players (email, webhook, etc.)
- Rate limiting or abuse prevention beyond basic bot detection
- Doubling cube or match-level game rules
- Spectator features or game history UI
- Manual dice setting or game debugging endpoints
