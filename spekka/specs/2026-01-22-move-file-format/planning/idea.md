# Move File Format

**Roadmap Item**: #3 - GitGammon

## Raw Idea

Design the move JSON format for files in `tables/{id}/moves/` directory (e.g., `0001-white-{sha}.json`). Include move notation, player, timestamp.

## Context

GitGammon is a backgammon game played on GitHub Pages through commits. This spec defines how individual moves will be stored as JSON files in the game's file structure.

## Key Requirements

- Files stored in `tables/{id}/moves/` directory
- Filename format: `0001-white-{sha}.json`
- Must include:
  - Move notation
  - Player information
  - Timestamp

## Next Steps

- Define the complete JSON schema
- Specify move notation format
- Document file naming conventions
- Define validation requirements
