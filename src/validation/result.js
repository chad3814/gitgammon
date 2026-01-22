/**
 * Validation Result Factory Functions
 * @module validation/result
 */

/**
 * Create a valid result with no errors
 * @returns {import('./types.js').MoveValidationResult} Valid result
 */
export function createValidResult() {
  return {
    valid: true,
    errors: []
  };
}

/**
 * Create an invalid result with error messages
 * @param {string[]} errors - Array of error messages
 * @returns {import('./types.js').MoveValidationResult} Invalid result
 */
export function createInvalidResult(errors) {
  return {
    valid: false,
    errors: Array.isArray(errors) ? errors : [errors]
  };
}

/**
 * Create a valid result that includes hit information
 * @param {import('./types.js').HitInfo} hitInfo - Information about the blot hit
 * @returns {import('./types.js').MoveValidationResult} Valid result with hit info
 */
export function createResultWithHit(hitInfo) {
  return {
    valid: true,
    errors: [],
    hitInfo
  };
}

/**
 * Create a result with forced move information
 * @param {boolean} valid - Whether the validation passed
 * @param {string[]} errors - Error messages (empty if valid)
 * @param {import('./types.js').ForcedMoveInfo} forcedMoveInfo - Forced move analysis
 * @returns {import('./types.js').MoveValidationResult} Result with forced move info
 */
export function createResultWithForcedMoveInfo(valid, errors, forcedMoveInfo) {
  return {
    valid,
    errors: errors || [],
    forcedMoveInfo
  };
}

/**
 * Combine multiple validation results into a single result
 * - valid is true only if all results are valid
 * - errors are concatenated from all results
 * - hitInfo is preserved if present in any result
 * - forcedMoveInfo is preserved if present in any result
 * @param {import('./types.js').MoveValidationResult[]} results - Array of validation results
 * @returns {import('./types.js').MoveValidationResult} Combined result
 */
export function combineValidationResults(results) {
  if (!results || results.length === 0) {
    return createValidResult();
  }

  const allErrors = [];
  let hitInfo;
  let forcedMoveInfo;

  for (const result of results) {
    if (!result.valid) {
      allErrors.push(...result.errors);
    }
    if (result.hitInfo) {
      hitInfo = result.hitInfo;
    }
    if (result.forcedMoveInfo) {
      forcedMoveInfo = result.forcedMoveInfo;
    }
  }

  /** @type {import('./types.js').MoveValidationResult} */
  const combined = {
    valid: allErrors.length === 0,
    errors: allErrors
  };

  if (hitInfo) {
    combined.hitInfo = hitInfo;
  }

  if (forcedMoveInfo) {
    combined.forcedMoveInfo = forcedMoveInfo;
  }

  return combined;
}

/**
 * Add hit info to an existing result
 * @param {import('./types.js').MoveValidationResult} result - Existing result
 * @param {import('./types.js').HitInfo} hitInfo - Hit information to add
 * @returns {import('./types.js').MoveValidationResult} Result with hit info
 */
export function addHitInfo(result, hitInfo) {
  return {
    ...result,
    hitInfo
  };
}

/**
 * Add forced move info to an existing result
 * @param {import('./types.js').MoveValidationResult} result - Existing result
 * @param {import('./types.js').ForcedMoveInfo} forcedMoveInfo - Forced move information to add
 * @returns {import('./types.js').MoveValidationResult} Result with forced move info
 */
export function addForcedMoveInfo(result, forcedMoveInfo) {
  return {
    ...result,
    forcedMoveInfo
  };
}
