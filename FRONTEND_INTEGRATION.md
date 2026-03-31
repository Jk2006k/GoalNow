# Test Case Evaluation Engine - Frontend Integration Guide

## Overview

The test case evaluation engine runs user code against all test cases (public + hidden) and provides detailed results. The backend automatically handles:

- Code wrapping with test case injection
- Multi-language execution (Python, JavaScript, Java, C++)
- Output normalization for format-agnostic comparison
- Hidden test case injection (without exposing to frontend)

## Frontend Integration

### 1. Basic Submit API Call

```javascript
const submitCode = async () => {
  const response = await fetch("http://localhost:5000/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userCode: code,                    // User's solution function
      questionId: "507f1f77bcf86cd799439011",  // MongoDB ObjectId
      languageId: "71",                  // "71" (Python) | "63" (JS) | "62" (Java) | "54" (C++)
      userId: "user-123"                 // Optional: for tracking
    })
  })

  const data = await response.json()
  console.log(data)
}
```

### 2. Response Format

Success Response (200):
```json
{
  "success": true,
  "total": 6,                    // Total test cases (public + hidden)
  "passed": 5,                   // Number passed
  "acceptance": "83.3%",         // Pass rate percentage
  "summary": {
    "passed": false,             // All tests passed?
    "acceptance": "83.3%"
  },
  "results": [
    {
      "passed": true,
      "input": { "nums": [2, 7, 11, 15], "target": 9 },
      "expected": "0 1",
      "actual": "0 1",
      "error": null
    },
    {
      "passed": false,
      "input": { "nums": [1, 2, 3], "target": 6 },
      "expected": "2 3",
      "actual": "1 2",
      "error": null
    }
  ]
}
```

Error Response (400/500):
```json
{
  "error": "Missing required fields: userCode, questionId, languageId",
  "details": "..."
}
```

### 3. Handling Results

```javascript
const handleSubmitResult = (data) => {
  // Check if all tests passed
  if (data.summary.passed) {
    showSuccess("🎉 All test cases passed!")
  } else {
    showWarning(`${data.passed}/${data.total} tests passed`)
  }

  // Log failed test cases
  const failedTests = data.results.filter(r => !r.passed)
  failedTests.forEach(test => {
    console.log({
      input: test.input,
      expected: test.expected,
      actual: test.actual,
      error: test.error
    })
  })
}
```

### 4. React Component Example

```jsx
import React, { useState } from 'react'

function CodeSubmission({ code, language, questionId, userId }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const submit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:5000/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userCode: code,
          questionId,
          languageId: language,
          userId
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <button onClick={submit} disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Solution'}
      </button>

      {error && <div className="error">{error}</div>}

      {results && (
        <div className="results">
          <h3>Submission Results</h3>
          <p>
            {results.passed} / {results.total} tests passed ({results.acceptance})
          </p>

          {results.summary.passed && <div className="success">✅ All tests passed!</div>}

          <div className="test-cases">
            {results.results.map((result, idx) => (
              <div key={idx} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
                <div className="status">{result.passed ? '✓' : '✗'}</div>
                <div className="details">
                  <p>Input: {JSON.stringify(result.input)}</p>
                  <p>Expected: {result.expected}</p>
                  <p>Actual: {result.actual || 'No output'}</p>
                  {result.error && <p className="error">Error: {result.error}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CodeSubmission
```

### 5. Important Notes

#### Language IDs
- `"71"` - Python 3
- `"63"` - JavaScript (Node.js)
- `"62"` - Java 11
- `"54"` - C++ 14

#### Test Cases
- The backend automatically combines **public test cases** + **hidden test cases**
- Frontend receives results for all tests but never sees which ones are hidden
- The `results` array includes output for all test cases

#### User Tracking
- If `userId` is omitted, submissions are tracked as "anonymous"
- Use actual user ID for authenticated users to track submission history

#### Success Criteria
- `summary.passed === true` means **all test cases passed** (both public and hidden)
- `summary.passed === false` means **at least one test case failed**

### 6. Querying Submission History

```javascript
// Get a user's submissions
const getSubmissionHistory = async (userId) => {
  const response = await fetch(
    `http://localhost:5000/api/submissions/user/${userId}?limit=10&skip=0`
  )
  const data = await response.json()
  return data.data // Array of submissions
}

// Get a specific submission
const getSubmissionDetails = async (submissionId) => {
  const response = await fetch(
    `http://localhost:5000/api/submissions/${submissionId}`
  )
  const data = await response.json()
  return data.data
}
```

### 7. Frontend Security Considerations

✅ **Safe to expose publicly:**
- Test case inputs/outputs after submission
- User's own submission results
- Acceptance rates

❌ **Never expose:**
- Hidden test cases before submission (backend handles this)
- Other users' code
- Internal evaluation logic

The backend automatically strips sensitive data before sending to frontend.

## Advanced Usage

### Display Test Results Table

```jsx
<table className="test-results">
  <thead>
    <tr>
      <th>Test #</th>
      <th>Status</th>
      <th>Input</th>
      <th>Expected</th>
      <th>Actual</th>
    </tr>
  </thead>
  <tbody>
    {results.results.map((result, idx) => (
      <tr key={idx} className={result.passed ? 'passed' : 'failed'}>
        <td>{idx + 1}</td>
        <td>{result.passed ? '✓ Pass' : '✗ Fail'}</td>
        <td><code>{JSON.stringify(result.input)}</code></td>
        <td><code>{result.expected}</code></td>
        <td><code>{result.actual}</code></td>
      </tr>
    ))}
  </tbody>
</table>
```

### Show Detailed Failure Info

```jsx
{results.results
  .filter(r => !r.passed)
  .map((result, idx) => (
    <div key={idx} className="failure-detail">
      <h4>Test Case {idx + 1} Failed</h4>
      <p><strong>Input:</strong> {JSON.stringify(result.input, null, 2)}</p>
      <p><strong>Expected:</strong> {result.expected}</p>
      <p><strong>Got:</strong> {result.actual}</p>
      {result.error && <p><strong>Error:</strong> {result.error}</p>}
    </div>
  ))}
```

## Testing the Endpoint

### Using cURL

```bash
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "def solution(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]",
    "questionId": "507f1f77bcf86cd799439011",
    "languageId": "71",
    "userId": "test-user"
  }'
```

### Using Postman

1. Create new POST request
2. URL: `http://localhost:5000/api/submit`
3. Body (JSON):
```json
{
  "userCode": "def solution(nums, target):\n    ...",
  "questionId": "ObjectId_here",
  "languageId": "71",
  "userId": "optional_user_id"
}
```

## Next Steps

1. **Analytics Dashboard**: Plot user's acceptance rate over time
2. **Leaderboard**: Show top solvers by question
3. **Solution Comparison**: Show different solutions that passed
4. **Difficulty Progression**: Recommend problems based on user stats
