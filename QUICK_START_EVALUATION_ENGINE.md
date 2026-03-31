# Quick Start Guide - Evaluation Engine Integration

## 🚀 Getting Started in 5 Minutes

### Step 1: Verify Backend Setup

Check that your database has questions with test cases:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"message": "Server is running"}
```

### Step 2: Test with Quick API Call

Submit sample code to test the evaluation:

```bash
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "def solution(nums, target):\n    return [0, 1]",
    "questionId": "YOUR_QUESTION_ID_HERE",
    "languageId": "71"
  }'
```

Replace `YOUR_QUESTION_ID_HERE` with an actual question ID from your database.

### Step 3: Add Component to Your Page

**In your DSA Interview page:**

```jsx
import CodeSubmission from '../components/CodeSubmission';

export default function DSAInterview({ question }) {
  return (
    <div>
      <h1>{question.title}</h1>
      <p>{question.description}</p>
      
      {/* This is all you need! */}
      <CodeSubmission 
        questionId={question._id}
        starterCode={question.starterCode['71']}
      />
    </div>
  );
}
```

**Done!** The component handles everything:
- Code submission
- Evaluation
- Results display
- Error handling

---

## 📝 What You Get

### User Sees:
1. **Code Editor** with language selector
2. **Submit Button** that shows loading state
3. **Public Test Results** with detailed pass/fail info
4. **Hidden Test Summary** (counts only, no details)
5. **Compilation Errors** if any
6. **Runtime Errors** with messages

### Backend Does:
1. Fetches question from MongoDB
2. Combines public + hidden test cases
3. Evaluates code against all tests
4. Stores submission for history
5. Returns results (protects hidden tests)

---

## 🧪 Testing the System

### Test 1: Run Quick Test Endpoint

```bash
curl -X POST http://localhost:5000/api/run-tests \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "def solution(a, b):\n    return a + b",
    "language_id": "71",
    "testCases": [
      {
        "input": {"a": 1, "b": 2},
        "output": "3"
      },
      {
        "input": {"a": 5, "b": 5},
        "output": "10"
      }
    ]
  }'
```

### Test 2: Check Compilation Error Handling

```bash
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "def solution(invalid):\n    invalid syntax !!!",
    "questionId": "507f1f77bcf86cd799439011",
    "languageId": "71"
  }'
```

Expected: `compilation.success: false` with error message

### Test 3: Test with JavaScript

```bash
curl -X POST http://localhost:5000/api/run-tests \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "function solution(nums, target) { return [0, 1]; }",
    "language_id": "63",
    "testCases": [
      {
        "input": {"nums": [2,7,11,15], "target": 9},
        "output": "[0,1]"
      }
    ]
  }'
```

---

## 🔧 Integration Patterns

### Pattern 1: Simple Page Integration
```jsx
<CodeSubmission questionId={questionId} />
```

### Pattern 2: With Custom Handling
```jsx
const { submitCode, results, loading, error } = useCodeEvaluation();

const handleSubmit = async () => {
  const result = await submitCode(questionId, code, "71");
  if (result.success) {
    // Show success animation
    showConfetti();
    // Track in analytics
    trackSuccess(questionId);
    // Update user profile
    updateUserStats();
  }
};
```

### Pattern 3: With Custom UI
```jsx
<textarea value={code} onChange={setCode} />
<select value={lang} onChange={setLang}>
  <option value="71">Python</option>
  <option value="63">JavaScript</option>
</select>
<button onClick={handleSubmit} disabled={loading}>
  Submit
</button>

{results && (
  <div>
    <h2>{results.success ? '✅ Passed!' : '❌ Failed'}</h2>
    <p>Public: {results.publicTests.passed}/{results.publicTests.total}</p>
    <p>Hidden: {results.hiddenTests.passed}/{results.hiddenTests.total}</p>
  </div>
)}
```

---

## 🐍 Python Example

### Question: Two Sum
Find indices of two numbers that add up to target.

```python
# Starter code provided to user
def solution(nums, target):
    pass
```

### Test Case
```javascript
{
  input: {nums: [2, 7, 11, 15], target: 9},
  output: "[0,1]"
}
```

### User Submits
```python
def solution(nums, target):
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
```

### What Happens Internally
1. Code gets wrapped with test case:
```python
def solution(nums, target):
    # ... user code ...

