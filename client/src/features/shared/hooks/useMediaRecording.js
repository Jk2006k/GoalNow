import { useRef, useCallback } from 'react'
import apiClient from '../../../../services/authService'

export function useMediaRecording() {
  const interviewVideoRecorderRef = useRef(null)
  const interviewVideoChunksRef = useRef([])
  const interviewVideoStartedAtRef = useRef(null)

  const startInterviewVideoRecording = useCallback(() => {
    const stream = window.__goalnowScreenStream
    if (!stream || !stream.getTracks?.().some((t) => t.readyState === 'live')) {
      console.warn('Cannot start interview video recording: no live screen stream')
      return
    }

    if (interviewVideoRecorderRef.current?.state === 'recording') return

    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ]
    const mimeType = mimeTypes.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || 'video/webm'

    try {
      const screenTrack = stream.getVideoTracks?.()[0]
      if (screenTrack && 'contentHint' in screenTrack) {
        screenTrack.contentHint = 'detail'
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 100000,
      })

      interviewVideoChunksRef.current = []
      interviewVideoStartedAtRef.current = new Date().toISOString()

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          interviewVideoChunksRef.current.push(event.data)
        }
      }

      recorder.start(5000)
      interviewVideoRecorderRef.current = recorder
      console.log('Started interview video recording')
    } catch (error) {
      console.error('Failed to start interview video recording:', error)
    }
  }, [])

  const stopAndUploadInterviewVideo = useCallback(async () => {
    const recorder = interviewVideoRecorderRef.current
    if (!recorder) return

    try {
      if (recorder.state === 'recording') {
        await new Promise((resolve) => {
          recorder.onstop = resolve
          recorder.stop()
        })
      }

      const chunks = interviewVideoChunksRef.current
      if (!chunks.length) return

      const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' })
      if (!blob.size) return

      const videoData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      const token = localStorage.getItem('authToken')
      if (!token) throw new Error('CRITICAL: No authToken in localStorage! User must log in.')
      console.log('✓ Video upload: Auth token found, length:', token.length)
      
      await apiClient.post('/evaluation/proctoring/video', {
        interviewType: 'technical',
        videoData,
        mimeType: blob.type || 'video/webm',
        startedAt: interviewVideoStartedAtRef.current,
        endedAt: new Date().toISOString(),
      })

      console.log('Interview video uploaded successfully')
    } catch (error) {
      console.error('Failed to upload interview video:', error.response?.data || error.message)
    } finally {
      interviewVideoChunksRef.current = []
      interviewVideoRecorderRef.current = null
      interviewVideoStartedAtRef.current = null
    }
  }, [])

  return {
    interviewVideoRecorderRef,
    startInterviewVideoRecording,
    stopAndUploadInterviewVideo
  }
}
