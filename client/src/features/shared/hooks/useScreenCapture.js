import { useRef, useCallback } from 'react'
import apiClient from '../../../../services/authService'
import { isMostlyBlackFrame } from '../utils/mediaUtils'

export function useScreenCapture(authToken) {
  const canvasRef = useRef(null)
  const screenshotIntervalRef = useRef(null)
  const screenCaptureReadyRef = useRef(false)

  const captureAndUploadScreenshot = useCallback(async () => {
    if (!canvasRef.current || !authToken) return

    const screenStream = window.__goalnowScreenStream
    const screenTrack = screenStream?.getVideoTracks?.()[0]
    if (!screenCaptureReadyRef.current || !screenTrack || screenTrack.readyState !== 'live') {
      console.warn('Skipping screenshot upload: no active screen-share video stream')
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frameCaptured = false
    let frameLooksBlack = true

    for (let attempt = 0; attempt < 3 && (!frameCaptured || frameLooksBlack); attempt += 1) {
      try {
        if (window.ImageCapture) {
          const imageCapture = new ImageCapture(screenTrack)
          const bitmap = await imageCapture.grabFrame()
          canvas.width = Math.min(bitmap.width, 640)
          canvas.height = Math.min(bitmap.height, 480)
          ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
          frameCaptured = true
          frameLooksBlack = isMostlyBlackFrame(canvas)
          if (!frameLooksBlack) break
        }
      } catch (error) {
        if (attempt === 0) {
          console.warn('ImageCapture fallback to video element:', error?.message || error)
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 220))
    }

    if (!frameCaptured || frameLooksBlack) {
      const fallbackVideo = document.createElement('video')
      fallbackVideo.muted = true
      fallbackVideo.playsInline = true
      fallbackVideo.srcObject = screenStream

      try {
        await new Promise((resolve, reject) => {
          let settled = false
          const finish = (ok) => {
            if (settled) return
            settled = true
            if (ok) resolve()
            else reject(new Error('Screen video failed to become playable'))
          }

          const timer = setTimeout(() => {
            cleanup()
            finish(false)
          }, 1500)

          const onReady = () => {
            cleanup()
            finish(true)
          }

          const cleanup = () => {
            clearTimeout(timer)
            fallbackVideo.onloadedmetadata = null
            fallbackVideo.oncanplay = null
            fallbackVideo.onerror = null
          }

          fallbackVideo.onloadedmetadata = onReady
          fallbackVideo.oncanplay = onReady
          fallbackVideo.onerror = () => {
            cleanup()
            finish(false)
          }

          if (fallbackVideo.readyState >= 2) {
            cleanup()
            finish(true)
            return
          }

          fallbackVideo.play?.().catch(() => {})
        })

        if (!fallbackVideo.videoWidth || !fallbackVideo.videoHeight) {
          console.warn('Skipping screenshot upload: fallback screen video has no dimensions')
          return
        }

        canvas.width = Math.min(fallbackVideo.videoWidth, 640)
        canvas.height = Math.min(fallbackVideo.videoHeight, 480)
        ctx.drawImage(fallbackVideo, 0, 0, canvas.width, canvas.height)
        frameLooksBlack = isMostlyBlackFrame(canvas)
      } finally {
        fallbackVideo.pause?.()
        fallbackVideo.srcObject = null
      }
    }

    if (frameLooksBlack) {
      console.warn('Skipping screenshot upload: detected black frame from screen share stream')
      return
    }

    const imageData = canvas.toDataURL('image/jpeg', 0.7)
    const sizeMB = (imageData.length / (1024 * 1024)).toFixed(2)
    console.log(`📸 Screenshot: ${sizeMB}MB`)

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.warn('Screenshot skipped: no auth token')
        return
      }
      console.log('✓ Screenshot: Auth token found, length:', token.length)
      
      const response = await apiClient.post('/evaluation/proctoring/screenshot', {
        interviewType: 'technical',
        imageData,
        capturedAt: new Date().toISOString(),
      })
      
      if (!response.data.success) {
        console.warn('⚠️ Screenshot upload warning:', response.data.message)
      }
    } catch (error) {
      console.error('❌ Failed to upload proctoring screenshot:', error.response?.data || error.message)
    }
  }, [authToken])

  return {
    canvasRef,
    screenshotIntervalRef,
    screenCaptureReadyRef,
    captureAndUploadScreenshot
  }
}
