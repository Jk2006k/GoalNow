import React from 'react'

export function InterviewHeader({ timeLeft, formatTime, onExit }) {
  return (
    <div className="hdr">
      <div className="hlogo">Intbar.</div>
      <div className="hright">
        <span className="htmr">{formatTime(timeLeft)}</span>
        <button className="hexit" onClick={onExit}>Exit Test</button>
      </div>
    </div>
  )
}
