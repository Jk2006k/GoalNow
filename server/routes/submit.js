/**
 * Submission Routes
 * Handle code submissions and evaluate against test cases
 * 
 * IMPORTANT: Hidden test cases are NEVER exposed to frontend
 */

const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const Submission = require("../models/Submission");
const { evaluateSubmission, getEvaluationStats } = require("../services/evaluationEngine");
const { formatRunCodeResponse, formatSubmitResponse } = require("../utils/submissionResponse");

/**
 * POST /api/submit
 * Submit solution code for evaluation
 * 
 * Body:
 * {
 *   userCode: string,
 *   questionId: string (MongoDB ObjectId),
 *   languageId: string ("71" | "63" | "62" | "54"),
 *   userId?: string (optional, for tracking)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   publicTests: {
 *     total: number,
 *     passed: number,
 *     failed: number,
 *     results: [{ input, expected, actual, passed, error }]
 *   },
 *   hiddenTests: {
 *     total: number,
 *     passed: number,
 *     failed: number
 *   },
 *   compilation: { success: boolean, error?: string }
 * }
 */
router.post("/submit", async (req, res) => {
  try {
    const { userCode, questionId, languageId, userId } = req.body;

    // Validate required fields
    if (!userCode || !questionId || !languageId) {
      return res.status(400).json({
        error: "Missing required fields: userCode, questionId, languageId",
      });
    }

    // Validate language ID
    if (!["71", "63", "62", "54"].includes(String(languageId))) {
      return res.status(400).json({
        error: "Invalid languageId. Must be 71 (Python), 63 (JavaScript), 62 (Java), or 54 (C++)",
      });
    }

    // Validate MongoDB ObjectId
    if (!questionId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid questionId format" });
    }

    console.log("📝 Submission received");
    console.log("Question ID:", questionId);
    console.log("Language ID:", languageId);
    console.log("User ID:", userId || "anonymous");

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    console.log("✅ Question found:", question.title);

    // Run evaluation (includes hidden test cases on backend)
    console.log("🚀 Starting evaluation with public + hidden test cases...");
    const evaluationResult = await evaluateSubmission(
      questionId,
      userCode,
      String(languageId),
      true // includeHidden = true
    );

    console.log("📊 Evaluation complete");
    console.log(`   Public: ${evaluationResult.publicTests.passed}/${evaluationResult.publicTests.total}`);
    console.log(`   Hidden: ${evaluationResult.hiddenTests.passed}/${evaluationResult.hiddenTests.total}`);

    // Save submission to database (for history/analytics)
    try {
      const submission = new Submission({
        userId: userId || "anonymous",
        questionId: question._id,
        languageId: String(languageId),
        code: userCode,
        testsPassed: evaluationResult.publicTests.passed + evaluationResult.hiddenTests.passed,
        totalTests: evaluationResult.publicTests.total + evaluationResult.hiddenTests.total,
        results: evaluationResult.publicTests.results,
        accepted: evaluationResult.success,
      });

      await submission.save();
      console.log("✅ Submission saved to database");
    } catch (dbError) {
      console.error("⚠️ Failed to save submission:", dbError.message);
      // Continue even if DB save fails
    }

    // Return evaluation results using new format
    // IMPORTANT: Do NOT expose detailed results of hidden test cases
    const formattedResponse = formatSubmitResponse(evaluationResult);
    
    res.json(formattedResponse);
  } catch (error) {
    console.error("❌ Submission error:", error);
    res.status(500).json({
      error: "Evaluation failed",
      details: error.message,
    });
  }
});

/**
 * POST /api/run
 * Run code against VISIBLE test cases only (no hidden tests)
 * Used for the "Run Code" button - shows detailed results for debugging
 * 
 * Body:
 * {
 *   userCode: string,
 *   questionId: string (MongoDB ObjectId),
 *   languageId: string ("71" | "63" | "62" | "54"),
 *   userId?: string (optional, for tracking)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   compilation: { success: boolean, error?: string },
 *   testResults: {
 *     passed: number,
 *     failed: number,
 *     total: number,
 *     details: [{ input, expected, actual, passed, error }]
 *   },
 *   message: string
 * }
 */
