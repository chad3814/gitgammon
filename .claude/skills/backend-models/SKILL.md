---
description: Game state and move data models as JSON schemas. Use when defining or modifying state.json structure, move file format, or validating data shapes. Reference for all game data structures.
---

# Data Models

## When to use this skill:
- Defining `state.json` schema in `src/state/`
- Creating move file formats
- Validating game data
- Writing JSDoc types

## Game State Schema

`tables/{id}/state.json`:

```javascript
/**
 * @typedef {Object} GameState
 * @property {number} turn - Current turn number (1-indexed)
 * @property {'white'|'black'} activePlayer - Player to move
 * @property {number[]} dice - Current dice values [1-6, 1-6]
 * @property {number[]} diceUsed - Dice values already used this turn
 * @property {number[]} board - 26-element array: [0]=unused, [1-24]=points, [25]=unused
 * @property {{white: number, black: number}} bar - Pieces on bar
 * @property {{white: number, black: number}} home - Pieces borne off
 * @property {string|null} lastMove - Reference to last move file
 * @property {'playing'|'completed'} status
 * @property {string|null} winner - Winner if completed
 * @property {string} updatedAt - ISO timestamp
 */
```

Board representation:
- Positive numbers = white pieces
- Negative numbers = black pieces
- Index 1-24 = points (1 is white's home board, 24 is black's)
- Index 0 and 25 are unused (for convenient indexing)

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
  "winner": null,
  "updatedAt": "2025-01-21T12:00:00Z"
}
```

## Move File Schema

`tables/{id}/moves/{seq}-{color}-{sha}.json`:

```javascript
/**
 * @typedef {Object} SingleMove
 * @property {number} from - Source point (0=bar, 1-24=point, 25=bear-off)
 * @property {number} to - Destination point
 * @property {number} die - Die value used
 */

/**
 * @typedef {Object} MoveFile
 * @property {'white'|'black'} player
 * @property {SingleMove[]} moves - List of individual moves (up to 4 for doubles)
 * @property {string} timestamp - ISO timestamp
 */
```

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

## Initial Board Setup

Standard backgammon starting position:

```javascript
const INITIAL_BOARD = [
  0,    // index 0 (unused)
  2,    // point 1: 2 white
  0, 0, 0, 0,
  -5,   // point 6: 5 black
  0,
  -3,   // point 8: 3 black
  0, 0, 0,
  5,    // point 12: 5 white
  -5,   // point 13: 5 black
  0, 0, 0,
  3,    // point 17: 3 white
  0,
  5,    // point 19: 5 white
  0, 0, 0,
  -2,   // point 24: 2 black
  0     // index 25 (unused)
]
```

## Doubling Cube (Future)

```javascript
/**
 * @typedef {Object} DoublingCube
 * @property {1|2|4|8|16|32|64} value - Current stake multiplier
 * @property {'white'|'black'|null} owner - Who can offer next double
 */
```

## Match State (Future)

```javascript
/**
 * @typedef {Object} MatchState
 * @property {number} targetScore - Points to win match
 * @property {{white: number, black: number}} score
 * @property {boolean} crawfordGame - Is this the Crawford game?
 * @property {boolean} crawfordUsed - Has Crawford game occurred?
 */
```
