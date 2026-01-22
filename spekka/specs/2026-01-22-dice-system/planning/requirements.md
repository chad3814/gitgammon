# Spec Requirements: Dice System

## Initial Description
Server-side dice rolling in GitHub Actions, committed as part of `state.json`. Rolls happen after move validation, ensuring no manipulation possible.

## Requirements Discussion

### Clarifying Questions and Answers

**Q1:** When should the dice roll occur in the game flow? After move validation when the state is updated, or at some other point?
**Answer:** After move validation. The flow is: player commits move file → Action validates → if valid, Action rolls dice for next turn → updates state.json with new dice.

**Q2:** How should the initial game roll work (determining who goes first)? Standard backgammon has both players roll one die, higher goes first, ties re-roll.
**Answer:** Standard backgammon rules. Both players "roll one die" conceptually - the Action will roll two dice, assign one to each player, higher goes first. If tied, roll again until not tied. Store the opening roll in state.

**Q3:** How should doubles be stored and handled? Currently `dice` can hold 2-4 values. Should doubles be stored as `[3, 3, 3, 3]` or `[3, 3]` with logic knowing it means 4 moves?
**Answer:** Store as `[3, 3]` - just the two dice values. The existing schema already supports this (minItems: 2, maxItems: 4). The validation engine already handles doubles by allowing 4 moves when both dice match. Keep it simple.

**Q4:** How should the Action update `diceUsed` tracking? Reset to empty after rolling new dice for the next turn?
**Answer:** Yes. When rolling new dice for the next turn, reset `diceUsed` to empty array `[]`. The turn flow is: previous turn ends → roll new dice → set dice to new roll → set diceUsed to empty.

**Q5:** What randomness source should be used? Node.js `crypto.randomInt()` is cryptographically secure and available in GitHub Actions.
**Answer:** Use `crypto.randomInt(1, 7)` for each die. This is cryptographically secure, non-deterministic, and native to Node.js.

**Q6:** Should the dice roll be recorded anywhere beyond state.json? For example, in the move file or a separate log?
**Answer:** The dice roll is recorded in state.json's `dice` array. Move files reference the dice values used but don't need to record the roll itself. The commit history serves as the audit log.

**Q7:** What should happen if a player cannot make any legal moves with their roll? Should the Action auto-pass and roll new dice?
**Answer:** Yes. If the validation engine detects no legal moves are possible, the Action should: add an info message to state ("Player X cannot move, turn passes"), switch activePlayer, roll new dice for the next player.

**Q8:** What should be explicitly OUT of scope for this dice system spec?
**Answer:** Out of scope: doubling cube, custom dice faces, weighted dice, match-specific rules, manual dice setting (for debugging), dice animation/display.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Game state schema - Path: `src/state/schema/game-state.schema.json`
- Feature: State validation - Path: `src/state/validation.js`
- Feature: Move validation engine - Path: `src/validation/`
- Components to potentially reuse: State factory functions, validation patterns
- Backend logic to reference: Move validation flow, forced move detection

### Follow-up Questions
None required - all answers clear.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A

## Requirements Summary

### Functional Requirements
- Server-side dice rolling in GitHub Actions using `crypto.randomInt(1, 7)`
- Dice rolled after successful move validation
- Initial game roll to determine starting player (standard backgammon rules)
- Doubles stored as `[n, n]` - validation engine handles 4 moves
- Reset `diceUsed` to empty when rolling new dice
- Auto-pass turn when no legal moves possible
- Add info messages to state for auto-pass events
- Commit updated state.json with new dice values

### Reusability Opportunities
- Build on existing `src/state/` factory and validation patterns
- Use move validation engine's `calculateLegalMoves` for no-move detection
- Follow existing ValidationResult pattern for dice rolling results
- Integrate with existing game state schema (no schema changes needed)

### Scope Boundaries
**In Scope:**
- Dice rolling function using crypto.randomInt
- Initial game roll (determine starting player)
- Turn-end dice roll (roll for next player)
- No-move detection and auto-pass
- State update with new dice values
- Message generation for game events

**Out of Scope:**
- Doubling cube
- Custom dice faces or weighted dice
- Match-specific dice rules
- Manual dice setting for debugging
- Dice animation or visual display
- Re-roll mechanics beyond initial game

### Technical Considerations
- Pure JavaScript module in `src/dice/` directory
- Uses Node.js `crypto` module (available in GitHub Actions)
- Integrates with existing state.json structure (no schema changes)
- Works with move validation engine for legal move detection
- Returns results compatible with Action's state update flow
