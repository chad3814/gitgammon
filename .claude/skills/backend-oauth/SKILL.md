---
description: GitHub OAuth Device Flow implementation for static sites. Use when implementing authentication in public/js/auth.js. Covers code request, polling, token storage.
---

# OAuth Device Flow

## When to use this skill:
- Implementing login in `public/js/auth.js`
- Handling token polling
- Managing token storage

## Request Device Code

```javascript
const GITHUB_CLIENT_ID = 'your-client-id'

const requestDeviceCode = async () => {
  const response = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      scope: 'repo'
    })
  })

  return response.json()
  // { device_code, user_code, verification_uri, interval }
}
```

## Poll for Token

```javascript
const pollForToken = async (deviceCode, interval) => {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      device_code: deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
    })
  })

  const data = await response.json()

  if (data.access_token) return { token: data.access_token }
  if (data.error === 'authorization_pending') {
    await delay(interval * 1000)
    return pollForToken(deviceCode, interval)
  }
  if (data.error === 'slow_down') {
    return pollForToken(deviceCode, interval + 5)
  }

  return { error: data.error }
}
```

## Token Storage

```javascript
const saveToken = (token) => localStorage.setItem('github_token', token)
const getToken = () => localStorage.getItem('github_token')
const clearToken = () => localStorage.removeItem('github_token')
const isLoggedIn = () => !!getToken()
```
