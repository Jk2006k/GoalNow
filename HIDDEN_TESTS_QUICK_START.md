# Quick Reference: Hidden Test Cases Implementation

## What Was Changed

### Backend

#### 1. **New File:** `server/utils/submissionResponse.js`
- `formatRunCodeResponse()` - For /api/run endpoint
- `formatSubmitResponse()` - For /api/submit endpoint
- Ensures hidden test data is never leaked

#### 2. **Updated:** `server/routes/submit.js`
- Added new `POST /api/run` endpoint
  - Runs visible test cases only
  - Shows detailed results with inputs/outputs
- Updated `POST /api/submit` endpoint
  - Runs visible + hidden test cases
  - Returns only counts for hidden tests
  - Never sends hidden test inputs/outputs to frontend

### Frontend

#### **Refactored:** `client/src/components/CodeSubmission.jsx`
- Two separate action buttons:
  - **"Run Code"** (Blue) → calls `/api/run` → shows detailed results
  - **"Submit Solution"** (Green) → calls `/api/submit` → shows summary only
- Dynamic results display based on action type
- Hidden tests shown as counts only, never details

---

## How to Use

### 1. Create Questions with Hidden Tests

```javascript
await Question.create({
  title: "Merge Sorted Array",
  testCases: [
    { input: { nums1: [1, 3], nums2: [2] }, output: "1 2 3" },
    { input: { nums1: [1], nums2: [] }, output: "1" }
  ],
  hiddenTestCases: [
    { input: { nums1: [0], nums2: [0] }, output: "0 0" },
    // ... more hidden tests
  ]
});
```

### 2. Frontend Behavior

**User clicks "Run Code":**
- → Calls `POST /api/run`
- → Shows all test cases with input/expected/actual
- → User can debug with full information

**User clicks "Submit Solution":**
- → Calls `POST /api/submit`
- → Shows: Total tests, Passed tests, Failed tests
- → Says: "✅ Accepted!" or "❌ Failed - X hidden tests failed"
- → Never shows hidden test inputs or outputs

---

## API Responses

### POST /api/run (Visible Tests Only)
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
        "passed": true
      }
    ]
  },
  "message": "✅ All 3 test cases passed!"
}
```

### POST /api/submit (Visible + Hidden)
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
  "compilation": { "success": true, "error": null },
  "visibleTestDetails": null,
  "message": "✅ Accepted! All 13 test cases passed (including 10 hidden test cases)"
}
```

---

## Security Guarantees

✅ Hidden test **inputs** never sent to frontend  
✅ Hidden test **outputs** never sent to frontend  
✅ Only **counts** of hidden tests displayed  
✅ Frontend **never knows** which hidden tests failed  
✅ All evaluation happens **server-side only**  
✅ Database only stores **visible test results**  

---

## Testing Checklist

- [ ] Create a question with visible and hidden test cases
- [ ] Click "Run Code" and verify:
  - Shows all visible test case details
  - Shows pass/fail for each
  - Allows user to debug
- [ ] Click "Submit Solution" and verify:
  - Shows total test count (visible + hidden)
  - Shows pass/fail summary
  - Does NOT show hidden test inputs/outputs
  - Shows message like "X hidden tests failed" (if applicable)

---

## Files to Review

1. **Implementation Guide:** [HIDDEN_TEST_CASES_IMPLEMENTATION.md](./HIDDEN_TEST_CASES_IMPLEMENTATION.md)
   - Complete architectural overview
   - Detailed code examples
   - Security checklist
   - Troubleshooting guide

2. **Backend:** 
   - [server/utils/submissionResponse.js](./server/utils/submissionResponse.js)
   - [server/routes/submit.js](./server/routes/submit.js)

3. **Frontend:**
   - [client/src/components/CodeSubmission.jsx](./client/src/components/CodeSubmission.jsx)

---

## Key Design Decisions

1. **Separate Endpoints**
   - `/api/run` for visible tests (debugging)
   - `/api/submit` for full evaluation (final)
   - Clear separation of concerns

2. **Frontend Doesn't Know Hidden Tests Exist**
   - Only receives counts
   - Improved UX: Can't cheat
   - Better security: No data leakage risk

3. **All Evaluation Backend-Side**
   - Can't bypass with client-side tools
   - Consistent evaluation across languages
   - Easy to add new test cases

4. **Clear User Feedback**
   - "Run Code": Detailed debugging info
   - "Submit": Summary with counts
   - Familiar LeetCode-style experience

---

## Next Steps

1. ✅ **Backend routes created** - Deploy to production
2. ✅ **Frontend component updated** - Build and deploy
3. Create questions with hidden test cases
4. Test the end-to-end flow
5. Monitor success rates and acceptance rates
6. Gather feedback from users

---

## Support

For issues or questions, refer to:
- Full implementation guide: `HIDDEN_TEST_CASES_IMPLEMENTATION.md`
- Code comments in source files
- API response examples above
