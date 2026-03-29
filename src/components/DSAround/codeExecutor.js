/**
 * Mock code executor that runs JavaScript user code against test cases.
 * For Python, we perform a simulated syntax check and mock run.
 */

/**
 * Safely execute JavaScript code against a test case.
 * Extracts the function from user code and calls it with test inputs.
 */
function executeJavaScript(code, testCase, problem) {
  try {
    // Build a sandboxed function from user code
    // We wrap in an IIFE and extract the last declared function
    const wrappedCode = `
      ${code}
      return (function() {
        ${buildCallExpression(problem, testCase)}
      })();
    `;

    // eslint-disable-next-line no-new-func
    const fn = new Function(wrappedCode);
    const result = fn();
    return { success: true, result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Build the function call expression based on problem + test case input keys.
 */
function buildCallExpression(problem, testCase) {
  const { input } = testCase;
  const keys = Object.keys(input);

  // Map problem ID to function name
  const fnMap = {
    1: "twoSum",
    2: "isValid",
    3: "reverseList",
    4: "maxSubArray",
    5: "search",
  };

  const fnName = fnMap[problem.id] || "solve";
  const args = keys.map((k) => JSON.stringify(input[k])).join(", ");
  return `return ${fnName}(${args});`;
}

/**
 * Deep equality check for comparing results with expected values.
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === "object" && a !== null && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

/**
 * Normalize output — sort arrays where order doesn't matter (Two Sum).
 */
function normalize(value, problemId) {
  // For Two Sum, the order of indices in result doesn't matter
  if (problemId === 1 && Array.isArray(value)) {
    return [...value].sort((a, b) => a - b);
  }
  return value;
}

/**
 * Format a value for display in the output panel.
 */
export function formatOutput(value) {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  return JSON.stringify(value);
}

/**
 * Run all test cases for a given problem and language.
 * Returns an array of result objects.
 */
export function runTestCases(code, problem, language) {
  if (!code || !code.trim()) {
    return problem.testCases.map((tc) => ({
      id: tc.id,
      status: "error",
      input: tc.inputDisplay,
      expected: tc.expectedDisplay,
      actual: "",
      error: "No code provided.",
      runtime: 0,
    }));
  }

  return problem.testCases.map((tc) => {
    const start = performance.now();

    let execResult;
    if (language === "javascript") {
      execResult = executeJavaScript(code, tc, problem);
    } else {
      // Python mock: detect obvious issues then "pass" all tests
      execResult = mockPythonExecution(code, tc);
    }

    const runtime = Math.round(performance.now() - start);

    if (!execResult.success) {
      return {
        id: tc.id,
        status: "error",
        input: tc.inputDisplay,
        expected: tc.expectedDisplay,
        actual: "",
        error: execResult.error,
        runtime,
      };
    }

    const actual = execResult.result;
    const normalizedActual = normalize(actual, problem.id);
    const normalizedExpected = normalize(tc.expected, problem.id);
    const passed = deepEqual(normalizedActual, normalizedExpected);

    return {
      id: tc.id,
      status: passed ? "pass" : "fail",
      input: tc.inputDisplay,
      expected: tc.expectedDisplay,
      actual: formatOutput(actual),
      error: null,
      runtime,
    };
  });
}

/**
 * Python mock executor — checks for common syntax issues and simulates run.
 * Since we can't run Python in the browser natively, we do a best-effort mock.
 */
function mockPythonExecution(code, tc) {
  // Basic checks
  if (code.includes("pass") && !code.includes("return")) {
    return {
      success: false,
      error: "Function returns None (did you forget to add your logic?)",
    };
  }
  if (!code.includes("def ")) {
    return { success: false, error: "No function definition found." };
  }
  // Simulate a successful run with a placeholder
  return { success: true, result: "__python_mock__" };
}
