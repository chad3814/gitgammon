# Tech Stack

## Frontend (GitHub Pages)

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Markup | HTML5 | Native GitHub Pages support, no build step required |
| Styling | CSS3 | Vanilla CSS for simplicity; CSS custom properties for theming |
| Scripting | Vanilla JavaScript (ES6+) | No framework overhead; runs directly in browser without bundling |
| Board Rendering | SVG | Scalable graphics for the game board; easy to style and animate |
| State Loading | Fetch API | Load state.json from Pages URL with cache busting |

**Notes:**
- No build step required; all assets served directly from the repository
- Avoids framework dependencies to minimize maintenance burden
- SVG chosen over Canvas for accessibility and CSS styling flexibility

## Authentication (OAuth Device Flow)

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Flow Type | Device Authorization Grant | Works for static sites; no client secret needed |
| Token Storage | localStorage | Persist access token across sessions |
| Scopes | `repo` | Required for committing move files |

**How It Works:**
1. App requests device code: `POST https://github.com/login/device/code`
2. User visits `github.com/login/device` and enters short code
3. App polls: `POST https://github.com/login/oauth/access_token` with grant type `urn:ietf:params:oauth:grant-type:device_code`
4. GitHub returns access token on authorization

**Polling Responses:**
| `error` value | Action |
|---------------|--------|
| `authorization_pending` | Keep polling |
| `slow_down` | Increase interval by 5 seconds |
| `expired_token` | Restart flow |

**Setup:**
1. Create OAuth App: GitHub → Settings → Developer settings → OAuth Apps
2. Enable device flow in app settings
3. Store Client ID in app (no secret required)

## Game State Storage

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Game State | JSON files | Human-readable, diffable, native to JavaScript |
| File Structure | `/tables/{table-id}/` | One directory per table for clean organization |
| State File | `state.json` | Authoritative current board state |
| Move History | `moves/{seq}-{color}-{sha}.json` | Individual move files for conflict mitigation |

**Example state.json:**
```json
{
    "turn": 12,
    "activePlayer": "white",
    "dice": [4, 2],
    "diceUsed": [],
    "board": [...],
    "bar": { "white": 0, "black": 1 },
    "home": { "white": 3, "black": 0 },
    "lastMove": "0012-black-a1b2c3",
    "status": "playing",
    "updatedAt": "2025-01-21T..."
}
```

**File Structure:**
```
/tables/{table-id}/
    state.json              # Current board state (authoritative)
    moves/
        0001-white-{sha}.json
        0002-black-{sha}.json
        ...
```

## Move Processing (GitHub Actions)

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Workflow Runtime | GitHub Actions | Native to GitHub; triggers on push events |
| Validation Logic | Node.js | JavaScript consistency with frontend; rich ecosystem |
| Dice Generation | Server-side random | Generated after move validation; committed in state.json |
| State Updates | Git commits | Action commits validated state back to the branch |

**Processing Flow:**
```
Player commits move.json (authenticated)
        ↓
GitHub Action triggers on push
        ↓
Action validates move against state.json
        ├─ Invalid → Revert commit, update state with error
        └─ Valid → Apply move, roll dice, update state.json
        ↓
Action commits updated state.json
        ↓
Pages rebuilds (~10-30 sec)
        ↓
Opponent polls and sees new state (unauthenticated)
```

**Workflow Triggers:**
- `push` to paths matching `tables/*/moves/*.json`
- `workflow_dispatch` for manual operations

## Optimized Polling Strategy

| Operation | Authentication | Rate Limit |
|-----------|----------------|------------|
| Commit moves | Access token | 5000 req/hr |
| Poll state.json | None (fetch from Pages URL) | Essentially unlimited |

**Cache Busting:**
```javascript
fetch(`https://<user>.github.io/gitgammon/tables/{id}/state.json?_=${Date.now()}`, {
  cache: "no-store"
})
```

## Development Tools

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Testing | Vitest | Fast, modern test runner with native ES modules |
| Linting | ESLint | Consistent code style; catch common errors |
| Formatting | Prettier | Automatic code formatting |
| Type Checking | JSDoc + TypeScript (check-only) | Type safety without full TypeScript compilation |
| Local Development | Live Server or http-server | Simple static file serving for local testing |

## Repository Structure

```
gitgammon/
├── .github/
│   └── workflows/
│       ├── validate-move.yml    # Process and validate player moves
│       └── start-game.yml       # Initialize new tables from challenges
├── src/
│   ├── validation/              # Move validation logic (used by Actions)
│   ├── dice/                    # Dice rolling
│   └── state/                   # State management utilities
├── public/                      # GitHub Pages root
│   ├── index.html               # Main board page
│   ├── css/
│   │   └── board.css            # Board styling and themes
│   ├── js/
│   │   ├── board.js             # Board rendering logic
│   │   ├── state.js             # State loading and polling
│   │   ├── auth.js              # OAuth Device Flow
│   │   ├── moves.js             # Move submission
│   │   └── history.js           # Move history navigation
│   └── assets/                  # Images, icons
├── tables/                      # Active and completed game states
│   └── {table-id}/
│       ├── state.json
│       └── moves/
│           └── *.json
├── tests/                       # Test files
├── spekka/                      # Product documentation
│   └── product/
│       ├── mission.md
│       ├── roadmap.md
│       └── tech-stack.md
└── README.md
```

## Deployment

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Hosting | GitHub Pages | Zero-cost hosting; automatic deployment from repository |
| Domain | `<username>.github.io/gitgammon` | Default GitHub Pages URL |
| SSL | GitHub-provided | Automatic HTTPS for all GitHub Pages sites |
| CDN | GitHub's infrastructure | Global distribution via GitHub's CDN |

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Move Tampering | GitHub Actions validates all moves before updating state |
| Dice Manipulation | Dice rolled server-side after move submission |
| Out-of-Turn Moves | Action verifies activePlayer matches commit author |
| Unauthorized Access | OAuth Device Flow authenticates players |
| State Corruption | JSON schema validation on every state update |
| Simultaneous Commits | Separate move files + retry logic mitigate conflicts |

## Known Limitations

| Issue | Mitigation |
|-------|------------|
| Multi-second latency | Acceptable for turn-based; not real-time |
| Pages caching | Cache busting with timestamp query param |
| Merge conflicts | Separate files per move; retry on failure |
| Clunky OAuth UX | Device flow is the only option without a backend |

## Future Considerations

- **Real-time Updates**: Would require external service (Supabase, Firebase, Cloudflare Worker)
- **Database Backend**: If game volume exceeds practical flat file limits
- **Alternative Auth**: For non-GitHub players (would need backend)
- **Game Analysis API**: External service for AI move suggestions
