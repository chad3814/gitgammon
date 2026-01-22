# Task Breakdown: Dice System

## Overview
Total Tasks: 20 (across 4 task groups)

This spec creates a server-side dice rolling module (`src/dice/`) that generates cryptographically secure dice rolls for use in GitHub Actions, handling initial game rolls, turn-end rolls, and no-move detection.

## Task List

### Foundation Layer

#### Task Group 1: Types, Constants, and Core Dice Rolling
**Dependencies:** None

- [x] 1.0 Complete dice module foundation
  - [x] 1.1 Write 4-6 focused tests for core dice functionality
    - Test `rollDie()` returns integer between 1 and 6
    - Test `rollDice()` returns array of two valid dice values
    - Test dice values pass `isValidDieValue()` check
    - Test multiple rolls produce variation (not all same)
    - Test `createDiceResult()` factory returns correct structure
  - [x] 1.2 Create `src/dice/types.js` with JSDoc type definitions
    - Define `DiceRollResult` type: `{dice, diceUsed, autoPass, messages, activePlayer?}`
    - Define `InitialRollResult` type: `{startingPlayer, dice}`
    - Follow documentation style from `src/state/types.js`
  - [x] 1.3 Create `src/dice/constants.js` with dice-specific constants
    - `MIN_DIE_VALUE = 1`, `MAX_DIE_VALUE = 6`
    - `DICE_COUNT = 2`
    - Reuse `isValidDieValue` from `src/state/constants.js`
  - [x] 1.4 Create `src/dice/roll.js` with core dice rolling functions
    - Import `crypto` from Node.js
    - Implement `rollDie()` using `crypto.randomInt(1, 7)`
    - Implement `rollDice()` returning `[rollDie(), rollDie()]`
    - Implement `isDoubles(dice)` checking if both dice match
  - [x] 1.5 Create `src/dice/result.js` with result factory functions
    - Implement `createDiceResult(dice, options)` factory
    - Default `diceUsed` to `[]`, `autoPass` to `false`, `messages` to `[]`
    - Implement `createInitialRollResult(startingPlayer, dice)`
  - [x] 1.6 Ensure foundation tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify exports are accessible

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- Core rolling uses crypto.randomInt for security
- Factory functions produce correctly structured objects

---

### Initial Game Roll

#### Task Group 2: Starting Player Determination
**Dependencies:** Task Group 1

- [x] 2.0 Complete initial game roll functionality
  - [x] 2.1 Write 4-6 focused tests for initial roll
    - Test `rollForStart()` returns valid structure with startingPlayer and dice
    - Test startingPlayer is 'white' or 'black'
    - Test dice values match the roll that determined winner
    - Test tie-breaking produces different values (mock if needed)
    - Test returned dice have higher value first (winner's die)
  - [x] 2.2 Create `src/dice/initial-roll.js`
    - Implement `rollForStart()` function
    - Roll two dice, compare values
    - If tied, re-roll (with iteration limit for safety)
    - Higher roll wins and becomes `startingPlayer`
    - Return `{ startingPlayer, dice }` where dice is the winning roll
  - [x] 2.3 Ensure initial roll tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Verify tie-breaking logic works correctly

**Acceptance Criteria:**
- The 4-6 tests written in 2.1 pass
- Initial roll correctly determines starting player
- Tie-breaking re-rolls until resolved
- Standard backgammon convention followed

---

### Turn Management

#### Task Group 3: Turn-End Roll and No-Move Detection
**Dependencies:** Task Groups 1 and 2

- [x] 3.0 Complete turn-end roll functionality
  - [x] 3.1 Write 6-8 focused tests for turn-end roll
    - Test `rollForNextTurn()` returns new dice and empty diceUsed
    - Test `checkForLegalMoves()` returns true when moves exist
    - Test `checkForLegalMoves()` returns false when blocked
    - Test auto-pass message format is correct
    - Test auto-pass switches activePlayer correctly
    - Test double auto-pass (both players blocked) scenario
    - Test message timestamp is valid ISO 8601
  - [x] 3.2 Create `src/dice/turn-roll.js`
    - Import `calculateLegalMoves` from `src/validation/forced-moves.js`
    - Import `getOpponent` from `src/validation/constants.js`
    - Implement `checkForLegalMoves(gameState, dice, player)` using calculateLegalMoves
    - Implement `rollForNextTurn(gameState)` function
      - Get next player (opponent of activePlayer)
      - Roll new dice
      - Check for legal moves
      - If no moves, generate auto-pass message and switch player
      - Handle recursive auto-pass (max 2 iterations)
    - Return `DiceRollResult` with all relevant fields
  - [x] 3.3 Create `src/dice/messages.js` for message generation
    - Implement `createAutoPassMessage(player, dice)` function
    - Format: "Player {color} cannot move with roll [{die1}, {die2}], turn passes"
    - Return message object with type: 'info', text, timestamp
  - [x] 3.4 Ensure turn-end roll tests pass
    - Run ONLY the 6-8 tests written in 3.1
    - Verify integration with validation module

**Acceptance Criteria:**
- The 6-8 tests written in 3.1 pass
- Turn-end roll correctly identifies no-move situations
- Auto-pass messages are properly formatted
- Active player switches when auto-pass occurs

---

### Integration

#### Task Group 4: Module Integration and Entry Point
**Dependencies:** Task Groups 1, 2, and 3

- [x] 4.0 Complete module integration
  - [x] 4.1 Write 4-6 focused tests for module integration
    - Test all public functions exported from `src/dice/index.js`
    - Test integration: rollForStart → rollForNextTurn flow
    - Test result objects are compatible with state.json update
    - Test no circular dependencies
  - [x] 4.2 Create `src/dice/index.js` as module entry point
    - Export `rollDice`, `rollDie`, `isDoubles` from roll.js
    - Export `rollForStart` from initial-roll.js
    - Export `rollForNextTurn`, `checkForLegalMoves` from turn-roll.js
    - Export `createDiceResult`, `createInitialRollResult` from result.js
    - Export types from types.js
  - [x] 4.3 Ensure all tests pass
    - Run ONLY tests in `tests/dice/` directory
    - Verify module works end-to-end

**Acceptance Criteria:**
- The 4-6 tests written in 4.1 pass
- All public API functions exported
- Module is usable as single import point
- No circular dependencies

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Foundation Layer**
   - Core dice rolling with crypto.randomInt
   - Types and factory functions
   - No dependencies on other modules

2. **Task Group 2: Initial Game Roll**
   - Depends on core rolling from Group 1
   - Determines starting player

3. **Task Group 3: Turn Management**
   - Depends on Groups 1 and 2
   - Integrates with validation module for legal move detection
   - Most complex logic for auto-pass handling

4. **Task Group 4: Module Integration**
   - Depends on all other groups
   - Exposes public API
   - Final integration testing

## File Structure

After completion, `src/dice/` should contain:

```
src/dice/
  index.js              # Module entry point and public API
  types.js              # JSDoc type definitions
  constants.js          # Dice-specific constants
  roll.js               # Core dice rolling (crypto.randomInt)
  result.js             # Result factory functions
  initial-roll.js       # Starting player determination
  turn-roll.js          # Turn-end roll with no-move detection
  messages.js           # Message generation for dice events
```

## Notes

- All randomness uses `crypto.randomInt` for cryptographic security
- Module runs in Node.js environment (GitHub Actions)
- No state mutation - returns update objects for Action to merge
- Integrates with validation module for legal move detection
- Auto-pass can chain (rare but handled: both players blocked)
- Doubles stored as `[n, n]` - validation engine handles 4 moves
- Messages follow existing state.json message structure
