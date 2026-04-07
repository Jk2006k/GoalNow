import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../services/authService"
import Editor from "@monaco-editor/react"
import "./DSAInterview.css"

export default function DSAInterview() {
  const navigate = useNavigate()

  // Get actual user ID from auth service
  const getUserId = () => {
    const user = authService.getCurrentUser()
    return user?._id || localStorage.getItem('userId') || 'anonymous'
  }

  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questionLoading, setQuestionLoading] = useState(true)
  const [questionError, setQuestionError] = useState("")
  const [language, setLanguage] = useState("71")
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState("")
  const [testCases, setTestCases] = useState([])
  const [selectedTestCase, setSelectedTestCase] = useState(0)
  const [testResults, setTestResults] = useState({})
  const [manualOutput, setManualOutput] = useState("")
  const [manualError, setManualError] = useState("")
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)
  const [testSessions, setTestSessions] = useState([])
  const [showNextButton, setShowNextButton] = useState(false)
  const [allTestsPassed, setAllTestsPassed] = useState(false)
  const [fullscreenViolation, setFullscreenViolation] = useState(false)
  const [allQuestions, setAllQuestions] = useState([])
  const [difficulty, setDifficulty] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [showTimerWarning, setShowTimerWarning] = useState(false)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setQuestionLoading(true)
        setQuestionError("")

        const selectedDifficulty = window.__goalnowDifficulty || 'easy'
        setDifficulty(selectedDifficulty)

        let questionsToLoad = []

        if (selectedDifficulty === 'prep') {
          try {
            const easyRes = await fetch("http://localhost:5000/api/questions/all?count=2&difficulty=easy")
            const mediumRes = await fetch("http://localhost:5000/api/questions/all?count=2&difficulty=medium")
            const hardRes = await fetch("http://localhost:5000/api/questions/all?count=1&difficulty=hard")

            const easyData = easyRes.ok ? await easyRes.json() : { data: [] }
            const mediumData = mediumRes.ok ? await mediumRes.json() : { data: [] }
            const hardData = hardRes.ok ? await hardRes.json() : { data: [] }

            questionsToLoad = [
              ...(easyData.data || []),
              ...(mediumData.data || []),
              ...(hardData.data || [])
            ]

            for (let i = questionsToLoad.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [questionsToLoad[i], questionsToLoad[j]] = [questionsToLoad[j], questionsToLoad[i]]
            }
          } catch (err) {
            console.error('Error fetching interview prep questions:', err)
            throw new Error('Failed to load interview prep questions')
          }
        } else {
          const response = await fetch(`http://localhost:5000/api/questions/all?count=5&difficulty=${selectedDifficulty}`)

          if (!response.ok) {
            throw new Error(`Failed to fetch questions: ${response.status}`)
          }

          const data = await response.json()
          questionsToLoad = data.data || []
        }

        if (questionsToLoad.length === 0) {
          throw new Error(`No ${selectedDifficulty} questions available`)
        }

        setAllQuestions(questionsToLoad)
        const firstQuestion = questionsToLoad[0]
        setCurrentQuestion(firstQuestion)

        if (!firstQuestion.testCases || !Array.isArray(firstQuestion.testCases)) {
          throw new Error(
            "Question data error: testCases is not an array. Make sure you've seeded the database with: node server/scripts/seedQuestions.js"
          )
        }

        if (firstQuestion.testCases.length === 0) {
          throw new Error("This question has no test cases")
        }

        const formattedTestCases = firstQuestion.testCases.map((tc, idx) => {
          if (tc.input === undefined || tc.output === undefined) {
            throw new Error(`Test case ${idx} is missing input or output property`)
          }
          return {
            id: idx,
            input: tc.input,
            output: tc.output,
            name: `Test Case ${idx + 1}`
          }
        })

        setTestCases(formattedTestCases)

        if (firstQuestion.starterCode && firstQuestion.starterCode["71"]) {
          setCode(firstQuestion.starterCode["71"])
        }
      } catch (err) {
        setQuestionError(err.message)
      } finally {
        setQuestionLoading(false)
      }
    }

    loadQuestions()
  }, [])

  const autoSubmitWithViolation = useCallback(async () => {
    if (!code.trim() || !currentQuestion) return

    setIsRunning(true)
    setError("")
    setOutput("")
    setTestResults({})
    setAllTestsPassed(false)
    setShowNextButton(false)

    try {
      const userId = getUserId()
      console.log('🔐 DSA Auto-Submit: userId=', userId, 'questionId=', currentQuestion._id)
      
      const res = await fetch("http://localhost:5000/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userCode: code,
          questionId: currentQuestion._id,
          languageId: language,
          userId: userId,
          fullscreenViolation: true
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(`Server Error (${res.status}): ${errorData.error || "Unknown error"}`)
        setIsRunning(false)
        return
      }

      const data = await res.json()

      const submissionData = data.submission || {}
      const resultsObject = {}
      const results = data.publicTests?.results || data.results || data.testResults || []

      if (Array.isArray(results)) {
        results.forEach((result, idx) => {
          if (result && typeof result === "object") {
            resultsObject[idx] = {
              passed: result.passed || false,
              expected: result.expected || "",
              actual: result.actual || "",
              error: result.error || null
            }
          }
        })
      }

      setTestResults(resultsObject)

      const passedCount = submissionData.passedTests ?? data.passed ?? data.passedTests ?? results.filter(r => r?.passed).length
      const totalCount = submissionData.totalTests ?? data.total ?? data.totalTests ?? results.length
      const acceptance = totalCount > 0 ? `${((passedCount / totalCount) * 100).toFixed(1)}%` : "0%"

      const marks = Math.min(passedCount, 3)

      setOutput(`⚠️ FULLSCREEN EXITED - Auto-submitted\n\n${passedCount}/${totalCount} tests passed (${acceptance})`)

      const sessionData = {
        questionNumber: currentQuestionNumber,
        questionId: currentQuestion._id,
        questionTitle: currentQuestion.title,
        difficulty: currentQuestion.difficulty,
        totalTests: totalCount,
        passedTests: passedCount,
        marks: marks,
        allTestsPassed: false,
        code: code,
        language: language,
        fullscreenViolation: true
      }

      const updatedSessions = [...testSessions, sessionData]
      setTestSessions(updatedSessions)

      setTimeout(() => {
        navigateToResults(updatedSessions)
      }, 2000)

      setIsRunning(false)
    } catch (err) {
      setError(`Network Error: ${err.message}`)
      setIsRunning(false)
    }
  }, [code, currentQuestion, currentQuestionNumber, language, testSessions])

  useEffect(() => {
    let hasSubmittedDueToViolation = false

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement
      
      if (!isCurrentlyFullscreen && !hasSubmittedDueToViolation) {
        hasSubmittedDueToViolation = true
        setFullscreenViolation(true)
        autoSubmitWithViolation()
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        e.preventDefault()
        if (!hasSubmittedDueToViolation) {
          hasSubmittedDueToViolation = true
          setFullscreenViolation(true)
          autoSubmitWithViolation()
        }
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("keydown", handleKeyDown, true)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [autoSubmitWithViolation])

  const languages = {
    "71": { name: "Python",     ext: ".py",   monacoLang: "python"     },
    "63": { name: "JavaScript", ext: ".js",   monacoLang: "javascript" },
    "62": { name: "Java",       ext: ".java", monacoLang: "java"       },
    "54": { name: "C++",        ext: ".cpp",  monacoLang: "cpp"        }
  }

  useEffect(() => {
    let timerInterval

    if (timerActive && timeRemaining > 0) {
      timerInterval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1
          
          if (newTime === 10 && !showTimerWarning) {
            setShowTimerWarning(true)
            setTimeout(() => setShowTimerWarning(false), 3000)
          }
          
          return newTime
        })
      }, 1000)
    } else if (timerActive && timeRemaining === 0) {
      setTimerActive(false)
      handleTimeExpired()
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  }, [timerActive, timeRemaining, showTimerWarning])

  const handleTimeExpired = async () => {
    setIsRunning(true)
    setOutput("Time expired! Auto-submitting your solution...")
    
=    if (!code.trim()) {
      setError("No code to submit")
      setIsRunning(false)
      setTimeout(() => moveToNextQuestion(), 2000)
      return
    }

    try {
      const userId = getUserId()
      console.log('📤 DSA Run Submit: userId=', userId, 'questionId=', currentQuestion._id)
      
      const res = await fetch("http://localhost:5000/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userCode: code,
          questionId: currentQuestion._id,
          languageId: language,
          userId: userId
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(`Submission Error: ${errorData.error || "Unknown error"}`)
      } else {
        const data = await res.json()
        const results = data.publicTests?.results || data.results || data.testResults || []
        const passedCount = data.submission?.passedTests ?? data.passed ?? results.filter(r => r?.passed).length
        const totalCount = data.submission?.totalTests ?? data.total ?? results.length

        const sessionData = {
          questionNumber: currentQuestionNumber,
          questionId: currentQuestion._id,
          questionTitle: currentQuestion.title,
          difficulty: currentQuestion.difficulty,
          totalTests: totalCount,
          passedTests: passedCount,
          marks: Math.min(passedCount, 3),
          allTestsPassed: false,
          code: code,
          language: language,
          timedOut: true
        }

        const updatedSessions = [...testSessions, sessionData]
        setTestSessions(updatedSessions)

        if (currentQuestionNumber >= allQuestions.length) {
          setTimeout(() => navigateToResults(updatedSessions), 1500)
        } else {
          setTimeout(() => moveToNextQuestion(), 1500)
        }
      }
    } catch (err) {
      setError(`Network Error: ${err.message}`)
      setTimeout(() => moveToNextQuestion(), 2000)
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    if (currentQuestion?.starterCode?.[language]) {
      setCode(currentQuestion.starterCode[language])
    }
    setOutput("")
    setError("")
    setTestResults({})
  }, [language, currentQuestion])

  useEffect(() => {
    if (currentQuestion && currentQuestion.difficulty) {
      const timeLimit = getTimeLimitByDifficulty(currentQuestion.difficulty)
      setTimeRemaining(timeLimit)
      setTimerActive(true)
      setShowTimerWarning(false)
    }
  }, [currentQuestion])

  const getTimeLimitByDifficulty = (diff) => {
    const limits = {
      easy: 20 * 60,    // 20 minutes
      medium: 40 * 60,  // 40 minutes
      hard: 60 * 60     // 60 minutes
    }
    return limits[diff] || limits.easy
  }

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const runWithManualInput = () => {
    // This function is no longer used - Run Code button has been removed
  }

  const runAllTests = async () => {
    if (!code.trim())       { setError("Please write some code first"); return }
    if (!currentQuestion)   { setError("Question not loaded yet");      return }

    setIsRunning(true)
    setError("")
    setOutput("")
    setTestResults({})

    try {
      const res = await fetch("http://localhost:5000/api/run-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userCode:   code,
          questionId: currentQuestion._id,
          languageId: language,
          userId:     getUserId()
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(`Server Error (${res.status}): ${errorData.error || "Unknown error"}`)
        setIsRunning(false)
        return
      }

      const data = await res.json()

      if (!data.compilation.success) {
        setError(`Compilation Error: ${data.compilation.error}`)
        setIsRunning(false)
        return
      }

      const resultsObject = {}
      const allDetails = data.allTests.details || []

      allDetails.forEach((result, idx) => {
        const typeLabel = result.type === "hidden" ? "[Hidden]" : "[Visible]"
        resultsObject[idx] = {
          passed:    result.passed  || false,
          expected:  result.expected || "",
          actual:    result.actual   || "",
          error:     result.error    || null,
          type:      result.type,
          testLabel: `${typeLabel} Test ${idx + 1}`
        }
      })

      setTestResults(resultsObject)

      const passedCount    = data.allTests.passed
      const totalCount     = data.allTests.total
      const passPercentage = totalCount > 0 ? ((passedCount / totalCount) * 100).toFixed(1) : 0

      setOutput(
        `All Tests Complete\n\n` +
        `Total: ${passedCount}/${totalCount} passed (${passPercentage}%)\n\n` +
        `Visible: ${data.allTests.summary.visible.passed}/${data.allTests.summary.visible.total} passed\n` +
        `Hidden:  ${data.allTests.summary.hidden.passed}/${data.allTests.summary.hidden.total} passed\n\n` +
        `${data.message}`
      )

      setIsRunning(false)
    } catch (err) {
      setError(`Error: ${err.message}`)
      setIsRunning(false)
    }
  }

  const handleTestCaseClick = (index) => {
    setSelectedTestCase(index)
    setOutput("")
    setError("")
  }

  const submitSolution = async () => {
    if (!code.trim())     { setError("Please write some code first"); return }
    if (!currentQuestion) { setError("Question not loaded");          return }

    setIsRunning(true)
    setError("")
    setOutput("")
    setTestResults({})
    setAllTestsPassed(false)
    setShowNextButton(false)

    try {
      const userId = getUserId()
      console.log('🎯 DSA Final Submit: userId=', userId, 'questionId=', currentQuestion._id)
      
      const res = await fetch("http://localhost:5000/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userCode:   code,
          questionId: currentQuestion._id,
          languageId: language,
          userId:     userId
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(`Server Error (${res.status}): ${errorData.error || "Unknown error"}`)
        setIsRunning(false)
        return
      }

      const data = await res.json()

      const submissionData = data.submission || {}
      const resultsObject  = {}
      const results        = data.publicTests?.results || data.results || data.testResults || []

      if (Array.isArray(results)) {
        results.forEach((result, idx) => {
          if (result && typeof result === "object") {
            resultsObject[idx] = {
              passed:   result.passed   || false,
              expected: result.expected || "",
              actual:   result.actual   || "",
              error:    result.error    || null
            }
          }
        })
      }

      setTestResults(resultsObject)

      const passedCount = submissionData.passedTests ?? data.passed ?? data.passedTests ?? results.filter(r => r?.passed).length
      const totalCount  = submissionData.totalTests  ?? data.total  ?? data.totalTests  ?? results.length
      const acceptance  = totalCount > 0 ? `${((passedCount / totalCount) * 100).toFixed(1)}%` : "0%"

      // Calculate marks: 1 mark per test case passed (max 3)
      const marks = Math.min(passedCount, 3)
      
      // Check if all tests passed (including hidden tests)
      const isAllTestsPassed = data.success || (passedCount === totalCount && totalCount > 0)

      setOutput(`${passedCount}/${totalCount} tests passed (${acceptance})`)

      // Store this question's result
      const sessionData = {
        questionNumber: currentQuestionNumber,
        questionId: currentQuestion._id,
        questionTitle: currentQuestion.title,
        difficulty: currentQuestion.difficulty,
        totalTests: totalCount,
        passedTests: passedCount,
        marks: marks,
        allTestsPassed: isAllTestsPassed,
        code: code,
        language: language,
        fullscreenViolation: false
      }

      const updatedSessions = [...testSessions, sessionData]
      setTestSessions(updatedSessions)

      // On question 3, navigate to results after any submission
      if (currentQuestionNumber === 3) {
        setTimeout(() => {
          navigateToResults(updatedSessions)
        }, 1000)
        return
      }

      if (isAllTestsPassed) {
        // All tests passed - auto advance
        setAllTestsPassed(true)
        setTimeout(() => {
          moveToNextQuestion()
        }, 1500)
      } else {
        // Not all tests passed - show Next button
        setShowNextButton(true)
      }

      if (isAllTestsPassed) {
        alert("All test cases passed! ✓")
      }
    } catch (err) {
      setError(`Network Error: ${err.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const moveToNextQuestion = () => {
    if (currentQuestionNumber < allQuestions.length) {
      // Increment question number first
      const nextQuestionIndex = currentQuestionNumber; // This is the new index (0-based)
      
      // Reset all state for new question
      setCurrentQuestionNumber(currentQuestionNumber + 1)
      setCode("")
      setOutput("")
      setError("")
      setTestResults({})
      setShowNextButton(false)
      setAllTestsPassed(false)
      
      // Load the next question from the array
      loadNewQuestion(nextQuestionIndex)
    } else {
      // All questions completed - navigate to score tracker
      navigateToResults()
    }
  }

  const loadNewQuestion = async (questionIndex) => {
    try {
      setQuestionLoading(true)
      setQuestionError("")

      // Load from the allQuestions array using the provided index (0-based)
      const nextQuestion = allQuestions[questionIndex]

      if (!nextQuestion) {
        throw new Error("Question not found")
      }

      setCurrentQuestion(nextQuestion)
      // Timer will auto-reset via the useEffect that watches currentQuestion
      setTimerActive(false) // Stop current timer
      setTimeRemaining(0) // Reset to 0 temporarily

      if (!nextQuestion.testCases || !Array.isArray(nextQuestion.testCases)) {
        throw new Error("Question data error: testCases is not an array")
      }

      if (nextQuestion.testCases.length === 0) {
        throw new Error("This question has no test cases")
      }

      const formattedTestCases = nextQuestion.testCases.map((tc, idx) => {
        if (tc.input === undefined || tc.output === undefined) {
          throw new Error(`Test case ${idx} is missing input or output property`)
        }
        return {
          id: idx,
          input: tc.input,
          output: tc.output,
          name: `Test Case ${idx + 1}`
        }
      })

      setTestCases(formattedTestCases)

      if (nextQuestion.starterCode && nextQuestion.starterCode["71"]) {
        setCode(nextQuestion.starterCode["71"])
      }
    } catch (err) {
      setQuestionError(err.message)
    } finally {
      setQuestionLoading(false)
    }
  }

  const navigateToResults = (sessionsData) => {
    // Stop all media streams (camera, screen, audio)
    try {
      // Stop camera stream
      if (navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices.enumerateDevices?.().then(() => {
          const stream = window.__goalnowCameraStream || window.__goalnowScreenStream
          if (stream) {
            stream.getTracks().forEach(track => {
              try { 
                track.stop() 
              } catch {
                // Ignore errors when stopping tracks
              }
            })
          }
        })
      }

      // Stop all video and audio elements
      document.querySelectorAll('video, audio').forEach(el => {
        if (el.srcObject) {
          el.srcObject.getTracks?.().forEach(track => {
            try { 
              track.stop() 
            } catch {
              // Ignore errors when stopping tracks
            }
          })
        }
        try { 
          el.pause() 
        } catch {
          // Ignore errors when pausing
        }
      })

      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {})
      }

      // Exit picture-in-picture
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture?.().catch(() => {})
      }
    } catch (error) {
      console.error('Error stopping media:', error)
    }

    // Store test session results in localStorage
    const sessions = sessionsData || testSessions
    const totalMarks = sessions.reduce((sum, session) => sum + session.marks, 0)
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const testResult = {
      id: uniqueId,
      timestamp: new Date().toISOString(),
      totalQuestions: 3,
      totalMarks: totalMarks,
      questions: sessions
    }
    
    console.log("Test completed:", testResult)
    localStorage.setItem("lastTestResult", JSON.stringify(testResult))
    
    // Navigate to home page
    navigate("/home", { replace: true })
  }

  return (
    <div className="dsa-interview-wrapper">
      <div className="dsa-interview-container">

        {/* Left Panel — Problem */}
        <div className="dsa-left-panel">
          {questionLoading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading question...</p>
            </div>
          ) : questionError ? (
            <div className="error-state">
              <p>Failed to load question</p>
              <p>{questionError}</p>
            </div>
          ) : currentQuestion ? (
            <>
              <div className="problem-header">
                <div>
                  <h2>{currentQuestion.title}</h2>
                  <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "4px" }}>
                    Question {currentQuestionNumber} of 3
                  </div>
                </div>
                <span className={`difficulty ${currentQuestion.difficulty}`}>
                  {currentQuestion.difficulty.charAt(0).toUpperCase() +
                    currentQuestion.difficulty.slice(1)}
                </span>
              </div>

              <div className="problem-content">
                <div>
                  <h3>Description</h3>
                  <p>{currentQuestion.description}</p>
                </div>

                <div>
                  <h3>Example</h3>
                  {testCases.length > 0 && (
                    <pre>
                      {`Input:\n${JSON.stringify(testCases[0].input, null, 2)}\n\nOutput:\n${testCases[0].output}`}
                    </pre>
                  )}
                </div>

                <div>
                  <h3>Constraints</h3>
                  <ul>
                    <li>Valid test cases exist</li>
                  </ul>
                </div>

                <div>
                  <h3>Test Cases</h3>
                  <div className="test-cases-list">
                    {testCases.map((tc, idx) => (
                      <div
                        key={tc.id}
                        className={`test-case-item ${selectedTestCase === idx ? "active" : ""} ${
                          testResults[tc.id]
                            ? testResults[tc.id].passed === true ? "passed" : "failed"
                            : ""
                        }`}
                        onClick={() => handleTestCaseClick(idx)}
                      >
                        <span className="tc-name">{tc.name || `Test ${tc.id}`}</span>
                        <span className="tc-status">
                          {testResults[tc.id] && typeof testResults[tc.id] === "object" && (
                            <span className={`indicator ${testResults[tc.id].passed === true ? "success" : "error"}`}>
                              {testResults[tc.id].passed === true ? "+" : "-"}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Middle Panel — Editor */}
        <div className="dsa-middle-panel">
          <div className="editor-header">
            <div className="language-selector">
              <label>Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {Object.entries(languages).map(([id, { name }]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <Editor
            height="100%"
            language={languages[language].monacoLang}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              minimap:               { enabled: false },
              fontSize:              13,
              fontFamily:            "'IBM Plex Mono', 'Menlo', 'Courier New', monospace",
              automaticLayout:       true,
              wordWrap:              "on",
              formatOnPaste:         true,
              formatOnType:          true,
              tabSize:               4,
              autoClosingBrackets:   "always",
              autoClosingQuotes:     "always",
              autoIndent:            "full",
              bracketPairColorization: { enabled: true },
              scrollBeyondLastLine:  false,
              lineNumbersMinChars:   3,
              padding:               { top: 16, bottom: 16 }
            }}
          />

          <div className="editor-footer">
            {fullscreenViolation && (
              <div style={{ marginRight: "auto", fontSize: "0.85rem", color: "#f16464", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
                <span style={{ fontSize: "1rem" }}>⚠️</span>
                Fullscreen Exited
              </div>
            )}
            <button className="btn btn-test-all" onClick={runAllTests}    disabled={isRunning}>
              {isRunning ? "Running..." : "Run All Tests"}
            </button>
            <button 
              className="btn btn-submit"   
              onClick={submitSolution} 
              disabled={isRunning}
              style={currentQuestionNumber === 3 ? { 
                backgroundColor: "#3ecf8e", 
                color: "#fff", 
                border: "1px solid #3ecf8e",
                marginLeft: "auto",
                fontWeight: "600"
              } : {}}
            >
              {isRunning ? (currentQuestionNumber === allQuestions.length ? "Submitting Test..." : "Submitting...") : (currentQuestionNumber === allQuestions.length ? "Submit Test" : "Submit Solution")}
            </button>
            {showNextButton && currentQuestionNumber < allQuestions.length && (
              <button 
                className="btn btn-submit" 
                onClick={moveToNextQuestion}
                style={{ marginLeft: "8px", backgroundColor: "#f39c12", color: "#fff", border: "1px solid #f39c12" }}
              >
                Next Question →
              </button>
            )}
            {allTestsPassed && (
              <div style={{ marginLeft: "auto", fontSize: "0.82rem", color: "#3ecf8e", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.2rem" }}>✓</span>
                Moving to next question...
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — Output */}
        <div className="dsa-right-panel">
          <div className="output-header">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h3 style={{ margin: 0 }}>Output</h3>
              <div style={{
                fontSize: "1.1rem",
                fontWeight: "700",
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: timeRemaining < 300 ? "#ffebee" : "#f5f5f5",
                color: timeRemaining < 300 ? "#c62828" : "#24344d",
                transition: "all 0.3s ease"
              }}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
            </div>
            {showTimerWarning && (
              <div style={{
                marginTop: "8px",
                padding: "8px 12px",
                backgroundColor: "#fff3e0",
                border: "1px solid #ffb74d",
                borderRadius: "6px",
                fontSize: "0.85rem",
                color: "#e65100",
                fontWeight: "600",
                animation: "pulse 0.5s ease-in-out"
              }}>
                ⚠️ Time running out! Less than 10 seconds remaining.
              </div>
            )}
          </div>

          {false && (
            <div className="output-section input-section" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="section-label">Custom Input</div>
              <textarea
                className="manual-input-box"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter custom input here..."
                disabled={isRunning}
                style={{ minHeight: "100px", maxHeight: "150px", overflow: "auto" }}
              />
              <button 
                className="btn btn-run-input" 
                onClick={runWithManualInput} 
                disabled={isRunning}
              >
                {isRunning ? "Running..." : "Run with Input"}
              </button>
            </div>
          )}

          {manualError && (
            <div className="output-section error" style={{ backgroundColor: "rgba(241, 100, 100, 0.10)", borderLeft: "2px solid rgb(241, 100, 100)" }}>
              <div className="section-label" style={{ color: "#f16464" }}>Error</div>
              <div className="output-content" style={{ backgroundColor: "#0f1117", borderColor: "#fcc", color: "#c33" }}>
                {manualError}
              </div>
            </div>
          )}

          {manualOutput && !manualError && (
            <div className="output-section success" style={{ backgroundColor: "rgba(62, 207, 142, 0.10)", borderLeft: "2px solid rgb(62, 207, 142)" }}>
              <div className="section-label" style={{ color: "#3ecf8e" }}>Manual Output</div>
              <div className="output-content" style={{ backgroundColor: "#0f1117", borderColor: "#cfc", color: "#3ecf8e", fontFamily: "'IBM Plex Mono', monospace" }}>
                {manualOutput}
              </div>
            </div>
          )}

          {error && (
            <div className="output-section error">
              <div className="section-label">Error</div>
              <div className="output-content">{error}</div>
            </div>
          )}

          {output && !error && (
            <div className="output-section success">
              <div className="section-label">Result</div>
              <div className="output-content">{output}</div>
            </div>
          )}

          {Object.keys(testResults).length > 0 && (
            <div className="output-section">
              <div className="section-label">Test Results</div>
              <div className="test-results">
                {testCases.map((tc) => {
                  const result = testResults[tc.id]
                  if (!result || typeof result !== "object") return null
                  return (
                    <div key={tc.id} className={`result-item ${result.passed === true ? "passed" : "failed"}`}>
                      <div className="result-header">
                        <span className={`status-icon ${result.passed === true ? "success" : "error"}`}>
                          {result.passed === true ? "+" : "-"}
                        </span>
                        <span className="test-name">{tc.name || `Test ${tc.id}`}</span>
                      </div>
                      <div className="result-details">
                        {result.error ? (
                          <div className="detail error-msg">
                            <strong>Error:</strong> {result.error}
                          </div>
                        ) : (
                          <>
                            <div className="detail">
                              <strong>Expected:</strong> {result.expected || "(empty)"}
                            </div>
                            <div className="detail">
                              <strong>Got:</strong> {result.actual || "(empty)"}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!output && !error && Object.keys(testResults).length === 0 && (
            <div className="output-placeholder">
              <p>Run your code to see output here</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