test_input = {"nums": [2, 7, 11, 15], "target": 9}
result = solution(**test_input)
print(result)  # Prints [0, 1]
```

2. Output is normalized: `[0, 1]` → `0 1`
3. Compared with expected: `[0,1]` → `0 1`
4. Result: ✅ PASS

---

## 👁️ Frontend Response Structure

### Successful Submission
```javascript
{
  success: true,
  compilation: {
    success: true,
    error: null
  },
  publicTests: {
    total: 3,
    passed: 3,
    failed: 0,
    results: [
      {
        input: '...',
        expected: '0 1',
        actual: '0 1',
        passed: true,
        error: null
      }
      // ... more results
    ]
  },
  hiddenTests: {
    total: 5,
    passed: 5,
    failed: 0
    // NO results array!
  },
  message: "✅ All test cases passed!"
}
```

### Failed Submission
```javascript
{
  success: false,
  compilation: {
    success: true,
    error: null
  },
  publicTests: {
    total: 3,
    passed: 1,
    failed: 2,
    results: [
      {
        input: '{"nums":[2,7,11,15],"target":9}',
        expected: '0 1',
        actual: '1 0',  // Wrong order!
        passed: false,
        error: null
      },
      // ... more results
    ]
  },
  hiddenTests: {
    total: 5,
    passed: 3,
    failed: 2
  },
  message: "❌ 2 public test case(s) failed"
}
```

---

## ⚠️ Important Notes

### Starter Code
Always provide starter code for your questions:

```javascript
question.starterCode = {
  '71': 'def solution(nums, target):\n    pass',
  '63': 'function solution(nums, target) { return []; }',
  '62': 'class Solution { public int[] twoSum(int[] nums, int target) { } }',
  '54': 'vector<int> twoSum(vector<int>& nums, int target) { }'
}
```

### Test Case Format
Ensure test cases have `input` and `output`:

```javascript
{
  input: {nums: [2,7,11,15], target: 9},  // Can be object, array, or scalar
  output: "[0,1]"  // Always a string
}
```

### Output Normalization
The system normalizes output automatically:
- `[0, 1]` = `0 1` = `[0,1]` = `0\n1`

All are treated as equal.

### Hidden Tests Security
✅ You control what gets shown:
- Frontend sees: Test case details (input, expected, actual)
- Frontend NEVER sees: Hidden test case details
- Frontend only gets: Hidden test counts (passed/failed)

---

## 📊 Monitoring and Analytics

### Get Submission Statistics
```javascript
const stats = await Submission.getStats(userId);
console.log(stats);
// { total: 50, accepted: 42, avgTestPassed: 4.8 }
```

### Get Accepted Questions
```javascript
const accepted = await Submission.getAcceptedQuestions(userId);
// Returns questions user has solved
```

### Custom Analytics
```javascript
// Get all submissions for a question
const submissions = await Submission.find({questionId: id});
const acceptanceRate = (submissions.filter(s => s.accepted).length / submissions.length) * 100;
```

---

## 🔍 Debugging Issues

### Issue: Tests always fail
→ Check output format. Use `print()` in Python, `console.log()` in JS

### Issue: "Invalid questionId format"  
→ Make sure to use MongoDB ObjectId (24 hex characters)

### Issue: Judge0 timeout
→ Verify JUDGE0_HOST environment variable and that Judge0 service is running

### Issue: No results shown
→ Check that question ID exists and has testCases in MongoDB

---

## ✅ Checklist for Integration

- [ ] Backend: evaluationEngine.js updated
- [ ] Backend: submit.js routes updated
- [ ] Backend: Server imports submitRoutes
- [ ] Frontend: CodeSubmission.jsx component added
- [ ] Frontend: useCodeEvaluation.js hook added
- [ ] Frontend: Import and use component in DSAInterview
- [ ] Test: Call /api/run-tests endpoint manually
- [ ] Test: Call /api/submit endpoint with real question
- [ ] Verify: Hidden tests are not exposed in response
- [ ] Deploy: Push to production

---

## 📚 Documentation Files

Read these for more details:

1. **EVALUATION_ENGINE_GUIDE.md** - Complete technical reference
2. **EVALUATION_ENGINE_IMPLEMENTATION_SUMMARY.md** - What was delivered
3. **CodeSubmission.jsx comments** - Component documentation
4. **useCodeEvaluation.js comments** - Hook documentation
5. **evaluationEngine.js comments** - Backend logic documentation

---

## 🎉 You're All Set!

The evaluation engine is ready to use. Simply add the `CodeSubmission` component to your interview page and you have a full LeetCode-style testing system!

**Next Step:** Integrate into your DSAInterview page and test with real questions.