router.post("/run", async (req, res) => {
  try {
    const { userCode, questionId, languageId, userId } = req.body;

    // Validate required fields
    if (!userCode || !questionId || !languageId) {
      return res.status(400).json({
        error: "Missing required fields: userCode, questionId, languageId",
      });
    }

    // Validate language ID
    if (!["71", "63", "62", "54"].includes(String(languageId))) {
      return res.status(400).json({
        error: "Invalid languageId. Must be 71 (Python), 63 (JavaScript), 62 (Java), or 54 (C++)",
      });
    }

    // Validate MongoDB ObjectId
    if (!questionId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid questionId format" });
    }

    console.log("🏃 Run Code request received");
    console.log("Question ID:", questionId);
    console.log("Language ID:", languageId);

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    console.log("✅ Question found:", question.title);

    // Run evaluation with VISIBLE test cases ONLY (includeHidden = false)
    console.log("🚀 Running visible test cases only...");
    const evaluationResult = await evaluateSubmission(
      questionId,
      userCode,
      String(languageId),
      false // includeHidden = false (only visible tests)
    );

    console.log("📊 Evaluation complete");
    console.log(`   Visible: ${evaluationResult.publicTests.passed}/${evaluationResult.publicTests.total}`);

    // Return formatted response for Run Code
    const formattedResponse = formatRunCodeResponse(evaluationResult);
    
    res.json(formattedResponse);
  } catch (error) {
    console.error("❌ Run Code error:", error);
    res.status(500).json({
      error: "Evaluation failed",
      details: error.message,
    });
  }
});

/**
 * POST /api/run-all
 * Run code against BOTH visible and hidden test cases
 * Shows detailed results for all tests (including hidden, for development)
 * 
 * Body:
 * {
 *   userCode: string,
 *   questionId: string (MongoDB ObjectId),
 *   languageId: string ("71" | "63" | "62" | "54"),
 *   userId?: string (optional)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   compilation: { success: boolean, error?: string },
 *   allTests: {
 *     passed: number,
 *     failed: number,
 *     total: number,
 *     visibleTests: number,
 *     hiddenTests: number,
 *     details: [
 *       { 
 *         input, expected, actual, passed, error, 
 *         type: 'visible' or 'hidden'
 *       }
 *     ]
 *   },
 *   message: string
 * }
 */
