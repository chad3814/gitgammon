# Specification: Move File Format

## Goal

Define the JSON schema for move files in `tables/{id}/moves/` directory, enabling atomic move submission, conflict detection, and game history tracking through individual timestamped move records.

## User Stories

- As a player, I want to submit moves in a structured format so that the GitHub Action can validate and apply them to the game state.
- As a GitHub Action, I want a well-defined move schema with conflict detection so that I can safely validate and reject conflicting concurrent moves.

## Specific Requirements

**Filename Convention**
- Format: `{sequence}-{player}-{sha}.json`
- Sequence: 4-digit zero-padded integer (e.g., `0001`, `0012`, `0123`)
- Player: lowercase `white` or `black`
- SHA: 6-character truncated hex string (e.g., `a1b2c3`)
- Full example: `0001-white-a1b2c3.json`
- Sequence numbers start at 1 and increment for each move regardless of player

**Machine-Readable Move Notation**
- Each individual move uses `{from, to, die}` structure
- Points are 0-indexed (0-23) to match the board array in state.json
- Special value `-1` represents the bar (pieces waiting to re-enter)
- Special value `24` represents bear-off (pieces leaving the board)
- `die` is the dice value used for this move (1-6)
- Moves array contains 1-4 individual moves (up to 4 for doubles)

**Expected State Hash for Conflict Detection**
- `expectedState` contains a hash of state.json before the move
- Used to detect concurrent move submissions that would conflict
- If expectedState does not match current state hash, move is rejected
- Enables safe concurrent gameplay without git merge conflicts
- Hash algorithm: SHA-256 of state.json content (truncated to 16 characters)

**Dice Roll Recording**
- `diceRoll` array captures the dice values being used
- Length 2 for normal rolls (e.g., `[3, 5]`)
- Length 4 for doubles (e.g., `[4, 4, 4, 4]`)
- Must match available dice in current game state
- Enables standalone move validation without referencing state

**Timestamp and Commit Tracking**
- `timestamp` is ISO 8601 format when player submitted the move
- `commitSha` is initially `null`, populated by GitHub Action after commit
- Provides full audit trail linking move files to git history

**Optional Comment Field**
- `comment` allows player messages or notes
- Can be `null` or empty string `""`
- Maximum length: 280 characters (tweet-length)
- Visible in game history and git diffs

## Visual Design

No visual assets provided for this specification.

## Existing Code to Leverage

**Game State Schema Spec (`/spekka/specs/2026-01-21-game-state-schema/spec.md`)**
- Follow same JSON Schema structure (draft 2020-12)
- Reference `lastMove` object format for consistency
- Match board indexing convention (0-based, 24-element)
- Use same player color enum pattern

**Type Definitions (`/src/state/types.js`)**
- Extend with `SingleMove` and `MoveFile` type definitions
- Use existing `PlayerColor` typedef pattern
- Follow established JSDoc documentation style

**Backend Models Skill (`/.claude/skills/backend-models/SKILL.md`)**
- Contains draft `SingleMove` and `MoveFile` structures
- Adapt from 1-based to 0-based point indexing
- Remove unused index 0 and 25 conventions
- Add required metadata fields (expectedState, diceRoll, commitSha)

## Out of Scope

- Move validation logic (determines if moves are legal)
- GitHub Action workflow implementation
- Doubling cube actions or resignation moves
- Match play state updates
- Move undo/redo functionality
- Move suggestions or hints
- Time controls or move deadlines
- Move animation data or UI hints
- Piece hit tracking (derived from board state changes)
- Schema migration tooling

---

