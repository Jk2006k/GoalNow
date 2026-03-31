# API Reference - Evaluation Engine

## Base URL
```
http://localhost:5000/api
```

---

## Endpoints

### 1. POST /api/submit
**Submit code for complete evaluation (public + hidden tests)**

#### Request
```json
{
  "userCode": "def solution(nums, target):\n    return [0, 1]",
  "questionId": "507f1f77bcf86cd799439011",
  "languageId": "71",
  "userId": "user123"  // Optional
}
```

#### Language IDs
- `"71"` - Python 3
- `"63"` - JavaScript (Node.js)
- `"62"` - Java
- `"54"` - C++

#### Response (Success)
```json
{
  "success": true,
  "compilation": {
    "success": true,
    "error": null
  },
  "publicTests": {
    "total": 3,
    "passed": 3,
    "failed": 0,
    "results": [
      {
        "input": "{\"nums\":[2,7,11,15],\"target\":9}",
        "expected": "0 1",
        "actual": "0 1",
        "passed": true,
        "error": null
      }
    ]
  },
  "hiddenTests": {
    "total": 5,
    "passed": 5,
    "failed": 0
  },
  "message": "✅ All test cases passed!",
  "timestamp": "2024-03-26T10:30:45.123Z"
}
```

#### Response (Compilation Error)
```json
{
  "success": false,
  "compilation": {
    "success": false,
    "error": "SyntaxError: invalid syntax on line 2"
  },
  "publicTests": {...},
  "hiddenTests": {...},
  "message": "❌ Compilation error"
}
```

#### Response (Test Failure)
```json
{
  "success": false,
  "compilation": {
    "success": true,
    "error": null
  },
  "publicTests": {
    "total": 3,
    "passed": 2,
    "failed": 1,
    "results": [
      {
        "input": "{\"nums\":[2,7,11,15],\"target\":9}",
        "expected": "0 1",
        "actual": "1 0",
        "passed": false,
        "error": null
      }
    ]
  },
  "hiddenTests": {
    "total": 5,
    "passed": 3,
    "failed": 2
  },
  "message": "❌ 1 public test case(s) failed"
}
```

#### Error Responses
```json
// Missing fields
{
  "error": "Missing required fields: userCode, questionId, languageId"
}

// Invalid language
{
  "error": "Invalid languageId. Must be 71 (Python), 63 (JavaScript), 62 (Java), or 54 (C++)"
}

// Question not found
{
  "error": "Question not found"
}

// Evaluation error
{
  "error": "Evaluation failed",
  "details": "Error message details"
}
```

---

### 2. POST /api/run-tests
**Quick test with custom test cases (for development)**

#### Request
```json
{
  "userCode": "def solution(nums, target):\n    return [0, 1]",
  "language_id": "71",
  "testCases": [
    {
      "input": {"nums": [2,7,11,15], "target": 9},
      "output": "[0,1]"
    },
    {
      "input": {"nums": [3,2,4], "target": 6},
      "output": "[1,2]"
    }
  ]
}
```

#### Response
```json
{
  "success": true,
  "total": 2,
  "passed": 2,
  "acceptance": "100%",
  "results": [
    {
      "input": {"nums": [2,7,11,15], "target": 9},
      "expected": "[0,1]",
      "actual": "[0, 1]",
      "passed": true
    }
  ],
  "summary": {
    "passed": true,
    "acceptance": "100%"
  }
}
```

---

### 3. GET /api/evaluation/stats/:questionId
**Get evaluation statistics for a question**

#### Request
```
GET /api/evaluation/stats/507f1f77bcf86cd799439011
```

#### Response
```json
{
  "success": true,
  "data": {
    "questionId": "507f1f77bcf86cd799439011",
    "publicTestCases": 3,
    "hiddenTestCases": 5,
    "functionName": "solution"
  }
}
```

#### Error Response
```json
{
  "error": "Failed to fetch stats",
  "details": "Invalid question ID"
}
```

---

## Submission History Endpoints

### 4. GET /api/submissions/user/:userId
**Get submission history for a user**

#### Request
```
GET /api/submissions/user/user@example.com?limit=10&skip=0
```

#### Query Parameters
- `limit` (optional, default: 10) - Number of submissions to return
- `skip` (optional, default: 0) - Number of submissions to skip (for pagination)

#### Response
```json
{
  "success": true,
  "count": 5,
  "total": 25,
  "data": [
    {
      "_id": "60d5ec49c1234567890abcd1",
      "userId": "user@example.com",
      "questionId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Two Sum",
        "difficulty": "easy"
      },
      "languageId": "71",
      "testsPassed": 8,
      "totalTests": 8,
      "accepted": true,
      "createdAt": "2024-03-26T10:30:45.123Z"
    }
  ]
}
```

---

### 5. GET /api/submissions/:submissionId
**Get details of a specific submission**

