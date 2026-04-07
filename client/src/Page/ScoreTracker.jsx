import React, { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../services/authService"
import axios from "axios"

export default function ScoreTracker() {
  const navigate = useNavigate()
  const [behavioralTests, setBehavioralTests] = useState([])
  const [technicalTests, setTechnicalTests] = useState([])
  const [dsaTests, setDsaTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState(null)
  const [expandedTest, setExpandedTest] = useState(null)
  const [expandedDsaTest, setExpandedDsaTest] = useState(null)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [lastRefreshTime, setLastRefreshTime] = useState(null)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://goalnow.onrender.com/api'

  const getScoreColor = (score) => {
    if (score >= 80) return '#111'
    if (score >= 60) return '#444'
    return '#888'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return '#111'
    if (score >= 60) return '#555'
    return '#999'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const groupIntoTests = (evaluations) => {
    if (evaluations.length === 0) return []

    const sorted = [...evaluations].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
    const groups = []
    let currentGroup = [sorted[0]]

    for (let i = 1; i < sorted.length; i++) {
      const prevTime = new Date(sorted[i - 1].submittedAt).getTime()
      const currTime = new Date(sorted[i].submittedAt).getTime()
      const diffMinutes = (currTime - prevTime) / (1000 * 60)

      if (diffMinutes <= 30) {
        currentGroup.push(sorted[i])
      } else {
        groups.push(currentGroup)
        currentGroup = [sorted[i]]
      }
    }
    groups.push(currentGroup)

    return groups.map((group, idx) => {
      const evaluatedQuestions = group.filter(q => q.displayScoreReady && q.score !== null)
      const avgScore = evaluatedQuestions.length > 0
        ? Math.round(evaluatedQuestions.reduce((sum, q) => sum + q.score, 0) / evaluatedQuestions.length)
        : null

      const hasProctoringNote = group.some(q => q.redCard === true || (q.proctoringTriggerCount || 0) >= 2)
      const redCardReasons = [...new Set(group.flatMap((q) => q.redCardReasons || []))].slice(0, 5)

      return {
        testNumber: idx + 1,
        date: group[0].submittedAt,
        questions: group,
        totalQuestions: group.length,
        avgScore,
        allEvaluated: group.every(q => q.displayScoreReady),
        hasProctoringNote,
        redCardReasons,
        interviewType: group[0].interviewType || 'behavioral'
      }
    })
  }

  const groupDsaSubmissions = (submissions) => {
    if (submissions.length === 0) return []

    const sorted = [...submissions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    const groups = []
    let currentGroup = [sorted[0]]

    for (let i = 1; i < sorted.length; i++) {
      const prevTime = new Date(sorted[i - 1].createdAt).getTime()
      const currTime = new Date(sorted[i].createdAt).getTime()
      const diffMinutes = (currTime - prevTime) / (1000 * 60)

      // Use 5-minute threshold - questions submitted in quick succession belong to same test
      if (diffMinutes <= 5) {
        currentGroup.push(sorted[i])
      } else {
        groups.push(currentGroup)
        currentGroup = [sorted[i]]
      }
    }
    groups.push(currentGroup)

    return groups.map((group, idx) => {
      const totalQuestions = group.length
      const totalPassed = group.reduce((sum, q) => sum + q.testsPassed, 0)
      const totalTests = group.reduce((sum, q) => sum + q.totalTests, 0)
      const avgScore = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0

      return {
        testNumber: idx + 1,
        date: group[0].createdAt,
        questions: group.map((submission, qIdx) => ({
          questionNumber: qIdx + 1,
          questionTitle: submission.questionId?.title || "Unknown Question",
          questionId: submission.questionId?._id,
          difficulty: submission.questionId?.difficulty || "medium",
          totalTests: submission.totalTests,
          passedTests: submission.testsPassed,
          accepted: submission.accepted,
          language: submission.languageId,
          code: submission.code,
          timestamp: submission.createdAt
        })),
        totalQuestions,
        totalPassed,
        totalTests,
        avgScore
      }
    })
  }

  const fetchEvaluations = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await axios.get(
        `${API_BASE_URL}/evaluation/user-evaluations`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const evals = response.data.evaluations || []
      const behavioralList = evals.filter(e => (!e.interviewType || e.interviewType === 'behavioral'))
      const technicalList = evals.filter(e => e.interviewType === 'technical')

      const groupedBehavioral = groupIntoTests(behavioralList)
      const groupedTechnical = groupIntoTests(technicalList)

      setBehavioralTests(groupedBehavioral.reverse())
      setTechnicalTests(groupedTechnical.reverse())
      setLoading(false)
    } catch (error) {
      console.error('Error fetching evaluations:', error)
      setLoading(false)
    }
  }, [API_BASE_URL])

  const fetchQuestionDetail = async (evaluationId) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await axios.get(
        `${API_BASE_URL}/evaluation/results/${evaluationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.isReady) {
        setSelectedQuestion(response.data)
      }
    } catch (error) {
      console.error('Error fetching detail:', error)
    }
  }

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate("/login")
      return
    }

    // Fetch DSA tests from backend API
    const fetchDsaTests = async () => {
      try {
        const user = authService.getCurrentUser()
        if (!user || !user._id) {
          console.log('❌ No user found')
          // Load from cache as fallback
          try {
            const cachedDsaTests = localStorage.getItem("dsaTests")
            if (cachedDsaTests) {
              const existingTests = JSON.parse(cachedDsaTests)
              setDsaTests(existingTests)
            }
          } catch (e) {
            console.error('Error loading cache:', e)
          }
          return
        }

        console.log(`🔄 Fetching DSA tests for user: ${user._id}`)
        
        const response = await axios.get(
          `${API_BASE_URL}/submissions/user/${user._id}?limit=100&skip=0`,
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }
        )

        const submissions = response.data.data || []
        
        console.log('📊 API Response:', {
          success: response.data.success,
          count: response.data.count,
          total: response.data.total,
          dataLength: submissions.length,
          status: response.status
        })
        
        if (submissions.length === 0) {
          console.warn('⚠️ API returned no submissions for this user')
        } else {
          console.log('First submission:', JSON.stringify(submissions[0], null, 2).substring(0, 200))
        }
        
        // Group DSA submissions into tests (submissions within 30 minutes = same test session)
        const groupedDsaTests = groupDsaSubmissions(submissions).reverse() // Most recent first
        
        console.log('✅ Grouped DSA tests:', groupedDsaTests.length)
        setDsaTests(groupedDsaTests)
        
        // Cache to localStorage for fallback
        try {
          localStorage.setItem("dsaTests", JSON.stringify(groupedDsaTests))
          console.log('💾 Cached DSA tests to localStorage')
        } catch (e) {
          console.warn('⚠️ Could not cache to localStorage:', e)
        }
        
        setLastRefreshTime(new Date().toLocaleString())
      } catch (error) {
        console.error("❌ Error fetching DSA tests from API:", {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data
        })
        
        // Fallback to localStorage if API fails
        console.log('📦 Attempting fallback to localStorage...')
        try {
          const cachedDsaTests = localStorage.getItem("dsaTests")
          if (cachedDsaTests) {
            const existingTests = JSON.parse(cachedDsaTests)
            console.log('✅ Loaded', existingTests.length, 'tests from cache')
            setDsaTests(existingTests)
          } else {
            console.log('⚠️ No cached DSA tests found in localStorage')
            setDsaTests([])
          }
        } catch (cacheError) {
          console.error("❌ Error loading cached tests:", cacheError)
          setDsaTests([])
        }
      }
    }

    fetchDsaTests()
    
    // Also load cached data immediately for instant UI
    try {
      const cachedDsaTests = localStorage.getItem("dsaTests")
      if (cachedDsaTests) {
        const existingTests = JSON.parse(cachedDsaTests)
        console.log('📦 Loaded cached DSA tests immediately:', existingTests.length)
        setDsaTests(existingTests)
      }
    } catch (e) {
      console.warn('Could not load cache on startup:', e)
    }

    // Listen for window focus - aggressive refresh when user returns
    const handleWindowFocus = () => {
      console.log('🪟 Window focused, refreshing DSA tests...')
      fetchDsaTests()
    }

    // Listen for visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📄 Page became visible, refreshing DSA tests...')
        fetchDsaTests()
      }
    }

    // Refresh every 30 seconds (less aggressive polling)
    const refreshInterval = setInterval(() => {
      console.log('⏱️ Auto-refresh interval triggered')
      fetchDsaTests()
    }, 30000)

    window.addEventListener('focus', handleWindowFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(refreshInterval)
    }
  }, [navigate, API_BASE_URL, refreshTrigger])

  useEffect(() => {
    fetchEvaluations()
  }, [fetchEvaluations])

  const dsaAvg = (() => {
    const totalPossible = dsaTests.reduce((sum, t) => sum + (t.questions?.reduce((qSum, q) => qSum + q.totalTests, 0) || 0), 0)
    const totalPassed = dsaTests.reduce((sum, t) => sum + (t.questions?.reduce((qSum, q) => qSum + q.passedTests, 0) || 0), 0)
    return totalPossible > 0 ? Math.round((totalPassed / totalPossible) * 100) : 0
  })()

  const behavioralAvg = (() => {
    const evaluated = behavioralTests.filter(t => t.avgScore !== null)
    return evaluated.length > 0
      ? Math.round(evaluated.reduce((s, t) => s + t.avgScore, 0) / evaluated.length)
      : 0
  })()

  const technicalAvg = (() => {
    const evaluated = technicalTests.filter(t => t.avgScore !== null)
    return evaluated.length > 0
      ? Math.round(evaluated.reduce((s, t) => s + t.avgScore, 0) / evaluated.length)
      : 0
  })()

  const totalQuestionsAnswered =
    behavioralTests.reduce((sum, t) => sum + t.totalQuestions, 0) +
    technicalTests.reduce((sum, t) => sum + t.totalQuestions, 0) +
    dsaTests.reduce((sum, t) => sum + (t.questions?.length || 0), 0)

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300;1,9..144,400&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.97); }
      to   { opacity: 1; transform: scale(1); }
    }

    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    .st-page {
      min-height: 100vh;
      background: #f5f5f5;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #111;
      animation: fadeIn 0.4s ease;
    }

    .st-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 60px;
      height: 72px;
      background: #fff;
      border-bottom: 1px solid #e8e8e8;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .st-nav-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .st-back-btn {
      background: none;
      border: 1.5px solid #ddd;
      border-radius: 10px;
      padding: 8px 18px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      color: #444;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transition: all 0.2s ease;
      letter-spacing: 0.01em;
    }

    .st-back-btn:hover {
      background: #f0f0f0;
      border-color: #bbb;
      transform: translateX(-2px);
    }

    .st-nav-title {
      font-family: 'Fraunces', serif;
      font-size: 1.3rem;
      font-weight: 300;
      color: #111;
    }

    .st-nav-title em {
      font-style: italic;
      color: #555;
    }

    .st-container {
      max-width: 960px;
      margin: 0 auto;
      padding: 40px 24px 80px;
    }

    .st-stats-row {
      display: flex;
      gap: 16px;
      margin-bottom: 48px;
    }

    .st-stat-card {
      flex: 1;
      background: #fff;
      border-radius: 16px;
      padding: 28px 28px 24px;
      border: 1px solid #e8e8e8;
      position: relative;
      overflow: hidden;
      animation: fadeInUp 0.5s ease both;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .st-stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    }

    .st-stat-card:nth-child(1) { animation-delay: 0.05s; }
    .st-stat-card:nth-child(2) { animation-delay: 0.1s; }
    .st-stat-card:nth-child(3) { animation-delay: 0.15s; }

    .st-stat-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: #111;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }

    .st-stat-card:hover::before {
      transform: scaleX(1);
    }

    .st-stat-value {
      font-size: 2.2rem;
      font-weight: 800;
      color: #111;
      letter-spacing: -0.02em;
    }

    .st-stat-label {
      font-size: 0.70rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #aaa;
      margin-top: 6px;
      font-weight: 600;
    }

    .st-section-heading {
      font-size: 0.78rem;
      font-weight: 700;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 16px;
      margin-top: 48px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .st-section-heading::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e8e8e8;
    }

    .st-section-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #111;
      flex-shrink: 0;
    }

    .st-test-card {
      background: #fff;
      border-radius: 14px;
      margin-bottom: 10px;
      border: 1px solid #e8e8e8;
      overflow: hidden;
      transition: box-shadow 0.25s ease, border-color 0.25s ease;
      animation: fadeInUp 0.4s ease both;
    }

    .st-test-card:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.07);
      border-color: #ccc;
    }

    .st-test-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 22px 24px;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s ease;
    }

    .st-test-header:hover {
      background: #fafafa;
    }

    .st-test-left {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .st-test-number {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #111;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1rem;
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }

    .st-test-card:hover .st-test-number {
      transform: scale(1.05);
    }

    .st-test-number.tech {
      background: #000000;
    }

    .st-test-number.dsa {
      background: #000000;
    }

    .st-test-info h3 {
      font-size: 0.95rem;
      font-weight: 700;
      color: #111;
      margin-bottom: 3px;
    }

    .st-test-meta {
      font-size: 0.76rem;
      color: #aaa;
      letter-spacing: 0.01em;
    }

    .st-test-right {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .st-test-score {
      font-size: 1.3rem;
      font-weight: 800;
      color: #111;
      letter-spacing: -0.02em;
    }

    .st-test-pending-badge {
      font-size: 0.70rem;
      color: #888;
      font-weight: 700;
      background: #f0f0f0;
      padding: 5px 10px;
      border-radius: 6px;
      letter-spacing: 0.03em;
    }

    .st-test-pending-badge.flag {
      background: #f0f0f0;
      color: #333;
      border: 1px solid #ddd;
    }

    .st-test-arrow {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #888;
      font-size: 0.6rem;
      transition: transform 0.25s ease, background 0.2s ease;
    }

    .st-test-arrow.open {
      transform: rotate(180deg);
      background: #111;
      color: #fff;
    }

    .st-questions-list {
      border-top: 1px solid #f0f0f0;
      padding: 0 24px 16px;
      animation: slideDown 0.25s ease;
    }

    .st-question-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 0;
      border-bottom: 1px solid #f5f5f5;
      cursor: pointer;
      transition: padding-left 0.2s ease, opacity 0.15s ease;
    }

    .st-question-item:last-child {
      border-bottom: none;
    }

    .st-question-item:hover {
      padding-left: 8px;
    }

    .st-question-left {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .st-q-index {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.68rem;
      font-weight: 700;
      color: #666;
      flex-shrink: 0;
      margin-top: 1px;
      transition: background 0.2s ease;
    }

    .st-question-item:hover .st-q-index {
      background: #e0e0e0;
    }

    .st-q-text {
      font-size: 0.85rem;
      color: #333;
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 500px;
    }

    .st-q-score {
      font-size: 0.92rem;
      font-weight: 800;
      flex-shrink: 0;
      margin-left: 16px;
      color: #111;
      letter-spacing: -0.01em;
    }

    .st-q-pending {
      font-size: 0.70rem;
      color: #aaa;
      font-weight: 600;
      flex-shrink: 0;
      margin-left: 16px;
      letter-spacing: 0.03em;
    }

    .st-score-bar {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .st-score-pill {
      display: inline-block;
      width: 32px;
      height: 4px;
      border-radius: 2px;
      background: #e8e8e8;
      overflow: hidden;
      vertical-align: middle;
    }

    .st-score-pill-fill {
      height: 100%;
      background: #111;
      border-radius: 2px;
      transition: width 0.6s ease;
    }

    .st-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.35);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }

    .st-modal {
      background: #fff;
      border-radius: 20px;
      max-width: 560px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      position: relative;
      animation: scaleIn 0.25s ease;
    }

    .st-modal-top {
      padding: 32px 32px 0;
    }

    .st-modal-close {
      position: absolute;
      top: 20px; right: 20px;
      background: #f5f5f5;
      border: none;
      border-radius: 8px;
      width: 34px; height: 34px;
      font-size: 1rem;
      cursor: pointer;
      color: #888;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease, color 0.15s ease;
      font-weight: 500;
    }

    .st-modal-close:hover {
      background: #111;
      color: #fff;
    }

    .st-modal-label {
      font-size: 0.67rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #aaa;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .st-modal-question {
      font-size: 1rem;
      font-weight: 700;
      color: #111;
      line-height: 1.55;
      margin-bottom: 24px;
    }

    .st-modal-score-big {
      text-align: center;
      padding: 20px 0 24px;
    }

    .st-modal-score-num {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1;
      color: #111;
      letter-spacing: -0.03em;
    }

    .st-modal-score-label {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #aaa;
      margin-top: 8px;
      font-weight: 600;
    }

    .st-modal-body {
      padding: 0 32px 32px;
    }

    .st-breakdown-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }

    .st-breakdown-item {
      background: #f7f7f7;
      border-radius: 10px;
      padding: 14px 16px;
      border: 1px solid #efefef;
    }

    .st-breakdown-name {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #aaa;
      margin-bottom: 6px;
      font-weight: 600;
    }

    .st-breakdown-val {
      font-size: 1.4rem;
      font-weight: 800;
      color: #111;
    }

    .st-feedback-box {
      background: #f7f7f7;
      border-radius: 12px;
      padding: 20px 22px;
      margin-bottom: 14px;
      border: 1px solid #efefef;
      transition: background 0.2s ease;
    }

    .st-feedback-box:hover {
      background: #f2f2f2;
    }

    .st-feedback-box.answer {
      border-left: 3px solid #111;
    }

    .st-feedback-box.ai {
      border-left: 3px solid #555;
    }

    .st-feedback-box.warning {
      border-left: 3px solid #888;
      background: #f9f9f9;
    }

    .st-feedback-title {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #555;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .st-feedback-text {
      font-size: 0.88rem;
      color: #333;
      line-height: 1.75;
    }

    .st-modal-date {
      font-size: 0.74rem;
      color: #ccc;
      text-align: center;
      padding-top: 8px;
    }

    .st-empty {
      text-align: center;
      padding: 100px 20px;
      animation: fadeInUp 0.5s ease;
    }

    .st-empty-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #f0f0f0;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .st-empty-icon svg {
      width: 22px;
      height: 22px;
      stroke: #aaa;
    }

    .st-empty-text {
      font-size: 1.05rem;
      color: #555;
      font-weight: 600;
      margin-bottom: 6px;
    }

    .st-empty-sub {
      font-size: 0.84rem;
      color: #bbb;
    }

    .st-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 16px;
    }

    .st-spinner {
      width: 28px;
      height: 28px;
      border: 2.5px solid #e0e0e0;
      border-top-color: #111;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .st-loading-text {
      font-size: 0.85rem;
      color: #aaa;
      letter-spacing: 0.04em;
    }

    .st-divider {
      width: 1px;
      height: 20px;
      background: #e8e8e8;
    }

    @media (max-width: 768px) {
      .st-nav { padding: 0 20px; }
      .st-container { padding: 24px 16px 60px; }
      .st-stats-row { flex-direction: column; gap: 10px; }
      .st-test-header { padding: 18px 20px; }
      .st-questions-list { padding: 0 20px 16px; }
      .st-q-text { max-width: 200px; }
      .st-modal-top, .st-modal-body { padding-left: 20px; padding-right: 20px; }
    }
  `

  if (loading) {
    return (
      <div className="st-page">
        <style>{css}</style>
        <div className="st-loading">
          <div className="st-spinner" />
          <div className="st-loading-text">Loading your scores</div>
        </div>
      </div>
    )
  }

  return (
    <div className="st-page">
      <style>{css}</style>

      <nav className="st-nav">
        <div className="st-nav-left">
          <button className="st-back-btn" onClick={() => navigate("/home")}>← Back</button>
          <h1 className="st-nav-title">Score <em>Tracker</em></h1>
        </div>
      </nav>

      <div className="st-container">

        <div className="st-stats-row">
          <div className="st-stat-card">
            <div className="st-stat-value">{behavioralAvg}%</div>
            <div className="st-stat-label">Behavioral Avg</div>
          </div>
          <div className="st-stat-card">
            <div className="st-stat-value">{technicalAvg}%</div>
            <div className="st-stat-label">Technical Avg</div>
          </div>
          <div className="st-stat-card">
            <div className="st-stat-value">{dsaAvg}%</div>
            <div className="st-stat-label">DSA Avg</div>
          </div>
        </div>

        {behavioralTests.length === 0 && technicalTests.length === 0 && dsaTests.length === 0 ? (
          <div className="st-empty">
            <div className="st-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <line x1="8" y1="9" x2="16" y2="9" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="12" y2="17" />
              </svg>
            </div>
            <div className="st-empty-text">No tests attempted yet</div>
            <div className="st-empty-sub">Complete a behavioral, technical, or DSA interview to see your scores here.</div>
          </div>
        ) : (
          <>
            {/* BEHAVIORAL SECTION */}
            {behavioralTests.length > 0 && (
              <>
                <div className="st-section-heading">
                  <span className="st-section-dot" />
                  Behavioral Interviews
                </div>
                {behavioralTests.map((test, i) => (
                  <div key={`beh-${test.testNumber}`} className="st-test-card" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div
                      className="st-test-header"
                      onClick={() => setExpandedTest(expandedTest === `beh-${test.testNumber}` ? null : `beh-${test.testNumber}`)}
                    >
                      <div className="st-test-left">
                        <div className="st-test-number">{test.testNumber}</div>
                        <div className="st-test-info">
                          <h3>Behavioral Session {test.testNumber}</h3>
                          <div className="st-test-meta">
                            {formatDate(test.date)} &nbsp;&middot;&nbsp; {test.totalQuestions} question{test.totalQuestions > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="st-test-right">
                        {test.avgScore !== null ? (
                          <span className="st-test-score">{test.avgScore}%</span>
                        ) : (
                          <span className="st-test-pending-badge">Evaluating...</span>
                        )}
                        {test.hasProctoringNote && (
                          <span className="st-test-pending-badge flag">Red Card</span>
                        )}
                        <div className={`st-test-arrow ${expandedTest === `beh-${test.testNumber}` ? 'open' : ''}`}>▼</div>
                      </div>
                    </div>

                    {expandedTest === `beh-${test.testNumber}` && (
                      <div className="st-questions-list">
                        {test.questions.map((q, qIdx) => (
                          <div
                            key={qIdx}
                            className="st-question-item"
                            onClick={() => (q.displayScoreReady && q.score !== null) && fetchQuestionDetail(q._id)}
                          >
                            <div className="st-question-left">
                              <div className="st-q-index">Q{qIdx + 1}</div>
                              <div className="st-q-text">{q.question}</div>
                            </div>
                            {((q.proctoringTriggerCount || 0) >= 2) ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 16, gap: 2 }}>
                                <span className="st-q-pending" style={{ color: '#555', fontWeight: 700, marginLeft: 0 }}>
                                  Malpractice Note
                                </span>
                                {!!q.redCardReasons?.length && (
                                  <span className="st-q-pending" style={{ color: '#888', maxWidth: 320, textAlign: 'right', marginLeft: 0 }}>
                                    {q.redCardReasons[0]}
                                  </span>
                                )}
                              </div>
                            ) : (q.displayScoreReady && q.score !== null) ? (
                              <span className="st-q-score">{q.score}% →</span>
                            ) : (
                              <span className="st-q-pending">Pending</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* TECHNICAL SECTION */}
            {technicalTests.length > 0 && (
              <>
                <div className="st-section-heading">
                  <span className="st-section-dot" />
                  Technical Viva Interviews
                </div>
                {technicalTests.map((test, i) => (
                  <div key={`tech-${test.testNumber}`} className="st-test-card" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div
                      className="st-test-header"
                      onClick={() => setExpandedTest(expandedTest === `tech-${test.testNumber}` ? null : `tech-${test.testNumber}`)}
                    >
                      <div className="st-test-left">
                        <div className="st-test-number tech">{test.testNumber}</div>
                        <div className="st-test-info">
                          <h3>Technical Session {test.testNumber}</h3>
                          <div className="st-test-meta">
                            {formatDate(test.date)} &nbsp;&middot;&nbsp; {test.totalQuestions} question{test.totalQuestions > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="st-test-right">
                        {test.avgScore !== null ? (
                          <span className="st-test-score">{test.avgScore}%</span>
                        ) : (
                          <span className="st-test-pending-badge">Evaluating...</span>
                        )}
                        {test.hasProctoringNote && (
                          <span className="st-test-pending-badge flag">Red Card</span>
                        )}
                        <div className={`st-test-arrow ${expandedTest === `tech-${test.testNumber}` ? 'open' : ''}`}>▼</div>
                      </div>
                    </div>

                    {expandedTest === `tech-${test.testNumber}` && (
                      <div className="st-questions-list">
                        {test.questions.map((q, qIdx) => (
                          <div
                            key={qIdx}
                            className="st-question-item"
                            onClick={() => (q.displayScoreReady && q.score !== null) && fetchQuestionDetail(q._id)}
                          >
                            <div className="st-question-left">
                              <div className="st-q-index">Q{qIdx + 1}</div>
                              <div className="st-q-text">{q.question}</div>
                            </div>
                            {((q.proctoringTriggerCount || 0) >= 2) ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 16, gap: 2 }}>
                                <span className="st-q-pending" style={{ color: '#555', fontWeight: 700, marginLeft: 0 }}>
                                  Malpractice Note
                                </span>
                                {!!q.redCardReasons?.length && (
                                  <span className="st-q-pending" style={{ color: '#888', maxWidth: 320, textAlign: 'right', marginLeft: 0 }}>
                                    {q.redCardReasons[0]}
                                  </span>
                                )}
                              </div>
                            ) : (q.displayScoreReady && q.score !== null) ? (
                              <span className="st-q-score">{q.score}% →</span>
                            ) : (
                              <span className="st-q-pending">Pending</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* DSA SECTION */}
            {dsaTests.length > 0 ? (
              <>
                <div className="st-section-heading">
                  <span className="st-section-dot" />
                  DSA Interviews
                </div>
                {dsaTests.map((test, testIdx) => {
                  return (
                    <div key={testIdx} className="st-test-card" style={{ animationDelay: `${testIdx * 0.05}s` }}>
                      <div
                        className="st-test-header"
                        onClick={() => setExpandedDsaTest(expandedDsaTest === testIdx ? null : testIdx)}
                      >
                        <div className="st-test-left">
                          <div className="st-test-number dsa">{testIdx + 1}</div>
                          <div className="st-test-info">
                            <h3>DSA Test {testIdx + 1}</h3>
                            <div className="st-test-meta">
                              {formatDate(test.date)} &nbsp;&middot;&nbsp; {test.totalQuestions} questions
                            </div>
                          </div>
                        </div>
                        <div className="st-test-right">
                          <span className="st-test-score">{test.avgScore}%</span>
                          <div className={`st-test-arrow ${expandedDsaTest === testIdx ? 'open' : ''}`}>▼</div>
                        </div>
                      </div>

                      {expandedDsaTest === testIdx && (
                        <div className="st-questions-list">
                          {test.questions && test.questions.map((q, qIdx) => {
                            const qPct = q.totalTests > 0 ? Math.round((q.passedTests / q.totalTests) * 100) : 0
                            const difficultyColor = {
                              'easy': '#27ae60',
                              'medium': '#f39c12',
                              'hard': '#e74c3c'
                            }[q.difficulty?.toLowerCase()] || '#888'
                            
                            return (
                              <div key={qIdx} className="st-question-item">
                                <div className="st-question-left">
                                  <div className="st-q-index">Q{qIdx + 1}</div>
                                  <div className="st-q-text" style={{ flex: 1, whiteSpace: 'normal' }}>
                                    <div style={{ fontWeight: 600, marginBottom: "2px", fontSize: '0.85rem' }}>{q.questionTitle}</div>
                                    <div style={{ fontSize: "0.73rem", color: "#aaa", marginBottom: "2px" }}>
                                      Difficulty: <strong style={{ color: difficultyColor }}>{q.difficulty}</strong>
                                    </div>
                                    <div style={{ fontSize: "0.73rem", color: "#888" }}>
                                      {q.passedTests}/{q.totalTests} test cases passed
                                    </div>
                                  </div>
                                </div>
                                <span className="st-q-score">
                                  {qPct}%
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            ) : (
              <>
                <div className="st-section-heading">
                  <span className="st-section-dot" />
                  DSA Interviews
                </div>
                <div style={{ 
                  padding: '24px', 
                  textAlign: 'center', 
                  color: '#aaa',
                  background: '#f9f9f9',
                  borderRadius: '12px',
                  marginTop: '16px'
                }}>
                  <p style={{ marginBottom: '12px' }}>No DSA tests found</p>
                  <p style={{ fontSize: '0.85rem', color: '#999' }}>
                    ✓ Click the <strong>Refresh</strong> button to fetch your submissions<br/>
                    ✓ Or complete a DSA test to see results here
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {selectedQuestion && selectedQuestion.isReady && (
        <div className="st-modal-overlay" onClick={() => setSelectedQuestion(null)}>
          <div className="st-modal" onClick={e => e.stopPropagation()}>
            <button className="st-modal-close" onClick={() => setSelectedQuestion(null)}>✕</button>

            <div className="st-modal-top">
              <div className="st-modal-label">Question</div>
              <div className="st-modal-question">{selectedQuestion.evaluation.question || 'Interview Question'}</div>
            </div>

            <div className="st-modal-body">
              <div className="st-feedback-box answer">
                <div className="st-feedback-title">Your Answer</div>
                <div className="st-feedback-text">
                  {selectedQuestion.evaluation.transcribedAnswer || 'Answer not available.'}
                </div>
              </div>

              {selectedQuestion.evaluation.feedback && (
                <div className="st-feedback-box ai">
                  <div className="st-feedback-title">AI Feedback & Improvements</div>
                  <div className="st-feedback-text">{selectedQuestion.evaluation.feedback}</div>
                </div>
              )}

              {selectedQuestion.evaluation.proctoringTriggerCount >= 2 && (
                <div className="st-feedback-box warning">
                  <div className="st-feedback-title">Proctoring Note</div>
                  <div className="st-feedback-text">
                    {(selectedQuestion.evaluation.redCardReasons && selectedQuestion.evaluation.redCardReasons.length > 0)
                      ? selectedQuestion.evaluation.redCardReasons.join(' | ')
                      : 'Suspicious screenshot triggers were detected during proctoring.'}
                  </div>
                </div>
              )}

              <div className="st-modal-date">
                Evaluated on {formatDate(selectedQuestion.evaluation.evaluatedAt)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}