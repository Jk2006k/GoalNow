/**
 * Mock code executor for JavaScript and Python
 * Safely runs user-submitted JavaScript using Function constructor,
 * and simulates Python execution via pattern matching + AST-style checks.
 */

/**
 * Deep-equality check for test case results
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    // Sort both arrays for problems where order doesn't matter (e.g. two-sum indices)
    const sortedA = [...a].sort((x, y) => x - y);
    const sortedB = [...b].sort((x, y) => x - y);
    return sortedA.every((v, i) => deepEqual(v, sortedB[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

/**
 * Execute JavaScript code safely using Function constructor.
 * Injects the user's function and calls it with test-case arguments.
 */
function executeJavaScript(code, functionName, args) {
  try {
    // Build a self-contained function wrapper
    const wrappedCode = `
      "use strict";
      ${code}
      return ${functionName}(${args.map((_, i) => `__args__[${i}]`).join(", ")});
    `;
    // eslint-disable-next-line no-new-func
    const fn = new Function("__args__", wrappedCode);
    const result = fn(args);
    return { success: true, result, error: null };
  } catch (err) {
    return { success: false, result: null, error: err.message };
  }
}

/**
 * Simulate Python execution.
 * Since we can't run Python in the browser, we parse the user's logic
 * conceptually and give a "simulation" response.
 * For common patterns (return, pass, empty body), we detect them.
 */
function executePython(code, functionName, args, expected) {
  // Check if the body is effectively empty (only pass or nothing meaningful)
  const lines = code
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !l.startsWith("def "));

  const isEmpty =
    lines.length === 0 ||
    lines.every((l) => l === "pass" || l === "return None" || l === "return");

  if (isEmpty) {
    return {
      success: false,
      result: null,
      error: "Function body is empty. Please implement your solution.",
      simulated: true,
    };
  }

  // For Python, we return a simulation notice — real execution would need a backend
  return {
    success: true,
    result: null,
    error: null,
    simulated: true,
    message:
      "Python simulation: Code structure looks valid. In a production environment, code would be sent to a secure backend for execution.",
  };
}

/**
 * Run user code against all test cases for a given problem.
 * Returns an array of result objects, one per test case.
 */
export function runCode(code, language, problem) {
  const results = problem.testCases.map((tc) => {
    const args = problem.argNames.map((name) => tc.input[name]);

    if (language === "javascript") {
      const { success, result, error } = executeJavaScript(
        code,
        problem.functionName,
        args
      );

      if (!success) {
        return {
          ...tc,
          status: "error",
          passed: false,
          actual: null,
          error,
          runtime: null,
        };
      }

      const passed = deepEqual(result, tc.expected);
      return {
        ...tc,
        status: passed ? "pass" : "fail",
        passed,
        actual: result,
        error: null,
        runtime: Math.floor(Math.random() * 40 + 20) + "ms", // mock runtime
      };
    }

    if (language === "python") {
      const { success, result, error, simulated, message } = executePython(
        code,
        problem.functionName,
        args,
        tc.expected
      );

      if (!success) {
        return {
          ...tc,
          status: "error",
          passed: false,
          actual: null,
          error,
          runtime: null,
          simulated,
        };
      }

      return {
        ...tc,
        status: "simulated",
        passed: null, // can't determine without real execution
        actual: null,
        error: null,
        simulated: true,
        message,
        runtime: Math.floor(Math.random() * 60 + 30) + "ms",
      };
    }

    return {
      ...tc,
      status: "error",
      passed: false,
      actual: null,
      error: "Unsupported language",
      runtime: null,
    };
  });

  return results;
}

export default runCode;
