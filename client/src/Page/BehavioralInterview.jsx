import React, { useRef, useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import behaviouralQuestions from "../components/question"
import axios from "axios"

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

export default function BehavioralInterview() {
  const navigate = useNavigate()
  const camRef             = useRef(null)
  const canvasRef          = useRef(null)
  const recognitionRef     = useRef(null)
  const mediaRecorderRef   = useRef(null)
  const faceMeshRef        = useRef(null)
  const cameraUtilsRef     = useRef(null)
  const lastResultRef      = useRef({ faces: 0, yaw: 0, pitch: 0 })

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [timeLeft,            setTimeLeft]            = useState(20 * 60)
  const [isMicActive,         setIsMicActive]         = useState(false)
  const [isRecording,         setIsRecording]         = useState(false)
  const [hasStopped,          setHasStopped]          = useState(false)
  const [transcribedText,     setTranscribedText]     = useState("")
  const [evaluationStatuses,  setEvaluationStatuses]  = useState({})
  const [authToken,           setAuthToken]           = useState(null)
  const [answeredQuestions,   setAnsweredQuestions]   = useState(new Set())
  const [faceAlert,           setFaceAlert]           = useState(null)
  const [mpReady,             setMpReady]             = useState(false)
  const [shuffledQuestions,   setShuffledQuestions]   = useState([])

  const NUM_Q   = 10
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  // ─── Fisher-Yates Shuffle Function ────────────────────────────────────────
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // ─── Scroll to top ────────────────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo(0, 0)
    // Shuffle questions on component mount
    const shuffled = shuffleArray(behaviouralQuestions).slice(0, NUM_Q)
    setShuffledQuestions(shuffled)
  }, [])

  // ─── MEDIAPIPE SETUP ──────────────────────────────────────────────────────
  useEffect(() => {
    let active = true
    let camInstance = null

    const setup = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')
        if (!active) return

        // Small delay so the browser fully releases the camera from the
        // instructions page before we try to acquire it here.
        await new Promise(r => setTimeout(r, 300))
        if (!active) return

        const FaceMesh = window.FaceMesh
        const Camera   = window.Camera
        if (!FaceMesh || !Camera) { console.error('MediaPipe not loaded'); return }

        const faceMesh = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        })

        faceMesh.setOptions({
          maxNumFaces: 4,
          refineLandmarks: false,
          minDetectionConfidence: 0.6,
          minTrackingConfidence:  0.5
        })

        faceMesh.onResults((results) => {
          if (!active) return
          const faces = results.multiFaceLandmarks || []
          const count = faces.length

          if (count === 0) { setFaceAlert('no-face'); return }
          if (count > 1)   { setFaceAlert('multiple-faces'); return }

          const lm       = faces[0]
          const noseTip  = lm[1]
          const leftEye  = lm[33]
          const rightEye = lm[263]
          const chin     = lm[152]
          const forehead = lm[10]

          const eyeMidX  = (leftEye.x + rightEye.x) / 2
          const eyeWidth = Math.abs(rightEye.x - leftEye.x)
          const yawNorm  = eyeWidth > 0 ? (noseTip.x - eyeMidX) / eyeWidth : 0

          const faceHeight = Math.abs(chin.y - forehead.y)
          const faceMidY   = (forehead.y + chin.y) / 2
          const pitchNorm  = faceHeight > 0 ? (noseTip.y - faceMidY) / faceHeight : 0

          const YAW_THRESH = 0.28
          const PITCH_UP   = -0.14
          const PITCH_DOWN =  0.14

          if      (yawNorm  >  YAW_THRESH) setFaceAlert('look-right')
          else if (yawNorm  < -YAW_THRESH) setFaceAlert('look-left')
          else if (pitchNorm < PITCH_UP)   setFaceAlert('look-up')
          else if (pitchNorm > PITCH_DOWN) setFaceAlert('look-down')
          else                             setFaceAlert(null)
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
          faceMeshRef.current    = faceMesh
          cameraUtilsRef.current = camInstance
          setMpReady(true)
        }
      } catch (err) {
        console.error('MediaPipe setup error:', err)
        // Fallback: just show raw camera without face detection
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          if (camRef.current) camRef.current.srcObject = stream
        } catch(e) {
          console.error('Fallback camera error:', e)
        }
      }
    }

    setup()

    return () => {
      active = false
      if (camInstance) camInstance.stop()
      if (faceMeshRef.current) {
        try { faceMeshRef.current.close() } catch(e) {}
      }
      if (camRef.current?.srcObject) {
        camRef.current.srcObject.getTracks().forEach(t => t.stop())
        camRef.current.srcObject = null
      }
    }
  }, [])

  // ─── SPEECH RECOGNITION ───────────────────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR) {
      recognitionRef.current = new SR()
      recognitionRef.current.continuous     = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.language       = 'en-US'
      recognitionRef.current.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++)
          if (e.results[i].isFinal)
            setTranscribedText(p => p + ' ' + e.results[i][0].transcript)
      }
      recognitionRef.current.onerror = (e) => console.error('SR error:', e.error)
    }
    setAuthToken(localStorage.getItem('authToken'))
  }, [])

  // ─── TIMER ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0) { handleSubmit(); return }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000)
    return () => clearInterval(t)
  }, [timeLeft])

  // ─── FULLSCREEN GUARD ─────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => { if (!document.fullscreenElement) handleSubmit() }
    document.addEventListener('fullscreenchange', fn)
    return () => document.removeEventListener('fullscreenchange', fn)
  }, [])

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  const formatTime = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const stopAllMedia = () => {
    // Stop MediaRecorder
    try { mediaRecorderRef.current?.stop() } catch(e) {}
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
    }

    // Stop MediaPipe camera loop
    try { cameraUtilsRef.current?.stop() } catch(e) {}

    // Stop FaceMesh WASM
    try { faceMeshRef.current?.close() } catch(e) {}

    // Stop raw camera stream on the video element
    if (camRef.current?.srcObject) {
      camRef.current.srcObject.getTracks().forEach(t => t.stop())
      camRef.current.srcObject = null
    }

    // Stop speech recognition
    try { recognitionRef.current?.stop() } catch(e) {}
  }

  // ─── MIC TOGGLE ───────────────────────────────────────────────────────────
  const handleMicToggle = async () => {
    if (!isMicActive && !hasStopped) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mr = new MediaRecorder(stream)
        mediaRecorderRef.current = mr
        mr.start()
        setIsRecording(true)
        setIsMicActive(true)
        setTranscribedText("")
        recognitionRef.current?.start()
      } catch(e) {
        console.error('Mic error:', e)
      }
    } else if (isMicActive) {
      try { mediaRecorderRef.current?.stop() } catch(e) {}
      try { mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop()) } catch(e) {}
      try { recognitionRef.current?.stop() } catch(e) {}
      setIsRecording(false)
      setIsMicActive(false)
      setHasStopped(true)
    }
  }

  // ─── SUBMIT ANSWER ────────────────────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (!transcribedText.trim()) { alert('Please speak an answer first.'); return }
    if (!authToken)               { alert('Authentication required.');     return }
    try {
      const res = await axios.post(`${API_URL}/evaluation/submit-answer`, {
        questionIndex:     currentQuestionIdx,
        question:          shuffledQuestions[currentQuestionIdx],
        transcribedAnswer: transcribedText,
        interviewType:     'behavioral'
      }, { headers: { Authorization: `Bearer ${authToken}` } })

      setEvaluationStatuses(p => ({
        ...p,
        [currentQuestionIdx]: { evaluationId: res.data.evaluationId, status: 'pending' }
      }))
      setAnsweredQuestions(p => new Set(p).add(currentQuestionIdx))
      setHasStopped(false)
    } catch(e) {
      alert('Error: ' + (e.response?.data?.message || e.message))
    }
  }

  // ─── NEXT QUESTION ────────────────────────────────────────────────────────
  const handleNextQuestion = () => {
    if (currentQuestionIdx < NUM_Q - 1) {
      setCurrentQuestionIdx(p => p + 1)
      setHasStopped(false)
      setIsMicActive(false)
      setIsRecording(false)
      setTranscribedText("")
    }
  }

  // ─── SUBMIT / EXIT ────────────────────────────────────────────────────────
  const handleSubmit = () => {
    stopAllMedia()
    document.exitFullscreen().catch(() => {})
    navigate("/home")
  }

  // ─── ALERT CONFIG ─────────────────────────────────────────────────────────
  const ALERTS = {
    'no-face':        { msg: 'No face detected — look at the screen', color: 'red'    },
    'look-left':      { msg: 'You are looking left — face the camera', color: 'red'   },
    'look-right':     { msg: 'You are looking right — face the camera', color: 'red'  },
    'look-up':        { msg: 'You are looking up — face the camera',    color: 'red'  },
    'look-down':      { msg: 'You are looking down — face the camera',  color: 'red'  },
    'multiple-faces': { msg: 'Multiple people detected in frame',       color: 'orange' },
  }

  const alertObj   = faceAlert ? ALERTS[faceAlert] : null
  const isAlert    = !!faceAlert
  const alertClr   = alertObj?.color || 'red'
  const progressPct = ((20 * 60 - timeLeft) / (20 * 60)) * 100

  // ─── STYLES ───────────────────────────────────────────────────────────────
  const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}

