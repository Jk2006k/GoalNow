/**
 * codeRunner.js
 *
 * Browser-side JavaScript code runner for the DSA Round feature.
 *
 * ⚠️  Security note: `new Function` executes arbitrary user-supplied code in the
 * browser context.  This is intentionally scoped to a sandboxed interview
 * environment where only the submitting user's own code runs.  Do NOT expose
 * this runner on a shared/multi-tenant server without a proper sandbox (e.g.
 * Web Workers, iframe sandbox, or a server-side isolate).
 */

/**
 * Extract the first `function` declaration name from a source string.
 * Returns null if no named function declaration is found.
 *
 * @param {string} code
 * @returns {string|null}
 */
function extractFunctionName(code) {
  const match = code.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
  return match ? match[1] : null;
}

/**
 * Run a single test case against user-supplied JavaScript code.
 *
 * @param {string}   code      - Raw JS source (must contain a named function declaration)
 * @param {Array}    inputArgs - Array of arguments spread into the function call
 * @param {*}        expected  - Expected return value
 * @param {Object}   problem   - The problem definition (used for comparison config)
 * @returns {{ passed: boolean, result: *, error: string|null }}
 */
function runTestCase(code, inputArgs, expected, problem) {
  try {
    const fnName = extractFunctionName(code);
    if (!fnName) {
      return {
        passed: false,
        result: undefined,
        error:
          "Could not detect a named function declaration. Make sure your solution defines a function (e.g. `function twoSum(...) { ... }`).",
      };
    }

    // Build an executable wrapper that returns the function's result.
    // The user's code is placed verbatim; we then call the extracted function.
    // eslint-disable-next-line no-new-func
    const executor = new Function(
      ...["__args__"],
      `
      ${code}
      return ${fnName}.apply(null, __args__);
    `
    );

    const result = executor(inputArgs);
    const passed = checkEquality(result, expected, problem);

    return { passed, result, error: null };
  } catch (err) {
    return {
      passed: false,
      result: undefined,
      error: err.message || String(err),
    };
  }
}

/**
 * Run all test cases for a problem against the user's code.
 *
 * @param {string} code     - User's JavaScript source code
 * @param {Object} problem  - Problem definition (must include `testCases`)
 * @returns {{
 *   totalTests:  number,
 *   passedTests: number,
 *   results: Array<{
 *     testIndex: number,
 *     input:     *,
 *     expected:  *,
 *     result:    *,
 *     passed:    boolean,
 *     error:     string|null
 *   }>
 * }}
 */
function runAllTests(code, problem) {
  const results = problem.testCases.map((tc, index) => {
    const { passed, result, error } = runTestCase(
      code,
      tc.input,
      tc.expected,
      problem
    );
    return {
      testIndex: index,
      input: tc.input,
      expected: tc.expected,
      result,
      passed,
      error,
    };
  });

  const passedTests = results.filter((r) => r.passed).length;

  return {
    totalTests: results.length,
    passedTests,
    results,
  };
}

/**
 * Compare a function's return value against the expected output.
 *
 * Comparison strategy is data-driven via problem definition fields:
 *   - `problem.normalizeResult(value)` — custom normalization applied to both
 *     sides before JSON.stringify comparison (highest priority).
 *   - `problem.orderInsensitive === true` — for array results where order
 *     doesn't matter (e.g. Two Sum returning indices in any order).
 *   - Default — deep structural equality via JSON.stringify.
 *
 * @param {*}       result   - Actual return value from user's function
 * @param {*}       expected - Expected value from test case
 * @param {Object}  problem  - Problem definition (may carry comparison config)
 * @returns {boolean}
 */
function checkEquality(result, expected, problem) {
  if (result === null || result === undefined) return false;

  const isArrayResult = Array.isArray(result);
  const isArrayExpected = Array.isArray(expected);

  // Allow problems to provide a custom normalization/comparison hook.
  // Both sides are normalized before comparison.
  if (problem && typeof problem.normalizeResult === "function") {
    const normalizedResult = problem.normalizeResult(result);
    const normalizedExpected = problem.normalizeResult(expected);
    return JSON.stringify(normalizedResult) === JSON.stringify(normalizedExpected);
  }

  // For problems where array element order doesn't matter (data-driven flag).
  if (
    problem &&
    problem.orderInsensitive &&
    isArrayResult &&
    isArrayExpected
  ) {
    if (result.length !== expected.length) return false;
    const sortedResult = [...result].sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    const sortedExpected = [...expected].sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    return JSON.stringify(sortedResult) === JSON.stringify(sortedExpected);
  }

  // Default: deep structural equality.
  return JSON.stringify(result) === JSON.stringify(expected);
}

export { runAllTests, runTestCase, checkEquality, extractFunctionName };
