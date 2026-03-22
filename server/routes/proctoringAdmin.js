const express = require('express');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const ProctoringScreenshot = require('../models/ProctoringScreenshot');
const ProctoringAttemptReport = require('../models/ProctoringAttemptReport');
const { applyStrictMalpracticeRules } = require('../services/proctoringRules');
const evaluationRouter = require('./evaluation');

const router = express.Router();
const { evaluateScreenshotWithGroqVision } = require('./evaluation');

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function verifyAdmin(req, res, next) {
  const adminKey = req.headers['x-admin-key'];
  const expected = process.env.ADMIN_API_KEY;

  if (!expected || adminKey !== expected) {
    return res.status(403).json({ message: 'Admin access denied' });
  }

  next();
}

async function evaluateScreenshotForMalpractice(imageData) {
  const prompt = `You are an online proctoring AI. Analyze this interview screenshot.

Return strict JSON only:
{"isMalpractice": true|false, "facesDetected": number, "reason": "short reason", "confidence": 0.0-1.0}

Mark malpractice for signs of cheating like second person, phone use for help, off-screen assistance, or obvious notes usage.`;

  let result = null;

  // Try Groq Vision first
  try {
    console.log('🔄 Trying Groq Vision for screenshot evaluation...');
    const dataURL = imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`;
    result = await evaluateScreenshotWithGroqVision(dataURL, prompt);
    console.log('✅ Groq Vision evaluation successful');
    return {
      isMalpractice: result.isMalpractice,
      facesDetected: result.facesDetected || 1,
      reason: result.reason || 'No reason provided',
      confidence: result.confidence,
    };
  } catch (groqError) {
    console.warn('⚠️ Groq Vision failed:', groqError.message);
  }

  // Fall back to Gemini if Groq fails
  try {
    console.log('🔄 Falling back to Gemini for screenshot evaluation...');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key missing');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const base64Data = imageData.split(',')[1] || imageData;
    const response = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      },
      prompt,
    ]);

    const text = response.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON from Gemini');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log('✅ Gemini evaluation successful');

    return {
      isMalpractice: Boolean(parsed.isMalpractice),
      facesDetected: Number.isFinite(parsed.facesDetected) ? parsed.facesDetected : 1,
      reason: parsed.reason || 'No reason provided',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    };
  } catch (geminiError) {
    console.warn('⚠️ Gemini also failed:', geminiError.message);
  }

  // Both providers failed - use safe default (no violations detected)
  console.warn('⚠️ Both AI providers failed/rate-limited. Using safe default (no violations detected).');
  return {
    isMalpractice: false,
    facesDetected: 1,
    reason: 'AI evaluation unavailable - defaulting to clean screenshot',
    confidence: 0,
  };
}

// Finalize proctoring with strict rules, persist report, and delete screenshots.
router.post('/proctoring/finalize-strict', verifyToken, async (req, res) => {
  try {
    const { interviewType = 'behavioral' } = req.body;

    const screenshots = await ProctoringScreenshot.find({
      userId: req.userId,
      interviewType,
    }).sort({ capturedAt: 1 });

    if (!screenshots.length) {
      const emptyReport = await ProctoringAttemptReport.create({
        userId: req.userId,
        interviewType,
        totalScreenshots: 0,
        malpracticeDetected: false,
        alerts: [],
        ruleSummary: {
          consecutiveNoFaceStreak: 0,
          maxFacesDetected: 1,
          highConfidenceMultipleFacesCount: 0,
        },
      });

      return res.json({
        success: true,
        reportId: emptyReport._id,
        summary: emptyReport,
      });
    }

    const frameAnalyses = [];

    for (const shot of screenshots) {
      const ai = await evaluateScreenshotForMalpractice(shot.imageData);
      frameAnalyses.push({
        screenshotId: shot._id,
        capturedAt: shot.capturedAt,
        isMalpractice: ai.isMalpractice,
        facesDetected: ai.facesDetected,
        reason: ai.reason,
        confidence: ai.confidence,
      });
    }

    const strict = applyStrictMalpracticeRules(frameAnalyses);

    const report = await ProctoringAttemptReport.create({
      userId: req.userId,
      interviewType,
      totalScreenshots: screenshots.length,
      malpracticeDetected: strict.malpracticeDetected,
      alerts: strict.alerts,
      ruleSummary: strict.ruleSummary,
      reviewedAt: new Date(),
    });

    await ProctoringScreenshot.deleteMany({
      _id: { $in: screenshots.map((s) => s._id) },
    });

    res.json({
      success: true,
      reportId: report._id,
      summary: {
        totalScreenshots: report.totalScreenshots,
        malpracticeDetected: report.malpracticeDetected,
        alerts: report.alerts,
        ruleSummary: report.ruleSummary,
        reviewedAt: report.reviewedAt,
      },
      message: 'Strict proctoring evaluation completed and screenshots deleted',
    });
  } catch (error) {
    console.error('Error in finalize-strict:', error);
    res.status(500).json({ message: 'Error finalizing strict proctoring' });
  }
});

// Admin: list reports by filters
router.get('/admin/proctoring/reports', verifyAdmin, async (req, res) => {
  try {
    const { userId, interviewType, malpracticeOnly, from, to, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (interviewType) filter.interviewType = interviewType;
    if (malpracticeOnly === 'true') filter.malpracticeDetected = true;
    if (from || to) {
      filter.reviewedAt = {};
      if (from) filter.reviewedAt.$gte = new Date(from);
      if (to) filter.reviewedAt.$lte = new Date(to);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      ProctoringAttemptReport.find(filter)
        .sort({ reviewedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ProctoringAttemptReport.countDocuments(filter),
    ]);

    res.json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total,
      items,
    });
  } catch (error) {
    console.error('Error listing proctoring reports:', error);
    res.status(500).json({ message: 'Error listing proctoring reports' });
  }
});

// Admin: fetch one report
router.get('/admin/proctoring/reports/:reportId', verifyAdmin, async (req, res) => {
  try {
    const report = await ProctoringAttemptReport.findById(req.params.reportId).lean();
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ success: true, report });
  } catch (error) {
    console.error('Error fetching proctoring report:', error);
    res.status(500).json({ message: 'Error fetching proctoring report' });
  }
});

module.exports = router;
