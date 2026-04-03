import { useEffect, useRef, useState } from 'react'

export function useTimer(initialSeconds, onTimeUp) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.()
      return
    }
    const interval = setInterval(() => setTimeLeft(p => p - 1), 1000)
    return () => clearInterval(interval)
  }, [timeLeft, onTimeUp])
  
  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  
  return { timeLeft, formatTime, progressPct: ((initialSeconds - timeLeft) / initialSeconds) * 100 }
}
