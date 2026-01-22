import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Task Group 2: SVG Board Skeleton Tests
 * Tests for SVG container, points, bar, and home areas
 */

const jsPath = resolve(process.cwd(), 'public/js/board.js');

let jsContent;

beforeAll(() => {
  jsContent = readFileSync(jsPath, 'utf-8');
});

describe('SVG Namespace and Utilities', () => {
  it('should define SVG namespace constant', () => {
    expect(jsContent).toMatch(/SVG_NS\s*=\s*['"]http:\/\/www\.w3\.org\/2000\/svg['"]/);
  });

  it('should have createSVGElement helper function', () => {
    expect(jsContent).toMatch(/function\s+createSVGElement\s*\(\s*tagName/);
    expect(jsContent).toMatch(/document\.createElementNS\s*\(\s*SVG_NS/);
  });

  it('should have setAttributes helper function', () => {
    expect(jsContent).toMatch(/function\s+setAttributes\s*\(\s*element/);
  });
});

describe('SVG Container Configuration', () => {
  it('should create SVG with correct viewBox dimensions (800x600)', () => {
    // Check for viewBox with template literal using BOARD_WIDTH and BOARD_HEIGHT
    expect(jsContent).toMatch(/viewBox.*BOARD_WIDTH.*BOARD_HEIGHT/);
    // Verify the constants are set to 800 and 600
    expect(jsContent).toMatch(/BOARD_WIDTH\s*=\s*800/);
    expect(jsContent).toMatch(/BOARD_HEIGHT\s*=\s*600/);
  });

  it('should set preserveAspectRatio to xMidYMid meet', () => {
    expect(jsContent).toMatch(/preserveAspectRatio['":\s]*['"`]xMidYMid meet['"`]/);
  });

  it('should set width to 100% for responsive scaling', () => {
    expect(jsContent).toMatch(/width['":\s]*['"`]100%['"`]/);
  });
});

describe('Board Structure Rendering', () => {
  it('should render board background with --board-bg', () => {
    expect(jsContent).toMatch(/fill['":\s]*['"`]var\(--board-bg\)['"`]/);
  });

  it('should render 24 triangle points', () => {
    // Check for loop iterating 24 times for points
    expect(jsContent).toMatch(/for\s*\([^)]*i\s*<\s*24/);
    expect(jsContent).toMatch(/createPointTriangle/);
  });

  it('should alternate point colors between light and dark', () => {
    expect(jsContent).toMatch(/--point-light/);
    expect(jsContent).toMatch(/--point-dark/);
    // Check for alternation logic
    expect(jsContent).toMatch(/pointIndex\s*%\s*2/);
  });
});

describe('Central Bar Rendering', () => {
  it('should render central bar with correct width (50px)', () => {
    expect(jsContent).toMatch(/BAR_WIDTH\s*=\s*50/);
  });

  it('should center bar horizontally', () => {
    // Bar X position should be (800 - 50) / 2 = 375
    expect(jsContent).toMatch(/BAR_X\s*=\s*\(BOARD_WIDTH\s*-\s*BAR_WIDTH\)\s*\/\s*2/);
  });

  it('should render bar rectangle with full height', () => {
    expect(jsContent).toMatch(/height:\s*BOARD_HEIGHT/);
  });
});

describe('Home Area Rendering', () => {
  it('should render home areas at right edge (x=750)', () => {
    expect(jsContent).toMatch(/HOME_WIDTH\s*=\s*50/);
    expect(jsContent).toMatch(/HOME_X\s*=\s*BOARD_WIDTH\s*-\s*HOME_WIDTH/);
  });

  it('should render white home area in bottom-right', () => {
    expect(jsContent).toMatch(/whiteHome/i);
    expect(jsContent).toMatch(/BOARD_HEIGHT\s*\/\s*2/);
  });

  it('should render black home area in top-right', () => {
    expect(jsContent).toMatch(/blackHome/i);
  });
});
