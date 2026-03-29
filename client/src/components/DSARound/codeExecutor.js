/**
 * codeExecutor.js
 *
 * Alternative code execution pipeline for the DSA Round.
 *
 * Differences from codeRunner.js:
 *  - Detects the user's function via a regex scan (useful when the function
 *    name might differ from problem.functionName as a fallback).
 *  - Uses the same data-driven checkEquality from codeRunner so both runners
 *    share identical comparison semantics.
 *  - Delegates all special-case comparison logic to the problem definition
 *    (orderInsensitive, normalizeResult) — no hard-coded per-problem branches.
 */

import { checkEquality } from "./codeRunner";

/**
 * Detect the first function name declared in a code string.
 * Handles `function foo(`, `const foo = (`, `const foo = function(`, arrow fns.
 *
 * @param {string} code
 * @returns {string|null}
 */
function detectFunctionName(code) {
  const patterns = [
    /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/,
    /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:function|\(|[a-zA-Z_$])/,
  ];

  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Execute user code against all test cases for a problem.
 *
 * Prefers `problem.functionName` for the call; falls back to auto-detection
 * if the declared name differs.
 *
 * @param {string} code
 * @param {Object} problem - problem definition from problems.js
 * @returns {{ results: Array, passed: number, total: number, error: string|null }}
 */
export function executeCode(code, problem) {
  // Determine which function name to call
  const preferredName = problem.functionName;
  const detectedName = detectFunctionName(code);
  const fnName = preferredName || detectedName;

  if (!fnName) {
    return {
      results: [],
      passed: 0,
      total: problem.testCases.length,
      error:
        "Could not detect a function in your code. Please define a function to solve the problem.",
    };
  }

  // Build the user function
  let userFn;
  try {
    // eslint-disable-next-line no-new-func
    userFn = new Function(
      `${code}; return typeof ${fnName} !== 'undefined' ? ${fnName} : undefined;`
    )();
  } catch (err) {
    return {
      results: [],
      passed: 0,
      total: problem.testCases.length,
      error: `Syntax error: ${err.message}`,
    };
  }

  if (typeof userFn !== "function") {
    return {
      results: [],
      passed: 0,
      total: problem.testCases.length,
      error: `Function "${fnName}" was not found after evaluation. Make sure it is declared at the top level.`,
    };
  }

  const results = [];

  for (let i = 0; i < problem.testCases.length; i++) {
    const { input, expected } = problem.testCases[i];
    let result;
    let caseError = null;

    try {
      result = userFn(...input);
    } catch (err) {
      caseError = err.message;
    }

    // Use the shared, data-driven equality checker — no per-problem branches here
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

  const passed = results.filter((r) => r.passed).length;

  return {
    results,
    passed,
    total: problem.testCases.length,
    error: null,
  };
}
