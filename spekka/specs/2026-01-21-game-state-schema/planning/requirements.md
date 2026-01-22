# Spec Requirements: Game State Schema

## Initial Description

Define the JSON schema for `state.json` matching the architecture spec: turn number, activePlayer, dice, diceUsed, board array, bar, home, lastMove, status, updatedAt.

This is for GitGammon - a backgammon game played on GitHub Pages through commits. The game state is stored in JSON files in `tables/{id}/state.json`.

## Requirements Discussion

### First Round Questions

**Q1:** The backend-models skill defines the board as a 26-element array where index 0 and 25 are "unused." I assume these padding elements exist for convenient 1-indexed point access (points 1-24). Is this intentional, or should we consider an alternative representation (e.g., 24-element array with 0-based indexing, or an object with named point keys)?

**Answer:** [Awaiting user response]

**Q2:** The current schema includes `winner: string|null`. I assume winner should be the player color (`'white'|'black'`) rather than a GitHub username or player identifier. Is that correct, or should we also track player identity (e.g., `players: {white: 'username1', black: 'username2'}`) in the game state?

**Answer:** [Awaiting user response]

**Q3:** The spec mentions `lastMove` as a string reference (e.g., `"0012-black-a1b2c3"`). I assume this is the filename (without `.json` extension) of the most recent valid move file. Should we store the full path, just the filename, or a structured object with sequence number and player?

**Answer:** [Awaiting user response]

**Q4:** For error states - if a move is invalid and gets reverted by the GitHub Action, should the `state.json` include any error information (e.g., `lastError: {message: string, moveFile: string}`) or is that handled elsewhere?

**Answer:** [Awaiting user response]

**Q5:** The roadmap mentions future features (Doubling Cube, Match Play). Should the schema be designed with placeholder fields for future extensibility now (even if null/undefined), or should we keep it minimal for MVP and extend later via schema versioning?

**Answer:** [Awaiting user response]

### Existing Code to Reference

[Awaiting user response about similar features]

### Follow-up Questions

[To be determined based on first round answers]

## Visual Assets

### Files Provided:

[Pending visual folder check]

### Visual Insights:

[To be populated after visual analysis]

## Requirements Summary

### Functional Requirements

[To be completed after Q&A]

### Reusability Opportunities

- Backend-models skill (`/.claude/skills/backend-models/SKILL.md`) already contains JSDoc type definitions that should be the basis for the JSON schema
- Initial board constant defined in backend-models skill

### Scope Boundaries

**In Scope:**
- JSON schema definition for `state.json`
- JSDoc/TypeScript type definitions
- Initial board state constant
- Validation constraints for each field

**Out of Scope:**
- Move file schema (separate roadmap item #3)
- Doubling cube fields (future Phase 2)
- Match state fields (future Phase 2)
- Move validation logic (roadmap item #4)

### Technical Considerations

- Schema must be JSON-parseable for frontend fetch
- Must support diff-friendly formatting for Git history
- Type checking via JSDoc + TypeScript (check-only mode per tech stack)
- Fields must support GitHub Actions validation workflow
