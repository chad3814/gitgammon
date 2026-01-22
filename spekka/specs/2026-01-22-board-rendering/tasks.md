# Task Breakdown: Board Rendering

## Overview
Total Tasks: 28 tasks across 5 task groups

This implementation creates a static HTML/CSS/JS page that renders a backgammon board using SVG with support for board flipping and responsive mobile layout. The tech stack is vanilla JavaScript (ES6+), CSS3, and SVG with no build step.

## Task List

### Foundation Layer

#### Task Group 1: HTML Structure and CSS Foundation
**Dependencies:** None
**Effort:** S-M

- [x] 1.0 Complete HTML structure and CSS foundation
  - [x] 1.1 Write 4 focused tests for foundation layer
    - Test that index.html loads without errors
    - Test that CSS custom properties are defined at :root level
    - Test that board container element exists with correct ID
    - Test that viewport meta tag includes width=device-width
  - [x] 1.2 Create `public/index.html` with semantic structure
    - DOCTYPE, html lang, meta charset
    - Viewport meta tag for responsive scaling
    - Link to `css/board.css`
    - Script tag for `js/board.js` with defer
    - Board container div with id `board-container`
  - [x] 1.3 Create `public/css/board.css` with CSS custom properties
    - Define `:root` variables for board colors:
      - `--board-bg: #8B4513` (saddle brown)
      - `--board-border: #5D3A1A` (darker brown)
      - `--point-light: #D2B48C` (tan)
      - `--point-dark: #8B6914` (dark tan)
    - Define piece colors:
      - `--piece-white: #FFFAF0`
      - `--piece-white-stroke: #333`
      - `--piece-black: #2F2F2F`
      - `--piece-black-stroke: #000`
    - Define UI colors for count badges
  - [x] 1.4 Add base styling for board container
    - Center board horizontally
    - Set max-width 800px
    - Add box-sizing: border-box reset
  - [x] 1.5 Ensure foundation tests pass
    - Run ONLY the 4 tests written in 1.1
    - Verify HTML structure renders correctly

**Acceptance Criteria:**
- HTML file loads without console errors
- CSS custom properties are accessible via `getComputedStyle`
- Board container element exists and is centered
- Viewport is properly configured for responsive behavior

---

### SVG Board Layer

#### Task Group 2: SVG Board Skeleton and Points
**Dependencies:** Task Group 1
**Effort:** M-L

- [x] 2.0 Complete SVG board skeleton and triangle points
  - [x] 2.1 Write 6 focused tests for SVG board rendering
    - Test SVG element has correct viewBox (800x600)
    - Test SVG has preserveAspectRatio="xMidYMid meet"
    - Test board background rect exists with correct fill
    - Test 24 triangle points are rendered
    - Test points alternate between light and dark colors
    - Test central bar element exists with correct width
  - [x] 2.2 Create `public/js/board.js` with SVG namespace utilities
    - Define `SVG_NS = 'http://www.w3.org/2000/svg'`
    - Create `createSVGElement(tagName, attributes)` helper
    - Create `setAttributes(element, attributes)` helper
  - [x] 2.3 Implement SVG container creation
    - Create SVG element with viewBox="0 0 800 600"
    - Set preserveAspectRatio="xMidYMid meet"
    - Set width="100%" for responsive scaling
    - Append to board-container div
  - [x] 2.4 Render board background and border
    - Background rect: fill with `--board-bg`
    - Border rect: 4-6px stroke with `--board-border`
    - Ensure proper layering (background behind all elements)
  - [x] 2.5 Implement point (triangle) rendering
    - Create 24 triangular polygon points
    - Points 1-6: bottom-right quadrant (pointing up)
    - Points 7-12: bottom-left quadrant (pointing up)
    - Points 13-18: top-left quadrant (pointing down)
    - Points 19-24: top-right quadrant (pointing down)
    - Triangle dimensions: base ~50px, height ~200px
    - Alternate `--point-light` and `--point-dark` colors
  - [x] 2.6 Render central bar
    - Vertical rectangle dividing board
    - Width: 50px, centered at x=375
    - Height: full board height (600px)
    - Fill with `--board-border` color
  - [x] 2.7 Render home/bear-off areas
    - Right edge area, width ~50px (x=750 to 800)
    - White home area: bottom-right section
    - Black home area: top-right section
    - Subtle visual divider between quadrants
  - [x] 2.8 Ensure SVG board skeleton tests pass
    - Run ONLY the 6 tests written in 2.1
    - Verify all SVG elements render correctly

