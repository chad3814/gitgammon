# Specification: Dice System

## Goal
Create a server-side dice rolling module for GitHub Actions that generates cryptographically secure dice rolls after move validation, updates game state, and handles special cases like initial game rolls and no-move scenarios.

## User Stories
- As the game engine, I need dice rolls generated server-side so that players cannot manipulate randomness
- As a player, I want fair, cryptographically secure dice rolls so the game maintains integrity
- As a player starting a new game, I want a fair initial roll to determine who goes first

## Specific Requirements

**Dice Rolling Function**
- Use Node.js `crypto.randomInt(1, 7)` for each die (cryptographically secure, range 1-6)
- Return two dice values as an array: `[die1, die2]`
- Function signature: `rollDice()` returning `number[]`
- Pure function with no side effects beyond randomness

**Initial Game Roll**
- Determines which player goes first using standard backgammon rules
- Roll two dice, assign one to each player conceptually
- Higher roll wins and goes first; ties re-roll until resolved
- Store the winning roll as the first turn's dice
- Return structure: `{ startingPlayer: PlayerColor, dice: number[] }`
- Function signature: `rollForStart()`

**Turn-End Dice Roll**
- Called after successful move validation in the GitHub Action
- Rolls new dice for the next player's turn
- Resets `diceUsed` to empty array `[]`
- Handles doubles: if both dice match, player gets 4 moves (validation engine already handles this)
- Function signature: `rollForNextTurn(gameState)` returning updated dice-related fields

**No-Move Detection and Auto-Pass**
- After rolling new dice, check if the next player has any legal moves
- Use existing `calculateLegalMoves(gameState, dice, player)` from validation module
- If no legal moves possible:
  - Add info message: "Player {color} cannot move with roll [{die1}, {die2}], turn passes"
  - Switch `activePlayer` to opponent
  - Roll new dice for the now-active player
  - Repeat check (rare but possible: neither player can move)
- Return indicates if turn was auto-passed

**State Update Structure**
- The dice module returns an update object, not the full state
- Update object structure:
```javascript
{
  dice: number[],           // New dice roll
  diceUsed: number[],       // Always [] for new roll
  activePlayer?: string,    // Only if auto-pass occurred
  messages?: Message[],     // Only if messages to add
}
```
- The GitHub Action merges this with existing state

**Doubles Handling**
- Store doubles as `[n, n]` (two values, not four)
- Existing schema supports `minItems: 2, maxItems: 4` but we use 2
- Validation engine's `calculateLegalMoves` already handles doubles by allowing 4 moves
- No special storage needed; logic determines move count from dice values

**Message Generation**
- Generate info messages for game events
- Auto-pass message format: `"Player {color} cannot move with roll [{die1}, {die2}], turn passes"`
- Messages include `type: 'info'`, `text`, and `timestamp` (ISO 8601)
- Function: `createDiceMessage(type, text)` returning Message object

**DiceRollResult Type**
- Return type for all dice operations
- Structure:
```javascript
{
  dice: number[],
  diceUsed: number[],
  autoPass: boolean,
  messages: Message[],
  activePlayer?: PlayerColor  // Only set if autoPass occurred
}
```

## Existing Code to Leverage

**src/state/schema/game-state.schema.json**
- Schema defines `dice` array (2-4 items, integers 1-6)
- Schema defines `diceUsed` array (0-4 items)
- Schema defines `messages` array with type/text/timestamp structure
- No schema changes required - dice module works within existing structure

**src/state/constants.js**
- Use `PLAYER_COLORS`, `isValidPlayer()`, `isValidDieValue()` for validation
- Use `MESSAGE_TYPES` for message creation

**src/state/create.js**
- Reference `createMessage()` pattern for message creation
- Follow factory function patterns for dice result creation

**src/validation/forced-moves.js**
- Use `calculateLegalMoves(gameState, remainingDice, player)` for legal move detection
- Use `buildMoveTree()` if deeper analysis needed
- Already handles doubles, bar re-entry, bearing off

**src/validation/constants.js**
- Use `getOpponent(player)` for switching players on auto-pass

## Visual Design
No visual assets provided.

## Out of Scope
- Doubling cube and cube-related dice rules
- Custom dice faces, weighted dice, or non-standard dice
- Match-specific dice rules (e.g., Crawford rule dice handling)
- Manual dice setting for debugging or testing
- Dice animation, display, or UI components
- Re-roll mechanics beyond initial game roll tie-breaking
- Dice history tracking beyond current turn
- Client-side dice preview or prediction