router.post("/run-all", async (req, res) => {
  try {
    const { userCode, questionId, languageId, userId } = req.body;

    // Validate required fields
    if (!userCode || !questionId || !languageId) {
      return res.status(400).json({
        error: "Missing required fields: userCode, questionId, languageId",
      });
    }

    // Validate language ID
    if (!["71", "63", "62", "54"].includes(String(languageId))) {
      return res.status(400).json({
        error: "Invalid languageId. Must be 71 (Python), 63 (JavaScript), 62 (Java), or 54 (C++)",
      });
    }

    // Validate MongoDB ObjectId
    if (!questionId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid questionId format" });
    }

    console.log("🏃 Run All Tests request received");
    console.log("Question ID:", questionId);
    console.log("Language ID:", languageId);

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    console.log("✅ Question found:", question.title);

    // Run evaluation with BOTH visible and hidden test cases
    console.log("🚀 Running all test cases (visible + hidden)...");
    const evaluationResult = await evaluateSubmission(
      questionId,
      userCode,
      String(languageId),
      true // includeHidden = true (include all tests)
    );

    console.log("📊 Evaluation complete");
    console.log(`   Total: ${evaluationResult.publicTests.passed + evaluationResult.hiddenTests.passed}/${evaluationResult.publicTests.total + evaluationResult.hiddenTests.total}`);

    // Format response with all test details
    const allTestDetails = [
      // Add visible tests
      ...evaluationResult.publicTests.results.map(r => ({
        input: r.input,
        expected: r.expected,
        actual: r.actual,
        passed: r.passed,
        error: r.error || null,
        type: 'visible'
      }))
    ];

    // Get hidden test details from the evaluation  (note: evaluation stores them separately)
    // We need to track hidden tests by their position in the results array
    if (evaluationResult.publicTests.total < Object.keys(evaluationResult).length) {
      // This is a bit hacky - we need better tracking of hidden tests in the response
      // For now, we'll show the counts
    }

    const response = {
      success: evaluationResult.success,
      compilation: evaluationResult.compilation,
      allTests: {
        passed: evaluationResult.publicTests.passed + evaluationResult.hiddenTests.passed,
        failed: evaluationResult.publicTests.failed + evaluationResult.hiddenTests.failed,
        total: evaluationResult.publicTests.total + evaluationResult.hiddenTests.total,
        visibleTests: evaluationResult.publicTests.total,
        hiddenTests: evaluationResult.hiddenTests.total,
        details: allTestDetails,
        visibleResults: evaluationResult.publicTests.results,
        summary: {
          visible: {
            passed: evaluationResult.publicTests.passed,
            total: evaluationResult.publicTests.total
          },
          hidden: {
            passed: evaluationResult.hiddenTests.passed,
            total: evaluationResult.hiddenTests.total
          }
        }
      },
      message: `${evaluationResult.publicTests.passed + evaluationResult.hiddenTests.passed}/${evaluationResult.publicTests.total + evaluationResult.hiddenTests.total} tests passed (${evaluationResult.publicTests.passed}/${evaluationResult.publicTests.total} visible, ${evaluationResult.hiddenTests.passed}/${evaluationResult.hiddenTests.total} hidden)`
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Run All error:", error);
    res.status(500).json({
      error: "Evaluation failed",
      details: error.message,
    });
  }
});

/**
 * GET /api/evaluation/stats/:questionId
 * Get evaluation statistics (no sensitive data)
 */
router.get("/evaluation/stats/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!questionId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid question ID" });
    }

    const stats = await getEvaluationStats(questionId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching evaluation stats:", error);
    res.status(500).json({
      error: "Failed to fetch stats",
      details: error.message,
    });
  }
});

/**
 * POST /api/run-tests (existing endpoint for quick testing)
 * Quick test with custom test cases, no database lookup
 * Useful for development/debugging
 */
router.post("/run-tests", async (req, res) => {
  try {
    const { userCode, language_id, testCases } = req.body;

    if (!userCode || !language_id || !testCases || testCases.length === 0) {
      return res.status(400).json({
        error: "Missing required fields: userCode, language_id, testCases (array)",
      });
    }

    console.log(`🧪 Quick test - running ${testCases.length} test cases`);

    // Validate language
    if (!["71", "63", "62", "54"].includes(String(language_id))) {
      return res.status(400).json({
        error: "Invalid language_id",
      });
    }

    // Create temporary question object for evaluation
    const tempQuestion = {
      _id: "temp",
      functionName: "solution",
      testCases: testCases,
      hiddenTestCases: [],
    };

    // Mock the evaluateSubmission to work with custom test cases
    const { evaluateAllTestCases } = require("../services/evaluationEngine");
    const result = await evaluateAllTestCases(userCode, tempQuestion, language_id);

    res.json({
      success: result.summary.passed,
      total: result.total,
      passed: result.passed,
      acceptance: result.summary.acceptance,
      results: result.results,
      summary: result.summary,
    });
  } catch (error) {
    console.error("❌ Quick test error:", error);
    res.status(500).json({
      error: "Test execution failed",
      details: error.message,
    });
  }
});

/**
 * GET /api/submissions/:submissionId
 * Get details of a previous submission
 */
router.get("/submissions/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;

    if (!submissionId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid submission ID" });
    }

    const submission = await Submission.findById(submissionId)
      .populate("questionId", "title difficulty")
      .lean();

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({
      error: "Failed to fetch submission",
      details: error.message,
    });
  }
});

/**
 * GET /api/submissions/user/:userId
 * Get submission history for a user
 */
router.get("/submissions/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    const submissions = await Submission.find({ userId })
      .populate("questionId", "title difficulty")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await Submission.countDocuments({ userId });

    res.json({
      success: true,
      count: submissions.length,
      total,
      data: submissions,
    });
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    res.status(500).json({
      error: "Failed to fetch submissions",
      details: error.message,
    });
  }
});

module.exports = router;