**Acceptance Criteria:**
- SVG renders with correct dimensions and aspect ratio
- All 24 points display with alternating colors
- Central bar divides the board visually
- Home areas are positioned correctly
- Board maintains proportions at different viewport sizes

---

### Piece Rendering Layer

#### Task Group 3: Piece Rendering and Stacking
**Dependencies:** Task Group 2
**Effort:** M

- [x] 3.0 Complete piece rendering with stacking logic
  - [x] 3.1 Write 6 focused tests for piece rendering
    - Test white piece renders with correct fill color (#FFFAF0)
    - Test black piece renders with correct fill color (#2F2F2F)
    - Test pieces stack vertically with ~36px spacing
    - Test count badge displays when 5+ pieces on point
    - Test bar pieces render correctly (white from bottom, black from top)
    - Test home area displays piece count
  - [x] 3.2 Implement piece rendering function
    - Create `renderPiece(x, y, color)` function
    - Circle radius: 18px
    - Apply correct fill and stroke based on color
    - Add subtle drop shadow via CSS filter
  - [x] 3.3 Implement point-to-coordinates mapping
    - Create `getPointCoordinates(pointIndex, pieceIndex)` function
    - Calculate x,y position for each piece on each point
    - Account for point quadrant (top vs bottom)
    - Handle stacking offset (36px vertical spacing)
  - [x] 3.4 Implement piece stacking logic
    - Show maximum 5 pieces visually per point
    - Stack pieces with 36px vertical spacing
    - Pieces closer to base of triangle appear first
  - [x] 3.5 Implement count badge for 5+ pieces
    - Badge positioned at center of topmost visible piece
    - Dark badge on white pieces, light badge on black pieces
    - Font size minimum 14px for readability
    - Display total count number
  - [x] 3.6 Implement bar piece rendering
    - White bar pieces stack from bottom of bar area
    - Black bar pieces stack from top of bar area
    - Apply same 5+ count badge logic
  - [x] 3.7 Implement home area piece display
    - Show condensed visual (stacked rectangles or simplified circles)
    - Display numeric count prominently
    - White home at bottom-right, black at top-right
  - [x] 3.8 Ensure piece rendering tests pass
    - Run ONLY the 6 tests written in 3.1
    - Verify pieces render correctly for sample state

**Acceptance Criteria:**
- Pieces render with correct colors and dimensions
- Stacking works correctly with proper spacing
- Count badges appear for 5+ pieces
- Bar and home areas display pieces appropriately
- Drop shadows provide visual depth

---

### Interactivity Layer

#### Task Group 4: Board Flipping and State Loading
**Dependencies:** Task Group 3
**Effort:** M

- [x] 4.0 Complete board flipping and state loading
  - [x] 4.1 Write 6 focused tests for flipping and state loading
    - Test `flipBoard()` function toggles board orientation
    - Test count badges remain upright when board is flipped
    - Test state.json is fetched with cache busting parameter
    - Test board re-renders when new state is loaded
    - Test fetch error is logged to console gracefully
    - Test initial state renders all pieces correctly
  - [x] 4.2 Implement board flip state management
    - Create module-level `isFlipped` boolean (default: false)
    - Expose `flipBoard()` function globally
    - Store flip state in memory
  - [x] 4.3 Implement CSS transform flip approach
    - Apply `transform: rotate(180deg)` to SVG container
    - Use CSS class toggle for flip state
    - Ensure smooth visual transition
  - [x] 4.4 Implement counter-rotation for count badges
    - Apply `transform: rotate(180deg)` to badge text when board is flipped
    - Ensure badges remain readable in both orientations
    - Test badge positioning in flipped state
  - [x] 4.5 Implement state fetching with Fetch API
    - Create `loadState()` async function
    - Fetch `state.json?_=${Date.now()}` for cache busting
    - Parse JSON response
    - Handle fetch errors with console.error logging
  - [x] 4.6 Implement state-to-render pipeline
    - Create `renderBoard(gameState)` function
    - Clear existing SVG content before re-render
    - Parse board array (positive = white, negative = black)
    - Render bar and home pieces from state
  - [x] 4.7 Wire up page load initialization
    - Call `loadState()` on DOMContentLoaded
    - Render board with loaded state
    - Log success/error to console
  - [x] 4.8 Ensure flipping and state loading tests pass
    - Run ONLY the 6 tests written in 4.1
    - Verify flip toggles correctly
    - Verify state loads and renders

**Acceptance Criteria:**
- `flipBoard()` function is accessible globally
- Board rotates 180 degrees when flipped
- Count badges remain readable in both orientations
- State loads from state.json with cache busting
- Board re-renders correctly with new state data

---

### Responsive Layer

#### Task Group 5: Responsive Mobile Layout
**Dependencies:** Task Group 4
**Effort:** S-M

- [x] 5.0 Complete responsive mobile layout
  - [x] 5.1 Write 4 focused tests for responsive behavior
    - Test rotation prompt appears in portrait orientation
    - Test rotation prompt hides in landscape orientation
    - Test board is usable at 568px width (iPhone SE landscape)
    - Test touch targets are minimum 44x44px for future controls
  - [x] 5.2 Add portrait orientation detection CSS
    - Use `@media (orientation: portrait)` query
    - Style for showing rotation prompt overlay
    - Style for hiding board content in portrait
  - [x] 5.3 Implement rotation prompt overlay
    - Centered message: "Please rotate your device to landscape"
    - Full-viewport overlay with semi-transparent background
    - Icon or visual indicator for rotation
    - Auto-hide when orientation changes to landscape
  - [x] 5.4 Optimize board for minimum mobile viewport
    - Test at 568px width (iPhone SE landscape)
    - Ensure pieces remain visible and distinguishable
    - Verify count badges are readable at mobile scale
  - [x] 5.5 Add touch-friendly sizing considerations
    - Document touch target requirements (44x44px minimum)
    - Ensure board scales appropriately for touch interaction
    - Add CSS comments for future control implementation
  - [x] 5.6 Ensure responsive layout tests pass
    - Run ONLY the 4 tests written in 5.1
    - Verify portrait/landscape behavior
    - Verify minimum viewport usability

**Acceptance Criteria:**
- Rotation prompt displays in portrait mode
- Board is hidden when rotation prompt is shown
- Board remains usable at 568px minimum width
- Touch target guidelines are documented for future controls

---

## Execution Order

Recommended implementation sequence:

1. **Foundation Layer** (Task Group 1) - HTML structure, CSS custom properties
2. **SVG Board Layer** (Task Group 2) - SVG container, triangles, bar, home areas
3. **Piece Rendering Layer** (Task Group 3) - Pieces, stacking, count badges
4. **Interactivity Layer** (Task Group 4) - Flipping, state loading
5. **Responsive Layer** (Task Group 5) - Mobile layout, orientation prompt

## Testing Summary

| Task Group | Tests Written | Focus Area |
|------------|--------------|------------|
| 1 | 4 | HTML/CSS foundation |
| 2 | 6 | SVG board skeleton |
| 3 | 6 | Piece rendering |
| 4 | 6 | Flipping & state |
| 5 | 4 | Responsive layout |
| **Total** | **26** | |

## Reference Files

**Existing Code to Leverage:**
- `/Users/cwalker/Projects/gitgammon/src/state/constants.js` - BOARD_POINTS, PIECES_PER_PLAYER constants
- `/Users/cwalker/Projects/gitgammon/src/state/types.js` - GameState, PlayerPieces typedefs
- `/Users/cwalker/Projects/gitgammon/src/state/examples/initial-state.json` - Test rendering state

**Output Files:**
- `/Users/cwalker/Projects/gitgammon/public/index.html`
- `/Users/cwalker/Projects/gitgammon/public/css/board.css`
- `/Users/cwalker/Projects/gitgammon/public/js/board.js`

## Board Layout Reference

```
Point numbering (default orientation - white's perspective):

    13  14  15  16  17  18  |BAR|  19  20  21  22  23  24  [BLACK HOME]
    ========================|   |========================
    (black's outer board)   |   |  (black's home board)

    (white's outer board)   |   |  (white's home board)
    ========================|   |========================
    12  11  10   9   8   7  |BAR|   6   5   4   3   2   1  [WHITE HOME]

Board array mapping:
- Index 0 = Point 1 (bottom-right, white's home)
- Index 23 = Point 24 (top-right, black's home)
- Positive values = white pieces
- Negative values = black pieces
```
