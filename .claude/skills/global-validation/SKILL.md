---
description: Input validation and JSON schema validation for game state and moves. Use when handling user input, validating move files, or processing state.json. Critical for GitHub Actions validation logic.
---

# Validation

## When to use this skill:
- Validating move JSON files in `tables/*/moves/`
- Validating `state.json` structure
- Processing user input in the UI
- Writing validation logic in `src/validation/`
- GitHub Actions move validation workflow

## JSON Schema Validation

Validate game state against expected schema:

```javascript
const validateState = (state) => {
  const required = ['turn', 'activePlayer', 'dice', 'board', 'bar', 'home', 'status']
  const missing = required.filter((key) => !(key in state))

  if (missing.length > 0) {
    return { valid: false, error: `Missing fields: ${missing.join(', ')}` }
  }

  if (!['white', 'black'].includes(state.activePlayer)) {
    return { valid: false, error: 'activePlayer must be "white" or "black"' }
  }

  return { valid: true }
}
```

## Move Validation

Validate moves before applying:

```javascript
const validateMove = (move, state) => {
  // Check player turn
  if (move.player !== state.activePlayer) {
    return { valid: false, error: 'Not your turn' }
  }

  // Check dice availability
  if (!isDiceAvailable(move.die, state.dice, state.diceUsed)) {
    return { valid: false, error: 'Die value not available' }
  }

  // Check legal destination
  if (!isLegalDestination(move.from, move.to, state.board, move.player)) {
    return { valid: false, error: 'Illegal move destination' }
  }

  return { valid: true }
}
```

## Return Validation Results

Always return structured results:

```javascript
// Good: structured result
const validate = (input) => {
  if (!input) return { valid: false, error: 'Input required' }
  return { valid: true, data: parseInput(input) }
}

// Bad: throwing or returning mixed types
const validate = (input) => {
  if (!input) throw new Error('Input required')
  return parseInput(input)
}
```

## Validate at Boundaries

Validate at system boundaries, trust internal code:

```javascript
// Validate at API/commit boundary (GitHub Action)
const processMove = async (moveFile) => {
  const move = JSON.parse(await readFile(moveFile))
  const result = validateMove(move, currentState)

  if (!result.valid) {
    await revertCommit()
    return
  }

  // Internal functions can trust validated data
  applyMove(move, currentState)
}
```
