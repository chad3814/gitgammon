# Raw Idea: Win Detection

**Source**: Roadmap item #12

## Roadmap Description
> 12. [ ] Win Detection — Detect game-ending conditions (all pieces borne off), calculate win type (single, gammon, backgammon), update status to completed. `S`

## Current State
The basic win detection exists in `action/detect-win.js` but only checks if a player has 15 pieces home (borne off). This implementation is incomplete.

## Required Enhancement
The system needs to calculate the specific win type based on the opponent's board position at the time of win.

## Win Types in Backgammon

### 1. Single (1x stake)
- Winner has borne off all 15 pieces
- Opponent has borne off at least 1 piece

### 2. Gammon (2x stake)
- Winner has borne off all 15 pieces
- Opponent hasn't borne off any pieces (home count = 0)
- Opponent has no pieces on bar or in winner's home board

### 3. Backgammon (3x stake)
- Winner has borne off all 15 pieces
- Opponent hasn't borne off any pieces (home count = 0)
- Opponent has at least one piece on bar OR in winner's home board
  - For white winning: check black pieces on bar or points 0-5
  - For black winning: check white pieces on bar or points 18-23

## Implementation Scope
The spec should enhance `detectWin()` to:
1. Detect win condition (existing: 15 pieces borne off)
2. Calculate win type based on opponent's position
3. Return structured win information
4. Update game state with win type and completed status
