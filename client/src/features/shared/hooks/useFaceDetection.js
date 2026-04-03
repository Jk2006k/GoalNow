import { useRef, useState, useCallback, useEffect } from 'react'
import { loadScript } from '../utils/mediaUtils'

export function useFaceDetection(camRef) {
  const faceMeshRef = useRef(null)
  const cameraUtilsRef = useRef(null)
  const [mpReady, setMpReady] = useState(false)
  const [faceAlert, setFaceAlert] = useState(null)

  useEffect(() => {
    let active = true
    let camInstance = null

    const setup = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')
        if (!active) return

        await new Promise(r => setTimeout(r, 300))
        if (!active) return

        const FaceMesh = window.FaceMesh
        const Camera = window.Camera
        if (!FaceMesh || !Camera) {
          console.error('MediaPipe not loaded')
          return
        }

        const faceMesh = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        })

        faceMesh.setOptions({
          maxNumFaces: 4,
          refineLandmarks: false,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5
        })

        faceMesh.onResults((results) => {
          if (!active) return
          const faces = results.multiFaceLandmarks || []
          const count = faces.length

          if (count === 0) { setFaceAlert('no-face'); return }
          if (count > 1) { setFaceAlert('multiple-faces'); return }

          const lm = faces[0]
          const noseTip = lm[1]
          const leftEye = lm[33]
          const rightEye = lm[263]
          const chin = lm[152]
          const forehead = lm[10]

          const eyeMidX = (leftEye.x + rightEye.x) / 2
          const eyeWidth = Math.abs(rightEye.x - leftEye.x)
          const yawNorm = eyeWidth > 0 ? (noseTip.x - eyeMidX) / eyeWidth : 0

          const faceHeight = Math.abs(chin.y - forehead.y)
          const faceMidY = (forehead.y + chin.y) / 2
          const pitchNorm = faceHeight > 0 ? (noseTip.y - faceMidY) / faceHeight : 0

          const YAW_THRESH = 0.28
          const PITCH_UP = -0.14
          const PITCH_DOWN = 0.14

          if (yawNorm > YAW_THRESH) setFaceAlert('look-right')
          else if (yawNorm < -YAW_THRESH) setFaceAlert('look-left')
          else if (pitchNorm < PITCH_UP) setFaceAlert('look-up')
          else if (pitchNorm > PITCH_DOWN) setFaceAlert('look-down')
          else setFaceAlert(null)
        })

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false
        })
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }

        if (camRef.current) {
          camRef.current.srcObject = stream
          camInstance = new Camera(camRef.current, {
            onFrame: async () => {
              if (faceMesh && camRef.current) await faceMesh.send({ image: camRef.current })
            },
            width: 640,
            height: 480
          })
          camInstance.start()
          faceMeshRef.current = faceMesh
          cameraUtilsRef.current = camInstance
          setMpReady(true)
        }
      } catch (err) {
        console.error('MediaPipe setup error:', err)
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          if (camRef.current) camRef.current.srcObject = stream
        } catch (e) {
          console.error('Fallback camera error:', e)
        }
      }
    }

    setup()

    return () => {
      active = false
      if (camInstance) camInstance.stop()
      if (faceMeshRef.current) {
        try { faceMeshRef.current.close() } catch (e) {}
      }
      if (camRef.current?.srcObject) {
        camRef.current.srcObject.getTracks().forEach(t => t.stop())
        camRef.current.srcObject = null
      }
    }
  }, [camRef])

  return { mpReady, faceAlert, faceMeshRef, cameraUtilsRef }
}
