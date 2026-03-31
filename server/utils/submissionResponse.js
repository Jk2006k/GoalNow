/**
 * Submission Response Builder
 * 
 * Safely constructs API responses for:
 * 1. "Run Code" endpoint - visible test cases only
 * 2. "Submit" endpoint - visible + hidden test case summary
 * 
 * Ensures hidden test case data (inputs, outputs) are NEVER leaked
 */

/**
 * Format response for "Run Code" (visible tests only)
 * Shows detailed results for debugging
 */
const formatRunCodeResponse = (evaluationResult) => {
  return {
    success: evaluationResult.success,
    compilation: evaluationResult.compilation,
    testResults: {
      passed: evaluationResult.publicTests.passed,
      failed: evaluationResult.publicTests.failed,
      total: evaluationResult.publicTests.total,
      details: evaluationResult.publicTests.results.map(result => ({
        input: result.input,
        expected: result.expected,
        actual: result.actual,
        passed: result.passed,
        error: result.error || null
      }))
    },
    message: evaluationResult.success
      ? `✅ All ${evaluationResult.publicTests.total} test cases passed!`
      : evaluationResult.compilation.success
      ? `❌ ${evaluationResult.publicTests.failed} of ${evaluationResult.publicTests.total} test cases failed`
      : "❌ Compilation error"
  };
};

/**
 * Format response for "Submit Solution" (visible + hidden tests)
 * NEVER exposes hidden test case details
 */
const formatSubmitResponse = (evaluationResult) => {
  const totalTests = evaluationResult.publicTests.total + (evaluationResult.hiddenTests?.total || 0);
  const totalPassed = evaluationResult.publicTests.passed + (evaluationResult.hiddenTests?.passed || 0);
  const allPass = evaluationResult.success && (evaluationResult.hiddenTests?.passed === evaluationResult.hiddenTests?.total);

  return {
    success: allPass,
    submission: {
      totalTests,
      passedTests: totalPassed,
      failedTests: totalTests - totalPassed,
      visiblePassed: evaluationResult.publicTests.passed,
      visibleTotal: evaluationResult.publicTests.total,
      hiddenPassed: evaluationResult.hiddenTests?.passed || 0,
      hiddenTotal: evaluationResult.hiddenTests?.total || 0
    },
    compilation: evaluationResult.compilation,
    // For debugging on visible test failures
    visibleTestDetails: !evaluationResult.success ? evaluationResult.publicTests.results.map(result => ({
      input: result.input,
      expected: result.expected,
      actual: result.actual,
      passed: result.passed,
      error: result.error || null
    })) : null,
    // NEVER include hidden test details - only summary
    message: buildSubmissionMessage(totalPassed, totalTests, evaluationResult)
  };
};

/**
 * Build user-friendly submission message
 */
const buildSubmissionMessage = (passedTests, totalTests, evaluationResult) => {
  if (!evaluationResult.compilation.success) {
    return `❌ Compilation Error - Please fix the syntax errors`;
  }

  if (passedTests === totalTests) {
    return `✅ Accepted! All ${totalTests} test cases passed (including ${evaluationResult.hiddenTests?.total || 0} hidden test cases)`;
  }

  if (evaluationResult.publicTests.passed < evaluationResult.publicTests.total) {
    return `❌ Failed - ${evaluationResult.publicTests.failed} visible test case(s) failed`;
  }

  if ((evaluationResult.hiddenTests?.passed || 0) < (evaluationResult.hiddenTests?.total || 0)) {
    const hiddenFailed = evaluationResult.hiddenTests.total - evaluationResult.hiddenTests.passed;
    return `❌ Failed - ${hiddenFailed} hidden test case(s) failed`;
  }

  return "❌ Submission Failed";
};

module.exports = {
  formatRunCodeResponse,
  formatSubmitResponse,
  buildSubmissionMessage
};
