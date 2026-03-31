# Hidden Test Cases Implementation Guide
## LeetCode-Style Submission System

This guide documents the complete implementation of a hidden test case system that keeps hidden test case data secure while still providing detailed feedback to users.

---

## Architecture Overview

```
Frontend (React)
├── Run Code Button (API: /api/run)
│   └─ Shows detailed test results with inputs/outputs
├── Submit Solution Button (API: /api/submit)
│   └─ Shows summary only (no hidden test details)
└─ CodeSubmission.jsx (updated)

Backend (Node.js/Express)
├── POST /api/run
│   ├─ evaluateSubmission(questionId, code, languageId, false)
│   └─ Response: Detailed results (visible tests only)
├── POST /api/submit
│   ├─ evaluateSubmission(questionId, code, languageId, true)
│   └─ Response: Summary (no hidden test inputs/outputs)
└─ Services
    ├── evaluationEngine.js
    └── utils/submissionResponse.js
```

---

## Database Schema

### Question Model
```javascript
{
  title: String,
  description: String,
  functionName: String,
  starterCode: Map<String, String>,
  testCases: [{
    input: Mixed,      // Visible test case input
    output: String     // Expected output
  }],
  hiddenTestCases: [{  // NEVER sent to frontend
    input: Mixed,
    output: String
  }],
  tags: [String],
  // ... other fields
}
```

### Submission Model
```javascript
{
  userId: String,
  questionId: ObjectId,
  languageId: String,
  code: String,
  testsPassed: Number,
  totalTests: Number,
  accepted: Boolean,
  results: [{
    passed: Boolean,
    input: Mixed,
    expected: String,
    actual: String,
    error: String
  }],
  createdAt: Date
}
```

---

## Backend Implementation

### 1. Response Formatting Utility
**File:** `server/utils/submissionResponse.js`

Provides two response formatters:

#### `formatRunCodeResponse(evaluationResult)`
- Used for "Run Code" endpoint
- Shows detailed test case results
- Only includes visible test cases

Example Response:
```json
{
  "success": true,
  "compilation": { "success": true, "error": null },
  "testResults": {
    "passed": 3,
    "failed": 0,
    "total": 3,
    "details": [
      {
        "input": "[1, 2, 2, 3, 5]",
        "expected": "2",
        "actual": "2",
        "passed": true,
        "error": null
      }
    ]
  },
  "message": "✅ All 3 test cases passed!"
}
```

#### `formatSubmitResponse(evaluationResult)`
- Used for "Submit Solution" endpoint
- Shows counts only for hidden tests
- Displays failing details only if visible tests fail first
- **Never exposes hidden test inputs/outputs**

Example Response (Passed):
```json
{
  "success": true,
  "submission": {
    "totalTests": 13,
    "passedTests": 13,
    "failedTests": 0,
    "visiblePassed": 3,
    "visibleTotal": 3,
    "hiddenPassed": 10,
    "hiddenTotal": 10
  },
  "visibleTestDetails": null,
  "message": "✅ Accepted! All 13 test cases passed (including 10 hidden test cases)"
}
```

Example Response (Failed - Hidden):
```json
{
  "success": false,
  "submission": {
    "totalTests": 13,
    "passedTests": 9,
    "failedTests": 4,
    "visiblePassed": 3,
    "visibleTotal": 3,
    "hiddenPassed": 6,
    "hiddenTotal": 10
  },
  "visibleTestDetails": null,
  "message": "❌ Failed - 4 hidden test case(s) failed"
}
```

### 2. Run Code Endpoint
**File:** `server/routes/submit.js` - `POST /api/run`

```javascript
router.post("/run", async (req, res) => {
  // Validates request
  // Fetches question
  // Calls evaluateSubmission(questionId, code, languageId, false)
  //                          ↑ includeHidden = false (visible only)
  // Returns formatRunCodeResponse(result)
});
```

**Key Features:**
- Runs ONLY visible test cases
- Shows full test case details for debugging
- Returns inputs, expected outputs, and actual outputs
- Fails fast on compilation errors

### 3. Submit Endpoint
**File:** `server/routes/submit.js` - `POST /api/submit`

