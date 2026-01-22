# Spec Requirements: GitHub Action Workflow

## Initial Description

GitHub Action Workflow - Build the Action that triggers on push, validates the move against `state.json`, applies valid moves, rolls dice, updates state, or reverts invalid commits with error in state.

**Size Estimate:** L (Large)

**Phase:** Phase 1: Core MVP (Playable Two-Player Game)

**Dependencies:**
- Item #1: Game State Schema (completed)
- Item #3: Move File Format (completed)
- Item #4: Move Validation Engine (completed)
- Item #5: Dice System (completed)

**Key Responsibilities:**
1. Trigger on push events
2. Validate moves against current `state.json`
3. Apply valid moves to the game state
4. Roll dice for next turn
5. Update `state.json` with new state
6. Revert invalid commits with clear error messages in state

## Requirements Discussion

### First Round Questions

**Q1:** For trigger configuration, should the Action trigger on all push events to main, or should it be scoped to specific paths (e.g., only when files in `tables/*/moves/` are modified)?
**Answer:** Only trigger on `tables/*/moves/*.json` paths.

**Q2:** How should the Action detect and ignore its own commits (to prevent infinite loops)? Should we use a specific commit message prefix, a bot account check, or another mechanism?
**Answer:** Use `github.actor` to ignore bot commits.

**Q3:** For move validation, what should happen if a player submits a move when it's not their turn? Should the Action reject it immediately, or is there additional logic needed?
**Answer:** Any move not from the active player should be rejected.

**Q4:** The dependencies mention Move Validation Engine and Dice System are completed. Should this Action import and use those existing modules directly, or will it implement its own logic?
**Answer:** Yes to both - use existing modules and verify commit author matches player color.

**Q5:** For the state update sequence, should the Action: (a) apply move, (b) roll dice for next turn, (c) commit updated state.json, (d) leave the move file in place as history? Is this the correct sequence?
**Answer:** Correct - apply move, roll dice, commit state, leave move file.

**Q6:** When committing state updates, should the Action commit directly to main, or create a branch/PR?
**Answer:** Commit to main branch.

**Q7:** For invalid moves, should the Action: (a) delete the invalid move file, (b) update state.json with an error message, (c) both, or (d) something else?
**Answer:** Delete invalid move file via new commit, update state.json with error message.

**Q8:** How should unexpected errors (e.g., malformed JSON, missing state file) be handled differently from game rule violations?
**Answer:** Treat as invalid move with appropriate error message.

**Q9:** Should commit messages follow a specific format? For example: `[GitGammon] Apply move {sequence} by {color}` or `[GitGammon] Invalid move: {reason}`?
**Answer:** `[GitGammon] Apply move {sequence} by {color}` works.

**Q10:** Is there anything explicitly out of scope for this Action? For example, should it handle game initialization, or only process moves for existing games?
**Answer:** Action handles all game state transitions from moves.

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

No follow-up questions were necessary.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A

## Requirements Summary

### Functional Requirements
- Trigger GitHub Action on push events to `tables/*/moves/*.json` paths only
- Detect and skip bot commits using `github.actor` check to prevent infinite loops
- Validate that move is from the active player (reject moves from non-active player)
- Use existing Move Validation Engine module to validate moves against game rules
- Verify commit author matches the player color making the move
- Apply valid moves to update game state
- Use existing Dice System module to roll dice for the next turn
- Update `state.json` with new game state after valid moves
- Commit updated state directly to main branch
- Leave move files in place as game history
- Delete invalid move files via new commit
- Update `state.json` with error message for invalid moves
- Handle unexpected errors (malformed JSON, missing files) as invalid moves with error messages

### Reusability Opportunities
- Move Validation Engine (completed dependency - to be imported)
- Dice System (completed dependency - to be imported)
- Game State Schema (completed dependency - defines state.json structure)
- Move File Format (completed dependency - defines move file structure)

### Scope Boundaries

**In Scope:**
- Triggering on push events to move file paths
- Bot commit detection and skipping
- Move validation using existing engine
- Player turn verification
- Commit author to player color matching
- Applying valid moves to state
- Rolling dice for next turn
- Committing state updates to main
- Error handling for invalid moves
- Error handling for unexpected errors
- Deleting invalid move files
- Recording error messages in state

**Out of Scope:**
- Game initialization (not mentioned as in scope)
- Branch/PR workflow (commits go directly to main)
- Multi-game orchestration beyond single move processing
- Player authentication beyond commit author matching
- Game completion/winner determination (unless part of state transitions)

### Technical Considerations
- GitHub Actions workflow file in `.github/workflows/`
- Must handle path-based triggering for `tables/*/moves/*.json`
- Must use `github.actor` for bot detection
- Must integrate with existing TypeScript/JavaScript modules (Move Validation Engine, Dice System)
- Commit format: `[GitGammon] Apply move {sequence} by {color}`
- Direct commits to main branch (no PR workflow)
- State updates must be atomic (apply move + roll dice + commit as single operation)
- Error state must be recorded in `state.json` for visibility
