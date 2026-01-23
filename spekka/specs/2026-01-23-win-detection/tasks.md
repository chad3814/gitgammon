# Task Breakdown: Win Type Detection

## Overview
Total Tasks: 14

This spec enhances the existing win detection in `action/detect-win.js` to calculate and return the type of win (single, gammon, or backgammon) with appropriate point multipliers for scoring purposes.

## Task List

### Helper Functions Layer

#### Task Group 1: Win Type Helper Functions
**Dependencies:** None

- [x] 1.0 Complete win type helper functions
  - [x] 1.1 Write 6 focused tests for helper functions
    - Test `getWinnerHomeRange('white')` returns `[0, 5]`
    - Test `getWinnerHomeRange('black')` returns `[18, 23]`
    - Test `hasOpponentPiecesInWinnerHome()` returns true when opponent pieces in winner's home
    - Test `hasOpponentPiecesInWinnerHome()` returns false when no opponent pieces in winner's home
    - Test `calculateWinType()` returns single win when opponent has borne off pieces
    - Test `calculateWinType()` returns correct `winType` and `multiplier` tuple
  - [x] 1.2 Implement `getWinnerHomeRange(winner)` helper function
    - Accept winner player color as parameter
    - Return tuple `[start, end]` representing home board point indices
    - White winner home range: `[0, 5]`
    - Black winner home range: `[18, 23]`
    - Add JSDoc documentation following existing patterns
  - [x] 1.3 Implement `hasOpponentPiecesInWinnerHome(state, winner)` helper function
    - Accept game state and winner player color
    - Use `getWinnerHomeRange()` to get range
    - Iterate through winner's home board range
    - Use `isOpponentPiece()` from `src/validation/constants.js`
    - Return boolean indicating presence of opponent pieces
  - [x] 1.4 Implement `calculateWinType(state, winner)` helper function
    - Accept game state and winner player color
    - Use `getOpponent()` from `src/validation/constants.js`
    - Check opponent's `home` count first (if >= 1, return single)
    - Check bar and home board for backgammon conditions
    - Return object with `winType` and `multiplier`
  - [x] 1.5 Ensure helper function tests pass
    - Run ONLY the 6 tests written in 1.1
    - Verify all edge cases handled correctly

**Acceptance Criteria:**
- The 6 tests written in 1.1 pass
- Helper functions correctly determine win type
- Functions properly handle both white and black winners
- Functions use existing utilities from `src/validation/constants.js`

---

### Win Detection Layer

#### Task Group 2: Enhanced detectWin() Function
**Dependencies:** Task Group 1

- [x] 2.0 Complete enhanced detectWin() function
  - [x] 2.1 Write 6 focused tests for enhanced detectWin()
    - Test detectWin returns `winType: null` and `multiplier: 1` when no win
    - Test detectWin returns `winType: 'single'` when opponent has borne off pieces
    - Test detectWin returns `winType: 'gammon'` when opponent has 0 home and no pieces in winner's home
    - Test detectWin returns `winType: 'backgammon'` when opponent has pieces on bar
    - Test detectWin returns `winType: 'backgammon'` when opponent has pieces in winner's home board
    - Test detectWin maintains backward compatibility with `won`, `winner`, and `state` fields
  - [x] 2.2 Update `detectWin()` return type to include win type
    - Add `winType` field: `'single' | 'gammon' | 'backgammon' | null`
    - Add `multiplier` field: `1`, `2`, or `3`
    - Maintain backward compatibility with existing fields
    - Return `winType: null` and `multiplier: 1` when no win detected
  - [x] 2.3 Integrate `calculateWinType()` into `detectWin()`
    - Call `calculateWinType()` when win is detected
    - Include result in return object
    - Add `winType` to state update when completing game
  - [x] 2.4 Update JSDoc documentation for `detectWin()`
    - Document new return type fields
    - Follow existing documentation style
    - Add examples in comments if helpful
  - [x] 2.5 Ensure enhanced detectWin tests pass
    - Run ONLY the 6 tests written in 2.1
    - Verify backward compatibility maintained

**Acceptance Criteria:**
- The 6 tests written in 2.1 pass
- detectWin returns correct win type for all scenarios
- Backward compatibility maintained with existing code
- JSDoc documentation is complete and accurate

---

### State Schema Layer

#### Task Group 3: State Schema Update
**Dependencies:** Task Group 2

- [x] 3.0 Complete state schema update
  - [x] 3.1 Write 2 focused tests for state schema
    - Test GameState with `winType` field passes type checking
    - Test completed game state includes `winType` in correct format
  - [x] 3.2 Update `src/state/types.js` with winType typedef
    - Add `@typedef {'single' | 'gammon' | 'backgammon' | null} WinType`
    - Add `winType` field to GameState typedef
    - Document field is only populated when `status === 'completed'`
  - [x] 3.3 Ensure state schema tests pass
    - Run ONLY the 2 tests written in 3.1
    - Verify type definitions are correct

**Acceptance Criteria:**
- The 2 tests written in 3.1 pass
- WinType typedef correctly defined
- GameState includes winType field with proper documentation

---

### Testing

#### Task Group 4: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review 6 helper function tests (Task 1.1)
    - Review 6 enhanced detectWin tests (Task 2.1)
    - Review 2 state schema tests (Task 3.1)
    - Total existing tests: 14 tests
  - [x] 4.2 Analyze test coverage gaps for this feature only
    - Identify critical win type scenarios without tests
    - Check edge cases: bar + home board pieces, exactly 0 vs 1 home pieces
    - Verify integration with existing bearoff tests in `tests/action/bearoff-integration.test.js`
  - [x] 4.3 Write up to 6 additional strategic tests if needed
    - Focus on integration between detectWin and existing pipeline
    - Test edge cases identified in 4.2
    - Test win type for both white and black winners
    - Add backgammon tests with pieces on bar AND in home board
  - [x] 4.4 Run all feature-specific tests
    - Run all tests related to win type detection
    - Expected total: approximately 14-20 tests
    - Verify all tests pass

**Acceptance Criteria:**
- All 14+ feature-specific tests pass
- Critical win type scenarios have test coverage
- Edge cases from spec are tested
- No more than 6 additional tests added

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Helper Functions Layer**
   - Core win type calculation logic
   - Uses existing utilities from validation/constants.js
   - No dependencies on other groups

2. **Task Group 2: Win Detection Layer**
   - Enhances existing detectWin() function
   - Depends on helper functions from Group 1
   - Must maintain backward compatibility

3. **Task Group 3: State Schema Layer**
   - Updates type definitions
   - Depends on Group 2 for understanding final return structure

4. **Task Group 4: Test Review and Gap Analysis**
   - Depends on all other groups
   - Validates complete implementation
   - Integration with existing tests

---

## File Structure Summary

Files to be modified/created:

```
action/
  detect-win.js              # Enhanced with win type detection

src/
  state/
    types.js                 # Add WinType typedef

tests/
  action/
    win-detection.test.js    # New test file for win type detection
```

---

## Win Type Logic Reference

From the spec, the win type determination follows this logic:

| Condition | Win Type | Multiplier |
|-----------|----------|------------|
| Opponent home >= 1 | Single | 1x |
| Opponent home === 0, no pieces on bar or in winner's home | Gammon | 2x |
| Opponent home === 0, pieces on bar OR in winner's home | Backgammon | 3x |

**Winner's Home Board Ranges:**
- White winner: points 0-5 (check for black/negative pieces)
- Black winner: points 18-23 (check for white/positive pieces)
