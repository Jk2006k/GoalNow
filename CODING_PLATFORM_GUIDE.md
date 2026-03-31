# Coding Platform Architecture Guide

## Overview
This is a **LeetCode-like coding platform** built with React (frontend) + Node.js/Express (backend) + Judge0 (code execution).

Users write **only the function definition**, and the backend automatically wraps, executes, and compares test results.

---

## System Flow

### 1. **Frontend (React) - User writes function**
```python
def solution(nums, target):
    # User only writes this function
    pass
```

### 2. **Frontend sends to Backend**
```json
{
  "userCode": "def solution(nums, target):\n    pass",
  "language_id": "71",
  "testCases": [
    {
      "id": 1,
      "testCase": { "nums": [2, 7, 11, 15], "target": 9 },
      "expected": "0\n1",
      "name": "Test Case 1"
    }
  ]
}
```

### 3. **Backend wraps code with test case**
The backend transforms:
```python
def solution(nums, target):
    pass
```

Into:
```python
def solution(nums, target):
    pass

# Test case injection
test_input = {"nums": [2, 7, 11, 15], "target": 9}
result = solution(**test_input)
print(result)
```

### 4. **Backend executes via Judge0 or Local Executor**
- Runs the wrapped code
- Captures output
- Returns: `0 1` or `[0, 1]` or however the function prints

### 5. **Output Normalization**
```
Raw Output:    "0\n1\n"
Normalized:    "0\n1"
```

Removes:
- Leading/trailing whitespace
- Extra newlines
- Inconsistent formatting

### 6. **Comparison & Results**
```
Expected: "0\n1"
Actual:   "0\n1"
Result:   ✓ PASSED
```

### 7. **Frontend displays results**
```
Test Results
✓ Test Case 1: [2,7,11,15], target=9
  Expected: 0 1
  Got:      0 1

✗ Test Case 2: [3,2,4], target=6
  Expected: 1 2
  Got:      1 3
```

---

## Backend Implementation

### New Endpoint: `POST /api/run-tests`

**Handler**: [server/routes/runcode.js](server/routes/runcode.js)

#### Request Body
```javascript
{
  userCode: string,        // User function code only
  language_id: string,     // "71" (Python), "63" (JS), etc.
  testCases: Array<{
    id: number,
    testCase: object,       // Test parameters
    expected: string,       // Expected output
    name: string
  }>
}
```

#### Response Structure
```javascript
{
  success: boolean,
  totalTests: number,
  passedTests: number,
  failedTests: number,
  testResults: Array<{
    testCaseId: number,
    passed: boolean,
    expected: string,       // Normalized
    actual: string,         // Normalized
    error: string | null,   // If compilation/runtime error
    status: string          // "Passed", "Failed", "Compilation Error", etc.
  }>,
  summary: {
    passCount: number,
    failCount: number,
    hasCompilationError: boolean,
    compilationError: string | null
  }
}
```

### Key Functions

#### 1. Code Wrapping
```javascript
const wrapUserCode = (userCode, language, testCaseData) => {
  if (language === "71") {  // Python
    return `${userCode}\ntest_input = ${JSON.stringify(testCaseData.testCase)}\nresult = solution(**test_input)\nprint(result)`;
  }
  // ... (Similar for JS, Java, C++)
}
```

#### 2. Output Normalization
```javascript
const normalizeOutput = (output) => {
  return output
    .trim()                           // Remove whitespace
    .split(/\r?\n/)                   // Split lines
    .map(line => line.trim())         // Trim each line
    .filter(line => line !== "")      // Remove empty lines
    .join("\n");                      // Rejoin consistently
}
```

#### 3. Output Comparison
```javascript
const compareOutputs = (actual, expected) => {
  return normalizeOutput(actual) === normalizeOutput(expected);
}
```

#### 4. Code Execution
- **Local Executor** (Windows/Mac/Linux): Uses Node.js `child_process` module
- **Judge0**: Local instance or RapidAPI Cloud
- **Fallback chain**: Local → Judge0 Cloud → Local Judge0

---

## Frontend Implementation

### Component: [client/src/Page/DSAInterview.jsx](client/src/Page/DSAInterview.jsx)

#### User Input
- Only function template shown
- No input/output fields visible
- Test cases defined in state

#### Test Case Structure
```javascript
const [testCases, setTestCases] = useState([
  { 
    id: 1, 
    testCase: { nums: [2, 7, 11, 15], target: 9 },
    expected: "0\n1", 
    name: "Test Case 1: [2,7,11,15], target=9" 
  },
  // ...
])
```

#### Run Tests Function
```javascript
const runAllTests = async () => {
  const res = await fetch("http://localhost:5000/api/run-tests", {
    method: "POST",
    body: JSON.stringify({
      userCode: code,              // From editor
      language_id: language,       // "71", "63", etc.
      testCases: testCases         // Test case data
    })
  });
  
  const data = await res.json();
  setTestResults(data.testResults);
}
```

