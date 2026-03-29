/**
 * codeExecutor.js
 *
 * Alternative code executor for the DSA Round feature.
 *
 * Differences from codeRunner.js:
 *   - Detects the target function name from the problem's `starterCode`
 *     instead of scanning the user's submitted code.
 *   - Supports a per-problem `validator(result, expected)` function for
 *     fully custom comparison logic (optional; falls back to the same
 *     data-driven strategy used in codeRunner).
 *
 * ⚠️  Security note: see codeRunner.js for sandbox caveats.
 */

/**
 * Derive the expected function name from a problem's starter code.
 * Falls back to scanning the user-submitted code if the starter code has
 * no function declaration.
 *
 * @param {Object} problem  - Problem definition (must include `starterCode`)
 * @param {string} userCode - User-submitted code (fallback)
 * @returns {string|null}
 */
function resolveFunctionName(problem, userCode) {
  const scan = (src) => {
    const m = src.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
    return m ? m[1] : null;
  };
  return scan(problem.starterCode) || scan(userCode);
}

/**
 * Compare a result against an expected value.
 *
 * Priority order:
 *  1. `problem.validator(result, expected)` — fully custom comparison function
 *     defined on the problem object.
 *  2. `problem.normalizeResult(value)` — normalize both sides, then compare.
 *  3. `problem.orderInsensitive` — sort both arrays, then compare.
 *  4. JSON.stringify deep equality (default).
 *
 * @param {*}      result
 * @param {*}      expected
 * @param {Object} problem
 * @returns {boolean}
 */
function compareResult(result, expected, problem) {
  if (result === null || result === undefined) return false;

  // 1. Fully custom validator (takes precedence over everything else)
  if (problem && typeof problem.validator === "function") {
    return problem.validator(result, expected);
  }

  // 2. Custom normalization hook
  if (problem && typeof problem.normalizeResult === "function") {
    return (
      JSON.stringify(problem.normalizeResult(result)) ===
      JSON.stringify(problem.normalizeResult(expected))
    );
  }

  // 3. Order-insensitive array comparison
  if (
    problem &&
    problem.orderInsensitive &&
    Array.isArray(result) &&
    Array.isArray(expected)
  ) {
    if (result.length !== expected.length) return false;
    const sort = (arr) =>
      [...arr].sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });
    return JSON.stringify(sort(result)) === JSON.stringify(sort(expected));
  }

  // 4. Default deep equality
  return JSON.stringify(result) === JSON.stringify(expected);
}

/**
 * Execute user code against a single test case.
 *
 * @param {string} userCode  - User's JavaScript source
 * @param {Object} problem   - Problem definition
 * @param {Object} testCase  - { input: Array, expected: * }
 * @returns {{ passed: boolean, result: *, error: string|null }}
 */
function executeTestCase(userCode, problem, testCase) {
  try {
    const fnName = resolveFunctionName(problem, userCode);
    if (!fnName) {
      return {
        passed: false,
        result: undefined,
        error:
          "Could not detect a function name from the starter code or your submission. Make sure your solution defines a named function.",
      };
    }

    // eslint-disable-next-line no-new-func
    const executor = new Function(
      "__args__",
      `
      ${userCode}
      return ${fnName}.apply(null, __args__);
    `
    );

    const result = executor(testCase.input);
    const passed = compareResult(result, testCase.expected, problem);

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
 * Execute user code against every test case in a problem.
 *
 * @param {string} userCode - User's JavaScript source
 * @param {Object} problem  - Problem definition (must include `testCases`)
 * @returns {{
 *   totalTests:  number,
 *   passedTests: number,
 *   allPassed:   boolean,
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
function executeAllTests(userCode, problem) {
  const results = problem.testCases.map((tc, index) => {
    const { passed, result, error } = executeTestCase(userCode, problem, tc);
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
    allPassed: passedTests === results.length,
    results,
  };
}

export {
  executeAllTests,
  executeTestCase,
  compareResult,
  resolveFunctionName,
};
