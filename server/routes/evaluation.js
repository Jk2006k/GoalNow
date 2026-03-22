const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Evaluation = require('../models/Evaluation');
const ProctoringScreenshot = require('../models/ProctoringScreenshot');
const ProctoringVideo = require('../models/ProctoringVideo');

const PROCTORING_VIDEO_DIR = path.resolve(__dirname, '../uploads/proctoring');

// Middleware to verify token
const verifyToken = (req, res, next) => {
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
};

// Initialize OpenRouter API Key
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const GEMINI_MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
].filter(Boolean);
const GROK_MODEL = process.env.XAI_GROK_MODEL || 'grok-3-mini';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const GROQ_VISION_MODEL_CANDIDATES = [
  process.env.GROQ_VISION_MODEL,
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
].filter(Boolean);

const providerCooldown = {
  gemini: { until: 0, lastSkipLogAt: 0 },
  grok: { until: 0, lastSkipLogAt: 0 },
  groq: { until: 0, lastSkipLogAt: 0 },
};

const decommissionedModels = {
  groqVision: new Set(),
};

function parseRetryDelayMs(error) {
  const retryInfo = error?.response?.data?.error?.details?.find?.((d) => d?.['@type']?.includes('RetryInfo'));
  const retryDelay = retryInfo?.retryDelay;
  if (typeof retryDelay === 'string') {
    const seconds = Number(retryDelay.replace('s', ''));
    if (!Number.isNaN(seconds) && seconds > 0) return Math.ceil(seconds * 1000);
  }

  const msg = String(error?.message || '');
  const match = msg.match(/retry in\s+([\d.]+)s/i);
  if (match) {
    const seconds = Number(match[1]);
    if (!Number.isNaN(seconds) && seconds > 0) return Math.ceil(seconds * 1000);
  }

  return 60_000;
}

function isQuotaOrRateLimitError(error) {
  const status = error?.response?.status;
  const msg = String(error?.message || '').toLowerCase();
  const body = JSON.stringify(error?.response?.data || '').toLowerCase();
  return (
    status === 429 ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    body.includes('quota exceeded') ||
    body.includes('resource has been exhausted')
  );
}

function isModelDecommissionedError(error) {
  const code = String(error?.response?.data?.error?.code || '').toLowerCase();
  const msg = String(error?.response?.data?.error?.message || error?.message || '').toLowerCase();
  return code.includes('model_decommissioned') || msg.includes('decommissioned') || msg.includes('no longer supported');
}

function isProviderCoolingDown(provider) {
  return Date.now() < providerCooldown[provider].until;
}

function noteProviderQuotaCooldown(provider, error) {
  const ms = parseRetryDelayMs(error);
  providerCooldown[provider].until = Date.now() + ms;
}

