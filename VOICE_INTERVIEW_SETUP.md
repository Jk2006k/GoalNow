# 🎤 Voice-Based Behavioral Interview with AI Evaluation

## ✅ What's Been Implemented

I've set up a complete voice-based interview system with Gemini AI evaluation:

### Frontend Features ✨

- **Real-time Voice Transcription**: Uses browser's Web Speech API to convert speech → text
- **Live Transcription Display**: Shows transcribed text as the user speaks
- **Re-record Option**: Users can re-record if not satisfied
- **Evaluation Tracking**: See all past evaluations with scores
- **Auto-refresh Results**: Automatically polls for evaluation results every 30 seconds

### Backend Features 🔧

- **Audio Processing**: Receives transcribed text via API
- **Delayed Evaluation**: Scores after 30 minutes (prevents timeout issues)
- **Gemini AI Scoring**: Evaluates on 4 dimensions:
  - Clarity (how clear is the answer?)
  - Relevance (does it answer the question?)
  - Completeness (covers all aspects?)
  - Professionalism (appropriate tone/language?)
- **Score Breakdown**: Returns individual scores + overall score (0-100)

---

## 🚀 Setup Instructions

### Step 1: Get Gemini API Key

1. Go to: **https://aistudio.google.com/app/apikeys**
2. Click "Create API Key"
3. Copy the key

### Step 2: Update Server Configuration

Add to `server/.env`:

```
GEMINI_API_KEY=your_api_key_here
```

### Step 3: Verify Client Configuration

Ensure `client/.env.local` has:

```
VITE_GOOGLE_CLIENT_ID=399192649192-h253nuoh5tb5kaf340lcm7ijqhnvb2lm.apps.googleusercontent.com
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Start Both Servers

**Terminal 1 - Start Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 - Start Frontend:**

```bash
cd client
npm run dev
```

---

## 📱 How to Use

### During Interview:

1. User sees a behavioral question
2. Clicks the microphone button to start recording
3. Speaks their answer
4. Speech is transcribed in real-time
5. User clicks "Stop" when done
6. User reviews transcribed text and clicks "Submit Answer"
7. System confirms submission

### After Interview:

1. Go to "Evaluation Results" page
2. See all submitted answers with status
3. For each answer:
   - ⏳ **Pending**: Shows "Ready in X minutes"
   - ✅ **Evaluated**: Shows score and breakdown
4. Click "View Results" to see:
   - Overall score
   - Breakdown (Clarity, Relevance, Completeness, Professionalism)
   - AI feedback on the answer

---

## 🔌 API Endpoints

### 1. Submit Answer

```
POST /api/evaluation/submit-answer
Headers: Authorization: Bearer {token}
Body: {
  questionIndex: number,
  question: string,
  transcribedAnswer: string,
  interviewType: "behavioral" | "technical"
}
Response: { evaluationId, message }
```

### 2. Check Results

```
GET /api/evaluation/results/{evaluationId}
Headers: Authorization: Bearer {token}
Response: {
  isReady: boolean,
  minutesRemaining: number (if not ready),
  evaluation: {
    score: number,
    feedback: string,
    scores: {
      clarity, relevance, completeness, professionalism
    }
  }
}
```

### 3. Get All Evaluations

```
GET /api/evaluation/user-evaluations
Headers: Authorization: Bearer {token}
Response: {
  evaluations: [
    { _id, question, score, feedback, isEvaluated, submittedAt, evaluatedAt }
  ]
}
```

---

## 📊 Database Schema

### Evaluation Collection:

```javascript
{
  userId: ObjectId,
  interviewType: "behavioral" | "technical",
  questionIndex: number,
  question: string,
  transcribedAnswer: string,
  score: 0-100,
  feedback: string,
  evaluationScores: {
    clarity, relevance, completeness, professionalism
  },
  submittedAt: Date,
  evaluatedAt: Date,
  isEvaluated: boolean
}
```

---

## 🎯 File Structure

```
client/src/
├── Page/
│   ├── BehavioralInterview.jsx (UPDATED - Added voice + transcription)
│   └── EvaluationResults.jsx (NEW - View results)
└── services/
    └── authService.js (uses existing auth)

server/
├── routes/
│   └── evaluation.js (NEW - All evaluation endpoints)
├── models/
│   └── Evaluation.js (NEW - MongoDB schema)
├── server.js (UPDATED - Added evaluation routes)
└── .env (UPDATED - Added GEMINI_API_KEY)
```

---

## ⚠️ Important Notes

1. **Web Speech API Availability**:
   - Works in Chrome, Edge, Firefox
   - May have limited support in Safari
   - Needs HTTPS in production (HTTP works locally)

2. **Network Requirements**:
   - Gemini API needs active internet connection
   - Evaluation happens asynchronously (doesn't block user)

3. **30-Minute Delay**:
   - Prevents timeout issues with long processing
   - User can check results anytime after 30 minutes
   - Status updates every 30 seconds

4. **Error Handling**:
   - If transcription fails, user can re-record
   - If evaluation fails, user will see error in results
   - Token refresh handled by axios interceptor

---

## 🧪 Testing

### Quick Test:

1. Login to the app
2. Go to Behavioral Interview
3. Click mic and say: "Tell me about your experience with teamwork"
4. Click Submit Answer
5. Wait 30+ minutes OR check server logs for evaluation
6. Go to Evaluation Results to see score

### Check Server Logs:

Look for: `✅ Evaluation completed for {evaluationId}`

---

## 🐛 Troubleshooting

| Issue                      | Solution                                          |
| -------------------------- | ------------------------------------------------- |
| "OAuth client not found"   | Update VITE_GOOGLE_CLIENT_ID in client/.env.local |
| No transcription appearing | Check browser permissions for microphone          |
| Results not loading        | Ensure GEMINI_API_KEY is valid in server/.env     |
| 401 Authorization error    | Check auth token is stored in localStorage        |
| "invalid_client" on Gemini | Verify API key format and permissions             |

---

## 📝 Next Steps

1. Add more behavioral questions in `src/components/question.js`
2. Implement technical interview questions
3. Add analytics dashboard for score trends
4. Implement email notifications after evaluation
5. Add playback of recorded audio/video

Enjoy your AI-powered interview platform! 🚀
