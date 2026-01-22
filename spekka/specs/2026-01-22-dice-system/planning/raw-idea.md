# Raw Idea: Dice System

## Original Roadmap Item

**Roadmap item #5: Dice System** — Server-side dice rolling in GitHub Actions, committed as part of `state.json`. Rolls happen after move validation, ensuring no manipulation possible.

## User's Preferred Approach

Server-side dice rolling in GitHub Actions. The dice roll happens after move validation when the state is updated. This ensures no client-side manipulation is possible since the server controls all randomness.

## Key Requirements

- Server-side dice rolling in GitHub Actions
- Dice rolled after move validation completes
- Results committed as part of `state.json` update
- Cryptographically secure randomness
- No client-side manipulation possible
- Deterministic game flow: commit move → validate → roll dice → update state

## Project Context

This feature is for the GitGammon project located at `/Users/cwalker/Projects/gitgammon`.
