# Spec Requirements: Move File Format

## Initial Description

Design the move JSON format for files in `tables/{id}/moves/` directory (e.g., `0001-white-{sha}.json`). Include move notation, player, timestamp.

## Requirements Discussion

### First Round Questions

**Q1:** The backend-models skill proposes a numeric move notation with `{from, to, die}` where points are 1-24, 0=bar, and 25=bear-off. I'm assuming this is preferred over standard backgammon notation (e.g., "8/5, 6/5") since it's machine-readable and consistent with the 0-indexed board array in state.json. Is that correct, or would you prefer human-readable standard notation (or both)?

**Answer:** [Awaiting user response]

**Q2:** The filename includes a SHA component (e.g., `0001-white-{sha}.json`). I'm assuming a 6-character truncated SHA (e.g., `a1b2c3`) is sufficient for uniqueness and readability, matching the example in state.json's `lastMove.file` pattern. Should we use a different length (full 40-char, 7-char like git short SHA, etc.)?

**Answer:** [Awaiting user response]

**Q3:** For metadata, I'm planning to include: `player` (color), `moves[]` (array of individual moves), and `timestamp`. Should we also include any of these optional fields?
- `expectedState` - hash of state.json before move (for conflict detection)
- `diceRoll` - the dice values being used (redundant with state.json but useful for standalone validation)
- `comment` - optional player comment/message
- `commitSha` - auto-populated by GitHub Action after commit

**Answer:** [Awaiting user response]

**Q4:** For the JSON schema validation, should we include the full JSON Schema definition in the spec (like the game state schema spec did), or is a JSDoc type definition sufficient for this simpler structure?

**Answer:** [Awaiting user response]

**Q5:** Is there anything that should explicitly be excluded from the move file format, or any future considerations (like doubling cube actions) we should design hooks for now?

**Answer:** [Awaiting user response]

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Game State Schema - Path: `/Users/cwalker/Projects/gitgammon/spekka/specs/2026-01-21-game-state-schema/spec.md`
- Components to potentially reuse: `LastMove` type definition in `/Users/cwalker/Projects/gitgammon/src/state/types.js`
- Backend logic to reference: `MoveFile` and `SingleMove` draft types in `/.claude/skills/backend-models/SKILL.md`

### Follow-up Questions

[Will be populated based on answers to first round]

## Visual Assets

### Files Provided:
[Pending check of visuals folder after user response]

### Visual Insights:
[Will be populated after visual analysis]

## Requirements Summary

### Functional Requirements
[To be completed after clarifying questions are answered]

### Reusability Opportunities
- `LastMove` type in `src/state/types.js` - already defines the reference structure
- `MoveFile` and `SingleMove` JSDoc types in backend-models skill - draft schema to build upon
- JSON Schema pattern from game state spec - can follow same validation approach

### Scope Boundaries

**In Scope:**
- JSON schema for move files
- File naming conventions (sequence, color, sha)
- Move notation format
- Required and optional fields
- Validation schema

**Out of Scope:**
- Move validation logic (roadmap item #4)
- GitHub Action workflow (roadmap item #6)
- Doubling cube moves (Phase 2)
- Match play state updates (Phase 2)

### Technical Considerations
- Must integrate with existing `lastMove` reference in state.json
- Must support conflict detection (separate files per move)
- Should be human-readable for debugging via git diff
- Must work with GitHub Actions validation workflow
