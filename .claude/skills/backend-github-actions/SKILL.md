---
description: GitHub Actions workflow patterns for move validation. Use when writing .github/workflows/*.yml or Node.js scripts that run in Actions. Covers triggers, validation, and committing state.
---

# GitHub Actions

## When to use this skill:
- Creating workflows in `.github/workflows/`
- Writing validation scripts for Actions
- Committing state updates from Actions

## Workflow Structure

```yaml
# .github/workflows/validate-move.yml
name: Validate Move

on:
  push:
    paths:
      - 'tables/*/moves/*.json'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci

      - name: Validate and apply move
        run: node scripts/validate-move.js
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Validation Script Pattern

```javascript
// scripts/validate-move.js
import { readFile, writeFile } from 'fs/promises'
import { execSync } from 'child_process'

const main = async () => {
  // Find changed move file
  const moveFile = process.env.CHANGED_FILE
  const move = JSON.parse(await readFile(moveFile, 'utf-8'))

  // Load current state
  const tableId = extractTableId(moveFile)
  const statePath = `tables/${tableId}/state.json`
  const state = JSON.parse(await readFile(statePath, 'utf-8'))

  // Validate
  const result = validateMove(move, state)

  if (!result.valid) {
    console.error(`Invalid move: ${result.error}`)
    execSync('git revert HEAD --no-edit')
    execSync('git push')
    process.exit(0)
  }

  // Apply move and update state
  const newState = applyMove(move, state)
  newState.dice = rollDice()
  newState.updatedAt = new Date().toISOString()

  await writeFile(statePath, JSON.stringify(newState, null, 2))

  // Commit updated state
  execSync('git add .')
  execSync(`git commit -m "Apply move ${state.turn}"`)
  execSync('git push')
}

main()
```

## Committing from Actions

```yaml
- name: Commit state update
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add tables/
    git commit -m "Update game state" || exit 0
    git push
```
