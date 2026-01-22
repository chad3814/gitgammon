---
description: Polling state.json from GitHub Pages with cache busting. Use when implementing state synchronization in public/js/state.js. Covers fetch patterns, intervals, and change detection.
---

# State Polling

## When to use this skill:
- Fetching `state.json` from GitHub Pages
- Implementing polling intervals
- Detecting state changes

## Cache-Busted Fetch

```javascript
const fetchState = async (baseUrl, tableId) => {
  const url = `${baseUrl}/tables/${tableId}/state.json?_=${Date.now()}`

  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) return { error: `HTTP ${response.status}` }
    return { data: await response.json() }
  } catch (err) {
    return { error: err.message }
  }
}
```

## Polling Loop

```javascript
const startPolling = (baseUrl, tableId, onUpdate, interval = 5000) => {
  let lastTurn = null

  const poll = async () => {
    const result = await fetchState(baseUrl, tableId)

    if (result.data && result.data.turn !== lastTurn) {
      lastTurn = result.data.turn
      onUpdate(result.data)
    }
  }

  poll() // Initial fetch
  return setInterval(poll, interval)
}

// Stop polling
const stopPolling = (intervalId) => clearInterval(intervalId)
```

## Change Detection

```javascript
const hasStateChanged = (oldState, newState) => {
  return oldState.turn !== newState.turn ||
         oldState.updatedAt !== newState.updatedAt
}
```