#### Request
```
GET /api/submissions/60d5ec49c1234567890abcd1
```

#### Response
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49c1234567890abcd1",
    "userId": "user@example.com",
    "questionId": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Two Sum",
      "difficulty": "easy"
    },
    "languageId": "71",
    "code": "def solution(nums, target):\n    ...",
    "testsPassed": 8,
    "totalTests": 8,
    "accepted": true,
    "results": [
      {
        "passed": true,
        "input": "{\"nums\":[2,7,11,15],\"target\":9}",
        "expected": "0 1",
        "actual": "0 1"
      }
    ],
    "createdAt": "2024-03-26T10:30:45.123Z"
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing/invalid fields) |
| 404 | Not found (question/submission doesn't exist) |
| 500 | Server error (evaluation failed) |

---

## Input Format Examples

### Object Input
```javascript
{
  "input": {"nums": [1,2,3], "target": 3},
  "output": "2"
}
```

Wrapped as:
```python
test_input = {"nums": [1,2,3], "target": 3}
result = solution(**test_input)
```

### Array Input
```javascript
{
  "input": [1,2,3],
  "output": "6"
}
```

Wrapped as:
```python
test_input = [1,2,3]
result = solution(*test_input)
```

### Scalar Input
```javascript
{
  "input": 42,
  "output": "true"
}
```

Wrapped as:
```python
result = solution(42)
```

---

## Output Normalization Examples

All these outputs are treated as EQUAL:

| Expected | Actual | Normalized |
|----------|--------|------------|
| `[0,1]` | `0 1` | `0 1` |
| `[0, 1]` | `0\n1` | `0 1` |
| `(0,1)` | `0, 1` | `0 1` |
| `0 1` | `[0,1]` | `0 1` |
| `"[0,1]"` | `0\n\n1` | `0 1` |

---

## Example cURL Requests

### Submit Code
```bash
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "def solution(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]",
    "questionId": "507f1f77bcf86cd799439011",
    "languageId": "71",
    "userId": "user123"
  }'
```

### Quick Test
```bash
curl -X POST http://localhost:5000/api/run-tests \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "def solution(a, b): return a + b",
    "language_id": "71",
    "testCases": [
      {"input": {"a": 1, "b": 2}, "output": "3"},
      {"input": {"a": 5, "b": 5}, "output": "10"}
    ]
  }'
```

### Get Evaluation Stats
```bash
curl http://localhost:5000/api/evaluation/stats/507f1f77bcf86cd799439011
```

### Get User Submissions
```bash
curl "http://localhost:5000/api/submissions/user/user123?limit=10&skip=0"
```

---

## Rate Limiting

Currently no rate limiting. Consider adding for production:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30 // limit each IP to 30 submissions per windowMs
});

app.post('/api/submit', limiter, (req, res) => { ... });
```

---

## Authentication

Currently no authentication required. In production, add:

```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post('/api/submit', authenticateToken, (req, res) => { ... });
```

---

## Monitoring

### Successful Submissions
```javascript
GET /api/submissions/user/:userId
```

### Submission Success Rate
```javascript
const submissions = await Submission.find({userId});
const accepted = submissions.filter(s => s.accepted).length;
const rate = (accepted / submissions.length) * 100;
```

### Most Attempted Questions
```javascript
const questions = await Submission.aggregate([
  {$group: {_id: "$questionId", count: {$sum: 1}}},
  {$sort: {count: -1}},
  {$limit: 10}
]);
```

---

## Common Error Codes

| Error | Cause | Fix |
|-------|-------|-----|
| `ECONNREFUSED` | Judge0 not running | Start Judge0 service or use cloud API |
| `Invalid questionId format` | Not a valid MongoDB ObjectId | Use 24 hex character ID |
| `Question not found` | ID doesn't exist in DB | Verify ID exists in questions collection |
| `SyntaxError` | Invalid Python/JS syntax | Fix code syntax errors |
| `Timeout exceeded` | Code runs too long | Check for infinite loops |
| `NameError` | Variable not defined | Check variable names |
| `IndexError` | Array index out of bounds | Check array bounds |

---

## Implementation Checklist

- [ ] Backend evaluationEngine.js created/updated
- [ ] submit.js routes created/updated
- [ ] server.js imports submitRoutes
- [ ] MongoDB connection working
- [ ] Judge0 service running (or cloud API configured)
- [ ] Frontend CodeSubmission component created
- [ ] Frontend useCodeEvaluation hook created
- [ ] Tested POST /api/submit endpoint
- [ ] Tested POST /api/run-tests endpoint
- [ ] Tested GET /api/evaluation/stats endpoint
- [ ] Verified hidden tests not exposed
- [ ] Integrated into DSAInterview page

---

**Last Updated:** 2024-03-26
**Status:** Production Ready ✅
