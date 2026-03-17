import React, { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../services/authService"
import axios from "axios"

export default function ScoreTracker() {
  const navigate = useNavigate()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedTest, setExpandedTest] = useState(null)
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
      const evaluatedQuestions = group.filter(q => q.isEvaluated && q.score !== null)
      const avgScore = evaluatedQuestions.length > 0
        ? Math.round(evaluatedQuestions.reduce((sum, q) => sum + q.score, 0) / evaluatedQuestions.length)
        : null

      return {
        testNumber: idx + 1,
        date: group[0].submittedAt,
        questions: group,
        totalQuestions: group.length,
        avgScore,
        allEvaluated: group.every(q => q.isEvaluated)
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

      const grouped = groupIntoTests(response.data.evaluations)
      setTests(grouped.reverse())
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
  }, [navigate])

  useEffect(() => {
    fetchEvaluations()
  }, [fetchEvaluations])

  const totalTests = tests.length
  const overallAvg = tests.length > 0
    ? Math.round(tests.filter(t => t.avgScore !== null).reduce((s, t) => s + t.avgScore, 0) / tests.filter(t => t.avgScore !== null).length) || 0
    : 0

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

    /* DETAIL MODAL */

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
            <div className="st-stat-value">{totalTests}</div>
            <div className="st-stat-label">Tests Attempted</div>
          </div>
          <div className="st-stat-card">
            <div className="st-stat-value" style={{ color: getScoreColor(overallAvg) }}>{overallAvg}%</div>
            <div className="st-stat-label">Average Score</div>
          </div>
          <div className="st-stat-card">
            <div className="st-stat-value">
              {tests.reduce((sum, t) => sum + t.totalQuestions, 0)}
            </div>
            <div className="st-stat-label">Questions Answered</div>
          </div>
        </div>

        {tests.length === 0 ? (
          <div className="st-empty">
            <div className="st-empty-icon">📋</div>
            <div className="st-empty-text">No tests attempted yet</div>
            <div className="st-empty-sub">Start a behavioural or technical interview to see your scores here.</div>
          </div>
        ) : (
          tests.map((test) => (
            <div key={test.testNumber} className="st-test-card">
              <div
                className="st-test-header"
                onClick={() => setExpandedTest(expandedTest === test.testNumber ? null : test.testNumber)}
              >
                <div className="st-test-left">
                  <div className="st-test-number">{test.testNumber}</div>
                  <div className="st-test-info">
                    <h3>Test {test.testNumber}</h3>
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
                  <span className={`st-test-arrow ${expandedTest === test.testNumber ? 'open' : ''}`}>▼</span>
                </div>
              </div>

              {expandedTest === test.testNumber && (
                <div className="st-questions-list">
                  {test.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="st-question-item"
                      onClick={() => q.isEvaluated && fetchQuestionDetail(q._id)}
                    >
                      <div className="st-question-left">
                        <div className="st-q-index">Q{qIdx + 1}</div>
                        <div className="st-q-text">{q.question}</div>
                      </div>
                      {q.isEvaluated && q.score !== null ? (
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
          ))
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

            <div className="st-modal-score-big">
              <div className="st-modal-score-num" style={{ color: getScoreColor(selectedQuestion.evaluation.score) }}>
                {selectedQuestion.evaluation.score}<span style={{ fontSize: '1.2rem', fontWeight: 400 }}>%</span>
              </div>
              <div className="st-modal-score-label">Overall Score</div>
            </div>

            <div className="st-modal-body">
              {selectedQuestion.evaluation.scores && (
                <div className="st-breakdown-grid">
                  <div className="st-breakdown-item">
                    <div className="st-breakdown-name">Clarity</div>
                    <div className="st-breakdown-val">{selectedQuestion.evaluation.scores.clarity}</div>
                  </div>
                  <div className="st-breakdown-item">
                    <div className="st-breakdown-name">Relevance</div>
                    <div className="st-breakdown-val">{selectedQuestion.evaluation.scores.relevance}</div>
                  </div>
                  <div className="st-breakdown-item">
                    <div className="st-breakdown-name">Completeness</div>
                    <div className="st-breakdown-val">{selectedQuestion.evaluation.scores.completeness}</div>
                  </div>
                  <div className="st-breakdown-item">
                    <div className="st-breakdown-name">Professionalism</div>
                    <div className="st-breakdown-val">{selectedQuestion.evaluation.scores.professionalism}</div>
                  </div>
                </div>
              )}

              {selectedQuestion.evaluation.feedback && (
                <div className="st-feedback-box">
                  <div className="st-feedback-title">🤖 AI Feedback & Improvements</div>
                  <div className="st-feedback-text">{selectedQuestion.evaluation.feedback}</div>
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
