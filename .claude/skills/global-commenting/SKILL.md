---
description: JSDoc and inline comment conventions for JavaScript. Use when documenting functions, complex logic, or public APIs. Applies to all .js files. JSDoc enables TypeScript type checking without compilation.
---

# Commenting & Documentation

## When to use this skill:
- Documenting exported functions in `src/`
- Adding JSDoc types for TypeScript checking
- Explaining complex game logic (move validation, bearing off)
- Documenting public API in `public/js/`

## JSDoc for Type Safety

Use JSDoc for TypeScript-style type checking:

```javascript
/**
 * @typedef {Object} GameState
 * @property {number} turn
 * @property {'white'|'black'} activePlayer
 * @property {number[]} dice
 * @property {number[]} diceUsed
 * @property {number[]} board
 * @property {{white: number, black: number}} bar
 * @property {{white: number, black: number}} home
 * @property {string} lastMove
 * @property {'playing'|'completed'} status
 */

/**
 * Validates a move against current game state
 * @param {Object} move - The move to validate
 * @param {number} move.from - Source point (1-24, 0 for bar, 25 for bear-off)
 * @param {number} move.to - Destination point
 * @param {number} move.die - Die value used
 * @param {GameState} state - Current game state
 * @returns {{valid: boolean, error?: string}}
 */
const validateMove = (move, state) => { ... }
```

## When to Comment

Comment non-obvious logic, not obvious code:

```javascript
// Bad: obvious
// Add 1 to turn
state.turn = state.turn + 1

// Good: explains business logic
// In backgammon, bearing off requires all pieces in home board (points 19-24 for white)
const canBearOff = (player, board) => {
  const homeRange = player === 'white' ? [19, 24] : [1, 6]
  return getPiecesOutsideHome(player, board, homeRange) === 0
}
```

## File Headers

Add brief headers for module purpose:

```javascript
/**
 * OAuth Device Flow authentication for GitHub
 * Handles code generation, polling, and token storage
 * @module auth
 */
```

## TODO Comments

Use consistent TODO format:

```javascript
// TODO(username): Description of what needs to be done
// TODO: Implement Crawford rule for match play
```

## Inline Comments

Keep inline comments brief:

```javascript
const applyMove = (move, state) => {
  const newBoard = [...state.board]

  newBoard[move.from]-- // Remove piece from source

  // Check for hit (opponent has single piece)
  if (isBlot(move.to, state.board, opponent(move.player))) {
    newBoard[move.to] = 1 // Replace with our piece
    state.bar[opponent(move.player)]++ // Send to bar
  } else {
    newBoard[move.to]++
  }

  return newBoard
}
```
