/**
 * Test Case Evaluation Engine
 * Executes user code against test cases and compares outputs
 * Similar to LeetCode evaluation system
 * 
 * IMPORTANT: Hidden test cases MUST NEVER be exposed to frontend
 */

const axios = require("axios");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const Question = require("../models/Question");

// Judge0 API Configuration
const JUDGE0_HOST = process.env.JUDGE0_HOST || "http://127.0.0.1:2358";
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "http://localhost:2358/api";
const USE_CLOUD_JUDGE0 = process.env.USE_CLOUD_JUDGE0 === "true";
const JUDGE0_RAPID_KEY = process.env.JUDGE0_RAPID_KEY;
const JUDGE0_RAPID_HOST = "https://judge0-ce.p.rapidapi.com";
const USE_LOCAL_EXECUTOR = process.env.USE_LOCAL_EXECUTOR !== "false";
const JUDGE0_TIMEOUT_MS = 5000; // 5 seconds per submission

/**
 * Language ID mapping
 * 71 = Python, 63 = JavaScript, 62 = Java, 54 = C++
 */
const LANGUAGE_IDS = {
  python: "71",
  javascript: "63",
  java: "62",
  cpp: "54",
  c: "50"
};

// ==================== OUTPUT NORMALIZATION ====================

/**
 * Normalize output for comparison
 * Handles:
 * - "[0, 1]" vs "0\n1" vs "(0, 1)" vs "0 1" → all become "0 1"
 * - Removes brackets, parentheses, commas
 * - Collapses multiple spaces/newlines
 * - Converts "True"/"False" to "true"/"false" for case-insensitive comparison
 */
function normalizeOutput(output) {
  if (!output) return "";

  let normalized = output
    .trim() // Remove leading/trailing whitespace
    .replace(/[\[\]()]/g, "") // Remove brackets and parentheses
    .replace(/,/g, " ") // Replace commas with spaces
    .replace(/\r\n/g, " ") // Replace Windows newlines
    .replace(/\n/g, " ") // Replace Unix newlines
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .toLowerCase() // Convert to lowercase for case-insensitive comparison (True->true, False->false)
    .trim();

  return normalized;
}

/**
 * Deep normalization for array-like outputs
 * Splits by whitespace and rejoins to handle various formats
 */
function deepNormalizeOutput(output) {
  const normalized = normalizeOutput(output);
  const tokens = normalized
    .split(/\s+/)
    .filter((token) => token.length > 0)
    .join(" ");

  return tokens;
}

/**
 * Compare two outputs with normalization
 */
function compareOutputs(expected, actual) {
  const normalizedExpected = deepNormalizeOutput(expected);
  const normalizedActual = deepNormalizeOutput(actual);

  return {
    passed: normalizedActual === normalizedExpected,
    normalizedExpected: normalizedExpected,
    normalizedActual: normalizedActual,
    raw: {
      expected: expected,
      actual: actual
    }
  };
}

// ==================== CODE EXECUTION ====================

/**
 * Wrap user code with test case injection
 * Dynamically injects test inputs and captures output
 * 
 * Handles three input types:
 * 1. Object/Dictionary: Extract values in order (don't use **kwargs to avoid parameter name mismatches)
 * 2. Array: Use unpacking (*args for Python, ...spread for JS)
 * 3. Scalar: Pass directly
 */
function wrapCodeForExecution(userCode, languageId, testCaseData) {
  const input = testCaseData.input;

  if (languageId === LANGUAGE_IDS.python || languageId === "71") {
    // Python: Convert input to function arguments (positional, not keyword)
    if (typeof input === "object" && input !== null && !Array.isArray(input)) {
      // Input is a dictionary - extract values in order to pass as positional args
      // This avoids the "unexpected keyword argument" error
      const values = Object.values(input).map(v => JSON.stringify(v)).join(", ");
      return `${userCode}

# Test case injection
test_input = ${JSON.stringify(input)}
result = solution(${values})
if isinstance(result, (list, tuple)):
    print(' '.join(str(x) for x in result))
else:
    print(result)`;
    } else if (Array.isArray(input)) {
      // Input is an array, use *unpacking
      return `${userCode}

# Test case injection
test_input = ${JSON.stringify(input)}
result = solution(*test_input)
if isinstance(result, (list, tuple)):
    print(' '.join(str(x) for x in result))
else:
    print(result)`;
    } else {
      // Scalar input
      return `${userCode}

# Test case injection
result = solution(${JSON.stringify(input)})
print(result)`;
    }
  } else if (languageId === LANGUAGE_IDS.javascript || languageId === "63") {
    // JavaScript: Convert input to function arguments (positional, not keyword)
    if (typeof input === "object" && input !== null && !Array.isArray(input)) {
      // Input is an object - extract values in order
      const values = Object.values(input).map(v => JSON.stringify(v)).join(", ");
      return `${userCode}

// Test case injection
const testInput = ${JSON.stringify(input)};
const result = solution(${values});
console.log(result);`;
    } else if (Array.isArray(input)) {
      // Input is an array
      return `${userCode}

// Test case injection
const testInput = ${JSON.stringify(input)};
const result = solution(...testInput);
console.log(result);`;
    } else {
      // Scalar input
      return `${userCode}

// Test case injection
const result = solution(${JSON.stringify(input)});
console.log(result);`;
    }
  }

  return userCode;
}