function logProviderSkip(provider) {
  const slot = providerCooldown[provider];
  const now = Date.now();
  if (now - slot.lastSkipLogAt < 15_000) return;
  slot.lastSkipLogAt = now;
  const secondsLeft = Math.max(1, Math.ceil((slot.until - now) / 1000));
  console.warn(`⚠️ Skipping ${provider} calls during cooldown (${secondsLeft}s left)`);
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Submit transcribed answer for evaluation
router.post('/submit-answer', verifyToken, async (req, res) => {
  try {
    const { questionIndex, question, transcribedAnswer, interviewType } = req.body;

    if (!transcribedAnswer || !question) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create evaluation record
    const evaluation = new Evaluation({
      userId: req.userId,
      interviewType: interviewType || 'behavioral',
      questionIndex,
      question,
      transcribedAnswer,
      submittedAt: new Date(),
      proctoringStatus: (interviewType || 'behavioral') === 'behavioral' ? 'pending' : 'completed',
    });

    await evaluation.save();

    // Evaluate answer immediately
    evaluateAnswer(evaluation._id).catch(error => {
      console.error('Error evaluating answer:', error);
    });

    res.json({
      success: true,
      evaluationId: evaluation._id,
      message: 'Answer submitted. Evaluation in progress...'
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Error submitting answer' });
  }
});

// Store proctoring screenshot during interview
router.post('/proctoring/screenshot', verifyToken, async (req, res) => {
  try {
    const { interviewType = 'behavioral', imageData, capturedAt } = req.body;

    if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
      console.error('Invalid imageData received');
      return res.status(400).json({ message: 'Valid screenshot imageData is required' });
    }

    // Check data size - MongoDB has 16MB limit per document
    const sizeInMB = Buffer.byteLength(imageData) / (1024 * 1024);
    if (sizeInMB > 5) {
      console.warn(`Screenshot too large: ${sizeInMB.toFixed(2)}MB - compressing...`);
      // For now, just skip oversized images
      return res.json({
        success: true,
        screenshotId: null,
        message: 'Screenshot too large - skipped (size limit 5MB)',
      });
    }

    console.log(`Storing screenshot: ${sizeInMB.toFixed(2)}MB for user ${req.userId}`);

    const screenshot = await ProctoringScreenshot.create({
      userId: req.userId,
      interviewType,
      imageData,
      capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
    });

    console.log(`✅ Screenshot stored successfully: ${screenshot._id}`);

    // Evaluate screenshot immediately with Groq
    evaluateScreenshotAsync(imageData).catch(error => {
      console.error('Async screenshot evaluation error:', error.message);
    });

    res.json({
      success: true,
      screenshotId: screenshot._id,
      message: 'Screenshot stored successfully. Proctoring evaluation in progress...',
    });
  } catch (error) {
    console.error('Error storing proctoring screenshot:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Error storing screenshot', error: error.message });
  }
});

// Store full interview screen-recording video
router.post('/proctoring/video', verifyToken, async (req, res) => {
  try {
    const MAX_VIDEO_SIZE_MB = 120;

    const {
      interviewType = 'behavioral',
      videoData,
      mimeType = 'video/webm',
      startedAt,
      endedAt,
    } = req.body;

    if (!videoData || typeof videoData !== 'string' || !videoData.startsWith('data:video/')) {
      return res.status(400).json({ message: 'Valid videoData is required' });
    }

    const base64Data = videoData.split(',')[1];
    if (!base64Data) {
      return res.status(400).json({ message: 'Invalid video payload' });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const sizeInMB = buffer.length / (1024 * 1024);
    if (sizeInMB > MAX_VIDEO_SIZE_MB) {
      return res.status(413).json({
        message: `Video too large (${sizeInMB.toFixed(2)}MB). Max allowed is ${MAX_VIDEO_SIZE_MB}MB.`,
      });
    }

    await fs.promises.mkdir(PROCTORING_VIDEO_DIR, { recursive: true });

    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const filename = `${req.userId}_${interviewType}_${Date.now()}.${extension}`;
    const absoluteFilePath = path.join(PROCTORING_VIDEO_DIR, filename);
    const dbFilePath = path.posix.join('uploads/proctoring', filename);
    const publicPath = `/${dbFilePath}`;
    const fileUrl = `${req.protocol}://${req.get('host')}${publicPath}`;

    await fs.promises.writeFile(absoluteFilePath, buffer);

    const videoDoc = await ProctoringVideo.create({
      userId: req.userId,
      interviewType,
      filePath: dbFilePath,
      mimeType,
      fileSizeBytes: buffer.length,
      startedAt: startedAt ? new Date(startedAt) : null,
      endedAt: endedAt ? new Date(endedAt) : new Date(),
    });

    res.json({
      success: true,
      videoId: videoDoc._id,
      filePath: dbFilePath,
      fileUrl,
      message: 'Interview recording stored successfully',
    });
  } catch (error) {
    console.error('Error storing proctoring video:', error);
    res.status(500).json({ message: 'Error storing proctoring video' });
  }
});

// Get latest proctoring video URL for current user
router.get('/proctoring/video/latest', verifyToken, async (req, res) => {
  try {
    const { interviewType } = req.query;
    const filter = { userId: req.userId };
    if (interviewType) filter.interviewType = interviewType;

    const latestVideo = await ProctoringVideo.findOne(filter).sort({ createdAt: -1 });

    if (!latestVideo) {
      return res.status(404).json({ message: 'No proctoring videos found for this user.' });
    }

    const publicPath = `/${latestVideo.filePath.replace(/\\/g, '/')}`;
    const fileUrl = `${req.protocol}://${req.get('host')}${publicPath}`;

    res.json({
      success: true,
      video: {
        _id: latestVideo._id,
        interviewType: latestVideo.interviewType,
        filePath: latestVideo.filePath,
        fileUrl,
        mimeType: latestVideo.mimeType,
        fileSizeBytes: latestVideo.fileSizeBytes,
        createdAt: latestVideo.createdAt,
        startedAt: latestVideo.startedAt,
        endedAt: latestVideo.endedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching latest proctoring video:', error);
    res.status(500).json({ message: 'Error fetching latest proctoring video' });
  }
});

// List recent proctoring videos for current user
router.get('/proctoring/videos', verifyToken, async (req, res) => {
  try {
    const { interviewType } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const filter = { userId: req.userId };
    if (interviewType) filter.interviewType = interviewType;

    const videos = await ProctoringVideo.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const withUrls = videos.map((v) => {
      const publicPath = `/${String(v.filePath || '').replace(/\\/g, '/')}`;
      return {
        ...v,
        fileUrl: `${req.protocol}://${req.get('host')}${publicPath}`,
      };
    });

    res.json({ success: true, count: withUrls.length, videos: withUrls });
  } catch (error) {
    console.error('Error listing proctoring videos:', error);
    res.status(500).json({ message: 'Error listing proctoring videos' });
  }
});

// Evaluate all proctoring screenshots and keep them in MongoDB
router.post('/proctoring/finalize', verifyToken, async (req, res) => {
  try {
    const { interviewType = 'behavioral', evaluationIds = [] } = req.body;

    const screenshots = await ProctoringScreenshot.find({
      userId: req.userId,
      interviewType,
    }).sort({ capturedAt: 1 });

    const alerts = [];

    if (screenshots.length) {
      for (const shot of screenshots) {
        const aiResult = await evaluateScreenshotForMalpractice(shot.imageData);

        if (aiResult.isMalpractice) {
          alerts.push({
            screenshotId: shot._id,
            capturedAt: shot.capturedAt,
            verdict: 'malpractice',
            reason: aiResult.reason,
            confidence: aiResult.confidence,
          });
        }
      }
    }

    // Use stricter rules to avoid false positives from noisy AI outputs.
    const seriousReasonRegex = /phone|mobile|device|notes?|book|off-?screen|assistance|help/i;
    const multiFaceReasonRegex = /multiple\s*faces?|second\s*person/i;

    const seriousAlerts = alerts.filter((a) => {
      const confidence = typeof a.confidence === 'number' ? a.confidence : 0.5;
      const reason = String(a.reason || '');
      return confidence >= 0.85 && seriousReasonRegex.test(reason);
    });

    const multiFaceAlerts = alerts.filter((a) => {
      const confidence = typeof a.confidence === 'number' ? a.confidence : 0.5;
      const reason = String(a.reason || '');
      return confidence >= 0.97 && multiFaceReasonRegex.test(reason);
    });

    const distinctSeriousScreenshotIds = new Set(
      seriousAlerts
        .map((a) => String(a.screenshotId || '').trim())
        .filter(Boolean)
    );

    const distinctMultiFaceScreenshotIds = new Set(
      multiFaceAlerts
        .map((a) => String(a.screenshotId || '').trim())
        .filter(Boolean)
    );

    const triggerCount = seriousAlerts.length + multiFaceAlerts.length;
    // Note-only mode: keep trigger reasons for review, do not auto-assign red cards.
    const redCard = false;
    const normalizeReasonKey = (text) =>
      String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const selectedForReasons = [...seriousAlerts, ...multiFaceAlerts];
    const redCardReasons = Object.values(
      selectedForReasons.reduce((acc, a) => {
        const reason = String(a.reason || '').trim();
        if (!reason) return acc;
        const key = normalizeReasonKey(reason);
        if (!acc[key]) acc[key] = reason;
        return acc;
      }, {})
    ).slice(0, 5);

    const evalFilter = {
      userId: req.userId,
      interviewType,
      proctoringStatus: { $ne: 'completed' },
    };

    if (Array.isArray(evaluationIds) && evaluationIds.length) {
      evalFilter._id = { $in: evaluationIds };
    } else {
      evalFilter.submittedAt = { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) };
    }

    // Mark proctoring completion for all questions in this attempt,
    // and clear prior flags before applying attempt-level notes.
    await Evaluation.updateMany(evalFilter, {
      $set: {
        proctoringStatus: 'completed',
        proctoringReviewedAt: new Date(),
        proctoringTriggerCount: 0,
        redCard: false,
        redCardReasons: [],
      },
    });

    if (triggerCount > 0) {
      let targetEvaluationId = null;

      if (Array.isArray(evaluationIds) && evaluationIds.length) {
        // Apply the attempt-level red card to the latest question in this attempt.
        targetEvaluationId = evaluationIds[evaluationIds.length - 1];
      } else {
        const latestEval = await Evaluation.findOne({
          userId: req.userId,
          interviewType,
          submittedAt: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        }).sort({ submittedAt: -1 }).select('_id').lean();
        targetEvaluationId = latestEval?._id || null;
      }

      if (targetEvaluationId) {
        await Evaluation.updateOne(
          { _id: targetEvaluationId, userId: req.userId },
          {
            $set: {
              proctoringTriggerCount: triggerCount,
              redCard: triggerCount >= 2,
              redCardReasons: triggerCount >= 2 ? redCardReasons : [],
            },
          }
        );
      }
    }

    res.json({
      success: true,
      summary: {
        totalScreenshots: screenshots.length,
        malpracticeDetected: alerts.length > 0,
        alerts,
        triggerCount,
        redCard,
        redCardReasons,
      },
      message: 'Proctoring evaluation completed. Screenshots retained in MongoDB.',
    });
  } catch (error) {
    console.error('Error finalizing proctoring screenshots:', error);
    res.status(500).json({ message: 'Error finalizing proctoring' });
  }
});

// Get evaluation results
router.get('/results/:evaluationId', verifyToken, async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.evaluationId);

    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    if (evaluation.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const proctoringCompleted = evaluation.proctoringStatus === 'completed' || evaluation.interviewType === 'technical';
    const displayReady = evaluation.isEvaluated && proctoringCompleted;

    if (!displayReady) {
      let waitReason = 'AI answer evaluation is in progress.';
      if (evaluation.isEvaluated && !proctoringCompleted) {
        waitReason = 'Waiting for proctoring screenshot evaluation to finish.';
      }

      return res.json({
        success: true,
        isReady: false,
        waitReason,
        evaluation: null
      });
    }

    res.json({
      success: true,
      isReady: true,
      evaluation: {
        question: evaluation.question,
        transcribedAnswer: evaluation.transcribedAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        scores: evaluation.evaluationScores,
        evaluatedAt: evaluation.evaluatedAt,
        redCard: Boolean(evaluation.redCard),
        proctoringTriggerCount: evaluation.proctoringTriggerCount || 0,
        redCardReasons: evaluation.redCardReasons || [],
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Error fetching results' });
  }
});

// Cleanup: Remove proctoring flags from evaluations with < 2 triggers
router.post('/cleanup-old-proctoring-data', verifyToken, async (req, res) => {
  try {
    // Find evaluations with proctoringTriggerCount < 2 that have proctoring data
    const result = await Evaluation.updateMany(
      {
        userId: req.userId,
        $or: [
          { proctoringTriggerCount: { $lt: 2 } },
          { proctoringTriggerCount: { $exists: false } }
        ]
      },
      {
        $set: {
          proctoringTriggerCount: 0,
          redCard: false,
          redCardReasons: [],
          isProctoringEvaluated: true // Mark as evaluated but no violations
        }
      }
    );

    console.log(`✅ Cleaned up ${result.modifiedCount} old evaluations for user ${req.userId}`);

    res.json({
      success: true,
      message: `Cleaned up ${result.modifiedCount} old evaluations`,
      cleanedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error cleaning up proctoring data:', error);
    res.status(500).json({ message: 'Error cleaning up proctoring data' });
  }
});

// Get all user evaluations
router.get('/user-evaluations', verifyToken, async (req, res) => {
  try {
    // Auto-cleanup old proctoring data before fetching
    await Evaluation.updateMany(
      {
        userId: req.userId,
        $or: [
          { proctoringTriggerCount: { $lt: 2, $gt: 0 } },
          { 
            proctoringTriggerCount: 0, 
            redCardReasons: { $exists: true, $ne: [] }
          }
        ]
      },
      {
        $set: {
          proctoringTriggerCount: 0,
          redCard: false,
          redCardReasons: []
        }
      }
    ).catch(err => console.warn('⚠️ Auto-cleanup warning:', err.message));

    const evaluations = await Evaluation.find({ userId: req.userId }).sort({ submittedAt: -1 });

    const mapped = evaluations.map(e => {
      const proctoringCompleted = e.proctoringStatus === 'completed' || e.interviewType === 'technical';
      // For behavioral: both answer AND screenshot must be evaluated
      // For technical: only answer needs to be evaluated
      const displayScoreReady = e.interviewType === 'technical' 
        ? (e.isEvaluated && proctoringCompleted)
        : (e.isEvaluated && e.isProctoringEvaluated && proctoringCompleted);

      return {
        _id: e._id,
        question: e.question,
        score: displayScoreReady ? e.score : null,
        feedback: displayScoreReady ? e.feedback : null,
        isEvaluated: e.isEvaluated,
        isProctoringEvaluated: e.isProctoringEvaluated,
        proctoringStatus: proctoringCompleted ? 'completed' : 'pending',
        displayScoreReady,
        redCard: Boolean(e.redCard),
        proctoringTriggerCount: e.proctoringTriggerCount || 0,
        redCardReasons: e.redCardReasons || [],
        submittedAt: e.submittedAt,
        evaluatedAt: e.evaluatedAt
      }
    })

    res.json({
      success: true,
      evaluations: mapped
    });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ message: 'Error fetching evaluations' });
  }
});

// Function to evaluate answer using Claude/Copilot AI
async function evaluateAnswer(evaluationId) {
  try {
    const evaluation = await Evaluation.findById(evaluationId);

    if (!evaluation || evaluation.isEvaluated) {
      return;
    }

    const prompt = `You are an expert interviewer evaluating a behavioral interview answer. 

Question: ${evaluation.question}

Answer provided by candidate: "${evaluation.transcribedAnswer}"

Please evaluate this answer on the following criteria and provide scores from 0-100 for each:
1. Clarity: How clear and well-articulated is the answer?
2. Relevance: How relevant is the answer to the question asked?
3. Completeness: Does the answer cover all important aspects?
4. Professionalism: How professional and appropriate is the tone and language?

Also provide:
- Overall Score (0-100): Average of the above criteria
- Feedback: Constructive feedback on the answer (2-3 sentences)

Format your response as JSON only, nothing else:
{"clarity": <number>, "relevance": <number>, "completeness": <number>, "professionalism": <number>, "overallScore": <number>, "feedback": "<string>"}`;

    let evaluationResult = null;

    // Try Gemini AI first (most reliable with our key)
    try {
      console.log('🔄 Trying Gemini AI...');
      evaluationResult = await evaluateWithGemini(prompt);
      console.log('✅ Gemini evaluation successful');
    } catch (geminiError) {
      console.warn('⚠️ Gemini failed:', geminiError.message);
    }

    // If Gemini failed, try Groq Cloud
    if (!evaluationResult) {
      try {
        console.log('🔄 Trying Groq AI...');
        evaluationResult = await evaluateWithGroq(prompt);
        console.log('✅ Groq evaluation successful');
      } catch (groqError) {
        console.warn('⚠️ Groq failed:', groqError.message);
      }
    }

    // If Groq failed, try xAI Grok
    if (!evaluationResult) {
      try {
        console.log('🔄 Trying Grok AI...');
        evaluationResult = await evaluateWithGrok(prompt);
        console.log('✅ Grok evaluation successful');
      } catch (grokError) {
        console.warn('⚠️ Grok failed:', grokError.message);
      }
    }

    // If all AI services failed, use basic evaluation
    if (!evaluationResult) {
      console.log('🔄 AI services unavailable, using basic evaluation');
      evaluationResult = generateBasicEvaluation(evaluation.transcribedAnswer);
    }

    // Update evaluation with results
    evaluation.score = evaluationResult.overallScore;
    evaluation.feedback = evaluationResult.feedback;
    evaluation.evaluationScores = {
      clarity: evaluationResult.clarity,
      relevance: evaluationResult.relevance,
      completeness: evaluationResult.completeness,
      professionalism: evaluationResult.professionalism
    };
    evaluation.isEvaluated = true;
    evaluation.evaluatedAt = new Date();

    await evaluation.save();

    console.log(`✅ Evaluation completed for ${evaluationId}`);
  } catch (error) {
    console.error('❌ Critical error in evaluateAnswer:', error.message);
    
    const evaluation = await Evaluation.findById(evaluationId);
    if (evaluation) {
      evaluation.isEvaluated = true;
      evaluation.feedback = 'Evaluation service temporarily unavailable. Please try again later.';
      evaluation.evaluatedAt = new Date();
      await evaluation.save();
    }
  }
}

// Async function to evaluate screenshot and update all evaluations for the interview attempt
async function evaluateScreenshotAsync(imageData) {
  try {
    const prompt = `You are an online proctoring AI. Analyze this interview screenshot.

Return strict JSON only:
{"isMalpractice": true|false, "facesDetected": number, "reason": "short reason", "confidence": 0.0-1.0}

Mark malpractice for signs of cheating like second person, phone use for help, off-screen assistance, or obvious notes usage.`;

    let screenshotResult = null;

    // Try Groq Vision first
    try {
      console.log('🔄 Trying Groq Vision for screenshot...');
      screenshotResult = await evaluateScreenshotWithGroqVision(imageData, prompt);
      console.log('✅ Groq Vision screenshot evaluation successful');
    } catch (groqError) {
      console.warn('⚠️ Groq Vision failed:', groqError.message);
    }

    // If Groq failed, try Gemini
    if (!screenshotResult) {
      try {
        console.log('🔄 Trying Gemini for screenshot...');
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

        screenshotResult = JSON.parse(jsonMatch[0]);
        console.log('✅ Gemini screenshot evaluation successful');
      } catch (geminiError) {
        console.warn('⚠️ Gemini also failed:', geminiError.message);
      }
    }

    // If both AI providers failed, use safe default (no violations detected)
    if (!screenshotResult) {
      console.warn('⚠️ Both AI providers failed/rate-limited. Using safe default (no violations).');
      screenshotResult = {
        isMalpractice: false,
        facesDetected: 1,
        reason: 'AI evaluation unavailable - defaulting to clean screenshot',
        confidence: 0
      };
    }

    // Mark all evaluations from recent attempt as proctoring evaluated
    const recentEvaluations = await Evaluation.find({
      submittedAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }, // Last 10 minutes
    }).select('_id isProctoringEvaluated');

    if (recentEvaluations.length > 0) {
      await Evaluation.updateMany(
        { _id: { $in: recentEvaluations.map(e => e._id) } },
        { $set: { isProctoringEvaluated: true } }
      );
      console.log(`✅ Marked ${recentEvaluations.length} evaluations as proctoring evaluated`);
    }
  } catch (error) {
    console.error('❌ Error in evaluateScreenshotAsync:', error.message);
  }
}

// Evaluate using OpenRouter API
async function evaluateWithOpenRouter(prompt) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'claude-opus',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interviewer evaluating interview answers. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://localhost:5000',
          'X-Title': 'GoalNow Interview Evaluation'
        }
      }
    );

    const responseText = response.data.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from OpenRouter');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('OpenRouter error details:', error.response?.data || error.message);
    throw error;
  }
}