```javascript
router.post("/submit", async (req, res) => {
  // Validates request
  // Fetches question
  // Calls evaluateSubmission(questionId, code, languageId, true)
  //                          ↑ includeHidden = true (visible + hidden)
  // Saves submission to database
  // Returns formatSubmitResponse(result)
  //     ↑ NO hidden test details exposed!
});
```

**Key Features:**
- Runs BOTH visible and hidden test cases on backend
- Does NOT send hidden test inputs/outputs to frontend
- Saves full submission history (including visible results)
- Returns only counts for hidden tests

### 4. Evaluation Engine
**File:** `server/services/evaluationEngine.js`

#### `evaluateSubmission(questionId, code, languageId, includeHidden)`

```javascript
const evaluateSubmission = async (
  questionId,
  userCode,
  languageId,
  includeHidden = true
) => {
  // 1. Fetch question from DB
  const question = await Question.findById(questionId);
  
  // 2. Combine test cases based on includeHidden flag
  let allTestCases = [...question.testCases];
  if (includeHidden && question.hiddenTestCases) {
    allTestCases.push(...question.hiddenTestCases);
  }
  
  // 3. Execute each test case
  const results = [];
  for (let testCase of allTestCases) {
    const wrappedCode = wrapCodeForExecution(userCode, languageId, testCase);
    const executionResult = await executeCode(wrappedCode, languageId);
    const comparison = compareOutputs(testCase.output, executionResult.stdout);
    
    results.push({
      input: JSON.stringify(testCase.input),
      expected: comparison.normalizedExpected,
      actual: comparison.normalizedActual,
      passed: comparison.passed,
      isHidden: i >= question.testCases.length // Track if hidden
    });
  }
  
  // 4. Separate visible and hidden results
  const publicResults = results.filter(r => !r.isHidden);
  const hiddenResults = results.filter(r => r.isHidden);
  
  // 5. Return response (visible details + hidden counts only)
  return {
    success: publicResults.every(r => r.passed) && 
             hiddenResults.every(r => r.passed),
    publicTests: {
      total: publicResults.length,
      passed: publicResults.filter(r => r.passed).length,
      failed: publicResults.filter(r => !r.passed).length,
      results: publicResults // Include full details
    },
    hiddenTests: includeHidden ? {
      total: hiddenResults.length,
      passed: hiddenResults.filter(r => r.passed).length,
      failed: hiddenResults.filter(r => !r.passed).length
      // DO NOT include results array!
    } : null
  };
};
```

---

## Frontend Implementation

### CodeSubmission Component
**File:** `client/src/components/CodeSubmission.jsx`

#### Two Action Buttons

1. **Run Code Button** (Blue - `#2196F3`)
   - Calls `POST /api/run`
   - `includeHidden = false`
   - Shows detailed results

2. **Submit Solution Button** (Green - `#388e3c`)
   - Calls `POST /api/submit`
   - `includeHidden = true`
   - Shows summary only

#### Component Structure

```jsx
const CodeSubmission = ({ questionId, starterCode = '' }) => {
  const [code, setCode] = useState(starterCode);
  const [actionType, setActionType] = useState(null); // 'run' or 'submit'
  const [results, setResults] = useState(null);
  
  const handleRunCode = async () => {
    // Call /api/run endpoint
    // Will show detailed results
  };
  
  const handleSubmit = async () => {
    // Call /api/submit endpoint
    // Will show summary only
  };
  
  return (
    <div>
      <textarea value={code} ... />
      <button onClick={handleRunCode}>🏃 Run Code</button>
      <button onClick={handleSubmit}>✅ Submit Solution</button>
      <ResultsDisplay results={results} actionType={actionType} />
    </div>
  );
};
```

#### Results Display Logic

```jsx
const ResultsDisplay = ({ results, actionType }) => {
  if (actionType === 'run') {
    // Show detailed test case results
    return <RunCodeResults results={results} />;
  }
  
  if (actionType === 'submit') {
    // Show summary with hidden test info
    return <SubmitResults results={results} />;
  }
};
```

