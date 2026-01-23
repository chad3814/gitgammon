# Product Roadmap

## Phase 1: Core MVP (Playable Two-Player Game)

1. [x] Game State Schema — Define the JSON schema for `state.json` matching the architecture spec: turn number, activePlayer, dice, diceUsed, board array, bar, home, lastMove, status, updatedAt. `S`

2. [x] Board Rendering — Build a static HTML/CSS/JS page that reads `state.json` and renders an interactive backgammon board on GitHub Pages. Support for all 24 points, bar, and bear-off areas using SVG. `M`

3. [x] Move File Format — Design the move JSON format for files in `tables/{id}/moves/` directory (e.g., `0001-white-{sha}.json`). Include move notation, player, timestamp. `S`

4. [x] Move Validation Engine — Implement core backgammon rules: legal piece movement, hitting blots, bearing off conditions, and blocked point detection. Reject invalid moves with clear error messages. `M`

5. [x] Dice System — Server-side dice rolling in GitHub Actions, committed as part of `state.json`. Rolls happen after move validation, ensuring no manipulation possible. `S`

6. [x] GitHub Action Workflow — Build the Action that triggers on push, validates the move against `state.json`, applies valid moves, rolls dice, updates state, or reverts invalid commits with error in state. `L`

7. [x] OAuth Device Flow — Implement authentication using GitHub's Device Flow: request device code, poll for token, store access token locally. Only Client ID needed—no secrets. `M`

8. [x] Table Initialization — Create system for starting new tables: create `tables/{id}/` directory, initial `state.json`, empty `moves/` directory, assign players, first dice roll for starting player. `S`

9. [ ] State Polling — Implement unauthenticated polling of `state.json` from GitHub Pages URL with cache busting (`?_=${Date.now()}` and `cache: "no-store"`). `S`

10. [ ] Turn Management — Implement turn alternation, handle blocked situations, manage roll/move phase transitions. Validate it's the correct player's turn in the Action. `S`

11. [ ] Bearing Off Logic — Complete endgame implementation: detecting when bearing off is legal, validating bear-off moves, and determining game completion. `S`

12. [ ] Win Detection — Detect game-ending conditions (all pieces borne off), calculate win type (single, gammon, backgammon), update status to completed. `S`

## Phase 2: Enhanced Gameplay

13. [ ] Conflict Handling — Handle simultaneous commits gracefully: separate files per move, retry logic on commit failure, clear error states. `M`

14. [ ] Move History Display — Show complete move history on the board, with ability to step through past positions by navigating commits. `M`

15. [ ] Challenge System — Enable players to start games via issues or a web interface that creates the table directory and initial state. `S`

16. [ ] Doubling Cube — Implement the doubling cube: offering doubles, accepting/declining, tracking cube value and ownership, applying multipliers to final scores. `M`

17. [ ] Match Play Mode — Support multi-game matches to a point target. Track match score, implement Crawford rule, handle match-level state. `M`

18. [ ] Player Profiles — Display player stats on GitHub Pages: games played, win/loss record, notable matches. Pull data from repository history. `M`

## Phase 3: Social Features & Polish

19. [ ] Multiple Concurrent Tables — Support multiple active games in a single repository using the `tables/{id}/` directory structure. `M`

20. [ ] Leaderboard — Aggregate results across completed games to generate rankings. Display on GitHub Pages with filtering by time period. `L`

21. [ ] Game Notifications — Integrate with GitHub notifications or add webhook support to alert players when it's their turn. `S`

22. [ ] Board Themes — Add multiple visual themes (classic, dark mode, minimal) with a theme selector. `S`

23. [ ] Game Forking — Enable spectators to fork interesting game positions to analyze alternative lines. `S`

24. [ ] Tournament Bracket System — Create tournament infrastructure using GitHub Issues/Projects: bracket generation, match scheduling, automated advancement. `L`

25. [ ] Move Suggestions — Optional feature to highlight legal moves on the board, helping newer players learn. `M`

26. [ ] Game Export — Export completed games in standard backgammon notation formats (e.g., .mat files) for external analysis tools. `S`

27. [x] Mobile-Responsive Board — Ensure the board renders well on mobile for players checking games on the go. `M`

> Notes
> - Items are ordered by technical dependencies and incremental value delivery
> - Phase 1 (items 1-12): Core MVP delivering a playable two-player backgammon game with authentication
> - Phase 2 (items 13-18): Enhanced gameplay with conflict handling, doubling cube, matches, and player identity
> - Phase 3 (items 19-27): Social features, polish, and community tools
> - Each item represents an end-to-end functional feature that can be tested independently
