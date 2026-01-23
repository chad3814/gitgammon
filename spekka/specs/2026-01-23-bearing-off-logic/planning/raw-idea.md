# Raw Idea: Bearing Off Logic

**Roadmap Item #11**: Bearing Off Logic — Complete endgame implementation: detecting when bearing off is legal, validating bear-off moves, and determining game completion.

## Initial Description

The bearing off logic is mostly implemented in the codebase. This spec focuses on verifying and documenting the complete endgame implementation:

### Existing Components

- `validateBearingOff()` in `src/validation/validators/bearoff.js` - validates bear-off moves
- `checkAllPiecesInHome()` - detects when bearing off is legal
- `applyMoves()` in `action/apply-move.js` - handles bear-off moves (increments home counter)
- `detectWin()` in `action/detect-win.js` - determines game completion when home[player] === 15

### Focus Areas

The spec should verify integration of all these pieces and add end-to-end tests for the complete bearing off flow.

## Scope

Priority: `S` (Small)

This is primarily a verification and testing initiative to ensure the existing bearing off implementation is complete, integrated correctly, and well-tested.
