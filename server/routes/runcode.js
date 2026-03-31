const express = require("express")
const router = express.Router()
const axios = require("axios")
const { execSync, spawn } = require("child_process")
const fs = require("fs")
const path = require("path")
const os = require("os")

// Judge0 configuration
const JUDGE0_HOST = process.env.JUDGE0_HOST || "http://127.0.0.1:2358"
const USE_CLOUD_JUDGE0 = process.env.USE_CLOUD_JUDGE0 === "true"
const JUDGE0_RAPID_KEY = process.env.JUDGE0_RAPID_KEY
const JUDGE0_RAPID_HOST = "https://judge0-ce.p.rapidapi.com"
const USE_LOCAL_EXECUTOR = process.env.USE_LOCAL_EXECUTOR !== "false"

// ==================== CODE WRAPPING LOGIC ====================

/**
 * Wrap user function code with test case injection
 * Handles various input types: objects, arrays, and scalars
 * Uses positional arguments to avoid parameter name mismatches
 */
const wrapUserCode = (userCode, language, testCaseData) => {
  const input = testCaseData.input

  if (language === "71") {
    // Python: Convert input to function arguments (positional, not keyword)
    if (typeof input === "object" && input !== null && !Array.isArray(input)) {
      // Input is a dictionary - extract values in order to pass as positional args
      const values = Object.values(input).map(v => JSON.stringify(v)).join(", ")
      return `${userCode}

# Test case injection
test_input = ${JSON.stringify(input)}
result = solution(${values})
if isinstance(result, (list, tuple)):
    print(' '.join(str(x) for x in result))
else:
    print(result)`
    } else if (Array.isArray(input)) {
      // Input is an array, use *unpacking
      return `${userCode}

# Test case injection
test_input = ${JSON.stringify(input)}
result = solution(*test_input)
if isinstance(result, (list, tuple)):
    print(' '.join(str(x) for x in result))
else:
    print(result)`
    } else {
      // Scalar input
      return `${userCode}

# Test case injection
result = solution(${JSON.stringify(input)})
print(result)`
    }
  } else if (language === "63") {
    // JavaScript: Convert input to function arguments
    if (typeof input === "object" && input !== null && !Array.isArray(input)) {
      // Input is an object - extract values in order
      const values = Object.values(input).map(v => JSON.stringify(v)).join(", ")
      return `${userCode}

// Test case injection
const testInput = ${JSON.stringify(input)};
const result = solution(${values});
console.log(Array.isArray(result) ? result.join(' ') : result);`
    } else if (Array.isArray(input)) {
      // Input is an array, use spread operator
      return `${userCode}

// Test case injection
const testInput = ${JSON.stringify(input)};
const result = solution(...testInput);
console.log(Array.isArray(result) ? result.join(' ') : result);`
    } else {
      // Scalar input
      return `${userCode}

// Test case injection
const result = solution(${JSON.stringify(input)});
console.log(Array.isArray(result) ? result.join(' ') : result);`
    }
  } else if (language === "62") {
    // Java
    return userCode
  } else if (language === "54") {
    // C++
    return userCode
  }

  return userCode
}

/**
 * Enhanced normalization for output comparison
 * Handles:
 * - Removes brackets [], parentheses (), and commas
 * - Trims extra spaces and newlines
 * - Converts multiple spaces/newlines into single space
 * 
 * Examples:
 * "[0, 1]" → "0 1"
 * "(0,1)" → "0 1"
 * "0\n\n1" → "0 1"
 * "  0  ,  1  " → "0 1"
 */
const normalizeOutput = (output) => {
  if (!output) return ""
  
  let normalized = output
    .trim()                              // Remove leading/trailing whitespace
    .replace(/[\[\]()]/g, "")           // Remove brackets and parentheses: [], ()
    .replace(/,/g, " ")                 // Replace commas with spaces
    .replace(/\r\n/g, " ")              // Replace Windows newlines with spaces
    .replace(/\n/g, " ")                // Replace Unix newlines with spaces
    .replace(/\s+/g, " ")               // Replace multiple consecutive spaces with single space
    .toLowerCase()                      // Convert to lowercase for case-insensitive comparison (True->true, False->false)
    .trim()                              // Final trim
  
  return normalized
}

/**
 * Deep normalization for array-like outputs
 * Splits by whitespace and rejoins to handle various formats
 * "0 1" vs "0\n1" vs "[0, 1]" vs "(0, 1)" → all become "0 1"
 */
const deepNormalizeOutput = (output) => {
  const normalized = normalizeOutput(output)
  // Split by spaces, filter empty, rejoin
  const tokens = normalized
    .split(/\s+/)
    .filter(token => token.length > 0)
    .join(" ")
  
  return tokens
}

