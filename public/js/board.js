/**
 * GitGammon Board Rendering
 * SVG-based backgammon board with state loading and flip support
 * @module board
 */

// ============================================
// SVG Namespace and Utilities
// ============================================

/** SVG namespace for element creation */
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Create an SVG element with attributes
 * @param {string} tagName - The SVG element tag name
 * @param {Object} attributes - Key-value pairs of attributes
 * @returns {SVGElement} The created SVG element
 */
function createSVGElement(tagName, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tagName);
  setAttributes(element, attributes);
  return element;
}

/**
 * Set multiple attributes on an element
 * @param {Element} element - The target element
 * @param {Object} attributes - Key-value pairs of attributes
 */
function setAttributes(element, attributes) {
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

// ============================================
// Board Configuration Constants
// ============================================

/** Board dimensions */
const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 600;

/** Point (triangle) dimensions */
const POINT_BASE = 50;
const POINT_HEIGHT = 200;

/** Piece dimensions */
const PIECE_RADIUS = 18;
const PIECE_SPACING = 36;
const MAX_VISIBLE_PIECES = 5;

/** Central bar dimensions */
const BAR_WIDTH = 50;
const BAR_X = (BOARD_WIDTH - BAR_WIDTH) / 2; // 375

/** Home area dimensions */
const HOME_WIDTH = 50;
const HOME_X = BOARD_WIDTH - HOME_WIDTH; // 750

/** Quadrant layout */
const POINTS_PER_QUADRANT = 6;

// ============================================
// Board State
// ============================================

/** Board flip state - default is white's perspective */
let isFlipped = false;

/** Reference to the SVG element */
let boardSvg = null;

// ============================================
// Point Coordinate Mapping
// ============================================

/**
 * Calculate the x-coordinate for a point's center
 * Points are numbered 1-24 in the game, array indices 0-23
 * @param {number} pointIndex - Point index (0-23)
 * @returns {number} X coordinate for point center
 */
function getPointX(pointIndex) {
  const pointNumber = pointIndex + 1;

  if (pointNumber >= 1 && pointNumber <= 6) {
    // Bottom-right quadrant (points 1-6): right to left before home
    const posInQuadrant = 6 - pointNumber; // 5,4,3,2,1,0 for points 1-6
    return HOME_X - POINT_BASE / 2 - posInQuadrant * POINT_BASE;
  } else if (pointNumber >= 7 && pointNumber <= 12) {
    // Bottom-left quadrant (points 7-12): right to left
    const posInQuadrant = 12 - pointNumber; // 5,4,3,2,1,0 for points 7-12
    return BAR_X - POINT_BASE / 2 - posInQuadrant * POINT_BASE;
  } else if (pointNumber >= 13 && pointNumber <= 18) {
    // Top-left quadrant (points 13-18): left to right
    const posInQuadrant = pointNumber - 13; // 0,1,2,3,4,5 for points 13-18
    return POINT_BASE / 2 + posInQuadrant * POINT_BASE;
  } else {
    // Top-right quadrant (points 19-24): left to right after bar
    const posInQuadrant = pointNumber - 19; // 0,1,2,3,4,5 for points 19-24
    return BAR_X + BAR_WIDTH + POINT_BASE / 2 + posInQuadrant * POINT_BASE;
  }
}

/**
 * Check if a point is on the top half of the board
 * @param {number} pointIndex - Point index (0-23)
 * @returns {boolean} True if point is on top half
 */
function isTopPoint(pointIndex) {
  const pointNumber = pointIndex + 1;
  return pointNumber >= 13 && pointNumber <= 24;
}

/**
 * Calculate coordinates for a piece on a point
 * @param {number} pointIndex - Point index (0-23)
 * @param {number} pieceIndex - Piece position in stack (0 = closest to base)
 * @returns {{x: number, y: number}} Coordinates for piece center
 */
function getPointCoordinates(pointIndex, pieceIndex) {
  const x = getPointX(pointIndex);
  const isTop = isTopPoint(pointIndex);

  let y;
  if (isTop) {
    // Top points: pieces stack from top edge downward
    y = PIECE_RADIUS + 4 + pieceIndex * PIECE_SPACING;
  } else {
    // Bottom points: pieces stack from bottom edge upward
    y = BOARD_HEIGHT - PIECE_RADIUS - 4 - pieceIndex * PIECE_SPACING;
  }

  return { x, y };
}

// ============================================
// SVG Board Rendering
// ============================================

/**
 * Create the SVG container with viewBox
 * @returns {SVGSVGElement} The SVG element
 */
function createSvgContainer() {
  const svg = createSVGElement('svg', {
    viewBox: `0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`,
    preserveAspectRatio: 'xMidYMid meet',
    width: '100%',
  });
  return svg;
}

/**
 * Render the board background
 * @param {SVGSVGElement} svg - The SVG container
 */
function renderBackground(svg) {
  // Board background
  const bg = createSVGElement('rect', {
    x: 0,
    y: 0,
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    fill: 'var(--board-bg)',
  });
  svg.appendChild(bg);

  // Board border
  const border = createSVGElement('rect', {
    x: 2,
    y: 2,
    width: BOARD_WIDTH - 4,
    height: BOARD_HEIGHT - 4,
    fill: 'none',
    stroke: 'var(--board-border)',
    'stroke-width': 4,
  });
  svg.appendChild(border);
}

/**
 * Create a triangle polygon for a point
 * @param {number} pointIndex - Point index (0-23)
 * @returns {SVGPolygonElement} The triangle element
 */
function createPointTriangle(pointIndex) {
  const x = getPointX(pointIndex);
  const isTop = isTopPoint(pointIndex);

  // Alternate colors starting with light for point 1
  const isLight = (pointIndex % 2) === 0;
  const fill = isLight ? 'var(--point-light)' : 'var(--point-dark)';

  let points;
  if (isTop) {
    // Top points: triangles pointing down
    const baseY = 0;
    const tipY = POINT_HEIGHT;
    points = `${x - POINT_BASE / 2},${baseY} ${x + POINT_BASE / 2},${baseY} ${x},${tipY}`;
  } else {
    // Bottom points: triangles pointing up
    const baseY = BOARD_HEIGHT;
    const tipY = BOARD_HEIGHT - POINT_HEIGHT;
    points = `${x - POINT_BASE / 2},${baseY} ${x + POINT_BASE / 2},${baseY} ${x},${tipY}`;
  }

  return createSVGElement('polygon', {
    points,
    fill,
  });
}

/**
 * Render all 24 points (triangles)
 * @param {SVGSVGElement} svg - The SVG container
 */
function renderPoints(svg) {
  const pointsGroup = createSVGElement('g', { class: 'points' });

  for (let i = 0; i < 24; i++) {
    const triangle = createPointTriangle(i);
    pointsGroup.appendChild(triangle);
  }

  svg.appendChild(pointsGroup);
}

/**
 * Render the central bar
 * @param {SVGSVGElement} svg - The SVG container
 */
function renderBar(svg) {
  const bar = createSVGElement('rect', {
    x: BAR_X,
    y: 0,
    width: BAR_WIDTH,
    height: BOARD_HEIGHT,
    fill: 'var(--bar-color)',
  });
  svg.appendChild(bar);
}

/**
 * Render the home/bear-off areas
 * @param {SVGSVGElement} svg - The SVG container
 */
function renderHomeAreas(svg) {
  const homeGroup = createSVGElement('g', { class: 'home-areas' });

  // White home area (bottom-right)
  const whiteHome = createSVGElement('rect', {
    x: HOME_X,
    y: BOARD_HEIGHT / 2,
    width: HOME_WIDTH,
    height: BOARD_HEIGHT / 2,
    fill: 'var(--home-white-bg)',
  });
  homeGroup.appendChild(whiteHome);

  // Black home area (top-right)
  const blackHome = createSVGElement('rect', {
    x: HOME_X,
    y: 0,
    width: HOME_WIDTH,
    height: BOARD_HEIGHT / 2,
    fill: 'var(--home-black-bg)',
  });
  homeGroup.appendChild(blackHome);

  // Divider line
  const divider = createSVGElement('line', {
    x1: HOME_X,
    y1: BOARD_HEIGHT / 2,
    x2: BOARD_WIDTH,
    y2: BOARD_HEIGHT / 2,
    stroke: 'var(--board-border)',
    'stroke-width': 2,
  });
  homeGroup.appendChild(divider);

  svg.appendChild(homeGroup);
}

// ============================================
// Piece Rendering
// ============================================

/**
 * Render a single piece at the given coordinates
 * @param {number} x - X coordinate for piece center
 * @param {number} y - Y coordinate for piece center
 * @param {string} color - 'white' or 'black'
 * @returns {SVGCircleElement} The piece element
 */
function renderPiece(x, y, color) {
  const pieceClass = color === 'white' ? 'piece-white' : 'piece-black';

  const piece = createSVGElement('circle', {
    cx: x,
    cy: y,
    r: PIECE_RADIUS,
    class: `piece ${pieceClass}`,
  });

  return piece;
}

/**
 * Render a count badge on a piece
 * @param {number} x - X coordinate for badge center
 * @param {number} y - Y coordinate for badge center
 * @param {number} count - The count to display
 * @param {string} pieceColor - 'white' or 'black' (for contrast)
 * @returns {SVGTextElement} The badge element
 */
function renderCountBadge(x, y, count, pieceColor) {
  // Use contrasting color for readability
  const badgeClass = pieceColor === 'white' ? 'count-badge-dark' : 'count-badge-light';

  const badge = createSVGElement('text', {
    x,
    y,
    class: `count-badge ${badgeClass}`,
  });
  badge.textContent = count.toString();

  return badge;
}

/**
 * Render pieces on a point with stacking logic
 * @param {SVGGElement} piecesGroup - The group to append pieces to
 * @param {number} pointIndex - Point index (0-23)
 * @param {number} count - Number of pieces (positive = white, negative = black)
 */
function renderPointPieces(piecesGroup, pointIndex, count) {
  if (count === 0) return;

  const color = count > 0 ? 'white' : 'black';
  const absCount = Math.abs(count);
  const visibleCount = Math.min(absCount, MAX_VISIBLE_PIECES);

  // Render visible pieces
  for (let i = 0; i < visibleCount; i++) {
    const { x, y } = getPointCoordinates(pointIndex, i);
    const piece = renderPiece(x, y, color);
    piecesGroup.appendChild(piece);
  }

  // Render count badge if more than 5 pieces
  if (absCount > MAX_VISIBLE_PIECES) {
    const { x, y } = getPointCoordinates(pointIndex, visibleCount - 1);
    const badge = renderCountBadge(x, y, absCount, color);
    piecesGroup.appendChild(badge);
  }
}

/**
 * Render pieces on the bar
 * @param {SVGGElement} piecesGroup - The group to append pieces to
 * @param {Object} bar - Bar object with white and black counts
 */
function renderBarPieces(piecesGroup, bar) {
  const barCenterX = BAR_X + BAR_WIDTH / 2;

  // White bar pieces (stack from bottom)
  if (bar.white > 0) {
    const visibleWhite = Math.min(bar.white, MAX_VISIBLE_PIECES);
    for (let i = 0; i < visibleWhite; i++) {
      const y = BOARD_HEIGHT - PIECE_RADIUS - 10 - i * PIECE_SPACING;
      const piece = renderPiece(barCenterX, y, 'white');
      piecesGroup.appendChild(piece);
    }

    if (bar.white > MAX_VISIBLE_PIECES) {
      const y = BOARD_HEIGHT - PIECE_RADIUS - 10 - (visibleWhite - 1) * PIECE_SPACING;
      const badge = renderCountBadge(barCenterX, y, bar.white, 'white');
      piecesGroup.appendChild(badge);
    }
  }

  // Black bar pieces (stack from top)
  if (bar.black > 0) {
    const visibleBlack = Math.min(bar.black, MAX_VISIBLE_PIECES);
    for (let i = 0; i < visibleBlack; i++) {
      const y = PIECE_RADIUS + 10 + i * PIECE_SPACING;
      const piece = renderPiece(barCenterX, y, 'black');
      piecesGroup.appendChild(piece);
    }

    if (bar.black > MAX_VISIBLE_PIECES) {
      const y = PIECE_RADIUS + 10 + (visibleBlack - 1) * PIECE_SPACING;
      const badge = renderCountBadge(barCenterX, y, bar.black, 'black');
      piecesGroup.appendChild(badge);
    }
  }
}

/**
 * Render pieces in the home/bear-off areas
 * @param {SVGGElement} piecesGroup - The group to append pieces to
 * @param {Object} home - Home object with white and black counts
 */
function renderHomePieces(piecesGroup, home) {
  const homeCenterX = HOME_X + HOME_WIDTH / 2;

  // White home (bottom-right) - display count
  if (home.white > 0) {
    const whiteY = BOARD_HEIGHT * 0.75;

    // Draw a representative piece
    const piece = renderPiece(homeCenterX, whiteY - 20, 'white');
    piecesGroup.appendChild(piece);

    // Draw count below piece
    const countText = createSVGElement('text', {
      x: homeCenterX,
      y: whiteY + 15,
      class: 'home-count count-badge-dark',
    });
    countText.textContent = home.white.toString();
    piecesGroup.appendChild(countText);
  }

  // Black home (top-right) - display count
  if (home.black > 0) {
    const blackY = BOARD_HEIGHT * 0.25;

    // Draw a representative piece
    const piece = renderPiece(homeCenterX, blackY + 20, 'black');
    piecesGroup.appendChild(piece);

    // Draw count above piece
    const countText = createSVGElement('text', {
      x: homeCenterX,
      y: blackY - 5,
      class: 'home-count count-badge-light',
    });
    countText.textContent = home.black.toString();
    piecesGroup.appendChild(countText);
  }
}

// ============================================
// State Loading and Board Rendering
// ============================================

/**
 * Render the complete board from game state
 * @param {Object} gameState - The game state object
 */
function renderBoard(gameState) {
  const container = document.getElementById('board-container');
  if (!container) {
    console.error('Board container not found');
    return;
  }

  // Clear existing SVG
  container.innerHTML = '';

  // Create SVG container
  boardSvg = createSvgContainer();

  // Render board structure
  renderBackground(boardSvg);
  renderPoints(boardSvg);
  renderBar(boardSvg);
  renderHomeAreas(boardSvg);

  // Create pieces group
  const piecesGroup = createSVGElement('g', { class: 'pieces' });

  // Render pieces on points from state
  if (gameState && gameState.board) {
    for (let i = 0; i < gameState.board.length; i++) {
      renderPointPieces(piecesGroup, i, gameState.board[i]);
    }
  }

  // Render bar pieces
  if (gameState && gameState.bar) {
    renderBarPieces(piecesGroup, gameState.bar);
  }

  // Render home pieces
  if (gameState && gameState.home) {
    renderHomePieces(piecesGroup, gameState.home);
  }

  boardSvg.appendChild(piecesGroup);
  container.appendChild(boardSvg);

  // Apply flip state if needed
  if (isFlipped) {
    container.classList.add('flipped');
  }
}

/**
 * Load game state from state.json
 * @returns {Promise<Object|null>} The game state or null on error
 */
async function loadState() {
  try {
    // Cache busting with timestamp
    const response = await fetch(`state.json?_=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const state = await response.json();
    return state;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

// ============================================
// Board Flipping
// ============================================

/**
 * Toggle the board flip state
 * Flipping shows the board from the other player's perspective
 */
function flipBoard() {
  isFlipped = !isFlipped;

  const container = document.getElementById('board-container');
  if (container) {
    container.classList.toggle('flipped', isFlipped);
  }
}

/**
 * Get the current flip state
 * @returns {boolean} True if board is flipped
 */
function getFlipState() {
  return isFlipped;
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize the board on page load
 */
async function init() {
  const state = await loadState();
  if (state) {
    renderBoard(state);
    console.log('Board rendered successfully');
  } else {
    // Render empty board structure if no state
    renderBoard({ board: new Array(24).fill(0), bar: { white: 0, black: 0 }, home: { white: 0, black: 0 } });
    console.log('Board rendered with empty state');
  }
}

// Run initialization on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Expose functions globally for external use
window.flipBoard = flipBoard;
window.getFlipState = getFlipState;
window.renderBoard = renderBoard;
window.loadState = loadState;
