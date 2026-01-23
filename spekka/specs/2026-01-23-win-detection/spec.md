# Specification: Win Type Detection

## Goal
Enhance the existing win detection to calculate and return the type of win (single, gammon, or backgammon) with appropriate point multipliers for scoring purposes.

## User Stories
- As a player, I want to know what type of win I achieved so that the correct points are awarded
- As a spectator, I want to see the win type displayed so I understand the significance of the victory

## Specific Requirements

**Enhanced detectWin() Return Type**
- Add `winType` field: `'single' | 'gammon' | 'backgammon' | null`
- Add `multiplier` field: `1`, `2`, or `3` corresponding to win type
- Maintain backward compatibility with existing `won`, `winner`, and `state` fields
- Return `winType: null` and `multiplier: 1` when no win detected

**Single Win Detection (1x multiplier)**
- Opponent has borne off at least one piece: `opponent.home >= 1`
- This is the default win type when opponent has started bearing off
- Least valuable win condition in terms of match points

**Gammon Win Detection (2x multiplier)**
- Opponent has NOT borne off any pieces: `opponent.home === 0`
- Opponent has no pieces on the bar AND no pieces in winner's home board
- More valuable than single win, indicates opponent was behind in bearing off

**Backgammon Win Detection (3x multiplier)**
- Opponent has NOT borne off any pieces: `opponent.home === 0`
- Opponent has pieces on bar OR in winner's home board
- Winner's home board: points 0-5 for white winner, points 18-23 for black winner
- Most valuable win, indicates opponent was severely behind

**Helper Function: getWinnerHomeRange()**
- Accept winner player color as parameter
- Return tuple `[start, end]` representing home board point indices
- White winner home range: `[0, 5]`
- Black winner home range: `[18, 23]`

**Helper Function: hasOpponentPiecesInWinnerHome()**
- Accept game state and winner player color
- Iterate through winner's home board range
- Check for opponent pieces (negative values for white winner, positive for black)
- Return boolean indicating presence of opponent pieces

**Helper Function: calculateWinType()**
- Accept game state and winner player color
- Determine opponent using existing `getOpponent()` utility
- Check opponent's home count first to determine if gammon/backgammon possible
- Check bar and home board for backgammon conditions
- Return object with `winType` and `multiplier`

**State Schema Update**
- Add `winType` field to GameState type definition in `src/state/types.js`
- Field should be `'single' | 'gammon' | 'backgammon' | null`
- Only populated when `status === 'completed'`

## Visual Design
No visual assets provided for this specification.

## Existing Code to Leverage

**`/action/detect-win.js`**
- Current implementation checks `state.home[player] === 15` for basic win
- Returns `{ won, winner, state }` object structure
- Modify this file directly to add win type calculation
- Keep `PIECES_PER_PLAYER` constant for win threshold

**`/src/validation/constants.js`**
- `WHITE_HOME_RANGE` and `BLACK_HOME_RANGE` already defined as `[0, 5]` and `[18, 23]`
- `getHomeRange(player)` utility returns appropriate range for player
- `getOpponent(player)` utility returns opponent color
- `isOpponentPiece(boardValue, player)` checks piece ownership

**`/src/state/types.js`**
- Contains JSDoc type definitions for `GameState`, `PlayerColor`
- Add `winType` field to GameState typedef
- Follow existing documentation style with JSDoc annotations

**`/tests/action/bearoff-integration.test.js`**
- Contains test patterns for win detection scenarios
- Uses `createBearOffState()` helper for test state creation
- Follow same import structure and describe/it patterns using Vitest

## Out of Scope
- Doubling cube integration or Crawford rule handling
- Match scoring system or cumulative point tracking
- UI display of win type (frontend concern)
- Network/multiplayer win notification
- Win animation or celebration effects
- Historical win type tracking or statistics
- Undo/rollback of completed games
- Tournament bracket integration
- Win type disputes or appeals
- Localization of win type names