/**
 * Execute code locally using Node/Python with timeout
 */
const executeCodeLocally = async (code, languageId, maxTimeout = 5000) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "eval-"));

  try {
    const languageMap = {
      "71": { name: "python", ext: ".py", cmd: "python" },
      "63": { name: "javascript", ext: ".js", cmd: "node" }
    };

    const lang = languageMap[languageId];
    if (!lang) {
      throw new Error(`Unsupported language ID: ${languageId}`);
    }

    const filename = path.join(tmpDir, `solution${lang.ext}`);
    fs.writeFileSync(filename, code);

    return await executeWithTimeout(lang.cmd, filename, languageId, maxTimeout);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      console.error("Cleanup error:", e.message);
    }
  }
};

/**
 * Execute code with timeout protection and error handling
 */
const executeWithTimeout = (cmd, filename, languageId, maxTimeout) => {
  return new Promise((resolve, reject) => {
    let proc;
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      if (proc) {
        try {
          proc.kill("SIGKILL");
        } catch (e) {}
      }
      reject(new Error(`Timeout exceeded (${maxTimeout}ms)`));
    }, maxTimeout);

    try {
      proc = spawn(cmd, [filename]);

      proc.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        clearTimeout(timeout);

        if (timedOut) return;

        if (code !== 0 && stderr) {
          reject(new Error(`Runtime Error: ${stderr}`));
        } else {
          resolve({
            status: { id: 3, description: "Accepted" },
            stdout: stdout,
            stderr: stderr
          });
        }
      });

      proc.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      proc.stdin.end();
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });
};

/**
 * Execute code via Judge0 (local or cloud)
 */
const executeCodeViaJudge0 = async (code, languageId) => {
  try {
    if (USE_CLOUD_JUDGE0 && JUDGE0_RAPID_KEY) {
      const response = await axios.post(
        `${JUDGE0_RAPID_HOST}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: code,
          language_id: parseInt(languageId),
          stdin: ""
        },
        {
          headers: {
            "X-RapidAPI-Key": JUDGE0_RAPID_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );
      return response.data;
    } else {
      const response = await axios.post(
        `${JUDGE0_HOST}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: code,
          language_id: parseInt(languageId),
          stdin: ""
        },
        { timeout: 30000 }
      );
      return response.data;
    }
  } catch (error) {
    console.error("Judge0 error:", error.message);
    throw error;
  }
};

// ==================== MAIN EVALUATION ENGINE ====================

/**
 * Evaluate user code against all test cases (public + hidden)
 *
 * @param {string} questionId - MongoDB ObjectId of the question
 * @param {string} userCode - User's submitted code
 * @param {string} languageId - Judge0 language ID (e.g., "71" for Python)
 * @param {boolean} includeHidden - Whether to include hidden test cases (default: true)
 * @returns {Promise<EvaluationResult>}
 */
