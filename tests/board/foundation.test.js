import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Task Group 1: Foundation Layer Tests
 * Tests for HTML structure and CSS foundation
 */

const htmlPath = resolve(process.cwd(), 'public/index.html');
const cssPath = resolve(process.cwd(), 'public/css/board.css');

let htmlContent;
let cssContent;

beforeAll(() => {
  htmlContent = readFileSync(htmlPath, 'utf-8');
  cssContent = readFileSync(cssPath, 'utf-8');
});

describe('HTML Structure Foundation', () => {
  it('should have DOCTYPE, html lang, and meta charset', () => {
    expect(htmlContent).toMatch(/<!DOCTYPE html>/i);
    expect(htmlContent).toMatch(/<html\s+lang="en"/i);
    expect(htmlContent).toMatch(/<meta\s+charset="UTF-8"/i);
  });

  it('should have viewport meta tag with width=device-width', () => {
    expect(htmlContent).toMatch(/<meta\s+name="viewport"[^>]*width=device-width/i);
  });

  it('should have board container element with correct ID', () => {
    expect(htmlContent).toMatch(/<div[^>]*id=["']board-container["']/i);
  });

  it('should link to CSS and JS files correctly', () => {
    expect(htmlContent).toMatch(/<link[^>]*href=["']css\/board\.css["']/i);
    expect(htmlContent).toMatch(/<script[^>]*src=["']js\/board\.js["'][^>]*defer/i);
  });
});

describe('CSS Custom Properties', () => {
  it('should define board color CSS custom properties at :root level', () => {
    expect(cssContent).toMatch(/:root\s*\{[^}]*--board-bg:\s*#8B4513/i);
    expect(cssContent).toMatch(/:root\s*\{[^}]*--board-border:\s*#5D3A1A/i);
    expect(cssContent).toMatch(/:root\s*\{[^}]*--point-light:\s*#D2B48C/i);
    expect(cssContent).toMatch(/:root\s*\{[^}]*--point-dark:\s*#8B6914/i);
  });

  it('should define piece color CSS custom properties at :root level', () => {
    expect(cssContent).toMatch(/:root\s*\{[^}]*--piece-white:\s*#FFFAF0/i);
    expect(cssContent).toMatch(/:root\s*\{[^}]*--piece-white-stroke:\s*#333/i);
    expect(cssContent).toMatch(/:root\s*\{[^}]*--piece-black:\s*#2F2F2F/i);
    expect(cssContent).toMatch(/:root\s*\{[^}]*--piece-black-stroke:\s*#000/i);
  });
});

describe('Board Container Styling', () => {
  it('should have board container with centered layout and max-width', () => {
    expect(cssContent).toMatch(/#board-container\s*\{[^}]*max-width:\s*800px/i);
    expect(cssContent).toMatch(/#board-container\s*\{[^}]*margin[^}]*auto/i);
  });

  it('should include box-sizing border-box reset', () => {
    expect(cssContent).toMatch(/box-sizing:\s*border-box/i);
  });
});