// Evaluate using Google Gemini AI
async function evaluateWithGemini(prompt) {
  if (isProviderCoolingDown('gemini')) {
    logProviderSkip('gemini');
    throw new Error('Gemini provider cooldown active');
  }

  let lastError = null;

  for (const modelName of GEMINI_MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      });

      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Invalid response format from Gemini model ${modelName}`);
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      lastError = error;
      const msg = error?.message || '';
      if (isQuotaOrRateLimitError(error)) {
        noteProviderQuotaCooldown('gemini', error);
        throw new Error('Gemini quota/rate-limit active');
      }
      if (msg.includes('is not found') || msg.includes('not supported')) {
        console.warn(`Gemini model unavailable: ${modelName}`);
        continue;
      }
      throw error;
    }
  }

  console.error('Gemini error details:', lastError?.message || 'No Gemini model available');
  throw lastError || new Error('No Gemini model available');
}

// Evaluate using xAI Grok API
async function evaluateWithGrok(prompt) {
  if (isProviderCoolingDown('grok')) {
    logProviderSkip('grok');
    throw new Error('Grok provider cooldown active');
  }

  if (!process.env.XAI_GROK_API_KEY) {
    throw new Error('XAI_GROK_API_KEY missing');
  }

  try {
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: GROK_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert interviewer. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.XAI_GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseText = response.data.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Grok');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    if (isQuotaOrRateLimitError(error)) {
      noteProviderQuotaCooldown('grok', error);
      throw new Error('Grok quota/rate-limit active');
    }
    console.error('Grok error details:', error.response?.data || error.message);
    throw error;
  }
}

// Evaluate using Groq Cloud (OpenAI-compatible)
async function evaluateWithGroq(prompt) {
  if (isProviderCoolingDown('groq')) {
    logProviderSkip('groq');
    throw new Error('Groq provider cooldown active');
  }

  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY missing');
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert interviewer. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseText = response.data?.choices?.[0]?.message?.content || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Groq');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    if (isQuotaOrRateLimitError(error)) {
      noteProviderQuotaCooldown('groq', error);
      throw new Error('Groq quota/rate-limit active');
    }
    console.error('Groq error details:', error.response?.data || error.message);
    throw error;
  }
}

async function evaluateScreenshotWithGroqVision(imageData, prompt) {
  if (isProviderCoolingDown('groq')) {
    logProviderSkip('groq');
    throw new Error('Groq provider cooldown active');
  }

  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY missing');
  }

  let lastError = null;

  for (const modelName of GROQ_VISION_MODEL_CANDIDATES) {
    if (decommissionedModels.groqVision.has(modelName)) continue;

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: modelName,
          messages: [
            {
              role: 'system',
              content: 'You are an online proctoring AI. Respond only with valid JSON.',
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageData } },
              ],
            },
          ],
          temperature: 0.1,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseText = response.data?.choices?.[0]?.message?.content || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Invalid response format from Groq Vision model ${modelName}`);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isMalpractice: Boolean(parsed.isMalpractice),
        reason: parsed.reason || 'No reason provided',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      };
    } catch (error) {
      lastError = error;

      if (isModelDecommissionedError(error)) {
        decommissionedModels.groqVision.add(modelName);
        console.warn(`Groq Vision model decommissioned, skipping: ${modelName}`);
        continue;
      }

      if (isQuotaOrRateLimitError(error)) {
        noteProviderQuotaCooldown('groq', error);
        throw new Error('Groq quota/rate-limit active');
      }

      // Unsupported multimodal payload for this model: try next candidate.
      const msg = String(error?.response?.data?.error?.message || error?.message || '').toLowerCase();
      if (msg.includes('image') || msg.includes('vision') || msg.includes('unsupported')) {
        continue;
      }

      throw error;
    }
  }

  console.error('Groq Vision error details:', lastError?.response?.data || lastError?.message || 'No Groq vision model available');
  throw lastError || new Error('No Groq vision model available');
}

