import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Task Group 4: Board Flipping and State Loading Tests
 * Tests for flip functionality, state fetching, and board rendering
 */

const jsPath = resolve(process.cwd(), 'public/js/board.js');
const cssPath = resolve(process.cwd(), 'public/css/board.css');

let jsContent;
let cssContent;

beforeAll(() => {
  jsContent = readFileSync(jsPath, 'utf-8');
  cssContent = readFileSync(cssPath, 'utf-8');
});

describe('Board Flip State Management', () => {
  it('should have module-level isFlipped boolean', () => {
    expect(jsContent).toMatch(/let\s+isFlipped\s*=\s*false/);
  });

  it('should expose flipBoard function globally', () => {
    expect(jsContent).toMatch(/function\s+flipBoard\s*\(\s*\)/);
    expect(jsContent).toMatch(/window\.flipBoard\s*=\s*flipBoard/);
  });

  it('should toggle isFlipped state when flipBoard is called', () => {
    expect(jsContent).toMatch(/isFlipped\s*=\s*!isFlipped/);
  });
});

describe('CSS Transform Flip', () => {
  it('should apply rotate(180deg) transform when flipped', () => {
    expect(cssContent).toMatch(/\.flipped[^{]*\{[^}]*transform:\s*rotate\(180deg\)/);
  });

  it('should use CSS class toggle for flip state', () => {
    expect(jsContent).toMatch(/classList\.toggle\s*\(\s*['"]flipped['"]/);
  });
});

describe('Counter-rotation for Count Badges', () => {
  it('should counter-rotate count badges when board is flipped', () => {
    // CSS should have rule for .flipped .count-badge with counter-rotation
    expect(cssContent).toMatch(/\.flipped[^{]*\.count-badge[^{]*\{[^}]*transform:\s*rotate\(180deg\)/);
  });
});

describe('State Fetching', () => {
  it('should have loadState async function', () => {
    expect(jsContent).toMatch(/async\s+function\s+loadState\s*\(\s*\)/);
  });

  it('should fetch state.json with cache busting parameter', () => {
    expect(jsContent).toMatch(/fetch\s*\(\s*`state\.json\?\s*_=\$\{Date\.now\(\)\}`\s*\)/);
  });

  it('should handle fetch errors with console.error', () => {
    expect(jsContent).toMatch(/console\.error\s*\(\s*['"]Failed to load game state/);
  });

  it('should parse JSON response', () => {
    expect(jsContent).toMatch(/response\.json\s*\(\s*\)/);
  });

  it('should expose loadState globally', () => {
    expect(jsContent).toMatch(/window\.loadState\s*=\s*loadState/);
  });
});

describe('State-to-Render Pipeline', () => {
  it('should have renderBoard function accepting gameState', () => {
    expect(jsContent).toMatch(/function\s+renderBoard\s*\(\s*gameState\s*\)/);
  });

  it('should clear existing SVG content before re-render', () => {
    expect(jsContent).toMatch(/container\.innerHTML\s*=\s*['"]['"]|container\.innerHTML\s*=\s*``/);
  });

  it('should parse board array for piece rendering', () => {
    expect(jsContent).toMatch(/gameState\.board/);
    expect(jsContent).toMatch(/gameState\.board\.length/);
  });

  it('should render bar and home pieces from state', () => {
    expect(jsContent).toMatch(/gameState\.bar/);
    expect(jsContent).toMatch(/gameState\.home/);
  });

  it('should expose renderBoard globally', () => {
    expect(jsContent).toMatch(/window\.renderBoard\s*=\s*renderBoard/);
  });
});

describe('Page Load Initialization', () => {
  it('should have init function', () => {
    expect(jsContent).toMatch(/async\s+function\s+init\s*\(\s*\)/);
  });

  it('should call loadState on initialization', () => {
    expect(jsContent).toMatch(/const\s+state\s*=\s*await\s+loadState\s*\(\s*\)/);
  });

  it('should call renderBoard with loaded state', () => {
    expect(jsContent).toMatch(/renderBoard\s*\(\s*state\s*\)/);
  });

  it('should wire initialization to DOMContentLoaded', () => {
    expect(jsContent).toMatch(/document\.addEventListener\s*\(\s*['"]DOMContentLoaded['"]\s*,\s*init\s*\)/);
  });

  it('should log success or error to console', () => {
    expect(jsContent).toMatch(/console\.log\s*\(\s*['"]Board rendered/);
  });
});