#### Results Display
```jsx
{Object.keys(testResults).length > 0 && (
  <div className="output-section">
    {testCases.map((tc) => {
      const result = testResults[tc.id];
      return (
        <div className={`result-item ${result.passed ? "passed" : "failed"}`}>
          <span>{result.passed ? "✓" : "✗"} {tc.name}</span>
          <div>Expected: {result.expected}</div>
          <div>Got: {result.actual}</div>
        </div>
      );
    })}
  </div>
)}
```

---

## Supported Languages

| Language   | ID  | Execution Method           |
|----------|-----|---------------------------|
| Python   | 71  | `python` command          |
| JavaScript| 63  | `node` command            |
| Java     | 62  | `javac` + `java` command  |
| C++      | 54  | `g++` compile + run       |

---

## Error Handling

### Compilation Errors
```javascript
if (result.status?.id === 5) {  // Compilation error
  return {
    error: "Compilation Error",
    details: result.compile_output
  };
}
```

### Runtime Errors
```javascript
if (result.status?.id === 4) {  // Runtime error
  return {
    error: "Runtime Error",
    details: result.stderr
  };
}
```

### Timeout
- 5-second execution limit per test case
- Prevents infinite loops and hanging processes

---

## Configuration

### Backend `.env` file
```env
JUDGE0_HOST=http://127.0.0.1:2358         # Local Judge0
USE_LOCAL_EXECUTOR=true                    # Use child_process (default)
USE_CLOUD_JUDGE0=false                     # Use RapidAPI (optional)
JUDGE0_RAPID_KEY=your_api_key             # RapidAPI key (if using cloud)
```

### Environment Variables
- `USE_LOCAL_EXECUTOR` (default: true) - Use local code executor
- `JUDGE0_HOST` - Local Judge0 endpoint
- `USE_CLOUD_JUDGE0` - Switch to RapidAPI cloud
- `JUDGE0_RAPID_KEY` - RapidAPI authentication key

---

## Testing the System

### Manual Test
1. Go to http://localhost:5174/dsa-interview
2. Write a Python function:
   ```python
   def solution(nums, target):
       for i in range(len(nums)):
           for j in range(i + 1, len(nums)):
               if nums[i] + nums[j] == target:
                   return [i, j]
       return []
   ```
3. Click "🧪 Run All Tests"
4. See results:
   ```
   ✓ Test Case 1: [2,7,11,15], target=9
     Expected: 0\n1
     Got:      0\n1
   ```

### Test Multiple Languages
- Python: Write Python solution
- JavaScript: Change language, write JS solution
- Java: Requires full class structure
- C++: Requires vector includes

---

## Advanced Features

### Adding New Test Cases
Edit `DSAInterview.jsx`:
```javascript
{
  id: 3,
  testCase: { nums: [1, 2, 3], target: 5 },
  expected: "1\n2",
  name: "Test Case 3"
}
```

### Custom Output Format
If function returns array instead of printing:
```python
# Function returns [0, 1]
# Backend prints: [0, 1]
# Normalized: 0\n1
```

### Batch Test Execution
All tests run sequentially:
1. Test 1 → Execute → Compare → Store result
2. Test 2 → Execute → Compare → Store result
3. ... Continue for all tests
4. Return aggregate results

---

## Performance Considerations

- **Local Executor**: ~100-500ms per test (no API latency)
- **Judge0 Cloud**: ~1-3 sec per test (depends on RapidAPI performance)
- **Execution timeout**: 5 seconds per test case
- **Output normalization**: ~1ms per output

For 10 test cases:
- Local: ~1-5 seconds total
- Cloud: ~10-30 seconds total

---

## Future Enhancements

1. **Problem Database**: Store problems in MongoDB
2. **Submission History**: Track user submissions
3. **Leaderboard**: Compare solutions by performance
4. **Code Hints**: Provide hints based on failure
5. **Custom Test Cases**: Let users write test cases
6. **Performance Metrics**: Show execution time/memory
7. **Multiple Problems**: Problem selector on left
8. **Difficulty Levels**: Easy, Medium, Hard badges

---

## Troubleshooting

### "500 Internal Server Error"
- Check server is running: `npm run dev`
- Check language ID is valid
- Check test case data is valid JSON

### "Compilation Error"
- Verify syntax for selected language
- Check all imports/includes

### "Timeout"
- Function takes >5 seconds
- Infinite loop in code
- Increase timeout in `runcode.js`

### "Output mismatch"
- Check expected output format
- Verify output normalization logic
- Check for whitespace differences

---

## File Structure

```
└── GoalNow/
    ├── client/
    │   └── src/
    │       └── Page/
    │           ├── DSAInterview.jsx       # Frontend component
    │           └── DSAInterview.css       # Styling
    └── server/
        └── routes/
            └── runcode.js                 # Backend logic
                ├── wrapUserCode()         # Code wrapping
                ├── normalizeOutput()      # Output normalization
                ├── compareOutputs()       # Comparison logic
                ├── executeCodeLocally()   # Local executor
                └── POST /api/run-tests    # Main endpoint
```

---

## Summary

This architecture provides:
- ✅ Clean separation of concerns
- ✅ Automatic code wrapping
- ✅ Robust output comparison
- ✅ Multiple language support
- ✅ Error handling
- ✅ Scalable test execution
- ✅ Local and cloud execution options

The system is ready for production use with proper error handling, logging, and performance optimization.