// Evaluate using OpenAI API
async function evaluateWithOpenAI(prompt) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interviewer. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseText = response.data.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from OpenAI');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('OpenAI error details:', error.response?.data || error.message);
    throw error;
  }
}

async function evaluateScreenshotForMalpractice(imageData) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      isMalpractice: false,
      reason: 'Gemini API key not configured; screenshot flagged as clean by fallback',
      confidence: 0.5,
    };
  }

  try {
    const prompt = `You are an online proctoring AI. Analyze this interview screenshot and decide if it indicates malpractice.

Mark as malpractice when there are signs like:
- multiple people visible
- candidate clearly using another phone/device for help
- books/notes actively referenced
- obvious off-screen assistance

Return only strict JSON:
{"isMalpractice": true|false, "reason": "short reason", "confidence": 0.0-1.0}`;

    if (isProviderCoolingDown('gemini')) {
      logProviderSkip('gemini');
      try {
        return await evaluateScreenshotWithGroqVision(imageData, prompt);
      } catch (groqError) {
        console.warn('Groq Vision screenshot fallback failed:', groqError.message);
        return {
          isMalpractice: false,
          reason: 'AI evaluation skipped during Gemini cooldown window',
          confidence: 0.5,
        };
      }
    }

    const base64Data = imageData.split(',')[1];

    let lastError = null;
    for (const modelName of GEMINI_MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
          prompt,
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error(`Invalid JSON from screenshot evaluation using ${modelName}`);
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isMalpractice: Boolean(parsed.isMalpractice),
          reason: parsed.reason || 'No reason provided',
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
        };
      } catch (error) {
        lastError = error;
        if (isQuotaOrRateLimitError(error)) {
          noteProviderQuotaCooldown('gemini', error);
          try {
            return await evaluateScreenshotWithGroqVision(imageData, prompt);
          } catch (groqError) {
            console.warn('Groq Vision screenshot fallback failed:', groqError.message);
            return {
              isMalpractice: false,
              reason: 'AI evaluation skipped due to Gemini quota/rate-limit',
              confidence: 0.5,
            };
          }
        }
        const msg = error?.message || '';
        if (msg.includes('is not found') || msg.includes('not supported')) {
          continue;
        }
        throw error;
      }
    }

    throw lastError || new Error('No Gemini model available for screenshot evaluation');
  } catch (error) {
    console.error('Screenshot AI evaluation error:', error.message);
    return {
      isMalpractice: false,
      reason: 'AI evaluation failed; treated as clean in fallback',
      confidence: 0.5,
    };
  }
}