const evaluateSubmission = async (questionId, userCode, languageId, includeHidden = true) => {
  console.log(`\n🚀 Starting evaluation for question ${questionId}`);

  // Fetch question with all test cases
  let question;
  try {
    question = await Question.findById(questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }
  } catch (error) {
    throw new Error(`Failed to fetch question: ${error.message}`);
  }

  // Validate language
  if (!["71", "63", "62", "54"].includes(String(languageId))) {
    throw new Error(`Unsupported language ID: ${languageId}`);
  }

  // Combine public and hidden test cases
  const allTestCases = [...question.testCases];
  if (includeHidden && question.hiddenTestCases) {
    allTestCases.push(...question.hiddenTestCases);
  }

  console.log(`📋 Total test cases: ${allTestCases.length} (Public: ${question.testCases.length}, Hidden: ${includeHidden ? question.hiddenTestCases.length : 0})`);

  const results = [];
  let hasCompilationError = false;
  let compilationErrorMsg = "";

  // Sequentially evaluate each test case
  for (let i = 0; i < allTestCases.length; i++) {
    const testCase = allTestCases[i];
    const isHiddenTestCase = i >= question.testCases.length;

    console.log(
      `\n[Test ${i + 1}/${allTestCases.length}] ${isHiddenTestCase ? "[HIDDEN]" : "[PUBLIC]"} Evaluating with input:`,
      JSON.stringify(testCase.input)
    );

    try {
      // Wrap code with test case
      const wrappedCode = wrapCodeForExecution(userCode, languageId, testCase);

      // Execute code
      let executionResult;
      if (USE_LOCAL_EXECUTOR && ["71", "63"].includes(String(languageId))) {
        executionResult = await executeCodeLocally(wrappedCode, languageId);
      } else {
        executionResult = await executeCodeViaJudge0(wrappedCode, languageId);
      }

      // Check for compilation errors
      if (
        executionResult.status?.id === 5 ||
        executionResult.compile_output ||
        (executionResult.stderr && executionResult.stderr.includes("SyntaxError"))
      ) {
        hasCompilationError = true;
        compilationErrorMsg = executionResult.compile_output || executionResult.stderr || "Compilation error";

        console.error(`❌ Compilation Error:`, compilationErrorMsg);

        results.push({
          input: JSON.stringify(testCase.input),
          expected: testCase.output,
          actual: "",
          passed: false,
          error: compilationErrorMsg,
          isHidden: isHiddenTestCase
        });

        // Stop on first compilation error
        break;
      }

      // Check for runtime errors
      if (executionResult.stderr && executionResult.status?.id !== 3) {
        const errorMsg = executionResult.stderr;
        console.error(`❌ Runtime Error:`, errorMsg);

        results.push({
          input: JSON.stringify(testCase.input),
          expected: testCase.output,
          actual: "",
          passed: false,
          error: errorMsg,
          isHidden: isHiddenTestCase
        });

        continue;
      }

      // Compare outputs
      const actualOutput = executionResult.stdout || "";
      const expectedOutput = testCase.output || "";
      const comparison = compareOutputs(expectedOutput, actualOutput);

      console.log(`Expected: "${expectedOutput}"`);
      console.log(`Actual:   "${actualOutput}"`);
      console.log(`Result:   ${comparison.passed ? "✅ PASS" : "❌ FAIL"}`);

      results.push({
        input: JSON.stringify(testCase.input),
        expected: comparison.normalizedExpected,
        actual: comparison.normalizedActual,
        passed: comparison.passed,
        isHidden: isHiddenTestCase
      });
    } catch (error) {
      console.error(`❌ Execution Error:`, error.message);

      // Check if it's a timeout
      const isTimeout = error.message.includes("Timeout");

      results.push({
        input: JSON.stringify(testCase.input),
        expected: testCase.output,
        actual: "",
        passed: false,
        error: error.message,
        isTimeout: isTimeout,
        isHidden: isHiddenTestCase
      });
    }
  }

  // Separate public and hidden results
  const publicResults = results.filter((r) => !r.isHidden);
  const hiddenResults = results.filter((r) => r.isHidden);

  const publicPassed = publicResults.filter((r) => r.passed).length;
  const hiddenPassed = hiddenResults.filter((r) => r.passed).length;

  const totalPublic = publicResults.length;
  const totalHidden = hiddenResults.length;

  console.log(`\n📊 Evaluation Summary:`);
  console.log(`   Public Tests:  ${publicPassed}/${totalPublic} passed`);
  if (includeHidden) {
    console.log(`   Hidden Tests:  ${hiddenPassed}/${totalHidden} passed`);
  }
  console.log(`   Compilation:   ${hasCompilationError ? "❌ Error" : "✅ OK"}`);

  // Build response - DO NOT expose hidden test case details to frontend
  const response = {
    success: !hasCompilationError && publicPassed === totalPublic,
    questionId: questionId,
    language: languageId,
    compilation: {
      success: !hasCompilationError,
      error: compilationErrorMsg || null
    },
    publicTests: {
      total: totalPublic,
      passed: publicPassed,
      failed: totalPublic - publicPassed,
      results: publicResults.map(r => ({
        input: r.input,
        expected: r.expected,
        actual: r.actual,
        passed: r.passed,
        error: r.error || null
      }))
    },
    hiddenTests: includeHidden
      ? {
          total: totalHidden,
          passed: hiddenPassed,
          failed: totalHidden - hiddenPassed
          // DO NOT include detailed results for hidden tests
        }
      : null,
    timestamp: new Date()
  };

  return response;
};