/**
 * Compare actual vs expected output with strict normalization
 * Returns:
 * {
 *   passed: boolean,
 *   normalizedExpected: string,
 *   normalizedActual: string,
 *   raw: { expected: string, actual: string }
 * }
 */
const compareOutputs = (actual, expected) => {
  const normalizedActual = deepNormalizeOutput(actual)
  const normalizedExpected = deepNormalizeOutput(expected)
  
  return {
    passed: normalizedActual === normalizedExpected,
    normalizedExpected: normalizedExpected,
    normalizedActual: normalizedActual,
    raw: {
      expected: expected,
      actual: actual
    }
  }
}

// ==================== LOCAL CODE EXECUTOR ====================

const executeCodeLocally = async (code, languageId, input) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "judge0-"))
  
  try {
    const languageMap = {
      "71": { name: "python", ext: ".py", cmd: "python" },
      "63": { name: "javascript", ext: ".js", cmd: "node" },
      "62": { name: "java", ext: ".java", cmd: "java" },
      "54": { name: "cpp", ext: ".cpp", cmd: "g++" }
    }

    const lang = languageMap[languageId]
    if (!lang) {
      throw new Error(`Unsupported language ID: ${languageId}`)
    }

    const filename = path.join(tmpDir, `solution${lang.ext}`)
    fs.writeFileSync(filename, code)

    return await executeWithTimeout(lang.cmd, filename, input, languageId)
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    } catch (e) {
      console.error("Cleanup error:", e.message)
    }
  }
}

const executeWithTimeout = (cmd, filename, input, languageId) => {
  return new Promise((resolve, reject) => {
    let proc
    let stdout = ""
    let stderr = ""
    let timedOut = false

    const timeout = setTimeout(() => {
      timedOut = true
      if (proc) {
        try {
          proc.kill("SIGKILL")
        } catch (e) {}
      }
      reject(new Error("Execution timeout (exceeded 5 seconds)"))
    }, 5000)

    try {
      if (languageId === "71") {
        proc = spawn("python", [filename])
      } else if (languageId === "63") {
        proc = spawn("node", [filename])
      } else if (languageId === "62") {
        try {
          execSync(`javac ${filename}`, { timeout: 5000 })
          const className = path.basename(filename, ".java")
          proc = spawn("java", ["-cp", path.dirname(filename), className])
        } catch (e) {
          clearTimeout(timeout)
          reject(new Error(`Compilation Error: ${e.message}`))
          return
        }
      } else if (languageId === "54") {
        try {
          const outputFile = path.join(path.dirname(filename), "a.out")
          execSync(`g++ ${filename} -o ${outputFile}`, { timeout: 5000 })
          proc = spawn(outputFile)
        } catch (e) {
          clearTimeout(timeout)
          reject(new Error(`Compilation Error: ${e.message}`))
          return
        }
      }

      proc.stdout.on("data", (data) => {
        stdout += data.toString()
      })

      proc.stderr.on("data", (data) => {
        stderr += data.toString()
      })

      proc.on("close", (code) => {
        clearTimeout(timeout)
        
        if (timedOut) return

        if (code !== 0 && stderr) {
          reject(new Error(stderr))
        } else {
          resolve({
            status: { id: 3, description: "Accepted" },
            stdout: stdout,
            stderr: stderr,
            compile_output: ""
          })
        }
      })

      proc.on("error", (err) => {
        clearTimeout(timeout)
        reject(err)
      })

      if (input) {
        proc.stdin.write(input)
      }
      proc.stdin.end()
    } catch (err) {
      clearTimeout(timeout)
      reject(err)
    }
  })
}

// ==================== ROUTES ====================

/**
 * Single test case execution (original endpoint)
 */
router.post("/run", async (req, res) => {
  const { code, language_id, input } = req.body

  if (!code || language_id === undefined) {
    return res.status(400).json({ error: "Code and language_id are required" })
  }

  try {
    let result

    if (USE_LOCAL_EXECUTOR) {
      try {
        result = await executeCodeLocally(code, String(language_id), input || "")
        return res.json(result)
      } catch (localError) {
        console.error("Local executor error:", localError.message)
      }
    }

    if (USE_CLOUD_JUDGE0 && JUDGE0_RAPID_KEY) {
      const response = await axios.post(
        `${JUDGE0_RAPID_HOST}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: code,
          language_id: parseInt(language_id),
          stdin: input || ""
        },
        {
          headers: {
            "X-RapidAPI-Key": JUDGE0_RAPID_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      )
      return res.json(response.data)
    }

    const response = await axios.post(
      `${JUDGE0_HOST}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: code,
        language_id: parseInt(language_id),
        stdin: input || ""
      },
      { timeout: 30000 }
    )
    return res.json(response.data)
  } catch (error) {
    console.error("Code execution error:", error.message)

    if (error.message.includes("Compilation Error") || error.message.includes("timeout")) {
      return res.status(400).json({
        status: { id: 5, description: "Compilation Error" },
        compile_output: error.message,
        error: error.message
      })
    }

    res.status(500).json({
      error: "Code execution failed",
      details: error.message
    })
  }
})

