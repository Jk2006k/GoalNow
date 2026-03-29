/**
 * Mock code executor for DSA round.
 * Safely evaluates JavaScript solutions against test cases using Function constructor.
 * Python execution is simulated (mock) since there's no Python runtime in the browser.
 */

/**
 * Deep equality check for comparing expected vs actual outputs
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

/**
 * Serialize a value to a display string
 */
function serialize(val) {
  if (val === undefined) return "undefined";
  if (val === null) return "null";
  return JSON.stringify(val);
}

/**
 * Execute JavaScript code against test cases
 */
function executeJavaScript(code, problem) {
  const results = [];

  for (const tc of problem.testCases) {
    const startTime = performance.now();
    try {
      // Build argument list from paramNames
      const args = problem.paramNames.map((p) =>
        JSON.parse(JSON.stringify(tc.input[p]))
      );

      // Wrap code + call in an IIFE executed via Function
      const wrappedCode = `
        "use strict";
        ${code}
        return ${problem.functionName}(${args
        .map((_, i) => `__args__[${i}]`)
        .join(", ")});
      `;

      // eslint-disable-next-line no-new-func
      const fn = new Function("__args__", wrappedCode);
      const output = fn(args);
      const elapsed = (performance.now() - startTime).toFixed(2);

      const passed = deepEqual(output, tc.expected);
      results.push({
        passed,
        input: problem.paramNames
          .map((p) => `${p} = ${serialize(tc.input[p])}`)
          .join(", "),
        expected: serialize(tc.expected),
        output: serialize(output),
        runtime: `${elapsed} ms`,
        error: null,
      });
    } catch (err) {
      const elapsed = (performance.now() - startTime).toFixed(2);
      results.push({
        passed: false,
        input: problem.paramNames
          .map((p) => `${p} = ${serialize(tc.input[p])}`)
          .join(", "),
        expected: serialize(tc.expected),
        output: "Error",
        runtime: `${elapsed} ms`,
        error: err.message,
      });
    }
  }

  return results;
}

/**
 * Mock Python executor — returns simulated results with a note
 */
function executePython(code, problem) {
  return problem.testCases.map((tc) => ({
    passed: null, // null = simulated / unknown
    input: problem.paramNames
      .map((p) => `${p} = ${serialize(tc.input[p])}`)
      .join(", "),
    expected: serialize(tc.expected),
    output: "⚠ Python execution is simulated in the browser",
    runtime: "N/A",
    error: null,
    simulated: true,
  }));
}

/**
 * Main executor entry point
 */
export function executeCode(code, language, problem) {
  if (!code || !code.trim()) {
    return problem.testCases.map((tc) => ({
      passed: false,
      input: problem.paramNames
        .map((p) => `${p} = ${serialize(tc.input[p])}`)
        .join(", "),
      expected: serialize(tc.expected),
      output: "No code provided",
      runtime: "0 ms",
      error: "Please write your solution before running.",
    }));
  }

  if (language === "javascript") {
    return executeJavaScript(code, problem);
  } else if (language === "python") {
    return executePython(code, problem);
  }

  return [];
}
