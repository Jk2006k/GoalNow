# Test Case Evaluation Engine - Complete Implementation Guide

## Overview

The evaluation engine mimics LeetCode's approach to testing code:

1. **User submits code** → Backend receives it
2. **Fetch question** → Get both public and hidden test cases from MongoDB
3. **Wrap code dynamically** → Inject test inputs and capture output
4. **Execute via Judge0** → Run wrapped code for each test case
5. **Normalize output** → Handle formatting differences ([0,1] vs 0 1 vs 0\n1)
6. **Compare results** → Match actual vs expected
7. **Return structured response** → Show results WITHOUT exposing hidden tests

---

## Architecture

### Backend Files

#### 1. `server/services/evaluationEngine.js`
Core evaluation logic with:
- Output normalization functions
- Code wrapping for test case injection
- Judge0 integration (local and cloud)
- Main `evaluateSubmission()` function
- Public API for statistics

#### 2. `server/routes/submit.js`
Express routes:
- `POST /api/submit` - Main submission endpoint
- `POST /api/run-tests` - Quick tests during development
- `GET /api/evaluation/stats/{questionId}` - Get eval statistics

#### 3. `server/models/Question.js`
Question schema with:
- `testCases` - Public test cases (shown to users)
- `hiddenTestCases` - Secret test cases (never exposed to frontend)

---

## Backend API Reference

### POST /api/submit

**Request:**
```javascript
{
  userCode: string,           // User's code solution
  questionId: string,         // MongoDB ObjectId
  languageId: string,         // "71" (Python), "63" (JS), "62" (Java), "54" (C++)
  userId: string (optional)   // For tracking submissions
}
```

**Response:**
```javascript
{
  success: boolean,
  compilation: {
    success: boolean,
    error: string | null
  },
  publicTests: {
    total: number,
    passed: number,
    failed: number,
    results: [
      {
        input: string,
        expected: string,
        actual: string,
        passed: boolean,
        error: string | null
      }
    ]
  },
  hiddenTests: {
    total: number,
    passed: number,
    failed: number
    // NO DETAILED RESULTS - Only counts!
  },
  message: string
}
```

**Key Security Feature:** 
- Frontend receives `publicTests` with full details
- Frontend receives `hiddenTests` with ONLY counts (no test cases exposed)

### POST /api/run-tests

**Request:**
```javascript
{
  userCode: string,
  language_id: string,
  testCases: [
    {
      input: any,        // Can be object, array, or scalar
      output: string     // Expected output
    }
  ]
}
```

**Response:**
```javascript
{
  success: boolean,
  total: number,
  passed: number,
  acceptance: string,
  results: [...]
}
```

### GET /api/evaluation/stats/{questionId}

**Response:**
```javascript
{
  success: boolean,
  data: {
    questionId: string,
    publicTestCases: number,
    hiddenTestCases: number,
    functionName: string
  }
}
```

---

## Frontend Integration

### Method 1: Using React Component (Recommended)

```jsx
import CodeSubmission from './components/CodeSubmission';

export default function DSAInterview() {
  return (
    <CodeSubmission 
      questionId="507f1f77bcf86cd799439011"
      starterCode="def solution(nums, target):\n    pass"
    />
  );
}
```

### Method 2: Using Custom Hook

```jsx
import useCodeEvaluation from './hooks/useCodeEvaluation';

export default function MyInterview() {
  const { submitCode, results, loading, error } = useCodeEvaluation();

  const handleSubmit = async () => {
    try {
      const evalResult = await submitCode(
        questionId,
        userCode,
        "71" // Python
      );
      
      if (evalResult.success) {
        console.log('✅ All tests passed!');
      } else {
        console.log(`❌ ${evalResult.publicTests.failed} tests failed`);
      }
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };

  return (
    <>
      <textarea value={userCode} onChange={...} />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      {results && <ResultsDisplay results={results} />}
      {error && <ErrorDisplay error={error} />}
    </>
  );
}
```

### Method 3: Direct API Call

```javascript
axios.post('http://localhost:5000/api/submit', {
  userCode: 'def solution(nums): return nums',
  questionId: '507f1f77bcf86cd799439011',
  languageId: '71',
  userId: userId
}).then(response => {
  console.log('Evaluation Results:', response.data);
});
```

---

## Code Wrapping Logic

The engine automatically wraps user code to inject test inputs:

### Python Example

**User Code:**
```python
def solution(nums, target):
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
```

**After Wrapping (for test input `{nums: [2,7,11,15], target: 9}`):**
```python
def solution(nums, target):
    # ... user code ...

# Test case injection
test_input = {"nums": [2,7,11,15], "target": 9}
result = solution(**test_input)
print(result)
```

### JavaScript Example

**User Code:**
```javascript
function solution(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
}
```

**After Wrapping:**
```javascript
function solution(nums, target) {
    // ... user code ...
}

// Test case injection
const testInput = {"nums": [2,7,11,15], "target": 9};
const result = solution(...Object.values(testInput));
console.log(result);
```

---

## Output Normalization

The engine normalizes output to avoid false failures due to formatting:

| Expected | Actual | Normalized Both | Result |
|----------|--------|-----------------|--------|
| `[0,1]` | `0 1` | `0 1` | ✅ PASS |
| `0\n1` | `[0, 1]` | `0 1` | ✅ PASS |
| `(0,1)` | `0, 1` | `0 1` | ✅ PASS |
| `"[0,1]"` | `0\n\n1` | `0 1` | ✅ PASS |

