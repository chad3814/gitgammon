import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Task Group 3: Piece Rendering Tests
 * Tests for piece rendering, stacking, and count badges
 */

const jsPath = resolve(process.cwd(), 'public/js/board.js');
const cssPath = resolve(process.cwd(), 'public/css/board.css');

let jsContent;
let cssContent;

beforeAll(() => {
  jsContent = readFileSync(jsPath, 'utf-8');
  cssContent = readFileSync(cssPath, 'utf-8');
});

describe('Piece Rendering Function', () => {
  it('should have renderPiece function with x, y, color parameters', () => {
    expect(jsContent).toMatch(/function\s+renderPiece\s*\(\s*x\s*,\s*y\s*,\s*color\s*\)/);
  });

  it('should render white pieces with correct fill color (#FFFAF0)', () => {
    // CSS should define --piece-white: #FFFAF0
    expect(cssContent).toMatch(/--piece-white:\s*#FFFAF0/i);
    // JS should use piece-white class
    expect(jsContent).toMatch(/piece-white/);
  });

  it('should render black pieces with correct fill color (#2F2F2F)', () => {
    // CSS should define --piece-black: #2F2F2F
    expect(cssContent).toMatch(/--piece-black:\s*#2F2F2F/i);
    // JS should use piece-black class
    expect(jsContent).toMatch(/piece-black/);
  });

  it('should create circle element with radius 18px', () => {
    expect(jsContent).toMatch(/PIECE_RADIUS\s*=\s*18/);
    expect(jsContent).toMatch(/r:\s*PIECE_RADIUS/);
  });
});

describe('Point Coordinate Mapping', () => {
  it('should have getPointCoordinates function', () => {
    expect(jsContent).toMatch(/function\s+getPointCoordinates\s*\(\s*pointIndex\s*,\s*pieceIndex\s*\)/);
  });

  it('should calculate x coordinates for all four quadrants', () => {
    // Check for quadrant-based x calculation
    expect(jsContent).toMatch(/pointNumber\s*>=\s*1\s*&&\s*pointNumber\s*<=\s*6/);
    expect(jsContent).toMatch(/pointNumber\s*>=\s*7\s*&&\s*pointNumber\s*<=\s*12/);
    expect(jsContent).toMatch(/pointNumber\s*>=\s*13\s*&&\s*pointNumber\s*<=\s*18/);
  });

  it('should distinguish top and bottom points', () => {
    expect(jsContent).toMatch(/function\s+isTopPoint/);
    expect(jsContent).toMatch(/pointNumber\s*>=\s*13/);
  });
});

describe('Piece Stacking Logic', () => {
  it('should stack pieces with 36px spacing', () => {
    expect(jsContent).toMatch(/PIECE_SPACING\s*=\s*36/);
    expect(jsContent).toMatch(/pieceIndex\s*\*\s*PIECE_SPACING/);
  });

  it('should show maximum 5 pieces visually per point', () => {
    expect(jsContent).toMatch(/MAX_VISIBLE_PIECES\s*=\s*5/);
    expect(jsContent).toMatch(/Math\.min\s*\(\s*\w+\s*,\s*MAX_VISIBLE_PIECES\s*\)/);
  });

  it('should render count badge for 5+ pieces', () => {
    expect(jsContent).toMatch(/absCount\s*>\s*MAX_VISIBLE_PIECES/);
    expect(jsContent).toMatch(/renderCountBadge/);
  });
});

describe('Count Badge Rendering', () => {
  it('should have renderCountBadge function', () => {
    expect(jsContent).toMatch(/function\s+renderCountBadge\s*\(/);
  });

  it('should use dark badge on white pieces, light on black', () => {
    expect(jsContent).toMatch(/pieceColor\s*===\s*['"]white['"]/);
    expect(jsContent).toMatch(/count-badge-dark/);
    expect(jsContent).toMatch(/count-badge-light/);
  });

  it('should have minimum 14px font size in CSS', () => {
    expect(cssContent).toMatch(/\.count-badge\s*\{[^}]*font-size:\s*1[4-9]px/);
  });
});

describe('Bar Piece Rendering', () => {
  it('should have renderBarPieces function', () => {
    expect(jsContent).toMatch(/function\s+renderBarPieces\s*\(/);
  });

  it('should stack white bar pieces from bottom', () => {
    // Check for white bar pieces stacking from bottom (BOARD_HEIGHT - offset)
    expect(jsContent).toMatch(/bar\.white/);
    expect(jsContent).toMatch(/BOARD_HEIGHT\s*-\s*PIECE_RADIUS/);
  });

  it('should stack black bar pieces from top', () => {
    // Check for black bar pieces stacking from top
    expect(jsContent).toMatch(/bar\.black/);
    expect(jsContent).toMatch(/PIECE_RADIUS\s*\+\s*\d+\s*\+\s*i\s*\*\s*PIECE_SPACING/);
  });
});

describe('Home Area Piece Display', () => {
  it('should have renderHomePieces function', () => {
    expect(jsContent).toMatch(/function\s+renderHomePieces\s*\(/);
  });

  it('should display numeric count for home pieces', () => {
    expect(jsContent).toMatch(/home\.white\.toString\(\)/);
    expect(jsContent).toMatch(/home\.black\.toString\(\)/);
  });

  it('should render home pieces in correct positions', () => {
    // White home bottom-right, black home top-right
    expect(jsContent).toMatch(/whiteY/);
    expect(jsContent).toMatch(/blackY/);
    expect(jsContent).toMatch(/homeCenterX/);
  });
});

describe('Piece Styling via CSS', () => {
  it('should have drop shadow filter for depth', () => {
    expect(cssContent).toMatch(/\.piece\s*\{[^}]*filter:\s*drop-shadow/);
  });

  it('should define stroke for piece visibility', () => {
    expect(cssContent).toMatch(/\.piece-white\s*\{[^}]*stroke/);
    expect(cssContent).toMatch(/\.piece-black\s*\{[^}]*stroke/);
  });
});
