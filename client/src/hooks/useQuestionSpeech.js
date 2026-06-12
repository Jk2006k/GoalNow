import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const PREFERRED_VOICE_PATTERNS = [
  /natural/i,
  /online/i,
  /google us english/i,
  /microsoft.*(jenny|aria|guy|davis)/i,
  /samantha/i,
]

function chooseProfessionalVoice(voices) {
  const englishVoices = voices.filter((voice) => /^en(-|_)?/i.test(voice.lang || ""))
  const candidates = englishVoices.length ? englishVoices : voices

  for (const pattern of PREFERRED_VOICE_PATTERNS) {
    const match = candidates.find((voice) => pattern.test(voice.name))
    if (match) return match
  }

  return candidates.find((voice) => /en-US/i.test(voice.lang || "")) || candidates[0] || null
}

export default function useQuestionSpeech(question) {
  const synthesisRef = useRef(null)
  const utteranceRef = useRef(null)
  const questionRef = useRef("")
  const statusRef = useRef("idle")
  const [voices, setVoices] = useState([])
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState(null)

  const supported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window
  const selectedVoice = useMemo(() => chooseProfessionalVoice(voices), [voices])

  const setSpeechStatus = useCallback((nextStatus) => {
    statusRef.current = nextStatus
    setStatus(nextStatus)
  }, [])

  useEffect(() => {
    if (!supported) {
      const unsupportedTimer = window.setTimeout(() => setSpeechStatus("unsupported"), 0)
      return () => window.clearTimeout(unsupportedTimer)
    }

    synthesisRef.current = window.speechSynthesis

    const loadVoices = () => {
      const availableVoices = synthesisRef.current?.getVoices?.() || []
      setVoices(availableVoices)
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      if (window.speechSynthesis.onvoiceschanged === loadVoices) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [setSpeechStatus, supported])

  const cancel = useCallback(() => {
    if (!supported) return
    try {
      synthesisRef.current?.cancel()
    } catch (speechError) {
      console.warn("Unable to cancel question speech:", speechError)
    }
    utteranceRef.current = null
  }, [supported])

  const speak = useCallback((text, { replay = false } = {}) => {
    if (!supported) {
      setStatus("unsupported")
      return
    }

    const questionText = String(text || "").trim()
    if (!questionText) {
      cancel()
      setSpeechStatus("idle")
      return
    }

    if (!replay && questionRef.current === questionText && statusRef.current === "speaking") return

    cancel()
    setError(null)
    setSpeechStatus("preparing")
    questionRef.current = questionText

    const utterance = new SpeechSynthesisUtterance(questionText)
    utterance.lang = selectedVoice?.lang || "en-US"
    utterance.voice = selectedVoice
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => setSpeechStatus("speaking")
    utterance.onpause = () => setSpeechStatus("paused")
    utterance.onresume = () => setSpeechStatus("speaking")
    utterance.onend = () => {
      utteranceRef.current = null
      setSpeechStatus("completed")
    }
    utterance.onerror = (event) => {
      utteranceRef.current = null
      const message = event.error ? `Speech playback failed: ${event.error}` : "Speech playback failed."
      setError(message)
      setSpeechStatus("error")
    }

    utteranceRef.current = utterance

    window.setTimeout(() => {
      try {
        synthesisRef.current?.speak(utterance)
      } catch (speechError) {
        utteranceRef.current = null
        setError(speechError?.message || "Speech playback failed.")
        setSpeechStatus("error")
      }
    }, 80)
  }, [cancel, selectedVoice, setSpeechStatus, supported])

  const pause = useCallback(() => {
    if (!supported || status !== "speaking") return
    synthesisRef.current?.pause()
  }, [status, supported])

  const resume = useCallback(() => {
    if (!supported || status !== "paused") return
    synthesisRef.current?.resume()
  }, [status, supported])

  const replay = useCallback(() => {
    speak(questionRef.current || question, { replay: true })
  }, [question, speak])

  useEffect(() => {
    const questionText = String(question || "").trim()
    if (!questionText) return undefined

    const speakTimer = window.setTimeout(() => {
      speak(questionText, { replay: true })
    }, 0)

    return () => {
      window.clearTimeout(speakTimer)
      cancel()
    }
  }, [cancel, question, speak])

  useEffect(() => cancel, [cancel])

  return {
    status,
    error,
    supported,
    isPreparing: status === "preparing",
    isPlaying: status === "speaking",
    isPaused: status === "paused",
    isComplete: status === "completed" || status === "unsupported" || status === "error",
    pause,
    resume,
    replay,
    cancel,
  }
}
