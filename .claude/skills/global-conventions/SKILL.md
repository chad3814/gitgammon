---
description: Project conventions for GitGammon including file organization, naming, and patterns. Use when creating new files, organizing code, or establishing patterns. Reference for consistent project structure.
---

# Project Conventions

## When to use this skill:
- Creating new JavaScript modules
- Adding new game features
- Organizing test files
- Setting up GitHub Actions workflows

## Directory Structure

```
public/js/       → Browser code (ES modules, no bundling)
src/             → Shared logic (validation, state, dice)
src/validation/  → Move validation rules
src/state/       → State management utilities
src/dice/        → Dice rolling logic
tests/           → Vitest test files
tables/          → Game state directories
.github/workflows/ → GitHub Actions
```

## File Naming

| Location | Convention | Example |
|----------|------------|---------|
| `public/js/` | kebab-case | `board-renderer.js` |
| `src/` | kebab-case | `move-validator.js` |
| `tests/` | `*.test.js` | `move-validator.test.js` |
| `tables/` | UUID or slug | `tables/game-123/` |
| Workflows | kebab-case | `validate-move.yml` |

## Import Conventions

Use relative imports with `.js` extension:

```javascript
// In public/js/board.js
import { fetchState } from './state.js'
import { validateMove } from '../../src/validation/move-validator.js'
```

## State File Conventions

Game state in `tables/{id}/state.json`:

```json
{
  "turn": 1,
  "activePlayer": "white",
  "dice": [3, 5],
  "diceUsed": [],
  "board": [0, 2, 0, 0, 0, 0, -5, 0, -3, 0, 0, 0, 5, -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2, 0],
  "bar": { "white": 0, "black": 0 },
  "home": { "white": 0, "black": 0 },
  "lastMove": null,
  "status": "playing",
  "updatedAt": "2025-01-21T12:00:00Z"
}
```

Move files in `tables/{id}/moves/{seq}-{color}-{sha}.json`:

```json
{
  "player": "white",
  "moves": [
    { "from": 6, "to": 3, "die": 3 },
    { "from": 8, "to": 3, "die": 5 }
  ],
  "timestamp": "2025-01-21T12:01:00Z"
}
```

## Export Conventions

Use named exports, avoid default exports:

```javascript
// Good
export const rollDice = () => { ... }
export const validateMove = (move, state) => { ... }

// Avoid
export default { rollDice, validateMove }
```

## Constants

Define constants in dedicated files:

```javascript
// src/constants.js
export const POINTS_COUNT = 24
export const PIECES_PER_PLAYER = 15
export const MAX_DICE_VALUE = 6
export const GITHUB_CLIENT_ID = 'your-client-id'
```
