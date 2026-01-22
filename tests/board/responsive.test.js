import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Task Group 5: Responsive Mobile Layout Tests
 * Tests for portrait orientation detection, rotation prompt, and mobile optimization
 */

const htmlPath = resolve(process.cwd(), 'public/index.html');
const cssPath = resolve(process.cwd(), 'public/css/board.css');

let htmlContent;
let cssContent;

beforeAll(() => {
  htmlContent = readFileSync(htmlPath, 'utf-8');
  cssContent = readFileSync(cssPath, 'utf-8');
});

describe('Portrait Orientation Detection', () => {
  it('should have media query for portrait orientation', () => {
    expect(cssContent).toMatch(/@media\s*\(\s*orientation:\s*portrait\s*\)/);
  });

  it('should show rotation overlay in portrait mode', () => {
    // Check that portrait media query contains rotation-overlay with display: flex
    // The CSS has multiple rules in the media query block
    expect(cssContent).toMatch(/@media\s*\(\s*orientation:\s*portrait\s*\)\s*\{[^@]*\.rotation-overlay\s*\{[^}]*display:\s*flex/s);
  });

  it('should hide/dim board container in portrait mode', () => {
    // Check that portrait media query contains board-container with opacity
    expect(cssContent).toMatch(/@media\s*\(\s*orientation:\s*portrait\s*\)\s*\{[^@]*#board-container\s*\{[^}]*opacity/s);
  });
});

describe('Rotation Prompt Overlay', () => {
  it('should have rotation overlay element in HTML', () => {
    expect(htmlContent).toMatch(/id=["']rotation-prompt["']/);
    expect(htmlContent).toMatch(/class=["'][^"']*rotation-overlay/);
  });

  it('should have centered rotation message', () => {
    expect(htmlContent).toMatch(/class=["'][^"']*rotation-message/);
    expect(htmlContent).toMatch(/rotate.*device.*landscape/i);
  });

  it('should have rotation icon or visual indicator', () => {
    // Check for SVG icon or CSS-based rotation indicator
    expect(htmlContent).toMatch(/rotation-icon|rotate-icon/i);
  });

  it('should have full-viewport overlay with semi-transparent background', () => {
    expect(cssContent).toMatch(/\.rotation-overlay\s*\{[^}]*position:\s*fixed/);
    expect(cssContent).toMatch(/\.rotation-overlay\s*\{[^}]*width:\s*100%/);
    expect(cssContent).toMatch(/\.rotation-overlay\s*\{[^}]*height:\s*100%/);
  });

  it('should hide rotation overlay in landscape mode', () => {
    expect(cssContent).toMatch(/@media\s*\(\s*orientation:\s*landscape\s*\)\s*\{[^@]*\.rotation-overlay\s*\{[^}]*display:\s*none/s);
  });
});

describe('Mobile Viewport Optimization', () => {
  it('should have media query for small landscape viewports', () => {
    // Check for media query targeting iPhone SE landscape (568px) or similar
    expect(cssContent).toMatch(/@media[^{]*max-width:\s*600px[^{]*orientation:\s*landscape/);
  });

  it('should optimize padding and spacing for mobile', () => {
    expect(cssContent).toMatch(/padding:\s*[248]px/);
  });

  it('should scale font sizes for mobile readability', () => {
    // Count badges should have mobile-specific font size
    expect(cssContent).toMatch(/\.count-badge\s*\{[^}]*font-size:\s*\d+px/);
  });
});

describe('Touch-Friendly Sizing', () => {
  it('should document 44x44px minimum touch target requirement', () => {
    // CSS should have comments about touch target requirements
    expect(cssContent).toMatch(/44.*px|touch.*target/i);
  });

  it('should have viewport meta tag for proper scaling', () => {
    expect(htmlContent).toMatch(/<meta\s+name="viewport"[^>]*width=device-width/i);
    expect(htmlContent).toMatch(/<meta\s+name="viewport"[^>]*initial-scale=1/i);
  });
});

describe('Responsive Board Container', () => {
  it('should have max-width for large screens', () => {
    expect(cssContent).toMatch(/#board-container\s*\{[^}]*max-width:\s*800px/);
  });

  it('should fill available width on smaller screens', () => {
    expect(cssContent).toMatch(/#board-container\s*\{[^}]*width:\s*100%/);
  });

  it('should center board horizontally', () => {
    expect(cssContent).toMatch(/#board-container\s*\{[^}]*margin[^}]*auto/);
  });
});
