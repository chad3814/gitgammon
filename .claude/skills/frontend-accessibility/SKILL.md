---
description: Accessibility guidelines for the game UI. Use when building interactive SVG elements, handling keyboard navigation, or adding ARIA attributes. Essential for board.js and UI controls.
---

# Accessibility

## When to use this skill:
- Making the SVG board keyboard-navigable
- Adding ARIA labels to game elements
- Ensuring color contrast for pieces
- Screen reader announcements for game state

## SVG Accessibility

Add roles and labels to SVG elements:

```javascript
const createBoard = () => {
  const svg = createSVGElement('svg', {
    role: 'img',
    'aria-label': 'Backgammon board'
  })

  // Add title for screen readers
  const title = createSVGElement('title')
  title.textContent = 'Backgammon game board'
  svg.appendChild(title)

  return svg
}

const createPoint = (index, pieces, color) => {
  const g = createSVGElement('g', {
    role: 'button',
    tabindex: '0',
    'aria-label': `Point ${index}: ${Math.abs(pieces)} ${color} pieces`
  })
  return g
}
```

## Keyboard Navigation

Enable keyboard interaction:

```javascript
const setupKeyboardNav = (container) => {
  container.addEventListener('keydown', (e) => {
    const current = document.activeElement

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      current.click()
    }

    if (e.key === 'ArrowRight') {
      const next = current.nextElementSibling
      if (next) next.focus()
    }

    if (e.key === 'ArrowLeft') {
      const prev = current.previousElementSibling
      if (prev) prev.focus()
    }
  })
}
```

## Focus Styles

Visible focus indicators:

```css
.point:focus {
  outline: 3px solid #4A90D9;
  outline-offset: 2px;
}

.point:focus:not(:focus-visible) {
  outline: none;
}

.point:focus-visible {
  outline: 3px solid #4A90D9;
  outline-offset: 2px;
}
```

## Live Regions for Updates

Announce state changes:

```html
<div id="announcements" aria-live="polite" class="sr-only"></div>
```

```javascript
const announce = (message) => {
  const el = document.getElementById('announcements')
  el.textContent = message
}

// Usage
announce(`${state.activePlayer} rolled ${state.dice.join(' and ')}`)
announce('Your turn to move')
announce('Game over! White wins')
```

## Screen Reader Only Class

Hide visual elements that provide screen reader context:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

## Color Contrast

Ensure pieces are distinguishable:

```css
/* High contrast between pieces and board */
.piece.white {
  fill: #FFFAF0;
  stroke: #333;
  stroke-width: 2;
}

.piece.black {
  fill: #2F2F2F;
  stroke: #000;
  stroke-width: 2;
}
```