/**
 * Get evaluation statistics without exposing test cases
 */
const getEvaluationStats = async (questionId) => {
  try {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    return {
      questionId,
      publicTestCases: question.testCases.length,
      hiddenTestCases: question.hiddenTestCases.length,
      functionName: question.functionName
    };
  } catch (error) {
    throw new Error(`Failed to get stats: ${error.message}`);
  }
};

/**
 * Legacy function for backward compatibility
 * Evaluates all test cases (public + hidden) for a question object
 * Used by quick test endpoint
 */
const evaluateAllTestCases = async (userCode, question, languageId) => {
  console.log("📊 Starting evaluation for question:", question._id);
  console.log("Language ID:", languageId);
  console.log(
    "Total test cases (public + hidden):",
    question.testCases.length + question.hiddenTestCases.length
  );

  const allTestCases = [...question.testCases, ...question.hiddenTestCases];
  const results = [];
  let passedCount = 0;
  let hasCompilationError = false;
  let compilationErrorMsg = "";

  // Execute test cases sequentially
  for (let i = 0; i < allTestCases.length; i++) {
    const testCase = allTestCases[i];

    try {
      // Wrap code with test case
      const wrappedCode = wrapCodeForExecution(userCode, languageId, testCase);

      // Execute code
      let executionResult;
      if (USE_LOCAL_EXECUTOR && ["71", "63"].includes(String(languageId))) {
        executionResult = await executeCodeLocally(wrappedCode, languageId);
      } else {
        executionResult = await executeCodeViaJudge0(wrappedCode, languageId);
      }

      // Check for compilation errors
      if (
        executionResult.status?.id === 5 ||
        executionResult.compile_output ||
        (executionResult.stderr && executionResult.stderr.includes("SyntaxError"))
      ) {
        hasCompilationError = true;
        compilationErrorMsg = executionResult.compile_output || executionResult.stderr || "Compilation error";

        console.error(`❌ Compilation Error:`, compilationErrorMsg);

        results.push({
          input: testCase.input,
          expected: testCase.output,
          actual: "",
          passed: false,
          error: compilationErrorMsg
        });

        break; // Stop on first compilation error
      }

      // Check for runtime errors
      if (executionResult.stderr && executionResult.status?.id !== 3) {
        const errorMsg = executionResult.stderr;
        results.push({
          input: testCase.input,
          expected: testCase.output,
          actual: "",
          passed: false,
          error: errorMsg
        });
        continue;
      }

      // Compare outputs
      const actualOutput = executionResult.stdout || "";
      const expectedOutput = testCase.output || "";
      const comparison = compareOutputs(expectedOutput, actualOutput);

      results.push({
        input: testCase.input,
        expected: expectedOutput,
        actual: actualOutput,
        passed: comparison.passed,
        normalizedExpected: comparison.normalizedExpected,
        normalizedActual: comparison.normalizedActual
      });

      if (comparison.passed) {
        passedCount++;
      }
    } catch (error) {
      console.error(`❌ Execution Error:`, error.message);

      results.push({
        input: testCase.input,
        expected: testCase.output,
        actual: "",
        passed: false,
        error: error.message
      });
    }
  }

  return {
    total: allTestCases.length,
    passed: passedCount,
    results,
    summary: {
      passed: passedCount === allTestCases.length,
      acceptance: allTestCases.length > 0 ? ((passedCount / allTestCases.length) * 100).toFixed(1) + "%" : "0%"
    }
  };
};

module.exports = {
  evaluateSubmission,
  evaluateAllTestCases,
  getEvaluationStats,
  normalizeOutput,
  deepNormalizeOutput,
  compareOutputs,
  wrapCodeForExecution,
  executeCodeLocally,
  executeCodeViaJudge0,
  LANGUAGE_IDS
};

