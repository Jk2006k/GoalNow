/**
 * Mock code execution engine.
 * Evaluates JavaScript solutions against predefined test cases.
 * Python support shows a friendly "not supported in browser" message.
 */

function deepEqual(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

function formatValue(v) {
  if (Array.isArray(v)) return `[${v.join(", ")}]`;
  if (typeof v === "string") return `"${v}"`;
  return String(v);
}

/**
 * Build a wrapper that injects the user's function and calls it with the
 * correct arguments based on the problem's test-case shape.
 */
function buildRunner(problemId, userCode) {
  // Map problem id → argument extractor
  const argExtractors = {
    1: (input) => [input.nums, input.target],
    2: (input) => [input.s],
    3: (input) => [input.head],
  };

  // Map problem id → function name
  const fnNames = {
    1: "twoSum",
    2: "isValid",
    3: "reverseList",
  };

  const extract = argExtractors[problemId];
  const fnName = fnNames[problemId];

  if (!extract || !fnName) {
    throw new Error("Unknown problem id");
  }

  return (testCase) => {
    const args = extract(testCase.input);
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      ...Object.keys({ userCode: 1 }),
      `${userCode}; return ${fnName};`
    )();
    return fn(...args);
  };
}

export function runCode(language, code, problem) {
  if (language === "python") {
    return problem.testCases.map((tc) => ({
      id: tc.id,
      label: tc.label,
      status: "skipped",
      message:
        "Python execution is not supported in the browser. Switch to JavaScript to run tests.",
      input: JSON.stringify(tc.input),
      expected: formatValue(tc.expected),
      actual: "N/A",
      runtime: 0,
    }));
  }

  // --- JavaScript execution ---
  let runner;
  try {
    runner = buildRunner(problem.id, code);
  } catch (err) {
    return problem.testCases.map((tc) => ({
      id: tc.id,
      label: tc.label,
      status: "error",
      message: `Compilation error: ${err.message}`,
      input: JSON.stringify(tc.input),
      expected: formatValue(tc.expected),
      actual: "—",
      runtime: 0,
    }));
  }

  return problem.testCases.map((tc) => {
    const start = performance.now();
    try {
      const result = runner(tc);
      const elapsed = +(performance.now() - start).toFixed(2);
      const passed = deepEqual(result, tc.expected);
      return {
        id: tc.id,
        label: tc.label,
        status: passed ? "pass" : "fail",
        message: passed ? "Accepted" : "Wrong Answer",
        input: JSON.stringify(tc.input),
        expected: formatValue(tc.expected),
        actual: formatValue(result),
        runtime: elapsed,
      };
    } catch (err) {
      const elapsed = +(performance.now() - start).toFixed(2);
      return {
        id: tc.id,
        label: tc.label,
        status: "error",
        message: `Runtime error: ${err.message}`,
        input: JSON.stringify(tc.input),
        expected: formatValue(tc.expected),
        actual: "—",
        runtime: elapsed,
      };
    }
  });
}