.iw{width:100vw;height:100vh;background:#f5f5f5;font-family:'Sora',sans-serif;display:flex;flex-direction:column;color:#111;}

.hdr{display:flex;justify-content:space-between;align-items:center;padding:0 36px;height:60px;background:#111;border-bottom:1px solid #222;flex-shrink:0;}
.hlogo{font-weight:700;font-size:1rem;letter-spacing:.12em;text-transform:uppercase;color:#fff;}
.hright{display:flex;align-items:center;gap:12px;}
.htmr{font-family:'DM Mono',monospace;background:transparent;color:#fff;padding:7px 16px;border-radius:6px;font-weight:500;font-size:.95rem;letter-spacing:.08em;border:1px solid #3a3a3a;}
.hexit{padding:7px 18px;border-radius:6px;border:1px solid #3a3a3a;cursor:pointer;background:transparent;color:#aaa;font-family:'Sora',sans-serif;font-size:.82rem;font-weight:500;transition:all .2s;}
.hexit:hover{border-color:#888;color:#fff;}

.bdy{flex:1;display:flex;overflow:hidden;}

.lft{width:160px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;border-right:1px solid #e0e0e0;gap:10px;flex-shrink:0;}
.tlbl{font-size:.7rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#999;}
.tdsp{font-family:'DM Mono',monospace;font-size:2.2rem;font-weight:500;color:#111;letter-spacing:.04em;}
.ptrk{width:2px;height:80px;background:#e5e5e5;border-radius:2px;margin-top:20px;position:relative;overflow:hidden;}
.pfll{position:absolute;bottom:0;left:0;width:100%;background:#111;border-radius:2px;transition:height 1s linear;}

.ctr{flex:1;display:flex;align-items:center;justify-content:center;padding:48px 64px;background:#f5f5f5;}
.qcn{display:flex;flex-direction:column;align-items:center;text-align:center;max-width:680px;width:100%;}
.qtg{font-size:.72rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#999;margin-bottom:24px;display:flex;align-items:center;gap:8px;}
.qtg::before,.qtg::after{content:'';display:block;width:28px;height:1px;background:#ccc;}
.qtx{font-size:1.65rem;font-weight:600;line-height:1.55;color:#111;margin-bottom:52px;letter-spacing:-.01em;}
.tdv{background:#f0f0f0;border:2px solid #e0e0e0;border-radius:10px;padding:20px;margin-bottom:28px;min-height:80px;font-size:.95rem;line-height:1.6;color:#333;text-align:left;max-height:120px;overflow-y:auto;width:100%;}
.tdv.empty{color:#ccc;font-style:italic;}
.mca{display:flex;flex-direction:column;align-items:center;gap:24px;}
.mrng{width:96px;height:96px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .25s;}
.mrng.idle{background:#111;}
.mrng.active{background:#1a1a1a;animation:mpls 1.6s ease-in-out infinite;}
@keyframes mpls{0%{box-shadow:0 0 0 0 rgba(17,17,17,.18),0 0 0 0 rgba(17,17,17,.08);}70%{box-shadow:0 0 0 10px rgba(17,17,17,.04),0 0 0 20px rgba(17,17,17,0);}100%{box-shadow:0 0 0 0 rgba(17,17,17,0),0 0 0 0 rgba(17,17,17,0);}}
.mrng svg{width:34px;height:34px;fill:#fff;}
.mst{font-size:.75rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:#888;}
.mst.rec{color:#333;}
.abts{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;}
.bstop{padding:10px 26px;background:#fff;color:#111;border:1px solid #ccc;border-radius:7px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600;font-size:.82rem;transition:all .2s;}
.bstop:hover{background:#f0f0f0;border-color:#aaa;}
.bnxt{padding:10px 26px;background:#111;color:#fff;border:1px solid #111;border-radius:7px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600;font-size:.82rem;transition:all .2s;}
.bnxt:hover{background:#333;}
.bsub{padding:10px 26px;background:#2ecc71;color:#fff;border:1px solid #2ecc71;border-radius:7px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600;font-size:.82rem;transition:all .2s;}
.bsub:hover{background:#27ae60;}

.rgt{width:260px;background:#fff;border-left:1px solid #e0e0e0;padding:24px 20px;display:flex;flex-direction:column;align-items:center;gap:16px;flex-shrink:0;}
.clbl{font-size:.7rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#999;align-self:flex-start;}

.cambox{
  width:100%;aspect-ratio:3/4;background:#111;border-radius:12px;
  overflow:hidden;position:relative;
  border:3px solid #e0e0e0;
  transition:border-color .08s ease;
}
.cambox video{width:100%;height:100%;object-fit:cover;display:block;transform:scaleX(-1);}

.cambox.alarm-red{
  border-color:#ff1111 !important;
  animation:alm-red .42s ease-in-out infinite;
}
.cambox.alarm-orange{
  border-color:#ff6600 !important;
  animation:alm-orange .42s ease-in-out infinite;
}

@keyframes alm-red{
  0%,100%{box-shadow:0 0 0 2px rgba(255,17,17,.4),0 0 12px rgba(255,17,17,.65),0 0 28px rgba(255,17,17,.3),inset 0 0 12px rgba(255,17,17,.2);}
  50%{box-shadow:0 0 0 6px rgba(255,17,17,.75),0 0 28px rgba(255,17,17,1),0 0 52px rgba(255,17,17,.55),inset 0 0 26px rgba(255,17,17,.5);}
}
@keyframes alm-orange{
  0%,100%{box-shadow:0 0 0 2px rgba(255,102,0,.4),0 0 12px rgba(255,102,0,.65),0 0 28px rgba(255,102,0,.3),inset 0 0 12px rgba(255,102,0,.2);}
  50%{box-shadow:0 0 0 6px rgba(255,102,0,.75),0 0 28px rgba(255,102,0,1),0 0 52px rgba(255,102,0,.55),inset 0 0 26px rgba(255,102,0,.5);}
}

.abar{
  position:absolute;bottom:0;left:0;right:0;
  padding:8px 10px;font-size:.67rem;font-weight:700;
  letter-spacing:.05em;text-align:center;text-transform:uppercase;
  border-radius:0 0 10px 10px;z-index:20;
  line-height:1.3;
  animation:brin .15s ease-out;
}
.abar.red{background:rgba(175,0,0,.92);color:#fff;}
.abar.orange{background:rgba(175,70,0,.92);color:#fff;}
@keyframes brin{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}

.mp-loading{position:absolute;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;border-radius:10px;z-index:15;}
.mp-spinner{width:28px;height:28px;border-radius:50%;border:3px solid rgba(255,255,255,.2);border-top-color:#fff;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

.cind{display:flex;align-items:center;gap:6px;align-self:flex-start;}
.dot{width:6px;height:6px;border-radius:50%;background:#555;}
.dot.live{background:#222;animation:dblink 1.4s ease-in-out infinite;}
.dot.danger{background:#ff1111;animation:dfast .42s ease-in-out infinite;}
@keyframes dblink{0%,100%{opacity:1;}50%{opacity:.3;}}
@keyframes dfast{0%,100%{opacity:1;}50%{opacity:.1;}}
.itxt{font-size:.72rem;font-weight:500;letter-spacing:.06em;color:#888;}
.itxt.danger{color:#c80000;font-weight:700;}

.sbtn{margin-top:auto;padding:12px;width:100%;background:#111;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600;font-size:.85rem;letter-spacing:.06em;text-transform:uppercase;transition:background .2s;}
.sbtn:hover{background:#333;}
.qlst{width:100%;margin-top:16px;padding-top:16px;border-top:1px solid #e0e0e0;max-height:300px;overflow-y:auto;}
.qltl{font-size:.7rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#999;margin-bottom:12px;}
.qi{display:flex;align-items:center;gap:8px;padding:8px;margin-bottom:4px;border-radius:5px;font-size:.75rem;color:#666;cursor:pointer;transition:all .2s;}
.qi:hover{background:#f5f5f5;}
.qi.cur{background:#f0f0f0;color:#111;font-weight:600;}
.qi.ans{color:#2ecc71;}
.qnum{width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:1px solid #d0d0d0;font-size:.65rem;font-weight:600;}
.qi.cur .qnum{border-color:#111;background:#111;color:#fff;}
.qi.ans .qnum{border-color:#2ecc71;background:#2ecc71;color:#fff;}
`

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="iw">
      <style>{css}</style>

      {/* HEADER */}
      <div className="hdr">
        <div className="hlogo">Intbar.</div>
        <div className="hright">
          <span className="htmr">{formatTime(timeLeft)}</span>
          <button className="hexit" onClick={handleSubmit}>Exit Test</button>
        </div>
      </div>

      <div className="bdy">

        {/* LEFT — time panel */}
        <div className="lft">
          <div className="tlbl">Time Left</div>
          <div className="tdsp">{formatTime(timeLeft)}</div>
          <div className="ptrk">
            <div className="pfll" style={{ height: `${progressPct}%` }} />
          </div>
        </div>

        {/* CENTER — question + recording */}
        <div className="ctr">
          <div className="qcn">
            <div className="qtg">Behavioural Question</div>
            <div className="qtx">{shuffledQuestions[currentQuestionIdx]}</div>

            <div className={`tdv ${!transcribedText ? 'empty' : ''}`}>
              {transcribedText || 'Your speech will appear here...'}
            </div>

            <div className="mca">
              <div
                className={`mrng ${isMicActive ? 'active' : 'idle'}`}
                onClick={handleMicToggle}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              </div>

              <div className={`mst ${isMicActive ? 'rec' : ''}`}>
                {isMicActive ? 'Recording in progress' : 'Click to begin recording'}
              </div>

              <div className="abts">
                {!isMicActive && !hasStopped && (
                  <button className="bnxt" onClick={handleMicToggle}>Start Recording</button>
                )}
                {isMicActive && (
                  <button className="bstop" onClick={handleMicToggle}>Stop</button>
                )}
                {hasStopped && (
                  <>
                    <button className="bsub" onClick={handleSubmitAnswer}>Submit Answer</button>
                    <button className="bstop" onClick={() => { setHasStopped(false); setTranscribedText("") }}>
                      Re-record
                    </button>
                  </>
                )}
                {currentQuestionIdx < NUM_Q - 1 && answeredQuestions.has(currentQuestionIdx) && (
                  <button className="bnxt" onClick={handleNextQuestion}>Next Question</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — camera + question list */}
        <div className="rgt">
          <div className="clbl">Your Camera</div>

          <div className={`cambox ${isAlert ? (alertClr === 'orange' ? 'alarm-orange' : 'alarm-red') : ''}`}>
            <video ref={camRef} autoPlay muted playsInline />

            {!mpReady && (
              <div className="mp-loading">
                <div className="mp-spinner" />
              </div>
            )}

            {isAlert && alertObj && (
              <div className={`abar ${alertClr}`}>{alertObj.msg}</div>
            )}
          </div>

          <div className="cind">
            <div className={`dot ${isAlert ? 'danger' : isMicActive ? 'live' : ''}`} />
            <span className={`itxt ${isAlert ? 'danger' : ''}`}>
              {isAlert
                ? faceAlert === 'multiple-faces' ? 'Multiple faces detected'
                  : faceAlert === 'no-face'      ? 'No face detected'
                  : 'Look at camera'
                : isMicActive ? 'Live' : 'Standby'}
            </span>
          </div>

          {answeredQuestions.size === NUM_Q && currentQuestionIdx === NUM_Q - 1 && !isMicActive
            ? <button className="sbtn" onClick={handleSubmit}>
                Submit Test — All {NUM_Q} Done
              </button>
            : <div style={{ opacity: 0, pointerEvents: 'none', height: '44px' }} />
          }

          <div className="qlst">
            <div className="qltl">Questions</div>
            {Array.from({ length: NUM_Q }, (_, i) => (
              <div
                key={i}
                className={`qi ${answeredQuestions.has(i) ? 'ans' : ''} ${currentQuestionIdx === i ? 'cur' : ''}`}
                title={`Q${i + 1}: ${shuffledQuestions[i]}`}
              >
                <div className="qnum">{i + 1}</div>
                {answeredQuestions.has(i) && <span style={{ fontSize: '.8rem' }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}