#### Run Code Results Display
Shows all visible test case details:
```
✅ All Tests Passed! (3/3)

📋 Test Case Details
┌─────────────────────────────────────────┐
│ ✅ Test Case 1                          │
│   Input: [1, 2, 2, 3, 5]                │
│   Expected: 2                            │
│   Actual: 2                              │
└─────────────────────────────────────────┘
```

#### Submit Results Display
Shows summary with hidden test counts:
```
✅ Accepted!

Total Tests: 13
Passed: 13 ✓
Failed: 0 ✗

📋 Failing Visible Test Cases
(only shown if visible tests fail)

🔒 Hidden Test Cases
✅ All 10 hidden test cases passed
(Hidden test case details are not shown for security reasons)
```

### Key Security Features

1. **Never displays hidden test inputs**
   ```jsx
   // ✅ Correct: Only show counts
   {submission.hiddenPassed}/{submission.hiddenTotal} passed
   
   // ❌ Never do this:
   {hiddenTests.details.map(tc => <TestCase {...tc} />)}
   ```

2. **Conditional rendering based on action type**
   ```jsx
   {actionType === 'run' && <TestCaseDetails />}
   {actionType === 'submit' && <SubmissionSummary />}
   ```

3. **Shows failing visible tests only**
   ```jsx
   {results.visibleTestDetails
     ?.filter(tc => !tc.passed)
     .map(tc => <TestCase {...tc} />)}
   ```

---

## API Endpoint Comparison

| Feature | Run Code | Submit |
|---------|----------|--------|
| Endpoint | `POST /api/run` | `POST /api/submit` |
| Test Cases | Visible only | Visible + Hidden |
| Shows Inputs | ✅ Yes | ✅ Yes (visible only) |
| Shows Outputs | ✅ Yes | ✅ Yes (visible only) |
| Shows Errors | ✅ Yes (detailed) | ✅ Yes (visible only) |
| Hidden Summary | ❌ No | ✅ Yes (counts only) |
| Saves to DB | ❌ No | ✅ Yes |
| Purpose | Debug | Final evaluation |

---

## Server-Side Security Checklist

- ✅ Hidden test cases stored in separate field
- ✅ Frontend never receives hidden test inputs
- ✅ Frontend never receives hidden test outputs
- ✅ Backend tracks which tests are hidden
- ✅ Response formatter separates visible/hidden
- ✅ Database saves only visible test results
- ✅ No bypass route to access hidden tests
- ✅ submissions endpoint requires authentication (if needed)

---

## Frontend Security Checklist

- ✅ Different endpoints for run vs submit
- ✅ Never renders hidden test inputs in DOM
- ✅ Only displays hidden test counts
- ✅ Shows full details for visible tests only
- ✅ Error messages don't leak hidden info
- ✅ Storage doesn't cache hidden details

---

## Usage Example

### 1. Setup Question with Hidden Tests

```javascript
const question = await Question.create({
  title: "Merge Sorted Array",
  description: "...",
  functionName: "solution",
  starterCode: {
    "71": "def solution(nums1, nums2):\n    pass"
  },
  testCases: [
    { input: { nums1: [1, 3], nums2: [2] }, output: "1 2 3" },
    { input: { nums1: [1], nums2: [] }, output: "1" }
  ],
  hiddenTestCases: [
    { input: { nums1: [0], nums2: [0] }, output: "0 0" },
    { input: { nums1: [4, 5], nums2: [1, 2, 3] }, output: "1 2 3 4 5" },
    // ... 7 more hidden test cases
  ]
});
```

### 2. User Clicks "Run Code"

```
Frontend: POST /api/run
Body: { userCode: "...", questionId: "...", languageId: "71" }

Backend:
1. evaluateSubmission(..., includeHidden=false)
2. Runs only 2 visible test cases
3. Returns detailed results + inputs/outputs

Frontend Display:
- Shows all test case details
- User can see inputs and expected vs actual outputs
- User can debug their solution
```

### 3. User Clicks "Submit Solution"

