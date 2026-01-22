---
description: GitHub Contents API for committing move files. Use when implementing move submission in public/js/moves.js. Covers file creation, conflict handling, and rate limits. For OAuth, see backend-oauth skill.
---

# GitHub API for Commits

## When to use this skill:
- Committing move files via GitHub API in `public/js/moves.js`
- Handling commit conflicts (HTTP 409)
- Checking rate limits

## Commit a Move File

```javascript
const commitMove = async (token, owner, repo, tableId, move) => {
  const seq = String(move.turn).padStart(4, '0')
  const path = `tables/${tableId}/moves/${seq}-${move.player}-${Date.now()}.json`

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Move ${move.turn}: ${move.player}`,
        content: btoa(JSON.stringify(move, null, 2)),
        branch: 'main'
      })
    }
  )

  if (response.status === 409) {
    return { error: 'conflict', retry: true }
  }

  if (!response.ok) {
    return { error: `HTTP ${response.status}` }
  }

  return { success: true, sha: (await response.json()).content.sha }
}
```

## Conflict Retry

```javascript
const commitWithRetry = async (token, owner, repo, tableId, move, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    const result = await commitMove(token, owner, repo, tableId, move)
    if (!result.retry) return result
    await delay(1000 * (i + 1)) // Exponential backoff
  }
  return { error: 'Max retries exceeded' }
}
```

## Rate Limits

| Operation | Limit |
|-----------|-------|
| Authenticated API | 5000/hr |
| Unauthenticated API | 60/hr |
| Pages fetch | Unlimited |

```javascript
const checkRateLimit = (response) => {
  const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0')
  if (remaining < 10) {
    console.warn(`Rate limit low: ${remaining}`)
  }
}
```
