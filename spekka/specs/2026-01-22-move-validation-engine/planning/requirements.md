# Spec Requirements: Move Validation Engine

## Initial Description
Create a comprehensive move validation engine for backgammon that validates all move types according to standard backgammon rules. The engine should be a pure validation layer that returns detailed validation results without mutating game state.

## Requirements Discussion

### First Round Questions

**Q1:** I assume we'll create a pure JavaScript module in `src/validation/` that takes game state + proposed move and returns a ValidationResult object (valid/invalid + reasons). Is that correct?
**Answer:** Correct - pure JS module in src/validation/ with ValidationResult pattern.

**Q2:** For bar re-entry validation, I'm assuming standard backgammon convention where white enters on points 18-23 and black enters on points 0-5 based on the dice roll. Should we validate that pieces on the bar MUST re-enter before any other move?
**Answer:** Yes - standard backgammon convention (white enters 18-23, black enters 0-5). Pieces on bar must re-enter before other moves.

**Q3:** For error messages, should they be generic (e.g., "Invalid move") or specific (e.g., "Point 18 is blocked by black (3 pieces)")?
**Answer:** Specific detailed error messages (e.g., "Point 18 is blocked by black (3 pieces)").

**Q4:** I assume when validating a move that hits a blot (opponent's single piece), we should validate and return hit information but NOT mutate state (let the GitHub Action handle state changes). Correct?
**Answer:** Correct - validate and return hit info, but DO NOT mutate state (GitHub Action handles that).

**Q5:** For bearing off, should we allow "overshoot" moves (e.g., rolling a 6 when your furthest piece is on point 4) as valid, or require exact rolls when possible?
**Answer:** Should be a TABLE OPTION saved in game state (configurable per table).

**Q6:** Should we validate the "forced move" rule - that if a player can use both dice, they must, and if only one can be used, they must use the higher one?
**Answer:** Should CALCULATE whether more moves were possible (full complexity).

**Q7:** I assume we should validate that it's the correct player's turn (activePlayer matches the piece color being moved). Correct?
**Answer:** Yes, should validate it's the activePlayer's turn.

**Q8:** Is there anything specific that should be explicitly OUT of scope for this validation engine?
**Answer:** Only what was stated in the original description (doubling cube, match rules, history tracking are out of scope).

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Existing validation logic - Path: `src/state/validation.js`
- Feature: Existing move validation - Path: `src/moves/validation.js`
- Components to potentially reuse: Existing validation patterns and utilities from these files
- Backend logic to reference: Current validation approach and game state structure

### Follow-up Questions
None required - all answers were clear and comprehensive.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A

## Requirements Summary

### Functional Requirements
- Pure validation module that takes game state + proposed move as input
- Returns ValidationResult object containing valid/invalid status and detailed reasons
- Validate bar re-entry rules (white: 18-23, black: 0-5)
- Enforce bar re-entry priority (must re-enter before other moves)
- Validate point blocking (cannot land on points with 2+ opponent pieces)
- Validate and report blot hits (return hit info without mutating state)
- Support configurable bearing off overshoot rules (table option)
- Calculate forced move compliance (both dice usage, higher die rule)
- Validate activePlayer turn (correct player is moving)
- Provide specific, detailed error messages for invalid moves

### Reusability Opportunities
- Build on existing code in `src/state/validation.js`
- Build on existing code in `src/moves/validation.js`
- Follow existing validation patterns and conventions
- Reuse game state structure and types

### Scope Boundaries
**In Scope:**
- Bar re-entry validation
- Point blocking validation
- Blot hit detection and reporting
- Bearing off validation (with configurable overshoot option)
- Forced move calculation
- Turn validation (activePlayer check)
- Detailed error message generation
- ValidationResult pattern implementation

**Out of Scope:**
- Doubling cube logic
- Match rules and scoring
- Move history tracking
- State mutation (handled by GitHub Action)
- UI/visual components

### Technical Considerations
- Pure JavaScript module architecture
- Located in `src/validation/` directory
- No state mutation - validation only
- Must integrate with existing game state structure
- Table options stored in game state for configurable rules
- Full complexity forced move calculation (not simplified)
- Build on existing validation patterns in the codebase
