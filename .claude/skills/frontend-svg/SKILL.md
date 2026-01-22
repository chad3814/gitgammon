---
description: SVG creation and manipulation for the backgammon board. Use when creating board elements, pieces, or points in public/js/board.js. Covers SVG namespacing, element creation, and styling.
---

# SVG Board Rendering

## When to use this skill:
- Creating board elements (points, pieces, dice)
- Building SVG dynamically in JavaScript
- Styling SVG with CSS

## SVG Namespace

Always use SVG namespace:

```javascript
const SVG_NS = 'http://www.w3.org/2000/svg'

const createSVGElement = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG_NS, tag)
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value)
  })
  return el
}
```

## Board Structure

```javascript
const createBoard = () => {
  const svg = createSVGElement('svg', {
    viewBox: '0 0 800 600',
    class: 'board'
  })

  // Background
  svg.appendChild(createSVGElement('rect', {
    width: 800, height: 600, fill: 'var(--board-bg)'
  }))

  // Points (triangles)
  for (let i = 1; i <= 24; i++) {
    svg.appendChild(createPoint(i))
  }

  return svg
}
```

## Pieces as Circles

```javascript
const createPiece = (color, stackIndex) => {
  return createSVGElement('circle', {
    r: 18,
    cy: 30 + stackIndex * 36, // Stack vertically
    class: `piece ${color}`
  })
}
```

## Points as Polygons

```javascript
const createTriangle = (index, isTop) => {
  const x = getPointX(index)
  const height = isTop ? 200 : -200
  const points = `${x},0 ${x + 30},0 ${x + 15},${height}`

  return createSVGElement('polygon', {
    points,
    class: index % 2 === 0 ? 'point-light' : 'point-dark'
  })
}
```
