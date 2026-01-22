# Raw Idea

**Source:** GitGammon Product Roadmap - Item #6

**Description:**

GitHub Action Workflow — Build the Action that triggers on push, validates the move against `state.json`, applies valid moves, rolls dice, updates state, or reverts invalid commits with error in state.

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
