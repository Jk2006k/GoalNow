/**
 * Question Routes
 * API endpoints for fetching questions
 */

const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

/**
 * GET /api/questions/random
 * Get a random question
 * 
 * Query Parameters:
 * - difficulty: Filter by difficulty (easy, medium, hard)
 * - languages: ISO 639 language codes (optional)
 * 
 * Returns:
 * - Question object (without hiddenTestCases)
 * 
 * Example:
 * GET /api/questions/random?difficulty=easy
 */
router.get("/random", async (req, res) => {
  try {
    const { difficulty } = req.query;

    // Build filter
    let filter = {};
    if (difficulty) {
      if (!["easy", "medium", "hard"].includes(difficulty.toLowerCase())) {
        return res
          .status(400)
          .json({ error: "Invalid difficulty. Must be: easy, medium, or hard" });
      }
      filter.difficulty = difficulty.toLowerCase();
    }

    // Use MongoDB aggregation for efficient random selection
    const question = await Question.aggregate([
      { $match: filter },
      { $sample: { size: 1 } },
      {
        // Remove hiddenTestCases before sending to frontend
        $project: {
          title: 1,
          description: 1,
          difficulty: 1,
          functionName: 1,
          starterCode: 1,
          testCases: 1,
          tags: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (question.length === 0) {
      return res.status(404).json({ error: "No questions found" });
    }

    res.json({
      success: true,
      data: question[0],
    });
  } catch (error) {
    console.error("Error fetching random question:", error);
    res.status(500).json({
      error: "Failed to fetch question",
      details: error.message,
    });
  }
});

/**
 * GET /api/questions/all
 * Get multiple random questions
 * 
 * Query Parameters:
 * - count: Number of questions to return (default: 5, max: 20)
 * - difficulty: Filter by difficulty
 * 
 * Returns:
 * - Array of question objects (without hiddenTestCases)
 * 
 * Example:
 * GET /api/questions/all?count=10&difficulty=medium
 */
router.get("/all", async (req, res) => {
  try {
    let { count = 5, difficulty } = req.query;

    // Validate count
    count = parseInt(count);
    if (isNaN(count) || count < 1 || count > 20) {
      count = 5;
    }

    // Build filter
    let filter = {};
    if (difficulty) {
      if (!["easy", "medium", "hard"].includes(difficulty.toLowerCase())) {
        return res
          .status(400)
          .json({ error: "Invalid difficulty. Must be: easy, medium, or hard" });
      }
      filter.difficulty = difficulty.toLowerCase();
    }

    // Fetch random questions
    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: count } },
      {
        // Remove hiddenTestCases
        $project: {
          title: 1,
          description: 1,
          difficulty: 1,
          functionName: 1,
          starterCode: 1,
          testCases: 1,
          tags: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    res.json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      error: "Failed to fetch questions",
      details: error.message,
    });
  }
});

/**
 * GET /api/questions/:id
 * Get a specific question by ID
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the question
 * 
 * Returns:
 * - Question object (without hiddenTestCases)
 * 
 * Example:
 * GET /api/questions/507f1f77bcf86cd799439011
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid question ID format" });
    }

    const question = await Question.findById(id).select(
      "-hiddenTestCases"
    );

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({
      error: "Failed to fetch question",
      details: error.message,
    });
  }
});

/**
 * GET /api/questions/paginated
 * Get paginated list of questions with filters
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Questions per page (default: 10, max: 50)
 * - difficulty: Filter by difficulty
 * - tags: Filter by tags (comma-separated)
 * - search: Search in title/description
 * 
 * Returns:
 * - Paginated questions with metadata
 * 
 * Example:
 * GET /api/questions/paginated?page=2&limit=20&difficulty=easy
 */
router.get("/paginated/list", async (req, res) => {
  try {
    let { page = 1, limit = 10, difficulty, tags, search } = req.query;

    // Validate pagination
    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 50) limit = 10;

    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};

    if (difficulty) {
      if (!["easy", "medium", "hard"].includes(difficulty.toLowerCase())) {
        return res
          .status(400)
          .json({ error: "Invalid difficulty. Must be: easy, medium, or hard" });
      }
      filter.difficulty = difficulty.toLowerCase();
    }

    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      filter.tags = { $in: tagArray };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Get total count
    const total = await Question.countDocuments(filter);

    // Fetch paginated questions
    const questions = await Question.find(filter)
      .select("-hiddenTestCases")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: questions,
    });
  } catch (error) {
    console.error("Error fetching paginated questions:", error);
    res.status(500).json({
      error: "Failed to fetch questions",
      details: error.message,
    });
  }
});

/**
 * GET /api/questions/:id/with-hidden
 * Get question WITH hidden test cases (for backend evaluation only)
 * 
 * ⚠️ IMPORTANT: This should be protected by authentication middleware
 *              Only backend should call this endpoint
 * 
 * Returns:
 * - Complete question object including hiddenTestCases
 */
router.get("/:id/with-hidden", async (req, res) => {
  try {
    // TODO: Add authentication middleware here
    // Only backend evaluator should have access

    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid question ID format" });
    }

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json({
      success: true,
      data: question,
      warning: "This endpoint should only be accessible by backend evaluators",
    });
  } catch (error) {
    console.error("Error fetching question with hidden test cases:", error);
    res.status(500).json({
      error: "Failed to fetch question",
      details: error.message,
    });
  }
});

/**
 * POST /api/questions
 * Create a new question (admin only)
 * 
 * ⚠️ IMPORTANT: Should be protected by admin authentication middleware
 * 
 * Body:
 * - title: string
 * - description: string
 * - difficulty: easy|medium|hard
 * - functionName: string
 * - starterCode: { languageId: code }
 * - testCases: [{ input, output }]
 * - hiddenTestCases: [{ input, output }]
 * - tags: string[]
 */
router.post("/", async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const {
      title,
      description,
      difficulty,
      functionName,
      starterCode,
      testCases,
      hiddenTestCases,
      tags,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !difficulty ||
      !functionName ||
      !starterCode ||
      !testCases ||
      !hiddenTestCases
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        required: [
          "title",
          "description",
          "difficulty",
          "functionName",
          "starterCode",
          "testCases",
          "hiddenTestCases",
        ],
      });
    }

    const question = new Question({
      title,
      description,
      difficulty,
      functionName,
      starterCode,
      testCases,
      hiddenTestCases,
      tags: tags || [],
    });

    await question.save();

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: question,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({
      error: "Failed to create question",
      details: error.message,
    });
  }
});

module.exports = router;
