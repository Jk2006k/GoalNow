/**
 * Mock code execution engine for JavaScript solutions.
 * Safely runs user-submitted code against predefined test cases.
 */

/**
 * Runs user JavaScript code against all test cases for a given problem.
 * @param {string} code - The user's JavaScript code
 * @param {object} problem - The problem definition with testCases
 * @returns {Array} Array of test result objects
 */
export function runJavaScriptCode(code, problem) {
  const results = [];

  for (let i = 0; i < problem.testCases.length; i++) {
    const tc = problem.testCases[i];
    const startTime = performance.now();

    try {
      // Build argument list from inputArgs definition
      const argNames = problem.inputArgs;
      const argValues = argNames.map((arg) => tc.input[arg]);

      // Create a sandboxed function wrapper
      const wrappedCode = `
        ${code}
        return ${problem.functionName}(${argNames.map((_, idx) => `__arg${idx}`).join(", ")});
      `;

      // eslint-disable-next-line no-new-func
      const fn = new Function(
        ...argNames.map((_, idx) => `__arg${idx}`),
        wrappedCode
      );

      // Deep clone inputs to prevent mutation side-effects
      const clonedArgs = argValues.map((v) => JSON.parse(JSON.stringify(v)));
      const result = fn(...clonedArgs);
      const elapsed = (performance.now() - startTime).toFixed(2);

      const pass = checkEquality(result, tc.expected, problem);

      results.push({
        id: i + 1,
        pass,
        input: formatInput(tc.input, problem.inputArgs),
        expected: JSON.stringify(tc.expected),
        received: JSON.stringify(result),
        runtime: `${elapsed} ms`,
        error: null,
      });
    } catch (err) {
      const elapsed = (performance.now() - startTime).toFixed(2);
      results.push({
        id: i + 1,
        pass: false,
        input: formatInput(tc.input, problem.inputArgs),
        expected: JSON.stringify(tc.expected),
        received: null,
        runtime: `${elapsed} ms`,
        error: err.message,
      });
    }
  }

  return results;
}

/**
 * Mock Python execution — returns simulated "not supported" results.
 * In production this would call a backend sandbox API.
 */
export function runPythonCode(code, problem) {
  return problem.testCases.map((tc, i) => ({
    id: i + 1,
    pass: false,
    input: formatInput(tc.input, problem.inputArgs),
    expected: JSON.stringify(tc.expected),
    received: null,
    runtime: "—",
    error:
      "Python execution requires a backend sandbox. Please switch to JavaScript for live testing.",
  }));
}

/**
 * Checks whether a result matches the expected value.
 * Handles arrays (order-insensitive for twoSum style), primitives, etc.
 */
function checkEquality(result, expected, problem) {
  if (result === null || result === undefined) return false;

  // For problems where array order doesn't matter (e.g. twoSum)
  if (
    Array.isArray(result) &&
    Array.isArray(expected) &&
    problem.id === 1 // twoSum — order independent
  ) {
    return (
      JSON.stringify([...result].sort((a, b) => a - b)) ===
      JSON.stringify([...expected].sort((a, b) => a - b))
    );
  }

  // General deep equality via JSON serialization
  return JSON.stringify(result) === JSON.stringify(expected);
}

/**
 * Formats the input object into a readable string for display.
 */
function formatInput(input, argNames) {
  return argNames
    .map((name) => `${name} = ${JSON.stringify(input[name])}`)
    .join(", ");
}