// Fallback evaluation function when API is unavailable
function generateBasicEvaluation(transcribedAnswer) {
  const answerLength = transcribedAnswer.trim().split(' ').length;
  const sentences = transcribedAnswer.trim().split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  
  // Basic scoring logic
  let clarity = Math.min(100, Math.max(40, answerLength / 2));
  let relevance = 75; // Assume relevant since they answered
  let completeness = Math.min(100, Math.max(45, sentences * 15));
  let professionalism = 80; // Assume professional language
  
  const overallScore = Math.round((clarity + relevance + completeness + professionalism) / 4);
  
  const feedbackMap = {
    brief: answerLength < 20,
    moderate: answerLength >= 20 && answerLength < 50,
    detailed: answerLength >= 50
  };
  
  let feedback = '';
  if (feedbackMap.brief) {
    feedback = 'Your answer was concise but could benefit from more specific examples or details to strengthen your response.';
  } else if (feedbackMap.detailed) {
    feedback = 'Good job providing a detailed answer with relevant information. Consider making it more concise in future responses.';
  } else {
    feedback = 'Your answer demonstrates a solid understanding of the question with adequate detail and structure.';
  }
  
  return {
    clarity: Math.round(clarity),
    relevance,
    completeness: Math.round(completeness),
    professionalism,
    overallScore,
    feedback
  };
}

module.exports = router;
module.exports.evaluateScreenshotWithGroqVision = evaluateScreenshotWithGroqVision;
module.exports.evaluateScreenshotAsync = evaluateScreenshotAsync;
