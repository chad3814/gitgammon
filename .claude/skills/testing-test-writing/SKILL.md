---
description: Testing patterns using Vitest for game logic. Use when writing tests in tests/ directory. Covers unit tests for validation, state management, and dice logic. No DOM testing—focus on pure functions.
---

# Testing with Vitest

## When to use this skill:
- Writing unit tests for `src/validation/`
- Testing state transformations in `src/state/`
- Testing dice logic in `src/dice/`
- Adding tests in `tests/` directory

## Test File Structure

Mirror source structure in tests:

```
src/
  validation/
    move-validator.js
  state/
    state-manager.js
tests/
  validation/
    move-validator.test.js
  state/
    state-manager.test.js
```

## Basic Test Pattern

```javascript
import { describe, it, expect } from 'vitest'
import { validateMove } from '../../src/validation/move-validator.js'

describe('validateMove', () => {
  it('rejects move when not player turn', () => {
    const state = createState({ activePlayer: 'white' })
    const move = { player: 'black', from: 13, to: 7, die: 6 }

    const result = validateMove(move, state)

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Not your turn')
  })

  it('accepts valid move', () => {
    const state = createState({ activePlayer: 'white', dice: [3, 5] })
    const move = { player: 'white', from: 6, to: 3, die: 3 }

    const result = validateMove(move, state)

    expect(result.valid).toBe(true)
  })
})
```

## Test Fixtures

Create helper functions for test data:

```javascript
// tests/fixtures.js
export const createState = (overrides = {}) => ({
  turn: 1,
  activePlayer: 'white',
  dice: [3, 5],
  diceUsed: [],
  board: [...INITIAL_BOARD],
  bar: { white: 0, black: 0 },
  home: { white: 0, black: 0 },
  status: 'playing',
  ...overrides
})

export const createMove = (overrides = {}) => ({
  player: 'white',
  from: 6,
  to: 3,
  die: 3,
  ...overrides
})
```

## Test Edge Cases

Cover backgammon-specific scenarios:

```javascript
describe('bearing off', () => {
  it('allows bear off when all pieces in home board', () => {
    const state = createState({
      board: createHomeBoardOnly('white'),
      activePlayer: 'white',
      dice: [6, 6]
    })
    const move = { player: 'white', from: 24, to: 'off', die: 6 }

    expect(validateMove(move, state).valid).toBe(true)
  })

  it('rejects bear off when pieces outside home board', () => {
    const state = createState({ activePlayer: 'white', dice: [6, 6] })
    const move = { player: 'white', from: 24, to: 'off', die: 6 }

    expect(validateMove(move, state).valid).toBe(false)
  })
})

describe('bar moves', () => {
  it('requires entering from bar before other moves', () => {
    const state = createState({
      bar: { white: 1, black: 0 },
      activePlayer: 'white',
      dice: [3, 5]
    })
    const move = { player: 'white', from: 6, to: 3, die: 3 }

    expect(validateMove(move, state).valid).toBe(false)
    expect(validateMove(move, state).error).toContain('bar')
  })
})
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## Vitest Config

```javascript
// vitest.config.js
export default {
  test: {
    globals: true,
    environment: 'node'
  }
}
```
