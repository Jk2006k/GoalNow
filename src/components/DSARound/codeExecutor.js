/**
 * Mock JavaScript code executor.
 * Extracts the user-defined function from the editor and runs it
 * against each test case using the problem's validator.
 */

/**
 * Attempts to extract a named function or arrow-function assigned to a var
 * from the user's code string, then calls it via the problem validator.
 *
 * @param {string} code       - Raw JS source written by the user
 * @param {object} problem    - Problem object (contains testCases + validator)
 * @returns {Array<{id, passed, input, expected, actual, error}>}
 */
export function runJavaScriptCode(code, problem) {
  return problem.testCases.map((tc, idx) => {
    try {
      // Build a sandboxed function from the user's code.
      // We wrap in an IIFE that returns the last declared function name.
      // eslint-disable-next-line no-new-func
      const factory = new Function(`
        ${code}
        // detect & return function reference
        const fnNames = Object.getOwnPropertyNames(this).filter(
          k => typeof this[k] === 'function'
        );
        // Try common function name patterns
        const candidates = [
          typeof twoSum !== 'undefined' && twoSum,
          typeof reverseString !== 'undefined' && reverseString,
          typeof isValid !== 'undefined' && isValid,
          typeof maxSubArray !== 'undefined' && maxSubArray,
        ].filter(Boolean);
        return candidates[0] || null;
      `);

      // Execute in an empty object context so "this" is a plain obj.
      const userFn = factory.call({});

      if (typeof userFn !== "function") {
        throw new Error(
          "Could not detect your function. Make sure it matches the starter code signature."
        );
      }

      const passed = problem.validator(userFn, tc.input);

      // Compute actual output for display
      let actual;
      try {
        actual = userFn(
          ...Object.values(tc.input).map((v) =>
            Array.isArray(v) ? [...v] : v
          )
        );
      } catch {
        actual = "Runtime Error";
      }

      return {
        id: idx + 1,
        passed,
        input: tc.input,
        expected: tc.expected,
        actual,
        error: null,
      };
    } catch (err) {
      return {
        id: idx + 1,
        passed: false,
        input: tc.input,
        expected: tc.expected,
        actual: null,
        error: err.message,
      };
    }
  });
}

/**
 * Mock Python executor — since we cannot run Python in the browser,
 * we parse the code lightly and return a "mock" result with a notice.
 */
export function runPythonCode(code, problem) {
  // Very basic syntax check: look for the def line
  const hasDef = /^\s*def\s+\w+\s*\(/.test(code);
  if (!hasDef) {
    return problem.testCases.map((tc, idx) => ({
      id: idx + 1,
      passed: false,
      input: tc.input,
      expected: tc.expected,
      actual: null,
      error: "No function definition found. Make sure your Python function is defined correctly.",
    }));
  }

  // Simulate: we can't truly execute Python here.
  // Return mock "pending" results to inform the user.
  return problem.testCases.map((tc, idx) => ({
    id: idx + 1,
    passed: null, // null = "mock / not executed"
    input: tc.input,
    expected: tc.expected,
    actual: "⚠ Python execution is simulated in the browser",
    error: null,
    mock: true,
  }));
}

export function runCode(language, code, problem) {
  if (language === "javascript") return runJavaScriptCode(code, problem);
  if (language === "python") return runPythonCode(code, problem);
  return [];
}