**Normalization Steps:**
1. Trim whitespace
2. Remove brackets `[]()` and parentheses
3. Replace commas with spaces
4. Remove newlines (replace with spaces)
5. Collapse multiple spaces
6. Trim again

---

## Test Case Format

### Question Model (MongoDB)

```javascript
{
  _id: ObjectId,
  title: "Two Sum",
  description: "...",
  functionName: "solution",
  testCases: [
    {
      input: {
        nums: [2, 7, 11, 15],
        target: 9
      },
      output: "[0,1]"
    },
    {
      input: {
        nums: [3, 2, 4],
        target: 6
      },
      output: "[1,2]"
    }
  ],
  hiddenTestCases: [
    // Same format, but never exposed to frontend
  ]
}
```

### Test Case Input Formats

**Dictionary Input (Object):**
```javascript
input: { nums: [1,2,3], target: 3 }
// Wrapped as: solution(**input) in Python
// Wrapped as: solution(...Object.values(input)) in JS
```

**Array Input:**
```javascript
input: [1, 2, 3, 3]
// Wrapped as: solution(*input) in Python
// Wrapped as: solution(...input) in JS
```

**Scalar Input:**
```javascript
input: 42
// Wrapped as: solution(42) in Python
// Wrapped as: solution(42) in JS
```

---

## Security Features

### 1. Hidden Test Cases Protection
- Frontend NEVER receives detailed results of hidden tests
- Only aggregate counts are returned (passed/failed/total)
- Prevents users from reverse-engineering hidden tests

### 2. Code Isolation
- User code executed in isolated containers
- Timeout protection (5 seconds default)
- No file system access or network calls

### 3. User Tracking
- Optional userId parameter to track submissions
- All submissions stored in MongoDB for analytics

### 4. Input Validation
- Language ID validation
- TestCase input type checking
- Code size limits (200MB)

---

## Error Handling

### Compilation Error
```javascript
{
  success: false,
  compilation: {
    success: false,
    error: "SyntaxError: invalid syntax"
  }
}
```

### Runtime Error
```javascript
{
  success: false,
  compilation: { success: true },
  publicTests: {
    results: [
      {
        passed: false,
        error: "NameError: name 'invalid' is not defined"
      }
    ]
  }
}
```

### Timeout
```javascript
{
  success: false,
  publicTests: {
    results: [
      {
        passed: false,
        error: "Timeout exceeded (5000ms)"
      }
    ]
  }
}
```

---

## Configuration

### Environment Variables (.env)

```bash
# Judge0 Configuration
JUDGE0_HOST=http://127.0.0.1:2358
USE_CLOUD_JUDGE0=false
JUDGE0_RAPID_KEY=your_key_here  # For RapidAPI Judge0

# Local Executor
USE_LOCAL_EXECUTOR=true

# MongoDB
MONGODB_URI=mongodb://...
```

### Language IDs
- `71` - Python 3
- `63` - JavaScript (Node.js)
- `62` - Java
- `54` - C++
- `50` - C

---

## Performance Considerations

### Sequential Execution
- Test cases run one-by-one (not in parallel)
- Prevents resource exhaustion
- Allows early termination on compilation error

### Timeout Protection
- Default: 5000ms per test case
- Configurable via parameter
- Prevents infinite loops

### Code Wrapping Overhead
- ~100-200 bytes added per test case
- No compilation for interpreted languages

---

## Testing the Evaluation Engine

### Quick Test Example
```bash
curl -X POST http://localhost:5000/api/run-tests \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "def solution(nums, target):\n    return [0, 1]",
    "language_id": "71",
    "testCases": [
      {
        "input": {"nums": [2,7,11,15], "target": 9},
        "output": "[0,1]"
      }
    ]
  }'
```

### Submit Example
```bash
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "def solution(nums, target):\n    return [0, 1]",
    "questionId": "507f1f77bcf86cd799439011",
    "languageId": "71"
  }'
```

---

## Troubleshooting

### Issue: All tests fail with normalization error
**Solution:** Check output formatting. Use `print()` in Python, `console.log()` in JS.

### Issue: Timeout on simple code
**Solution:** Check for infinite loops or blocking operations.

### Issue: Judge0 connection fails
**Solution:** Verify `JUDGE0_HOST` is running or use cloud Judge0 with valid `JUDGE0_RAPID_KEY`.

### Issue: Hidden tests still visible
**Solution:** This shouldn't happen. Check that frontend is reading from `hiddenTests` object (which has no `results` array).

---

## Next Steps

1. **Integration into DSAInterview page:**
   ```jsx
   import CodeSubmission from '../components/CodeSubmission';
   
   <CodeSubmission questionId={question._id} starterCode={question.starterCode[languageId]} />
   ```

2. **Add progress tracking:**
   ```javascript
   const progress = getSubmissionProgress(results);
   // Progress: 2/3 (66%)
   ```

3. **Add submission history:**
   ```javascript
   GET `/api/submissions/user/{userId}`
   ```

4. **Add difficulty calculation:**
   - Track acceptance rates per question
   - Update question statistics after each submission

---

## References

- [Judge0 API Documentation](https://judge0.com/)
- [LeetCode Test Case Format](https://leetcode.com/problems/two-sum/)
- [MongooseJS Schema Guide](https://mongoosejs.com/)
