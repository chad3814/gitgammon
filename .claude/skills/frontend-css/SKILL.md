---
description: CSS styling conventions for the backgammon board and UI. Use when writing styles in public/css/. Uses CSS custom properties for theming, no preprocessors.
---

# CSS Styling

## When to use this skill:
- Styling the SVG board in `public/css/board.css`
- Creating theme variations (dark mode)
- Styling UI controls and status displays
- Responsive layout adjustments

## CSS Custom Properties for Theming

Define theme variables at root:

```css
:root {
  /* Board colors */
  --board-bg: #8B4513;
  --board-border: #5D3A1A;
  --point-light: #D2B48C;
  --point-dark: #8B4513;

  /* Piece colors */
  --piece-white: #FFFAF0;
  --piece-white-stroke: #333;
  --piece-black: #2F2F2F;
  --piece-black-stroke: #000;

  /* UI colors */
  --text-primary: #333;
  --text-secondary: #666;
  --bg-primary: #FFF;
  --bg-secondary: #F5F5F5;
}

[data-theme="dark"] {
  --board-bg: #2C1810;
  --text-primary: #EEE;
  --bg-primary: #1A1A1A;
}
```

## SVG Styling

Style SVG elements with CSS:

```css
.point {
  cursor: pointer;
  transition: opacity 0.2s;
}

.point:hover {
  opacity: 0.8;
}

.point.selected {
  filter: brightness(1.2);
}

.piece {
  stroke-width: 2;
}

.piece.white {
  fill: var(--piece-white);
  stroke: var(--piece-white-stroke);
}

.piece.black {
  fill: var(--piece-black);
  stroke: var(--piece-black-stroke);
}
```

## Layout

Use flexbox for simple layouts:

```css
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.board-wrapper {
  max-width: 800px;
  width: 100%;
}

.controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
```

## Button Styles

Consistent button styling:

```css
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background: #45A049;
}

.btn-primary:disabled {
  background: #CCC;
  cursor: not-allowed;
}
```

## Animations

Use CSS transitions for smooth updates:

```css
.dice {
  transition: transform 0.3s ease-out;
}

.dice.rolling {
  animation: roll 0.5s ease-in-out;
}

@keyframes roll {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg); }
}
```
