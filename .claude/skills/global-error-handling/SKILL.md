---
description: Error handling patterns for vanilla JS and async operations. Use when writing fetch calls, GitHub API interactions, file operations, or any code that can fail. Applies to both frontend (public/js/) and backend (src/, Actions).
---

# Error Handling

## When to use this skill:
- Writing fetch calls to poll `state.json`
- Making GitHub API requests for commits
- Parsing JSON files
- Handling OAuth flow errors
- GitHub Actions error recovery

## Async/Await Error Handling

Use try/catch with async/await:

```javascript
const fetchState = async (tableId) => {
  try {
    const url = `${BASE_URL}/tables/${tableId}/state.json?_=${Date.now()}`
    const response = await fetch(url, { cache: 'no-store' })

    if (!response.ok) {
      return { error: `HTTP ${response.status}` }
    }

    return { data: await response.json() }
  } catch (err) {
    return { error: err.message }
  }
}
```

## Result Objects Over Exceptions

Return result objects for expected errors:

```javascript
// Good: result object
const commitMove = async (move) => {
  const response = await fetch(GITHUB_API, { ... })

  if (response.status === 409) {
    return { error: 'conflict', retry: true }
  }
  if (!response.ok) {
    return { error: 'failed', retry: false }
  }

  return { success: true, sha: (await response.json()).sha }
}

// Consumer handles result
const result = await commitMove(move)
if (result.retry) {
  await delay(1000)
  return commitMove(move)
}
```

## OAuth Error Handling

Handle device flow polling errors:

```javascript
const pollForToken = async (deviceCode, interval) => {
  const response = await fetch(TOKEN_URL, { ... })
  const data = await response.json()

  if (data.error === 'authorization_pending') {
    await delay(interval * 1000)
    return pollForToken(deviceCode, interval)
  }

  if (data.error === 'slow_down') {
    await delay((interval + 5) * 1000)
    return pollForToken(deviceCode, interval + 5)
  }

  if (data.error === 'expired_token') {
    return { error: 'expired', restart: true }
  }

  return { token: data.access_token }
}
```

## User-Facing Errors

Show clear messages in the UI:

```javascript
const showError = (error) => {
  const messages = {
    'Not your turn': 'Wait for your opponent to move',
    'conflict': 'Move conflict—retrying...',
    'network': 'Connection lost. Retrying...',
  }

  statusEl.textContent = messages[error] || `Error: ${error}`
}
```

## GitHub Actions Errors

Exit with appropriate codes in Actions:

```javascript
// In validate-move workflow
if (!validationResult.valid) {
  console.error(`Invalid move: ${validationResult.error}`)
  await revertCommit()
  process.exit(0) // Don't fail workflow, just revert
}
```
