import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"

export default function EvaluationResults(){
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvaluation, setSelectedEvaluation] = useState(null)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://goalnow.onrender.com/api'

  const fetchEvaluations = useCallback(async (token) => {
    try {
      if (!token) return
      
      const response = await axios.get(
        `${API_BASE_URL}/evaluation/user-evaluations`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setEvaluations(response.data.evaluations)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching evaluations:', error)
      setLoading(false)
    }
  }, [API_BASE_URL])

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      fetchEvaluations(token).catch(console.error)

      // Poll for updates every 5 seconds
      const interval = setInterval(() => {
        fetchEvaluations(token).catch(console.error)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [fetchEvaluations])

  const checkResult = async (evaluationId) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await axios.get(
        `${API_BASE_URL}/evaluation/results/${evaluationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setSelectedEvaluation(response.data)
    } catch (error) {
      console.error('Error checking result:', error)
      alert('Error checking result: ' + error.message)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const css = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .evaluation-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: 'Sora', sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .evaluation-header {
      margin-bottom: 40px;
    }

    .evaluation-title {
      font-size: 2rem;
      font-weight: 700;
      color: #111111;
      margin-bottom: 8px;
    }

    .evaluation-subtitle {
      font-size: 0.95rem;
      color: #666666;
    }

    .evaluations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .evaluation-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      cursor: pointer;
      border-left: 4px solid #cccccc;
    }

    .evaluation-card:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .evaluation-card.evaluated {
      border-left-color: #2ecc71;
    }

    .evaluation-card.pending {
      border-left-color: #f39c12;
    }

    .card-question {
      font-size: 1rem;
      font-weight: 600;
      color: #111111;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #999999;
      margin-bottom: 12px;
    }

    .card-status {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .card-status.evaluated {
      background: #e8f8f5;
      color: #27ae60;
    }

    .card-status.pending {
      background: #fef5e7;
      color: #d68910;
    }

    .card-score {
      font-size: 1.8rem;
      font-weight: 700;
      color: #2ecc71;
      margin: 12px 0;
    }

    .card-button {
      width: 100%;
      padding: 10px;
      margin-top: 12px;
      background: #111111;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: background 0.2s ease;
    }

    .card-button:hover {
      background: #333333;
    }

    .card-button.view {
      background: #3498db;
    }

    .card-button.view:hover {
      background: #2980b9;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: #ffffff;
      border-radius: 12px;
      padding: 40px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      margin-bottom: 24px;
    }

    .modal-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #111111;
      margin-bottom: 8px;
    }

    .modal-close {
      position: absolute;
      top: 20px;
      right: 20px;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #999999;
    }

    .result-section {
      margin-bottom: 24px;
    }

    .result-label {
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #999999;
      margin-bottom: 8px;
    }

    .result-value {
      font-size: 1.1rem;
      color: #333333;
      line-height: 1.6;
    }

    .score-display {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2ecc71;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .score-breakdown {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 12px;
    }

    .score-item {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 8px;
    }

    .score-name {
      font-size: 0.85rem;
      color: #666666;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .score-number {
      font-size: 1.4rem;
      font-weight: 700;
      color: #111111;
    }

    .loading {
      text-align: center;
      padding: 40px;
      font-size: 1.1rem;
      color: #666666;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999999;
    }

    .empty-state-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .empty-state-text {
      font-size: 1.1rem;
      margin-bottom: 8px;
    }

    .timer-status {
      font-size: 0.9rem;
      color: #f39c12;
      font-weight: 500;
    }
  `

  if (loading) {
    return (
      <div className="evaluation-wrapper">
        <style>{css}</style>
        <div className="loading">Loading evaluations...</div>
      </div>
    )
  }

  return (
    <div className="evaluation-wrapper">
      <style>{css}</style>

      <div className="evaluation-header">
        <h1 className="evaluation-title">Interview Evaluations</h1>
        <p className="evaluation-subtitle">Your evaluation results will appear here in real-time as answers are evaluated.</p>
      </div>

      {evaluations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">No evaluations yet</div>
          <p>Start an interview to see your evaluation results here.</p>
        </div>
      ) : (
        <div className="evaluations-grid">
          {evaluations.map((evaluation, idx) => {
            return (
              <div key={idx} className={`evaluation-card ${evaluation.displayScoreReady ? 'evaluated' : 'pending'}`}>
                <div className="card-question">{evaluation.question.substring(0, 50)}...</div>
                
                <div className="card-meta">
                  <span>{formatDate(evaluation.submittedAt).split(' ').slice(0, 3).join(' ')}</span>
                  <span className={`card-status ${evaluation.displayScoreReady ? 'evaluated' : 'pending'}`}>
                    {evaluation.displayScoreReady ? '✓ Evaluated' : '⏳ Pending'}
                  </span>
                </div>

                {evaluation.displayScoreReady && evaluation.score !== null ? (
                  <div className="card-score">{evaluation.score}%</div>
                ) : (
                  <div className="timer-status">
                    🔄 Pending (AI + Proctoring)...
                  </div>
                )}

                {evaluation.displayScoreReady && evaluation.proctoringTriggerCount >= 2 && (
                  <div className="timer-status" style={{ color: '#c0392b', fontWeight: 700 }}>
                    ⚠️ Proctoring Note ({evaluation.proctoringTriggerCount || 0} triggers)
                  </div>
                )}

                <button 
                  className="card-button view"
                  onClick={() => checkResult(evaluation._id)}
                >
                  {evaluation.displayScoreReady ? 'View Results' : 'Check Status'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {selectedEvaluation && (
        <div className="modal" onClick={() => setSelectedEvaluation(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedEvaluation(null)}>✕</button>
            
            <div className="modal-header">
              <h2 className="modal-title">Evaluation Results</h2>
            </div>

            {!selectedEvaluation.isReady ? (
              <div className="result-section">
                <div className="result-label">Status</div>
                <div className="result-value">
                  🔄 Your evaluation is being processed. Please refresh to check results.
                </div>
              </div>
            ) : (
              <>
                <div className="result-section">
                  <div className="result-label">Question</div>
                  <div className="result-value">{selectedEvaluation.evaluation.question}</div>
                </div>

                <div className="result-section">
                  <div className="result-label">Your Answer</div>
                  <div className="result-value">{selectedEvaluation.evaluation.transcribedAnswer || 'Answer not available.'}</div>
                </div>

                <div className="result-section">
                  <div className="result-label">AI Feedback & Improvements</div>
                  <div className="result-value">{selectedEvaluation.evaluation.feedback}</div>
                </div>

                {selectedEvaluation.evaluation.proctoringTriggerCount >= 2 && (
                  <div className="result-section">
                    <div className="result-label">Proctoring Note</div>
                    <div className="result-value" style={{ color: '#c0392b', fontWeight: 700 }}>
                      {(selectedEvaluation.evaluation.redCardReasons && selectedEvaluation.evaluation.redCardReasons.length > 0)
                        ? selectedEvaluation.evaluation.redCardReasons.join(' | ')
                        : `Suspicious screenshot triggers were detected (${selectedEvaluation.evaluation.proctoringTriggerCount || 0}).`}
                    </div>
                  </div>
                )}

                <div className="result-section">
                  <div className="result-label">Evaluated On</div>
                  <div className="result-value">{formatDate(selectedEvaluation.evaluation.evaluatedAt)}</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
