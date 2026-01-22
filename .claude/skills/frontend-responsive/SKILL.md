---
description: Responsive design for the game board across devices. Use when ensuring the board scales properly on mobile and desktop. Applies to CSS media queries and viewport-aware SVG.
---

# Responsive Design

## When to use this skill:
- Ensuring board fits mobile screens
- Scaling SVG viewBox appropriately
- Adjusting controls for touch devices
- Testing across viewport sizes

## SVG ViewBox for Scaling

Use viewBox for responsive SVG:

```javascript
const createBoard = () => {
  const svg = createSVGElement('svg', {
    viewBox: '0 0 800 600',
    preserveAspectRatio: 'xMidYMid meet',
    class: 'board'
  })
  return svg
}
```

```css
.board {
  width: 100%;
  max-width: 800px;
  height: auto;
}
```

## Responsive Breakpoints

Define consistent breakpoints:

```css
/* Mobile first */
.game-container {
  padding: 0.5rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .game-container {
    padding: 1rem;
  }

  .controls {
    flex-direction: row;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .game-container {
    padding: 2rem;
  }
}
```

## Touch-Friendly Targets

Ensure touch targets are large enough:

```css
/* Minimum 44x44px touch targets */
.btn {
  min-width: 44px;
  min-height: 44px;
  padding: 0.75rem 1rem;
}

@media (min-width: 768px) {
  .btn {
    min-width: auto;
    min-height: auto;
    padding: 0.5rem 1rem;
  }
}
```

## Mobile-Specific Layouts

Stack controls on mobile:

```css
.controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

@media (min-width: 768px) {
  .controls {
    flex-direction: row;
    width: auto;
  }
}
```

## Viewport Meta Tag

Required in HTML:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Responsive Font Sizes

Scale text appropriately:

```css
:root {
  font-size: 16px;
}

.status {
  font-size: 1rem;
}

.dice-display {
  font-size: 1.5rem;
}

@media (min-width: 768px) {
  .dice-display {
    font-size: 2rem;
  }
}
```

## Testing Checklist

- [ ] Board readable on 320px width
- [ ] Touch targets minimum 44x44px on mobile
- [ ] No horizontal scroll on any viewport
- [ ] Controls accessible without zooming
- [ ] Text readable without pinch-zoom
