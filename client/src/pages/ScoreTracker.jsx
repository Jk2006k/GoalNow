import React, { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../features/shared/services/authService"
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

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60'
    if (score >= 60) return '#f39c12'
    return '#e74c3c'
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

  const fetchEvaluations = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await axios.get(
        `${API_BASE_URL}/evaluation/user-evaluations`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const evals = response.data.evaluations || []
      console.log("[ScoreTracker] Total Evals from server:", evals.length);
      
      const behavioralList = evals.filter(e => (!e.interviewType || e.interviewType === 'behavioral'))
      const technicalList = evals.filter(e => e.interviewType === 'technical')
      console.log("[ScoreTracker] Category Split - Behavioral:", behavioralList.length, "Technical:", technicalList.length);

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

    try {
      const allDsaTests = localStorage.getItem("allDsaTests")
      const savedResult = localStorage.getItem("lastTestResult")

      let existingTests = allDsaTests ? JSON.parse(allDsaTests) : []

      if (savedResult) {
        const result = JSON.parse(savedResult)
        const testAlreadyExists = existingTests.some(t => t.id === result.id)
        if (!testAlreadyExists && result.id) {
          existingTests = [result, ...existingTests]
          localStorage.setItem("allDsaTests", JSON.stringify(existingTests))
          localStorage.removeItem("lastTestResult")
        }
      }

      setDsaTests(existingTests)
    } catch (e) {
      console.error("Error loading DSA tests:", e)
      setDsaTests([])
    }
  }, [navigate])

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

    .st-page {
      min-height: 100vh;
      background: #f8f9fa;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #24344d;
    }

    .st-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 60px;
      height: 72px;
      background: #fff;
      border-bottom: 1px solid #eee;
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
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      padding: 8px 18px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      color: #555;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transition: all 0.2s;
    }

    .st-back-btn:hover {
      background: #f0f0f0;
      border-color: #ccc;
    }

    .st-nav-title {
      font-family: 'Fraunces', serif;
      font-size: 1.3rem;
      font-weight: 300;
      color: #24344d;
    }

    .st-nav-title em {
      color: #7bb600;
    }

    .st-container {
      max-width: 960px;
      margin: 0 auto;
      padding: 40px 24px 80px;
    }

    .st-stats-row {
      display: flex;
      gap: 20px;
      margin-bottom: 40px;
    }

    .st-stat-card {
      flex: 1;
      background: #fff;
      border-radius: 16px;
      padding: 24px 28px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    }

    .st-stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: #24344d;
    }

    .st-stat-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #999;
      margin-top: 4px;
    }

    .st-test-card {
      background: #fff;
      border-radius: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
      overflow: hidden;
      transition: box-shadow 0.2s;
    }

    .st-test-card:hover {
      box-shadow: 0 6px 24px rgba(0,0,0,0.1);
    }

    .st-test-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 28px;
      cursor: pointer;
      user-select: none;
    }

    .st-test-header:hover {
      background: #fafbfc;
    }

    .st-test-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .st-test-number {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #f0f7e6;
      color: #5a7a20;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .st-test-info h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #24344d;
      margin-bottom: 4px;
    }

    .st-test-meta {
      font-size: 0.78rem;
      color: #999;
    }

    .st-test-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .st-test-score {
      font-size: 1.4rem;
      font-weight: 800;
    }

    .st-test-pending-badge {
      font-size: 0.72rem;
      color: #f39c12;
      font-weight: 700;
      background: #fef5e7;
      padding: 6px 12px;
      border-radius: 6px;
    }

    .st-redcard-reason {
      margin-top: 8px;
      font-size: 0.74rem;
      color: #b03a2e;
      font-weight: 600;
      max-width: 520px;
      line-height: 1.45;
    }

    .st-test-arrow {
      font-size: 1rem;
      color: #ccc;
      transition: transform 0.2s;
    }

    .st-test-arrow.open {
      transform: rotate(180deg);
    }

    .st-questions-list {
      border-top: 1px solid #f0f0f0;
      padding: 0 28px 20px;
    }

    .st-question-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid #f5f5f5;
      cursor: pointer;
      transition: all 0.15s;
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
      gap: 14px;
      flex: 1;
      min-width: 0;
    }

    .st-q-index {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: #f0f2f5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 700;
      color: #666;
      flex-shrink: 0;
      margin-top: 2px;
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
      font-size: 0.95rem;
      font-weight: 700;
      flex-shrink: 0;
      margin-left: 16px;
    }

    .st-q-pending {
      font-size: 0.72rem;
      color: #f39c12;
      font-weight: 600;
      flex-shrink: 0;
      margin-left: 16px;
    }

    .st-q-arrow {
      color: #ccc;
      margin-left: 8px;
      flex-shrink: 0;
    }

    .st-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.45);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .st-modal {
      background: #fff;
      border-radius: 20px;
      max-width: 580px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 24px 80px rgba(0,0,0,0.25);
      position: relative;
    }

    .st-modal-top {
      padding: 32px 32px 0;
    }

    .st-modal-close {
      position: absolute;
      top: 20px; right: 20px;
      background: #f5f5f5;
      border: none;
      border-radius: 10px;
      width: 36px; height: 36px;
      font-size: 1.1rem;
      cursor: pointer;
      color: #999;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .st-modal-close:hover {
      background: #eee;
      color: #333;
    }

    .st-modal-label {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #999;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .st-modal-question {
      font-size: 1.05rem;
      font-weight: 600;
      color: #24344d;
      line-height: 1.5;
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
    }

    .st-modal-score-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #999;
      margin-top: 6px;
    }

    .st-modal-body {
      padding: 0 32px 32px;
    }

    .st-breakdown-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }

    .st-breakdown-item {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 16px 18px;
    }

    .st-breakdown-name {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #888;
      margin-bottom: 6px;
    }

    .st-breakdown-val {
      font-size: 1.4rem;
      font-weight: 800;
      color: #24344d;
    }

    .st-feedback-box {
      background: #f0f7e6;
      border-radius: 14px;
      padding: 22px 24px;
      margin-bottom: 20px;
    }

    .st-feedback-title {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #5a7a20;
      font-weight: 700;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .st-feedback-text {
      font-size: 0.88rem;
      color: #3a5010;
      line-height: 1.7;
    }

    .st-modal-date {
      font-size: 0.75rem;
      color: #bbb;
      text-align: center;
    }

    .st-empty {
      text-align: center;
      padding: 80px 20px;
    }

    .st-empty-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .st-empty-text {
      font-size: 1.1rem;
      color: #999;
      margin-bottom: 6px;
    }

    .st-empty-sub {
      font-size: 0.85rem;
      color: #bbb;
    }

    .st-loading {
      text-align: center;
      padding: 80px;
      font-size: 1rem;
      color: #999;
    }

    @media (max-width: 768px) {
      .st-nav { padding: 0 20px; }
      .st-container { padding: 24px 16px 60px; }
      .st-stats-row { flex-direction: column; gap: 12px; }
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
        <div className="st-loading">Loading your scores...</div>
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
            <div className="st-stat-value" style={{ color: getScoreColor(behavioralAvg) }}>
              <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '8px' }}>🤝</span>
              {behavioralAvg}%
            </div>
            <div className="st-stat-label">Behavioral Avg</div>
          </div>
          <div className="st-stat-card">
            <div className="st-stat-value" style={{ color: getScoreColor(technicalAvg) }}>
              <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '8px' }}>💻</span>
              {technicalAvg}%
            </div>
            <div className="st-stat-label">Technical Avg</div>
          </div>
          <div className="st-stat-card">
            <div className="st-stat-value" style={{ color: getScoreColor(dsaAvg) }}>
              <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '8px' }}>🚀</span>
              {dsaAvg}%
            </div>
            <div className="st-stat-label">DSA Avg</div>
          </div>
        </div>

        {behavioralTests.length === 0 && technicalTests.length === 0 && dsaTests.length === 0 ? (
          <div className="st-empty">
            <div className="st-empty-icon">📋</div>
            <div className="st-empty-text">No tests attempted yet</div>
            <div className="st-empty-sub">Start a behavioral, technical, or DSA interview to see your scores here.</div>
          </div>
        ) : (
          <>
            {/* BEHAVIORAL SECTION */}
            {behavioralTests.length > 0 && (
              <>
                <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px", marginTop: "40px", display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🤝</span> Behavioral Interviews
                </h2>
                {behavioralTests.map((test) => (
                  <div key={`beh-${test.testNumber}`} className="st-test-card">
                    <div
                      className="st-test-header"
                      onClick={() => setExpandedTest(expandedTest === `beh-${test.testNumber}` ? null : `beh-${test.testNumber}`)}
                    >
                      <div className="st-test-left">
                        <div className="st-test-number">{test.testNumber}</div>
                        <div className="st-test-info">
                          <h3>Behavioral Session {test.testNumber}</h3>
                          <div className="st-test-meta">
                            {formatDate(test.date)} &nbsp;·&nbsp; {test.totalQuestions} question{test.totalQuestions > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="st-test-right">
                        {test.avgScore !== null ? (
                          <span className="st-test-score" style={{ color: getScoreColor(test.avgScore) }}>
                            {test.avgScore}%
                          </span>
                        ) : (
                          <span className="st-test-pending-badge">⏳ Evaluating</span>
                        )}
                        {test.hasProctoringNote && (
                          <span className="st-test-pending-badge" style={{ background: '#fdecea', color: '#c0392b' }}>
                            🚩 Red Card
                          </span>
                        )}
                        <span className={`st-test-arrow ${expandedTest === `beh-${test.testNumber}` ? 'open' : ''}`}>▼</span>
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
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 16 }}>
                                <span className="st-q-pending" style={{ color: '#c0392b', fontWeight: 700, marginLeft: 0 }}>
                                  🚩 Malpractice Note
                                </span>
                                {!!q.redCardReasons?.length && (
                                  <span className="st-q-pending" style={{ color: '#b03a2e', maxWidth: 320, textAlign: 'right', marginLeft: 0 }}>
                                    {q.redCardReasons[0]}
                                  </span>
                                )}
                              </div>
                            ) : (q.displayScoreReady && q.score !== null) ? (
                              <span className="st-q-score" style={{ color: getScoreColor(q.score) }}>
                                {q.score}% →
                              </span>
                            ) : (
                              <span className="st-q-pending">⏳ Pending</span>
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
                <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px", marginTop: "40px", display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>💻</span> Technical Viva Interviews
                </h2>
                {technicalTests.map((test) => (
                  <div key={`tech-${test.testNumber}`} className="st-test-card">
                    <div
                      className="st-test-header"
                      onClick={() => setExpandedTest(expandedTest === `tech-${test.testNumber}` ? null : `tech-${test.testNumber}`)}
                    >
                      <div className="st-test-left">
                        <div className="st-test-number" style={{ background: '#f5f0ff', color: '#6b3dc7' }}>{test.testNumber}</div>
                        <div className="st-test-info">
                          <h3>Technical Session {test.testNumber}</h3>
                          <div className="st-test-meta">
                            {formatDate(test.date)} &nbsp;·&nbsp; {test.totalQuestions} question{test.totalQuestions > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="st-test-right">
                        {test.avgScore !== null ? (
                          <span className="st-test-score" style={{ color: getScoreColor(test.avgScore) }}>
                            {test.avgScore}%
                          </span>
                        ) : (
                          <span className="st-test-pending-badge">⏳ Evaluating</span>
                        )}
                        {test.hasProctoringNote && (
                          <span className="st-test-pending-badge" style={{ background: '#fdecea', color: '#c0392b' }}>
                            🚩 Red Card
                          </span>
                        )}
                        <span className={`st-test-arrow ${expandedTest === `tech-${test.testNumber}` ? 'open' : ''}`}>▼</span>
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
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 16 }}>
                                <span className="st-q-pending" style={{ color: '#c0392b', fontWeight: 700, marginLeft: 0 }}>
                                  🚩 Malpractice Note
                                </span>
                                {!!q.redCardReasons?.length && (
                                  <span className="st-q-pending" style={{ color: '#b03a2e', maxWidth: 320, textAlign: 'right', marginLeft: 0 }}>
                                    {q.redCardReasons[0]}
                                  </span>
                                )}
                              </div>
                            ) : (q.displayScoreReady && q.score !== null) ? (
                              <span className="st-q-score" style={{ color: getScoreColor(q.score) }}>
                                {q.score}% →
                              </span>
                            ) : (
                              <span className="st-q-pending">⏳ Pending</span>
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
            {dsaTests.length > 0 && (
              <>
                <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px", marginTop: "40px" }}>
                  DSA Interviews
                </h2>
                {/* FIX 4: Use block body arrow function with explicit return to fix JSX structure */}
                {dsaTests.map((test, testIdx) => {
                  const hasFullscreenViolation = test.questions && test.questions.some(q => q.fullscreenViolation)
                  const totalPossible = test.questions.reduce((sum, q) => sum + q.totalTests, 0)
                  const totalPassed = test.questions.reduce((sum, q) => sum + q.passedTests, 0)
                  const percentage = totalPossible > 0 ? Math.round((totalPassed / totalPossible) * 100) : 0
                  const scoreColor = percentage >= 75 ? '#3ecf8e' : percentage >= 50 ? '#f39c12' : '#e74c3c'

                  return (
                    <div key={testIdx} className="st-test-card">
                      <div
                        className="st-test-header"
                        onClick={() => setExpandedDsaTest(expandedDsaTest === testIdx ? null : testIdx)}
                      >
                        <div className="st-test-left">
                          <div className="st-test-number" style={{ background: '#e6f2ff', color: '#0066cc' }}>{testIdx + 1}</div>
                          <div className="st-test-info">
                            <h3>DSA Test {testIdx + 1}</h3>
                            <div className="st-test-meta">
                              {/* FIX 3: Use questions.length for accurate count */}
                              {formatDate(test.timestamp)} &nbsp;·&nbsp; {test.questions?.length || 0} questions
                            </div>
                          </div>
                        </div>
                        <div className="st-test-right">
                          <span className="st-test-score" style={{ color: scoreColor }}>
                            {percentage}%
                          </span>
                          {hasFullscreenViolation && (
                            <span className="st-test-pending-badge" style={{ background: '#fdecea', color: '#c0392b' }}>
                              🚩 Fullscreen Violation
                            </span>
                          )}
                          <span className={`st-test-arrow ${expandedDsaTest === testIdx ? 'open' : ''}`}>▼</span>
                        </div>
                      </div>

                      {/* FIX 4: expandedDsaTest block is now correctly INSIDE the st-test-card div */}
                      {expandedDsaTest === testIdx && (
                        <div className="st-questions-list">
                          {test.questions && test.questions.map((q, qIdx) => (
                            <div key={qIdx} className="st-question-item">
                              <div className="st-question-left">
                                <div className="st-q-index">Q{qIdx + 1}</div>
                                <div className="st-q-text" style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, marginBottom: "2px" }}>{q.questionTitle}</div>
                                  <div style={{ fontSize: "0.75rem", color: "#999", marginBottom: "4px" }}>
                                    Difficulty: <strong>{q.difficulty}</strong>
                                  </div>
                                  <div style={{ fontSize: "0.75rem", color: "#666" }}>
                                    {q.passedTests}/{q.totalTests} test cases passed
                                  </div>
                                  {q.fullscreenViolation && (
                                    <div style={{ fontSize: "0.75rem", color: "#c0392b", marginTop: "4px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                                      <span>🚩</span>
                                      <span>Fullscreen Exited - Auto Submitted</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span
                                className="st-q-score"
                                style={{
                                  color: q.fullscreenViolation
                                    ? '#c0392b'
                                    : (q.passedTests >= (q.totalTests * 0.75)
                                      ? '#3ecf8e'
                                      : q.passedTests >= (q.totalTests * 0.5)
                                        ? '#f39c12'
                                        : '#e74c3c'),
                                  flex: "0 0 auto"
                                }}
                              >
                                {q.fullscreenViolation && '⚠️ '}{Math.round((q.passedTests / q.totalTests) * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>  // closes st-test-card
                  )         // closes return
                })}         {/* closes dsaTests.map */}
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
              <div className="st-feedback-box" style={{ background: '#f8f9fa' }}>
                <div className="st-feedback-title" style={{ color: '#555' }}>🎤 Your Answer</div>
                <div className="st-feedback-text" style={{ color: '#333' }}>
                  {selectedQuestion.evaluation.transcribedAnswer || 'Answer not available.'}
                </div>
              </div>

              {selectedQuestion.evaluation.feedback && (
                <div className="st-feedback-box">
                  <div className="st-feedback-title">🤖 AI Feedback & Improvements</div>
                  <div className="st-feedback-text">{selectedQuestion.evaluation.feedback}</div>
                </div>
              )}

              {selectedQuestion.evaluation.proctoringTriggerCount >= 2 && (
                <div className="st-feedback-box" style={{ background: '#fdecea' }}>
                  <div className="st-feedback-title" style={{ color: '#c0392b' }}>⚠️ Proctoring Note</div>
                  <div className="st-feedback-text" style={{ color: '#8e2b21' }}>
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