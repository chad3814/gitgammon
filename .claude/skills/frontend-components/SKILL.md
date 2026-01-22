---
description: Vanilla JavaScript component patterns for the game board UI. Use when building or modifying SVG board rendering, UI controls, or interactive elements in public/js/. No framework—pure DOM manipulation.
---

# Frontend Components (Vanilla JS)

## When to use this skill:
- Building the SVG game board in `public/js/board.js`
- Creating UI controls (dice, move buttons)
- Handling user interactions
- Updating DOM based on state changes

## Component Pattern

Create reusable render functions:

```javascript
// board.js
const createPoint = (index, pieces, color) => {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  g.setAttribute('class', `point point-${index}`)
  g.setAttribute('data-point', index)

  // Add triangle
  const triangle = createTriangle(index)
  g.appendChild(triangle)

  // Add pieces
  for (let i = 0; i < Math.abs(pieces); i++) {
    const piece = createPiece(color, i)
    g.appendChild(piece)
  }

  return g
}
```

## State-Driven Rendering

Re-render from state, don't mutate DOM incrementally:

```javascript
const renderBoard = (state, container) => {
  // Clear existing
  container.innerHTML = ''

  // Create fresh SVG
  const svg = createBoardSVG()

  // Render each point from state
  state.board.forEach((pieces, index) => {
    if (pieces !== 0) {
      const color = pieces > 0 ? 'white' : 'black'
      const point = createPoint(index, pieces, color)
      svg.appendChild(point)
    }
  })

  // Render bar and home
  renderBar(svg, state.bar)
  renderHome(svg, state.home)

  container.appendChild(svg)
}
```

## Event Handling

Use event delegation on container:

```javascript
const setupBoardEvents = (container, onPointClick) => {
  container.addEventListener('click', (e) => {
    const point = e.target.closest('[data-point]')
    if (point) {
      const index = parseInt(point.dataset.point, 10)
      onPointClick(index)
    }
  })
}
```

## SVG Creation Helpers

Create SVG elements with namespace:

```javascript
const SVG_NS = 'http://www.w3.org/2000/svg'

const createSVGElement = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG_NS, tag)
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value)
  })
  return el
}

// Usage
const circle = createSVGElement('circle', {
  cx: 50,
  cy: 50,
  r: 20,
  fill: 'white',
  stroke: 'black'
})
```

## Status Updates

Update status text clearly:

```javascript
const updateStatus = (state) => {
  const statusEl = document.getElementById('status')

  if (state.status === 'completed') {
    statusEl.textContent = `Game over! ${state.winner} wins`
    return
  }

  const diceText = state.dice.length > 0
    ? `Dice: ${state.dice.join(', ')}`
    : 'Rolling...'

  statusEl.textContent = `${state.activePlayer}'s turn. ${diceText}`
}
```
