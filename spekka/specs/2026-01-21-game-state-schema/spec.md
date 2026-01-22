# Specification: Game State Schema

## Goal

Define the JSON schema for `state.json` that represents the authoritative game state for GitGammon tables, enabling frontend rendering, move validation, and game history tracking.

## User Stories

- As a player, I want the game state to accurately reflect the current board position so that I can make informed moves.
- As a GitHub Action, I want a well-defined schema so that I can validate moves and update state atomically.

## Specific Requirements

**Board Array Representation**
- Use a 0-based 24-element array (not 26-element padded array)
- Index 0 represents point 1 (white's home board corner)
- Index 23 represents point 24 (black's home board corner)
- Positive integers represent white pieces; negative integers represent black pieces
- Zero represents an empty point

**Player Identity Mapping**
- Include `players` object mapping colors to GitHub usernames
- Format: `players: {white: 'githubUsername', black: 'githubUsername'}`
- Required for validating that the correct player is making a move
- Enables display of player names in the UI

**Turn and Active Player Tracking**
- `turn` is a 1-indexed integer representing the current turn number
- `activePlayer` is `'white' | 'black'` indicating whose turn it is
- Turn increments after a player completes their move (uses all dice)

**Dice State Management**
- `dice` is a 2-element array of integers (1-6), or 4-element for doubles
- `diceUsed` tracks which dice values have been consumed this turn
- Dice are rolled server-side by GitHub Actions after move validation
- Initial dice roll determines starting player (higher roll goes first)

**Bar and Home Tracking**
- `bar` object: `{white: number, black: number}` for pieces hit and waiting to re-enter
- `home` object: `{white: number, black: number}` for pieces successfully borne off
- Sum of board pieces + bar + home must equal 15 for each color

**Last Move Reference**
- Use structured object instead of string reference
- Format: `{sequence: number, player: 'white'|'black', file: string}`
- `sequence` matches the move number in the filename
- `file` contains the full filename (e.g., `0012-black-a1b2c3.json`)
- `null` for initial game state before any moves

**Game Status and Winner**
- `status` is `'playing' | 'completed'`
- `winner` is `'white' | 'black' | null`
- `winner` is `null` while `status` is `'playing'`
- Win type (single/gammon/backgammon) not tracked in MVP

**Messages Array**
- Include array for system messages and errors
- Each message: `{type: 'error'|'info'|'warning', text: string, timestamp: string}`
- Invalid moves add error messages here (move is still rejected)
- Used for game events like "Game started", "Player resigned"
- Older messages may be pruned to prevent unbounded growth

**Timestamp Tracking**
- `updatedAt` is an ISO 8601 timestamp string
- Updated on every state change (move applied, dice rolled, etc.)
- Enables cache invalidation and ordering of state updates

## Visual Design

No visual assets provided for this specification.

## Existing Code to Leverage

**Backend Models Skill (`/.claude/skills/backend-models/SKILL.md`)**
- Contains JSDoc type definitions for `GameState`, `SingleMove`, `MoveFile`
- Defines board representation conventions (positive=white, negative=black)
- Includes initial board constant `INITIAL_BOARD` (will need adaptation for 24-element format)
- Move file schema can inform `lastMove` structure

**Tech Stack Architecture (`/spekka/product/tech-stack.md`)**
- Defines file structure: `tables/{table-id}/state.json`
- Specifies move file naming: `{seq}-{color}-{sha}.json`
- Documents JSON as human-readable, diffable format requirement
- Outlines GitHub Actions validation workflow

## Out of Scope

- Move file schema (roadmap item #3, separate spec)
- Doubling cube fields (Phase 2, roadmap item #16)
- Match play state (Phase 2, roadmap item #17)
- Move validation logic (roadmap item #4)
- Win type calculation (single/gammon/backgammon scoring)
- Undo/redo functionality
- Game clock or time controls
- Spectator list or viewer tracking
- Chat or in-game messaging beyond system messages
- Schema migration tooling (handle when needed)

---

## Complete JSON Schema Definition

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://gitgammon.github.io/schemas/state.json",
  "title": "GitGammon Game State",
  "description": "Authoritative game state for a GitGammon table",
  "type": "object",
  "required": [
    "turn",
    "activePlayer",
    "dice",
    "diceUsed",
    "board",
    "bar",
    "home",
    "lastMove",
    "status",
    "winner",
    "players",
    "messages",
    "updatedAt"
  ],
  "properties": {
    "turn": {
      "type": "integer",
      "minimum": 1,
      "description": "Current turn number, 1-indexed"
    },
    "activePlayer": {
      "type": "string",
      "enum": ["white", "black"],
      "description": "Player whose turn it is to move"
    },
    "dice": {
      "type": "array",
      "items": {
        "type": "integer",
        "minimum": 1,
        "maximum": 6
      },
      "minItems": 2,
      "maxItems": 4,
      "description": "Current dice values (4 items when doubles rolled)"
    },
    "diceUsed": {
      "type": "array",
      "items": {
        "type": "integer",
        "minimum": 1,
        "maximum": 6
      },
      "maxItems": 4,
      "description": "Dice values already used this turn"
    },
    "board": {
      "type": "array",
      "items": {
        "type": "integer",
        "minimum": -15,
        "maximum": 15
      },
      "minItems": 24,
      "maxItems": 24,
      "description": "24-element array, positive=white, negative=black, index 0=point 1"
    },
    "bar": {
      "type": "object",
      "required": ["white", "black"],
      "properties": {
        "white": {
          "type": "integer",
          "minimum": 0,
          "maximum": 15
        },
        "black": {
          "type": "integer",
          "minimum": 0,
          "maximum": 15
        }
      },
      "additionalProperties": false,
      "description": "Pieces on the bar waiting to re-enter"
    },
    "home": {
      "type": "object",
      "required": ["white", "black"],
      "properties": {
        "white": {
          "type": "integer",
          "minimum": 0,
          "maximum": 15
        },
        "black": {
          "type": "integer",
          "minimum": 0,
          "maximum": 15
        }
      },
      "additionalProperties": false,
      "description": "Pieces successfully borne off"
    },
    "lastMove": {
      "oneOf": [
        { "type": "null" },
        {
          "type": "object",
          "required": ["sequence", "player", "file"],
          "properties": {
            "sequence": {
              "type": "integer",
              "minimum": 1,
              "description": "Move sequence number"
            },
            "player": {
              "type": "string",
              "enum": ["white", "black"]
            },
            "file": {
              "type": "string",
              "pattern": "^[0-9]{4}-(white|black)-[a-f0-9]+\\.json$",
              "description": "Filename of the move file"
            }
          },
          "additionalProperties": false
        }
      ],
      "description": "Reference to the last applied move, null for initial state"
    },
    "status": {
      "type": "string",
      "enum": ["playing", "completed"],
      "description": "Current game status"
    },
    "winner": {
      "oneOf": [
        { "type": "null" },
        { "type": "string", "enum": ["white", "black"] }
      ],
      "description": "Winner of the game, null while playing"
    },
    "players": {
      "type": "object",
      "required": ["white", "black"],
      "properties": {
        "white": {
          "type": "string",
          "minLength": 1,
          "description": "GitHub username of white player"
        },
        "black": {
          "type": "string",
          "minLength": 1,
          "description": "GitHub username of black player"
        }
      },
      "additionalProperties": false,
      "description": "Player identity mapping"
    },
    "messages": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type", "text", "timestamp"],
        "properties": {
          "type": {
            "type": "string",
            "enum": ["error", "info", "warning"]
          },
          "text": {
            "type": "string",
            "minLength": 1
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        },
        "additionalProperties": false
      },
      "description": "System messages and error notifications"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of last state update"
    }
  },
  "additionalProperties": false
}
```

---

## Example: Initial Game Setup

```json
{
  "turn": 1,
  "activePlayer": "white",
  "dice": [3, 5],
  "diceUsed": [],
  "board": [
    2, 0, 0, 0, 0, -5,
    0, -3, 0, 0, 0, 5,
    -5, 0, 0, 0, 3, 0,
    5, 0, 0, 0, 0, -2
  ],
  "bar": { "white": 0, "black": 0 },
  "home": { "white": 0, "black": 0 },
  "lastMove": null,
  "status": "playing",
  "winner": null,
  "players": {
    "white": "alice",
    "black": "bob"
  },
  "messages": [
    {
      "type": "info",
      "text": "Game started. White to move.",
      "timestamp": "2025-01-21T12:00:00Z"
    }
  ],
  "updatedAt": "2025-01-21T12:00:00Z"
}
```

**Board Layout Explanation (Initial Position):**
| Index | Point | Pieces | Description |
|-------|-------|--------|-------------|
| 0 | 1 | +2 | 2 white pieces |
| 5 | 6 | -5 | 5 black pieces |
| 7 | 8 | -3 | 3 black pieces |
| 11 | 12 | +5 | 5 white pieces |
| 12 | 13 | -5 | 5 black pieces |
| 16 | 17 | +3 | 3 white pieces |
| 18 | 19 | +5 | 5 white pieces |
| 23 | 24 | -2 | 2 black pieces |

---

## Example: Mid-Game State

```json
{
  "turn": 12,
  "activePlayer": "black",
  "dice": [4, 2],
  "diceUsed": [],
  "board": [
    0, 0, 2, 0, 0, -4,
    0, -2, 0, 0, 1, 4,
    -4, 0, 0, 1, 2, 0,
    4, 0, 0, -1, 0, 0
  ],
  "bar": { "white": 1, "black": 0 },
  "home": { "white": 0, "black": 4 },
  "lastMove": {
    "sequence": 11,
    "player": "white",
    "file": "0011-white-a3f2e1.json"
  },
  "status": "playing",
  "winner": null,
  "players": {
    "white": "alice",
    "black": "bob"
  },
  "messages": [
    {
      "type": "info",
      "text": "Game started. White to move.",
      "timestamp": "2025-01-21T12:00:00Z"
    },
    {
      "type": "info",
      "text": "White piece hit on point 21.",
      "timestamp": "2025-01-21T12:15:32Z"
    }
  ],
  "updatedAt": "2025-01-21T12:15:32Z"
}
```

**State Explanation:**
- Turn 12, black's turn to move with dice [4, 2]
- White has 1 piece on the bar (must re-enter before other moves)
- Black has borne off 4 pieces
- Last move was white's 11th move of the game

---

## Field-by-Field Documentation

| Field | Type | Description |
|-------|------|-------------|
| `turn` | integer | Current turn number (1-indexed). Increments after each player completes their move. |
| `activePlayer` | `'white' \| 'black'` | Which player must move next. Alternates after each completed turn. |
| `dice` | `number[]` | Current dice roll. Length 2 normally, length 4 for doubles (e.g., `[3,3,3,3]`). |
| `diceUsed` | `number[]` | Dice values consumed by moves this turn. Empty at turn start. |
| `board` | `number[24]` | Board state. Index = point - 1. Positive = white, negative = black, zero = empty. |
| `bar` | `{white, black}` | Count of pieces on the bar for each player. Must re-enter before moving others. |
| `home` | `{white, black}` | Count of pieces borne off. Game ends when one player reaches 15. |
| `lastMove` | `object \| null` | Reference to last move file. Null only for initial state. |
| `status` | `'playing' \| 'completed'` | Game lifecycle status. |
| `winner` | `'white' \| 'black' \| null` | Winner when completed, null while playing. |
| `players` | `{white, black}` | GitHub usernames mapped to colors. |
| `messages` | `Message[]` | System messages, errors, and game events. |
| `updatedAt` | `string` | ISO 8601 timestamp of last modification. |

---

## Validation Rules

**Piece Count Invariant**
- For each color: `|board pieces| + bar + home = 15`
- Board pieces for white: sum of all positive values
- Board pieces for black: absolute value of sum of all negative values

**Dice Constraints**
- Each die value must be 1-6
- `diceUsed` values must be a subset of `dice` values
- For doubles: `dice` contains 4 identical values

**Turn/Player Consistency**
- `activePlayer` must match whose turn it is based on game flow
- Initial `activePlayer` is determined by opening dice roll (higher wins)

**Status/Winner Consistency**
- If `status` is `'playing'`, `winner` must be `null`
- If `status` is `'completed'`, `winner` must be `'white'` or `'black'`
- Game completes when one player's `home` equals 15

**LastMove Consistency**
- `lastMove` is `null` only when `turn` is 1 and no moves made
- `lastMove.sequence` should match expected sequence based on game progression
- `lastMove.player` should be the opposite of `activePlayer` (unless turn just started)

**Message Constraints**
- All messages must have valid ISO 8601 timestamps
- Message `type` must be one of: `error`, `info`, `warning`
- Messages should be ordered chronologically

---

## Edge Cases and Constraints

**Opening Roll**
- Game starts with both players rolling one die
- Higher roll determines starting player and uses both dice
- If tied, re-roll until different

**Doubles Handling**
- When doubles rolled, `dice` array contains 4 identical values: `[n, n, n, n]`
- Player must use all 4 if legally possible

**No Legal Moves**
- If player has no legal moves with rolled dice, turn passes
- `diceUsed` remains empty, turn increments
- Add message: `{type: 'info', text: 'No legal moves available'}`

**Partial Move Usage**
- Player must use as many dice as legally possible
- If only one die can be used, must use the higher if both are individually playable

**Bar Priority**
- Player with pieces on bar must re-enter them before moving any board pieces
- Re-entry uses a die matching an open point in opponent's home board

**Bearing Off Conditions**
- All 15 pieces must be in home board (indices 0-5 for white, 18-23 for black)
- Can bear off from exact point or higher if no pieces on higher points

**Message Pruning**
- Implementations may prune messages older than N turns to prevent unbounded growth
- Recommended: keep last 20 messages or messages from last 10 turns

**Concurrent Access**
- State is authoritative after GitHub Action commits
- Frontend should poll and display latest committed state
- Move files enable conflict detection (separate spec)
