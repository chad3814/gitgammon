# Product Mission

## Pitch

GitGammon is a static GitHub Pages backgammon game where players make moves by committing files to the repository. Each table is a directory, moves are committed as JSON files, and Git history serves as the permanent game log—no backend required.

## Users

### Primary Customers

- **Developer Gamers**: Software developers who enjoy blending coding culture with casual gaming
- **Backgammon Enthusiasts**: Players seeking a unique, asynchronous way to enjoy their favorite strategy game
- **Open Source Community Members**: GitHub users looking for novel ways to engage with the platform

### User Personas

**Alex the Developer** (25-40)
- **Role:** Full-stack developer at a tech company
- **Context:** Spends significant time on GitHub for work and personal projects
- **Pain Points:** Wants casual gaming that fits into coding workflow; traditional games feel disconnected from dev environment
- **Goals:** Play backgammon with colleagues without leaving the GitHub ecosystem; show off games on their profile

**Morgan the Backgammon Player** (30-55)
- **Role:** Casual backgammon player, may or may not be technical
- **Context:** Enjoys correspondence-style games; appreciates the strategic depth of backgammon
- **Pain Points:** Existing online platforms lack personality; wants games with a story/history
- **Goals:** Play thoughtful, unhurried matches with a permanent record of every move

**Sam the Open Source Contributor** (20-35)
- **Role:** Active GitHub contributor and community member
- **Context:** Enjoys creative uses of Git and GitHub; participates in coding challenges
- **Pain Points:** Looking for fun ways to engage with Git beyond typical workflows
- **Goals:** Discover novel applications of version control; share unique projects with the community

## The Problem

### Disconnected Gaming Experiences

Developers spend hours on GitHub but must context-switch to entirely different platforms for casual gaming. Traditional online backgammon lacks the permanence, transparency, and social coding culture that developers appreciate.

**Our Solution:** Embed backgammon directly into the GitHub workflow. Every move is a commit, every table is a directory, and every match is preserved forever in the repository history. The game board lives on GitHub Pages, making it shareable and always accessible.

### Ephemeral Game Records

Most online games disappear after completion. There's no way to revisit, analyze, or share the story of a match.

**Our Solution:** Git's immutable history means every move is permanently recorded. Players can fork interesting games, analyze pivotal moments, and share specific board states via commit links.

## Differentiators

### Backend-Free Architecture

Unlike traditional game servers, GitGammon requires no backend infrastructure. Authentication uses OAuth Device Flow (client ID only, no secrets). Move validation happens in GitHub Actions. State is polled directly from GitHub Pages with cache busting.

This results in zero hosting costs, zero server maintenance, and infinite scalability within GitHub's infrastructure.

### Git-Native Gameplay

Unlike browser-based backgammon sites, GitGammon uses Git itself as the game engine. Moves are committed files, game state is JSON, and validation happens through GitHub Actions. This creates a transparent, auditable, and hackable gaming experience.

This results in games that are permanently archived, infinitely forkable, and seamlessly integrated into developers' existing workflows.

### Asynchronous by Design

Unlike real-time gaming platforms that require both players online simultaneously, GitGammon embraces asynchronous play. Expect multi-second delays between move submission and opponent notification—this is acceptable for turn-based games and fits busy schedules across time zones.

This results in thoughtful, strategic gameplay that fits into busy schedules and spans time zones without friction.

### Open and Extensible

Unlike closed gaming platforms, GitGammon is entirely open source. The game logic, validation rules, and rendering are all visible and modifiable.

This results in a community-driven experience where players can propose rule variants, improve the UI, or even fork the entire game for their own tournaments.

## Key Features

### Core Features

- **Commit-Based Moves**: Make moves by committing JSON files to the table directory (e.g., `tables/{id}/moves/0001-white-{sha}.json`)
- **GitHub Pages Board**: View the current game state on a live board rendered on GitHub Pages, with unauthenticated polling
- **Move Validation**: GitHub Actions automatically validate moves, ensuring legal play and updating the authoritative `state.json`
- **Dice Rolling**: Server-side dice rolls in GitHub Actions—committed as part of `state.json` to prevent cheating

### Authentication Features

- **OAuth Device Flow**: Backend-free authentication using GitHub's device flow (user visits `github.com/login/device` and enters a code)
- **No Secrets Required**: Only the OAuth App's Client ID is needed, no client secret
- **Token-Based Commits**: Access token used only for committing moves; all reads are unauthenticated

### Collaboration Features

- **Challenge System**: Start games by opening issues or creating table directories
- **Game Comments**: Use commit messages and PR comments to chat, discuss strategy, or add flavor to matches
- **Spectator Mode**: Anyone can watch ongoing games by viewing the GitHub Pages site—no authentication needed

### Advanced Features

- **Doubling Cube**: Full support for the doubling cube, with stakes tracked in game state
- **Match Play**: Configure matches to a set number of points with Crawford rule support
- **Game Analysis**: Review any historical board state by checking out past commits
- **Tournament Support**: Organize brackets using GitHub's issue and project features

## Tradeoffs

| Pros | Cons |
|------|------|
| No backend needed | Multi-second latency |
| Free hosting | Complex conflict handling |
| Git history = game log | Pages caching quirks |
| Device flow = no secrets | Clunkier OAuth UX than redirect flow |

## Alternatives Considered

If smoother UX is needed later, consider:
- Supabase (free tier)
- Firebase Realtime Database
- Cloudflare Worker + D1

Git works as a fun hack for casual play with friends, but isn't optimized for this access pattern.

## Success Metrics

### Engagement

- Number of games started per month
- Average moves per active game
- Repository stars and forks
- Return player rate (players who start multiple games)

### Community

- Number of contributors to the codebase
- Community-created variants or themes
- Social shares and mentions

### Technical

- Move validation accuracy (zero invalid moves accepted)
- GitHub Pages uptime and load time
- Action execution time for move processing