/**
 * NEW: Multiple test cases execution with automatic wrapping
 * POST /api/run-tests
 * Body: {
 *   userCode: "def solution(nums, target):\n...",
 *   language_id: "71",
 *   testCases: [
 *     { testCase: { nums: [1,2], target: 3 }, expected: "0\n1" },
 *     { testCase: { nums: [3,2,4], target: 6 }, expected: "1\n2" }
 *   ]
 * }
 */
router.post("/run-tests", async (req, res) => {
  const { userCode, language_id, testCases } = req.body

  if (!userCode || !language_id || !testCases || testCases.length === 0) {
    return res.status(400).json({
      error: "userCode, language_id, and testCases array are required"
    })
  }

  console.log(`\n📝 Running ${testCases.length} test cases for language ${language_id}`)

  const results = []
  let hasCompilationError = false
  let compilationError = ""

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    console.log(`\n[Test ${i + 1}/${testCases.length}] Testing with:`, testCase.input)

    try {
      // Wrap user code with test case
      const wrappedCode = wrapUserCode(userCode, language_id, testCase)
      console.log("Wrapped code:", wrappedCode.substring(0, 100) + "...")

      // Execute wrapped code
      let result
      if (USE_LOCAL_EXECUTOR) {
        result = await executeCodeLocally(wrappedCode, String(language_id), "")
      } else {
        const response = await axios.post(
          `${JUDGE0_HOST}/submissions?base64_encoded=false&wait=true`,
          {
            source_code: wrappedCode,
            language_id: parseInt(language_id),
            stdin: ""
          },
          { timeout: 30000 }
        )
        result = response.data
      }

      // Check for compilation errors
      if (result.status?.id === 5) {
        hasCompilationError = true
        compilationError = result.compile_output || "Compilation error"
        console.error(`❌ Compilation Error:`, compilationError)

        results.push({
          testCaseId: testCase.id || i + 1,
          passed: false,
          expected: testCase.output,
          actual: "",
          error: compilationError,
          status: "Compilation Error"
        })
        break
      }

      // Compare outputs with enhanced normalization
      const actual = result.stdout || ""
      const expected = testCase.output || ""
      const comparisonResult = compareOutputs(actual, expected)

      console.log(`Expected (raw):      "${expected}"`)
      console.log(`Actual (raw):        "${actual}"`)
      console.log(`Expected (norm):     "${comparisonResult.normalizedExpected}"`)
      console.log(`Actual (norm):       "${comparisonResult.normalizedActual}"`)
      console.log(`Result:              ${comparisonResult.passed ? "✅ PASS" : "❌ FAIL"}`)

      results.push({
        testCaseId: testCase.id || i + 1,
        passed: comparisonResult.passed,
        expected: comparisonResult.normalizedExpected,
        actual: comparisonResult.normalizedActual,
        rawExpected: expected,
        rawActual: actual,
        status: comparisonResult.passed ? "Passed" : "Failed"
      })
    } catch (error) {
      console.error(`❌ Execution Error:`, error.message)

      results.push({
        testCaseId: testCase.id || i + 1,
        passed: false,
        expected: testCase.output,
        actual: "",
        error: error.message,
        status: "Execution Error"
      })
    }
  }

  const passedCount = results.filter(r => r.passed).length
  const totalCount = results.length

  console.log(`\n📊 Summary: ${passedCount}/${totalCount} tests passed`)

  res.json({
    success: !hasCompilationError && results.every(r => r.passed === false && !r.error) === false,
    totalTests: totalCount,
    passedTests: passedCount,
    failedTests: totalCount - passedCount,
    testResults: results,
    summary: {
      passCount: passedCount,
      failCount: totalCount - passedCount,
      hasCompilationError: hasCompilationError,
      compilationError: compilationError || null
    }
  })
})

/**
 * Health check endpoint
 */
router.get("/health", async (req, res) => {
  res.json({
    status: "ok",
    service: "Local Executor + Judge0",
    localExecutor: "Enabled",
    cloudAPI: USE_CLOUD_JUDGE0 && JUDGE0_RAPID_KEY ? "Configured" : "Not Configured"
  })
})

module.exports = router