```
Frontend: POST /api/submit
Body: { userCode: "...", questionId: "...", languageId: "71" }

Backend:
1. evaluateSubmission(..., includeHidden=true)
2. Runs 2 visible + 8 hidden test cases
3. Saves submission to database
4. Returns summary (no hidden details)

Frontend Display:
- Shows: "✅ Accepted! All 10 test cases passed"
- If failed: "❌ Failed - 3 hidden test case(s) failed"
- Does NOT show which hidden tests failed
- Does NOT show hidden test inputs/outputs
```

---

## Configuration

### Environment Variables
```bash
# Optional: Use cloud Judge0 instead of local executor
USE_CLOUD_JUDGE0=false
JUDGE0_HOST=http://127.0.0.1:2358
JUDGE0_API_URL=http://localhost:2358/api

# Frontend API
REACT_APP_API_URL=http://localhost:5000
```

---

## Testing the System

### Test Case 1: All Visible Tests Pass
```javascript
const code = `
def solution(nums1, nums2):
    return sorted(nums1 + nums2)
`;
// Run Code: ✅ 2/2 passed
// Submit: ✅ 10/10 passed (2 visible + 8 hidden)
```

### Test Case 2: Visible Test Fails
```javascript
const code = `
def solution(nums1, nums2):
    return []  // Wrong!
`;
// Run Code: ❌ 0/2 passed (shows which ones failed & why)
// Submit: ❌ Failed (never runs hidden tests if visible fails)
```

### Test Case 3: Visible Pass, Hidden Fail
```javascript
const code = `
def solution(nums1, nums2):
    if len(nums1) <= 2 and len(nums2) <= 1:
        return sorted(nums1 + nums2)
    return []  // Fails on larger inputs
`;
// Run Code: ✅ 2/2 passed
// Submit: ❌ Failed - 6 hidden test cases failed (no details shown)
```

---

## Monitoring & Analytics

### Track Success Rates
```javascript
// In submission save
const submission = new Submission({
  userId,
  questionId,
  code,
  testsPassed: visiblePassed + hiddenPassed,
  totalTests: visibleTotal + hiddenTotal,
  accepted: allPassed,
  createdAt: new Date()
});

// Query stats
const stats = await Submission.aggregate([
  { $match: { questionId } },
  { $group: {
    _id: null,
    total: { $sum: 1 },
    accepted: { $sum: { $cond: ["$accepted", 1, 0] } },
    acceptanceRate: { $avg: { $cond: ["$accepted", 100, 0] } }
  }}
]);
```

---

## Troubleshooting

### Issue: "Run Code shows hidden tests"
**Solution:** Check `evaluateSubmission` is called with `includeHidden=false` in /api/run

### Issue: "Hidden test data appears in response"
**Solution:** Ensure `formatRunCodeResponse` is used, not `formatSubmitResponse`

### Issue: "Frontend displays hidden inputs"
**Solution:** Verify ResultsDisplay checks `actionType === 'run'` before showing details

### Issue: "Hidden tests not evaluated on submit"
**Solution:** Ensure `/api/submit` calls `evaluateSubmission(..., true)`

---

## Future Enhancements

1. **AC Rate Per Problem**
   - Store acceptance rates for leaderboard
   - Update after each submission

2. **Premium Hidden Tests**
   - More hidden tests for harder problems
   - Separate hints tier

3. **Submission History**
   - Filter by question
   - Show progress over time

4. **Community Solutions**
   - After accepting, show other solutions
   - Learn from different approaches

5. **Custom Test Cases**
   - Let users create custom tests
   - Vote on hardness

---

## Files Modified

| File | Changes |
|------|---------|
| `server/utils/submissionResponse.js` | **NEW** - Response formatters |
| `server/routes/submit.js` | Added `/api/run` endpoint |
| `server/routes/submit.js` | Updated `/api/submit` to use formatter |
| `client/src/components/CodeSubmission.jsx` | **REFACTORED** - Split Run/Submit |

---

## Conclusion

This hidden test case system provides:
- **Security:** Hidden test data never leaks to frontend
- **Feedback:** Users get detailed debugging info for visible tests
- **Transparency:** Clear communication about overall success
- **Scalability:** Works with any number of hidden tests
- **LeetCode-Style:** Familiar user experience

All test cases are evaluated on the backend, ensuring integrity while maintaining user privacy and security.
