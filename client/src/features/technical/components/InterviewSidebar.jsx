import React from 'react'

export function InterviewSidebar({ timeLeft, formatTime, progressPct, answeredQuestions, currentQuestion, NUM_Q, onQuestionSelect }) {
  return (
    <div className="lft">
      <div className="tlbl">Time Left</div>
      <div className="tdsp">{formatTime(timeLeft)}</div>
      <div className="ptrk">
        <div className="pfll" style={{ height: `${progressPct}%` }} />
      </div>
    </div>
  )
}
