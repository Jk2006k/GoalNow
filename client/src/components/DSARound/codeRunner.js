/**
 * codeRunner.js
 *
 * Browser-side JavaScript code runner for the DSA Round.
 *
 * NOTE: This uses `new Function` which executes arbitrary user code.
 * It is intentionally sandboxed to the browser context only and should
 * NEVER be used server-side. There is no true sandbox here — treat this
 * as a learning/practice tool, not a security boundary.
 */

/**
 * Run user-submitted code against a problem's test cases.
 *
 * @param {string} code        - The user's source code (must define `functionName`).
 * @param {Object} problem     - A problem definition from problems.js.
 * @returns {{ results: Array, passed: number, total: number, error: string|null }}
 */
export function runCode(code, problem) {
  const results = [];
  let runtimeError = null;

  try {
    // Build a callable from the user's code.
    // We wrap in a block so multiple var declarations don't collide.
    // eslint-disable-next-line no-new-func
    const userFn = new Function(
      `${code}; return typeof ${problem.functionName} !== 'undefined' ? ${problem.functionName} : undefined;`
    )();

    if (typeof userFn !== "function") {
      return {
        results: [],
        passed: 0,
        total: problem.testCases.length,
        error: `Function "${problem.functionName}" was not found in your code. Make sure you define a function named exactly "${problem.functionName}".`,
      };
    }

    for (let i = 0; i < problem.testCases.length; i++) {
      const { input, expected } = problem.testCases[i];
      let result;
      let caseError = null;

      try {
        // Spread input array as individual arguments
        result = userFn(...input);
      } catch (err) {
        caseError = err.message;
      }

      const passed = caseError
        ? false
        : checkEquality(result, expected, problem);

      results.push({
        testCase: i + 1,
        input,
        expected,
        result: caseError ? null : result,
        passed,
        error: caseError,
      });
    }
  } catch (err) {
    runtimeError = err.message;
  }

  const passed = results.filter((r) => r.passed).length;

  return {
    results,
    passed,
    total: problem.testCases.length,
    error: runtimeError,
  };
}

/**
 * Deep equality check between a result and expected value.
 *
 * Comparison strategy is driven by the problem definition:
 *  - problem.normalizeResult(value) → custom normalization hook (highest priority)
 *  - problem.orderInsensitive === true → sort numeric arrays before comparing
 *  - Otherwise → JSON.stringify deep equality
 *
 * Adding a new problem that needs special comparison?  Add `orderInsensitive: true`
 * or a `normalizeResult` function to that problem's definition in problems.js —
 * no changes needed here.
 *
 * @param {*} result
 * @param {*} expected
 * @param {Object} problem - problem definition (may be undefined for standalone use)
 * @returns {boolean}
 */
export function checkEquality(result, expected, problem) {
  if (result === null || result === undefined) return false;

  const isArrayResult = Array.isArray(result);
  const isArrayExpected = Array.isArray(expected);

  // Allow problems to provide a custom normalization/comparison hook
  if (problem && typeof problem.normalizeResult === "function") {
    const normalizedResult = problem.normalizeResult(result);
    const normalizedExpected = problem.normalizeResult(expected);
    return JSON.stringify(normalizedResult) === JSON.stringify(normalizedExpected);
  }

  // For problems where array order doesn't matter (data-driven via problem definition)
  if (
    problem &&
    problem.orderInsensitive &&
    isArrayResult &&
    isArrayExpected
  ) {
    if (result.length !== expected.length) return false;
    const sortedResult = [...result].sort((a, b) => a - b);
    const sortedExpected = [...expected].sort((a, b) => a - b);
    return JSON.stringify(sortedResult) === JSON.stringify(sortedExpected);
  }

  // Handle mismatched array/primitive types
  if (isArrayResult !== isArrayExpected) return false;

  // Arrays — deep equality (order-sensitive)
  if (isArrayResult && isArrayExpected) {
    return JSON.stringify(result) === JSON.stringify(expected);
  }

  // Primitives
  return result === expected;
}
