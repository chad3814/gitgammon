# Specification: Board Rendering

## Goal

Build a static HTML/CSS/JS page that reads `state.json` and renders a traditional wooden-style backgammon board using SVG, with support for board flipping and responsive mobile layout with forced landscape orientation.

## User Stories

- As a player, I want to view the current game state rendered as a visual backgammon board so that I can understand piece positions at a glance
- As a mobile user, I want the board to display in landscape mode so that the board proportions are preserved and pieces are readable

## Specific Requirements

**SVG Board Container**
- ViewBox dimensions: 800x600 (4:3 aspect ratio suits backgammon board proportions)
- Use `preserveAspectRatio="xMidYMid meet"` for responsive scaling
- Container should fill available width up to max-width of 800px
- Include semantic structure: background rect, point groups, bar, home areas

**Point (Triangle) Rendering**
- 24 triangular points arranged in 4 quadrants of 6 points each
- Points 1-6: bottom-right quadrant (white's home board)
- Points 7-12: bottom-left quadrant
- Points 13-18: top-left quadrant
- Points 19-24: top-right quadrant (black's home board)
- Alternate tan (`--point-light: #D2B48C`) and brown (`--point-dark`) colors
- Triangle height approximately 200px (1/3 of board height), base width ~50px

**Central Bar**
- Vertical bar dividing board between points 6-7 and 18-19
- Width: approximately 50px centered horizontally
- Renders bar pieces stacked vertically with numeric count overlay
- White bar pieces stack from bottom, black from top

**Home/Bear-off Areas**
- Right edge of board (approximately 50px wide)
- White home area at bottom-right, black at top-right
- Show borne-off pieces as stacked rectangles or condensed visual
- Display numeric count prominently when pieces present

**Piece Rendering**
- Circular checkers with radius ~18px
- White pieces: fill `--piece-white: #FFFAF0`, stroke `--piece-white-stroke: #333`
- Black pieces: fill `--piece-black: #2F2F2F`, stroke `--piece-black-stroke: #000`
- Add subtle drop shadow via CSS filter for depth
- Stack pieces vertically with ~36px spacing on points
- When 5+ pieces on a point, show max 5 visually with numeric count overlay

**Piece Count Display**
- Render count badge when stack exceeds 4 pieces
- Badge positioned at center of topmost visible piece
- Use contrasting colors: dark badge on white pieces, light badge on black pieces
- Font size readable at mobile viewport (~14px minimum)

**Board Flipping Logic**
- Default orientation: white's home board bottom-right, points numbered 1-24 counter-clockwise from white's perspective
- Flipped orientation: black's home board bottom-right, same board mirrored
- Implement via CSS transform on board container (`transform: rotate(180deg)`) or re-render logic
- Piece count badges must remain upright when board is flipped
- Store flip state in memory; expose `flipBoard()` function for future UI integration

**State Loading**
- Fetch `state.json` from relative path on page load
- Use Fetch API with cache busting: `state.json?_=${Date.now()}`
- Parse JSON and call render function with state object
- Handle fetch errors gracefully with console error logging
- Re-render board whenever new state is loaded

**Responsive Mobile Layout**
- Force landscape orientation on mobile via CSS and viewport meta
- Use `@media (orientation: portrait)` to show rotation prompt overlay
- Rotation prompt: centered message instructing user to rotate device
- Board must remain usable at 568px viewport width (iPhone SE landscape)
- Touch targets for future controls minimum 44x44px

**File Structure**
- `public/index.html`: Main HTML document with board container div
- `public/css/board.css`: All board styling, CSS custom properties, responsive rules
- `public/js/board.js`: SVG generation, piece rendering, flip logic
- `public/js/state.js`: State fetching and parsing (if separate file warranted)

**CSS Custom Properties**
- Define all colors as CSS custom properties at `:root` level
- Board colors: `--board-bg`, `--board-border`, `--point-light`, `--point-dark`
- Piece colors: `--piece-white`, `--piece-white-stroke`, `--piece-black`, `--piece-black-stroke`
- UI colors: `--text-primary`, `--bg-primary` for count badges
- This foundation enables future theme switching without code changes

## Visual Design

No visual mockups provided. Implement traditional wooden backgammon aesthetic:
- Board background: `--board-bg: #8B4513` (saddle brown)
- Dark border: `--board-border: #5D3A1A` (darker brown, 4-6px width)
- Alternating point colors creating classic triangular pattern
- Subtle wood grain texture optional (CSS pattern or gradient)

## Existing Code to Leverage

**`src/state/constants.js`**
- `BOARD_POINTS = 24` constant for point iteration
- `PIECES_PER_PLAYER = 15` for validation reference
- `PLAYER_COLORS` array for player identification

**`src/state/types.js`**
- `GameState` typedef documents full state structure
- `PlayerPieces` typedef for bar/home object shape
- Use same naming conventions for consistency

**`src/state/examples/initial-state.json`**
- Reference for standard opening position
- Test rendering with this state during development
- Board array format: `[2, 0, 0, 0, 0, -5, 0, -3, 0, 0, 0, 5, -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2]`

**`.claude/skills/frontend-svg/SKILL.md`**
- `createSVGElement()` helper pattern with namespace handling
- SVG namespace constant `SVG_NS = 'http://www.w3.org/2000/svg'`
- Board structure pattern with viewBox setup

**`.claude/skills/frontend-css/SKILL.md`**
- CSS custom property definitions for theming foundation
- Piece color definitions and stroke styling
- SVG element styling patterns via CSS classes

## Out of Scope

- Dice display or dice rolling animations
- Move highlighting or legal move indicators
- Click or hover interactions on pieces or points
- Move submission or input handling
- Theme switching UI or dark mode toggle button
- Player turn indicators or status message display
- Animation of piece movement between points
- Sound effects or audio feedback
- Game history navigation or move replay
- Authentication or user identification UI
