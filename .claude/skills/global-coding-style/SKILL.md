---
description: JavaScript ES6+ coding style for vanilla JS projects. Use when writing or modifying .js files in public/js/ or src/. Applies to all JavaScript code including GitHub Actions scripts.
---

# JavaScript Coding Style

## When to use this skill:
- Writing or editing any `.js` file
- Creating new JavaScript modules in `public/js/` or `src/`
- Writing Node.js scripts for GitHub Actions
- Reviewing JavaScript code for style consistency

## Formatting

Use Prettier with project defaults:
- 2-space indentation
- Single quotes for strings
- No semicolons (or consistent semicolons—pick one)
- 80-character line width

```javascript
// Good
const getUserById = (id) => users.find((u) => u.id === id)

// Bad
const getUserById = (id) => {return users.find(u => u.id === id);}
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables/functions | camelCase | `activePlayer`, `rollDice()` |
| Constants | UPPER_SNAKE_CASE | `MAX_DICE_VALUE`, `API_BASE_URL` |
| Classes | PascalCase | `GameState`, `MoveValidator` |
| Files | kebab-case | `board-renderer.js`, `dice-utils.js` |
| Boolean variables | is/has/should prefix | `isValidMove`, `hasDoubled` |

## ES6+ Features

Prefer modern syntax:

```javascript
// Destructuring
const { activePlayer, dice } = gameState

// Arrow functions for callbacks
points.filter((p) => p.pieces > 0)

// Template literals
const url = `${BASE_URL}/tables/${tableId}/state.json`

// Spread operator
const newState = { ...state, turn: state.turn + 1 }

// Optional chaining
const owner = gameState?.cube?.owner
```

## Module Structure

Use ES modules with named exports:

```javascript
// dice.js
export const rollDice = () => [randomDie(), randomDie()]
export const isDiceUsed = (dice, used) => used.length === dice.length

// consumer.js
import { rollDice, isDiceUsed } from './dice.js'
```

## Function Guidelines

- Keep functions under 20 lines
- Single responsibility per function
- Use descriptive names that indicate what the function does

```javascript
// Good: clear purpose
const calculateLegalMoves = (board, dice, player) => { ... }

// Bad: vague name
const process = (b, d, p) => { ... }
```
