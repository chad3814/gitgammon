# Move Validation Engine

## Initial Feature Description

Implement core backgammon rules: legal piece movement, hitting blots, bearing off conditions, and blocked point detection. Reject invalid moves with clear error messages.

## Context

- This is GitGammon - a backgammon game played on GitHub through commits
- We already have:
  - Game state schema in src/state/ (0-based 24-element board array, positive=white, negative=black)
  - Move file format in src/moves/ with SingleMove {from, to, die} structure
  - Board rendering in public/
- The move validation will be used by a GitHub Action to validate submitted moves