## Complete JSON Schema Definition

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://gitgammon.github.io/schemas/move.json",
  "title": "GitGammon Move File",
  "description": "Individual move submission for a GitGammon table",
  "type": "object",
  "required": [
    "player",
    "moves",
    "timestamp",
    "expectedState",
    "diceRoll",
    "comment",
    "commitSha"
  ],
  "properties": {
    "player": {
      "type": "string",
      "enum": ["white", "black"],
      "description": "Player making the move"
    },
    "moves": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/SingleMove"
      },
      "minItems": 1,
      "maxItems": 4,
      "description": "Array of individual moves (1-4 moves per turn)"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp when move was submitted"
    },
    "expectedState": {
      "type": "string",
      "pattern": "^[a-f0-9]{16}$",
      "description": "Truncated SHA-256 hash of state.json before move (16 characters)"
    },
    "diceRoll": {
      "type": "array",
      "items": {
        "type": "integer",
        "minimum": 1,
        "maximum": 6
      },
      "minItems": 2,
      "maxItems": 4,
      "description": "Dice values being used (2 for normal, 4 for doubles)"
    },
    "comment": {
      "oneOf": [
        { "type": "null" },
        {
          "type": "string",
          "maxLength": 280
        }
      ],
      "description": "Optional player comment or message"
    },
    "commitSha": {
      "oneOf": [
        { "type": "null" },
        {
          "type": "string",
          "pattern": "^[a-f0-9]{40}$"
        }
      ],
      "description": "Full git commit SHA, populated by GitHub Action after commit"
    }
  },
  "additionalProperties": false,
  "$defs": {
    "SingleMove": {
      "type": "object",
      "required": ["from", "to", "die"],
      "properties": {
        "from": {
          "type": "integer",
          "minimum": -1,
          "maximum": 23,
          "description": "Source: 0-23 for board points, -1 for bar"
        },
        "to": {
          "type": "integer",
          "minimum": 0,
          "maximum": 24,
          "description": "Destination: 0-23 for board points, 24 for bear-off"
        },
        "die": {
          "type": "integer",
          "minimum": 1,
          "maximum": 6,
          "description": "Die value used for this move"
        }
      },
      "additionalProperties": false
    }
  }
}
```

---

## Example: Opening Move

White's first move using dice roll [3, 5]:

**Filename:** `0001-white-f7e2a9.json`

```json
{
  "player": "white",
  "moves": [
    { "from": 5, "to": 2, "die": 3 },
    { "from": 7, "to": 2, "die": 5 }
  ],
  "timestamp": "2025-01-21T12:01:00Z",
  "expectedState": "a3b4c5d6e7f8g9h0",
  "diceRoll": [3, 5],
  "comment": null,
  "commitSha": null
}
```

**Explanation:**
- Move 1: Point 6 to point 3 using die value 3 (index 5 to index 2)
- Move 2: Point 8 to point 3 using die value 5 (index 7 to index 2)
- Making a point on the 3-point (index 2)

---

## Example: Mid-Game Move with Comment

Black's move on turn 8 with comment:

**Filename:** `0015-black-c4d5e6.json`

```json
{
  "player": "black",
  "moves": [
    { "from": 12, "to": 16, "die": 4 },
    { "from": 16, "to": 18, "die": 2 }
  ],
  "timestamp": "2025-01-21T14:32:15Z",
  "expectedState": "1234567890abcdef",
  "diceRoll": [4, 2],
  "comment": "Running for safety!",
  "commitSha": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
}
```

**Explanation:**
- Move 1: Point 13 to point 17 using die value 4 (index 12 to index 16)
- Move 2: Point 17 to point 19 using die value 2 (index 16 to index 18)
- Player added a comment visible in game history
- `commitSha` populated after GitHub Action processed the move

---

## Example: Bar Entry

White re-enters from the bar:

**Filename:** `0023-white-b5c6d7.json`

```json
{
  "player": "white",
  "moves": [
    { "from": -1, "to": 20, "die": 4 },
    { "from": 11, "to": 5, "die": 6 }
  ],
  "timestamp": "2025-01-21T15:45:30Z",
  "expectedState": "fedcba9876543210",
  "diceRoll": [4, 6],
  "comment": null,
  "commitSha": null
}
```

**Explanation:**
- Move 1: Bar entry to point 21 using die value 4 (`from: -1` indicates bar, `to: 20` is point 21)
- Move 2: Point 12 to point 6 using die value 6 (index 11 to index 5)
- White must enter from bar before moving other pieces
- Bar entry target: For white entering with die N, destination is index (24 - N)

---

## Example: Bearing Off

White bears off two pieces with doubles:

**Filename:** `0047-white-e8f9g0.json`

```json
{
  "player": "white",
  "moves": [
    { "from": 2, "to": 24, "die": 3 },
    { "from": 2, "to": 24, "die": 3 },
    { "from": 0, "to": 24, "die": 3 },
    { "from": 0, "to": 24, "die": 3 }
  ],
  "timestamp": "2025-01-21T18:20:45Z",
  "expectedState": "0123456789abcdef",
  "diceRoll": [3, 3, 3, 3],
  "comment": "Four off! GG",
  "commitSha": null
}
```

**Explanation:**
- All four moves bear off pieces (`to: 24` indicates bear-off)
- Moves 1-2: Bear off from point 3 (index 2)
- Moves 3-4: Bear off from point 1 (index 0)
- Doubles [3, 3] provide four dice to use
- White can only bear off when all pieces are in home board (indices 0-5)

---

## Field-by-Field Documentation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `player` | `'white' \| 'black'` | Yes | Player submitting the move. Must match `activePlayer` in current state. |
| `moves` | `SingleMove[]` | Yes | Array of 1-4 individual moves comprising the turn. |
| `timestamp` | `string` | Yes | ISO 8601 timestamp when player submitted the move. |
| `expectedState` | `string` | Yes | 16-character truncated SHA-256 of state.json before move. |
| `diceRoll` | `number[]` | Yes | Dice values being used. Length 2 normally, 4 for doubles. |
| `comment` | `string \| null` | Yes | Optional player comment (max 280 chars) or null. |
| `commitSha` | `string \| null` | Yes | Full 40-char git commit SHA, null until GitHub Action commits. |

### SingleMove Object

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `from` | `integer` | -1 to 23 | Source location: -1 = bar, 0-23 = board point index |
| `to` | `integer` | 0 to 24 | Destination: 0-23 = board point index, 24 = bear-off |
| `die` | `integer` | 1 to 6 | Die value consumed by this move |

---

## Special Value Conventions

### Bar (from: -1)

- Used when a player's piece is on the bar and must re-enter
- Only valid as `from` value, never as `to`
- White re-enters into black's home board (indices 18-23)
- Black re-enters into white's home board (indices 0-5)
- Re-entry point calculation:
  - White with die N: enters at index `24 - N` (die 4 enters index 20, which is point 21)
  - Black with die N: enters at index `N - 1` (die 4 enters index 3, which is point 4)

### Bear-Off (to: 24)

- Used when bearing off a piece from the board
- Only valid as `to` value, never as `from`
- Only legal when all player's pieces are in their home board
- Home board indices:
  - White: indices 0-5 (points 1-6)
  - Black: indices 18-23 (points 19-24)
- Bear-off point calculation:
  - White with die N from index I: legal if `I < N` or `I == N - 1` (exact) or no pieces on higher indices
  - Black with die N from index I: legal if `I > 23 - N` or `I == 24 - N` (exact) or no pieces on lower indices

### Point Index Mapping

| Index | Point | White Direction | Black Direction |
|-------|-------|-----------------|-----------------|
| 0 | 1 | Home board | Outer board |
| 5 | 6 | Home board | Outer board |
| 6 | 7 | Outer board | Outer board |
| 11 | 12 | Outer board | Outer board |
| 12 | 13 | Outer board | Outer board |
| 17 | 18 | Outer board | Outer board |
| 18 | 19 | Outer board | Home board |
| 23 | 24 | Outer board | Home board |

---

## Validation Rules

**Filename Validation**
- Sequence must be exactly 4 digits, zero-padded
- Player must be lowercase `white` or `black`
- SHA must be exactly 6 lowercase hexadecimal characters
- Format regex: `^[0-9]{4}-(white|black)-[a-f0-9]{6}\.json$`

**Player Validation**
- `player` field must match `activePlayer` in current game state
- `player` field must match the player component of the filename

**Expected State Validation**
- `expectedState` must match hash of current state.json
- If mismatch, move is rejected (concurrent move conflict)
- Hash must be exactly 16 lowercase hexadecimal characters

**Dice Validation**
- `diceRoll` must match available `dice` in current game state
- Each `die` value in moves must be present in `diceRoll`
- Total dice used across all moves must not exceed `diceRoll` length
- Cannot use same die value more times than it appears in `diceRoll`

**Move Count Validation**
- Minimum 1 move per file
- Maximum 4 moves per file (doubles)
- Must use as many dice as legally possible

**Point Range Validation**
- `from` must be -1 (bar) or 0-23 (board)
- `to` must be 0-23 (board) or 24 (bear-off)
- `from` and `to` must differ

**Move Direction Validation**
- White moves from higher indices to lower (or to bear-off at 24)
- Black moves from lower indices to higher (or to bear-off at 24)
- Exception: bar entry follows re-entry rules

**Bar Priority Validation**
- If player has pieces on bar, first move(s) must be bar entry
- Cannot move board pieces until all bar pieces re-enter

**Bear-Off Validation**
- Can only bear off when all pieces in home board
- Die value must be sufficient to reach bear-off position

**Timestamp Validation**
- Must be valid ISO 8601 format
- Should be within reasonable time window (not in future)

**Comment Validation**
- Must be null or string
- If string, maximum 280 characters
