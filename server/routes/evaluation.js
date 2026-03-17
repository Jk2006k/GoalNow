const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Evaluation = require('../models/Evaluation');

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

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyB81-cL-991TjT8aWjOMUbCPQuwLruFJww');

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
      submittedAt: new Date()
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

    if (!evaluation.isEvaluated) {
      // Check if 30 minutes have passed
      const submittedTime = new Date(evaluation.submittedAt);
      const currentTime = new Date();
      const minutesPassed = (currentTime - submittedTime) / (1000 * 60);

      return res.json({
        success: true,
        isReady: false,
        minutesRemaining: Math.ceil(30 - minutesPassed),
        evaluation: null
      });
    }

    res.json({
      success: true,
      isReady: true,
      evaluation: {
        question: evaluation.question,
        score: evaluation.score,
        feedback: evaluation.feedback,
        scores: evaluation.evaluationScores,
        evaluatedAt: evaluation.evaluatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Error fetching results' });
  }
});

// Get all user evaluations
router.get('/user-evaluations', verifyToken, async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ userId: req.userId }).sort({ submittedAt: -1 });

    res.json({
      success: true,
      evaluations: evaluations.map(e => ({
        _id: e._id,
        question: e.question,
        score: e.score,
        feedback: e.feedback,
        isEvaluated: e.isEvaluated,
        submittedAt: e.submittedAt,
        evaluatedAt: e.evaluatedAt
      }))
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

    // Try OpenRouter AI
    try {
      console.log('🔄 Trying OpenRouter AI...');
      evaluationResult = await evaluateWithOpenRouter(prompt);
      console.log('✅ OpenRouter evaluation successful');
    } catch (openRouterError) {
      console.warn('⚠️ OpenRouter failed:', openRouterError.message);
    }

    // If OpenRouter failed, try Gemini
    if (!evaluationResult) {
      try {
        console.log('🔄 Trying Gemini AI...');
        evaluationResult = await evaluateWithGemini(prompt);
        console.log('✅ Gemini evaluation successful');
      } catch (geminiError) {
        console.warn('⚠️ Gemini failed:', geminiError.message);
      }
    }

    // If Gemini failed, try Grok
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
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    });

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Gemini error details:', error.message);
    throw error;
  }
}

// Evaluate using xAI Grok API
async function evaluateWithGrok(prompt) {
  try {
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: 'grok-2',
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
    console.error('Grok error details:', error.response?.data || error.message);
    throw error;
  }
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
