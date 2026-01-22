/**
 * GitGammon Action Entry Point
 * Main orchestration for processing move files
 * @module action/index
 */

import { discoverMoveFile } from './discovery.js';
import { loadState } from './state-loader.js';
import { loadMoveFile, extractSequence } from './move-loader.js';
import { runValidationPipeline } from './validation-pipeline.js';
import { applyMoves } from './apply-move.js';
import { rollDiceForNextTurn, mergeDiceResult } from './roll-dice.js';
import { detectWin } from './detect-win.js';
import { finalizeState } from './finalize-state.js';
import { commitValidMove } from './commit-valid.js';
import { handleInvalidMove } from './commit-invalid.js';
import { wrapWithErrorHandler, handleError } from './error-handler.js';
import { logInfo, logError, logGroup } from './logger.js';
import { join } from 'path';

/**
 * Main action entry point
 * @param {object} [options]
 * @param {string} [options.basePath] - Base path for file operations
 */
export async function run(options = {}) {
  const basePath = options.basePath || process.cwd();

  logInfo('GitGammon Action starting');

  // 1. Discover move file from git diff
  logInfo('Discovering move files...');
  const discovery = discoverMoveFile();

  if (!discovery) {
    logInfo('No move files found in commit - nothing to process');
    return { success: true, noMoves: true };
  }

  const { moveFilePath, tableName, filename } = discovery;
  const fullMoveFilePath = join(basePath, moveFilePath);
  logInfo(`Found move file: ${moveFilePath}`);

  // 2. Load state and move file
  logInfo('Loading game state and move file...');
  let state;
  let moveFile;

  try {
    state = loadState(tableName, basePath);
    const loaded = loadMoveFile(fullMoveFilePath);
    moveFile = loaded.moveFile;
  } catch (error) {
    // Handle missing or malformed files
    const handled = handleError(error);
    logError(`Failed to load files: ${handled.message}`);

    // Try to load state for error recording
    try {
      state = loadState(tableName, basePath);
      handleInvalidMove({
        moveFilePath: fullMoveFilePath,
        tableName,
        reason: handled.message,
        state,
        basePath
      });
    } catch (stateError) {
      // Can't even load state - just log and exit
      logError(`Cannot load state to record error: ${stateError.message}`);
    }

    return { success: false, error: handled };
  }

  // 3. Get actor from environment
  const actor = process.env.GITHUB_ACTOR;
  if (!actor) {
    logError('GITHUB_ACTOR environment variable not set');
    handleInvalidMove({
      moveFilePath: fullMoveFilePath,
      tableName,
      reason: 'Cannot determine commit author (GITHUB_ACTOR not set)',
      state,
      basePath
    });
    return { success: false, error: { message: 'GITHUB_ACTOR not set' } };
  }

  logInfo(`Processing move by: ${actor}`);

  // 4. Run validation pipeline
  logInfo('Validating move...');
  const validation = await runValidationPipeline({
    actor,
    state,
    moveFile,
    filename
  });

  if (!validation.valid) {
    // Move is invalid - reject it
    const reason = validation.errors.join('; ');
    logError(`Move validation failed: ${reason}`);

    handleInvalidMove({
      moveFilePath: fullMoveFilePath,
      tableName,
      reason,
      state,
      basePath
    });

    return { success: false, invalid: true, errors: validation.errors };
  }

  logInfo('Move validated successfully');

  // 5. Apply the moves to state
  logInfo('Applying moves to game state...');
  let newState = applyMoves(state, moveFile);

  // 6. Check for win
  const player = moveFile.player;
  const winResult = detectWin(newState, player);

  if (winResult.won) {
    logInfo(`Game over! ${player} wins!`);
    newState = winResult.state;
  } else {
    // 7. Roll dice for next turn (only if game not over)
    logInfo('Rolling dice for next turn...');
    const diceResult = rollDiceForNextTurn(newState);
    newState = mergeDiceResult(newState, diceResult);

    if (diceResult.autoPass) {
      logInfo(`Auto-pass: ${diceResult.activePlayer} has no legal moves`);
    }
  }

  // 8. Finalize state
  logInfo('Finalizing state...');
  const sequence = extractSequence(filename);
  newState = finalizeState(newState, {
    player,
    sequence,
    filename
  });

  // 9. Commit the valid move
  logInfo('Committing valid move...');
  commitValidMove({
    tableName,
    sequence,
    player,
    state: newState,
    basePath
  });

  logInfo('Move processed successfully');

  return { success: true, state: newState };
}

// Run when executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const wrappedRun = wrapWithErrorHandler(run);
  wrappedRun().then(result => {
    if (!result.success) {
      process.exitCode = 1;
    }
  });
}
