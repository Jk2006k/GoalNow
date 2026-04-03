import { useRef, useState, useEffect } from 'react'

export function useSpeechRecognition() {
  const recognitionRef = useRef(null)
  const isMicActiveRef = useRef(false)
  const isRecognizingRef = useRef(false)
  const [transcribedText, setTranscribedText] = useState('')

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR) {
      console.log('SR is supported, initializing')
      recognitionRef.current = new SR()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.language = 'en-US'

      recognitionRef.current.onstart = () => {
        isRecognizingRef.current = true
        console.log('SR onstart: Speech recognition started listening')
      }

      recognitionRef.current.onresult = (e) => {
        console.log('SR onresult fired. resultIndex:', e.resultIndex, 'length:', e.results.length)
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0].transcript
          if (e.results[i].isFinal) {
            console.log('SR onresult final transcript:', transcript)
            setTranscribedText(p => p + ' ' + transcript)
          } else {
            console.log('SR onresult interim transcript:', transcript)
          }
        }
      }

      recognitionRef.current.onerror = (e) => {
        if (e.error === 'no-speech') {
          console.warn('SR onerror: no-speech (ignoring)')
          return
        }
        console.error('SR error event:', e.error)
      }

      recognitionRef.current.onend = () => {
        isRecognizingRef.current = false
        console.log('SR onend: Speech recognition stopped')
        if (isMicActiveRef.current) {
          console.log('SR onend: isMicActiveRef is true, attempting restart')
          try {
            recognitionRef.current?.start()
            console.log('SR onend: restart started successfully')
          } catch (err) {
            console.error('SR onend restart error:', err)
          }
        }
      }
    } else {
      console.error('Speech recognition not supported in this browser.')
    }
  }, [])

  return {
    recognitionRef,
    isMicActiveRef,
    isRecognizingRef,
    transcribedText,
    setTranscribedText
  }
}
