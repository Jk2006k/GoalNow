import React, { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import behaviouralQuestions from "../components/question"
import axios from "axios"

export default function BehavioralInterview(){

const navigate = useNavigate()
const camRef = useRef(null)
const recognitionRef = useRef(null)
const mediaRecorderRef = useRef(null)

const [currentQuestionIdx,setCurrentQuestionIdx] = useState(0)
const [timeLeft,setTimeLeft] = useState(20*60)
const [isMicActive,setIsMicActive] = useState(false)
const [isRecording,setIsRecording] = useState(false)
const [hasStopped,setHasStopped] = useState(false)
const [transcribedText,setTranscribedText] = useState("")
const [isListening,setIsListening] = useState(false)
const [evaluationStatuses,setEvaluationStatuses] = useState({})
const [authToken,setAuthToken] = useState(null)
const [answeredQuestions,setAnsweredQuestions] = useState(new Set())

const NUM_QUESTIONS_IN_INTERVIEW = 10
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Initialize Web Speech API
useEffect(()=>{
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if(SpeechRecognition){
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.language = 'en-US'

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      console.log('🎤 Speech recognition started')
    }

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = ''
      for(let i = event.resultIndex; i < event.results.length; i++){
        const transcript = event.results[i][0].transcript
        if(event.results[i].isFinal){
          setTranscribedText(prev => prev + ' ' + transcript)
        } else {
          interimTranscript += transcript
        }
      }
      if(interimTranscript){
        console.log('📝 Interim:', interimTranscript)
      }
    }

    recognitionRef.current.onerror = (event) => {
      console.error('🔴 Speech recognition error:', event.error)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
      console.log('🎤 Speech recognition ended')
    }
  }
  
  // Get auth token
  const token = localStorage.getItem('authToken')
  setAuthToken(token)
}, [])

useEffect(()=>{
if(timeLeft<=0){
handleSubmit()
return
}

const timer=setInterval(()=>{
setTimeLeft(prev=>prev-1)
},1000)

return()=>clearInterval(timer)

},[timeLeft])


useEffect(()=>{

async function startCamera(){
try{
const stream=await navigator.mediaDevices.getUserMedia({video:true})
if(camRef.current){
camRef.current.srcObject=stream
}
}catch(err){
console.log(err)
}
}

startCamera()

},[])


useEffect(()=>{

const handleFullscreenChange=()=>{
if(!document.fullscreenElement){
handleSubmit()
}
}

document.addEventListener("fullscreenchange",handleFullscreenChange)

return()=>{
document.removeEventListener("fullscreenchange",handleFullscreenChange)
}

},[])


const formatTime=(seconds)=>{
const mins=Math.floor(seconds/60)
const secs=seconds%60
return `${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`
}


const handleMicToggle=async()=>{

if(!isMicActive && !hasStopped){

try{

const stream=await navigator.mediaDevices.getUserMedia({audio:true})
const mediaRecorder=new MediaRecorder(stream)

mediaRecorderRef.current=mediaRecorder
mediaRecorder.start()

setIsRecording(true)
setIsMicActive(true)
setTranscribedText("")

// Start speech recognition
if(recognitionRef.current){
  recognitionRef.current.start()
}

}catch(err){
console.log(err)
}

}else if(isMicActive){

if(mediaRecorderRef.current){

mediaRecorderRef.current.stop()

mediaRecorderRef.current.stream.getTracks().forEach(track=>track.stop())

}

// Stop speech recognition
if(recognitionRef.current){
  recognitionRef.current.stop()
}

setIsRecording(false)
setIsMicActive(false)
setHasStopped(true)

}

}

// Submit transcribed answer to server
const handleSubmitAnswer = async () => {
  try {
    if(!transcribedText.trim()){
      alert('Please provide an answer by speaking.')
      return
    }

    if(!authToken){
      alert('Authentication required. Please log in again.')
      return
    }

    console.log('📤 Submitting answer:', transcribedText.substring(0, 50))

    const response = await axios.post(
      `${API_BASE_URL}/evaluation/submit-answer`,
      {
        questionIndex: currentQuestionIdx,
        question: behaviouralQuestions[currentQuestionIdx],
        transcribedAnswer: transcribedText,
        interviewType: 'behavioral'
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('✅ Answer submitted:', response.data)

    // Store evaluation ID and status
    setEvaluationStatuses(prev => ({
      ...prev,
      [currentQuestionIdx]: {
        evaluationId: response.data.evaluationId,
        status: 'pending',
        submittedAt: new Date()
      }
    }))

    // Mark question as answered
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestionIdx))

    // Reset recording state and let user proceed manually with Next button
    setHasStopped(false)
  } catch (error) {
    console.error('❌ Error submitting answer:', error)
    alert('Error submitting answer: ' + (error.response?.data?.message || error.message))
  }
}

const handleNextQuestion=()=>{
if(currentQuestionIdx<NUM_QUESTIONS_IN_INTERVIEW-1){
setCurrentQuestionIdx(currentQuestionIdx+1)
setHasStopped(false)
setIsMicActive(false)
setIsRecording(false)
setTranscribedText("")
}
}


const handleSubmit=()=>{

if(mediaRecorderRef.current && isRecording){

mediaRecorderRef.current.stop()

mediaRecorderRef.current.stream.getTracks().forEach(track=>track.stop())

}

document.exitFullscreen().catch(()=>{})

navigate("/home")

}


const css=`

@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@300;400;500;600;700&display=swap');

*{
box-sizing:border-box;
margin:0;
padding:0;
}

.interview-wrapper{
width:100vw;
height:100vh;
background:#f5f5f5;
font-family:'Sora',sans-serif;
display:flex;
flex-direction:column;
color:#111111;
}

/* ── HEADER ── */

.interview-header{
display:flex;
justify-content:space-between;
align-items:center;
padding:0 36px;
height:60px;
background:#111111;
border-bottom:1px solid #222222;
flex-shrink:0;
}

.header-logo{
font-weight:700;
font-size:1rem;
letter-spacing:0.12em;
text-transform:uppercase;
color:#ffffff;
}

.header-right{
display:flex;
align-items:center;
gap:12px;
}

.timer{
font-family:'DM Mono',monospace;
background:transparent;
color:#ffffff;
padding:7px 16px;
border-radius:6px;
font-weight:500;
font-size:0.95rem;
letter-spacing:0.08em;
border:1px solid #3a3a3a;
}

.exit-btn{
padding:7px 18px;
border-radius:6px;
border:1px solid #3a3a3a;
cursor:pointer;
background:transparent;
color:#aaaaaa;
font-family:'Sora',sans-serif;
font-size:0.82rem;
font-weight:500;
letter-spacing:0.04em;
transition:all 0.2s ease;
}

.exit-btn:hover{
border-color:#888888;
color:#ffffff;
}

/* ── BODY ── */

.interview-content{
flex:1;
display:flex;
overflow:hidden;
}

/* ── LEFT PANEL ── */

.left-section{
width:160px;
background:#ffffff;
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
padding:32px 16px;
border-right:1px solid #e0e0e0;
gap:10px;
flex-shrink:0;
}

.time-label{
font-size:0.7rem;
font-weight:600;
letter-spacing:0.12em;
text-transform:uppercase;
color:#999999;
}

.timer-display{
font-family:'DM Mono',monospace;
font-size:2.2rem;
font-weight:500;
color:#111111;
letter-spacing:0.04em;
}

.progress-track{
width:2px;
height:80px;
background:#e5e5e5;
border-radius:2px;
margin-top:20px;
position:relative;
overflow:hidden;
}

.progress-fill{
position:absolute;
bottom:0;
left:0;
width:100%;
background:#111111;
border-radius:2px;
transition:height 1s linear;
}

/* ── CENTER PANEL ── */

.center-section{
flex:1;
display:flex;
align-items:center;
justify-content:center;
padding:48px 64px;
background:#f5f5f5;
}

.question-container{
display:flex;
flex-direction:column;
align-items:center;
text-align:center;
max-width:680px;
width:100%;
}

.question-tag{
font-size:0.72rem;
font-weight:600;
letter-spacing:0.16em;
text-transform:uppercase;
color:#999999;
margin-bottom:24px;
display:flex;
align-items:center;
gap:8px;
}

.question-tag::before,
.question-tag::after{
content:'';
display:block;
width:28px;
height:1px;
background:#cccccc;
}

.question-text{
font-size:1.65rem;
font-weight:600;
line-height:1.55;
color:#111111;
margin-bottom:52px;
letter-spacing:-0.01em;
}

.transcription-display{
background:#f0f0f0;
border:2px solid #e0e0e0;
border-radius:10px;
padding:20px;
margin-bottom:28px;
min-height:80px;
font-size:0.95rem;
line-height:1.6;
color:#333333;
text-align:left;
font-weight:400;
max-height:120px;
overflow-y:auto;
}

.transcription-display.empty{
color:#cccccc;
font-style:italic;
}

/* ── MIC AREA ── */

.mic-area{
display:flex;
flex-direction:column;
align-items:center;
gap:24px;
}

.mic-ring{
width:96px;
height:96px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
position:relative;
cursor:pointer;
transition:all 0.25s ease;
}

.mic-ring.idle{
background:#111111;
box-shadow:0 0 0 0 rgba(17,17,17,0);
}

.mic-ring.active{
background:#1a1a1a;
box-shadow:0 0 0 8px rgba(17,17,17,0.08), 0 0 0 16px rgba(17,17,17,0.04);
animation:pulse-ring 1.6s ease-in-out infinite;
}

@keyframes pulse-ring{
0%{box-shadow:0 0 0 0 rgba(17,17,17,0.18), 0 0 0 0 rgba(17,17,17,0.08);}
70%{box-shadow:0 0 0 10px rgba(17,17,17,0.04), 0 0 0 20px rgba(17,17,17,0);}
100%{box-shadow:0 0 0 0 rgba(17,17,17,0), 0 0 0 0 rgba(17,17,17,0);}
}

.mic-ring svg{
width:34px;
height:34px;
fill:#ffffff;
position:relative;
z-index:1;
}

.mic-status{
font-size:0.75rem;
font-weight:500;
letter-spacing:0.1em;
text-transform:uppercase;
color:#888888;
}

.mic-status.recording{
color:#333333;
}

/* ── BUTTONS ── */

.action-buttons{
display:flex;
gap:12px;
flex-wrap:wrap;
justify-content:center;
}

.stop-btn{
padding:10px 26px;
background:#ffffff;
color:#111111;
border:1px solid #cccccc;
border-radius:7px;
cursor:pointer;
font-family:'Sora',sans-serif;
font-weight:600;
font-size:0.82rem;
letter-spacing:0.04em;
transition:all 0.2s ease;
}

.stop-btn:hover:not(:disabled){
background:#f0f0f0;
border-color:#aaaaaa;
}

.stop-btn:disabled{
opacity:0.35;
cursor:not-allowed;
}

.next-btn{
padding:10px 26px;
background:#111111;
color:#ffffff;
border:1px solid #111111;
border-radius:7px;
cursor:pointer;
font-family:'Sora',sans-serif;
font-weight:600;
font-size:0.82rem;
letter-spacing:0.04em;
transition:all 0.2s ease;
}

.next-btn:hover{
background:#333333;
border-color:#333333;
}

.submit-answer-btn{
padding:10px 26px;
background:#2ecc71;
color:#ffffff;
border:1px solid #2ecc71;
border-radius:7px;
cursor:pointer;
font-family:'Sora',sans-serif;
font-weight:600;
font-size:0.82rem;
letter-spacing:0.04em;
transition:all 0.2s ease;
}

.submit-answer-btn:hover{
background:#27ae60;
border-color:#27ae60;
}

/* ── RIGHT PANEL ── */

.right-section{
width:260px;
background:#ffffff;
border-left:1px solid #e0e0e0;
padding:24px 20px;
display:flex;
flex-direction:column;
align-items:center;
gap:16px;
flex-shrink:0;
}

.camera-label{
font-size:0.7rem;
font-weight:600;
letter-spacing:0.14em;
text-transform:uppercase;
color:#999999;
align-self:flex-start;
}

.camera-container{
width:100%;
aspect-ratio:3/4;
background:#111111;
border-radius:10px;
overflow:hidden;
border:1px solid #e0e0e0;
}

.camera-container video{
width:100%;
height:100%;
object-fit:cover;
}

.camera-indicator{
display:flex;
align-items:center;
gap:6px;
align-self:flex-start;
}

.dot{
width:6px;
height:6px;
border-radius:50%;
background:#555555;
}

.dot.live{
background:#222222;
animation:blink 1.4s ease-in-out infinite;
}

@keyframes blink{
0%,100%{opacity:1;}
50%{opacity:0.3;}
}

.camera-indicator-text{
font-size:0.72rem;
font-weight:500;
letter-spacing:0.06em;
color:#888888;
}

.submit-btn{
margin-top:auto;
padding:12px;
width:100%;
background:#111111;
color:#ffffff;
border:none;
border-radius:8px;
cursor:pointer;
font-family:'Sora',sans-serif;
font-weight:600;
font-size:0.85rem;
letter-spacing:0.06em;
text-transform:uppercase;
transition:background 0.2s ease;
}

.submit-btn:hover{
background:#333333;
}

.submit-btn:disabled{
opacity:0.5;
cursor:not-allowed;
}

/* ── QUESTIONS LIST ── */

.questions-list{
width:100%;
margin-top:16px;
padding-top:16px;
border-top:1px solid #e0e0e0;
max-height:300px;
overflow-y:auto;
}

.questions-list-title{
font-size:0.7rem;
font-weight:600;
letter-spacing:0.12em;
text-transform:uppercase;
color:#999999;
margin-bottom:12px;
}

.question-item{
display:flex;
align-items:center;
gap:8px;
padding:8px;
margin-bottom:4px;
border-radius:5px;
font-size:0.75rem;
color:#666666;
cursor:pointer;
transition:all 0.2s ease;
}

.question-item:hover{
background:#f5f5f5;
}

.question-item.current{
background:#f0f0f0;
color:#111111;
font-weight:600;
}

.question-item.answered{
color:#2ecc71;
}

.question-item-number{
width:20px;
height:20px;
display:flex;
align-items:center;
justify-content:center;
border-radius:50%;
border:1px solid #d0d0d0;
font-size:0.65rem;
font-weight:600;
}

.question-item.current .question-item-number{
border-color:#111111;
background:#111111;
color:#ffffff;
}

.question-item.answered .question-item-number{
border-color:#2ecc71;
background:#2ecc71;
color:#ffffff;
}

.question-item-check{
width:16px;
height:16px;
display:flex;
align-items:center;
justify-content:center;
font-size:0.8rem;
}

`

const progressPct = ((20*60 - timeLeft) / (20*60)) * 100

return(

<div className="interview-wrapper">

<style>{css}</style>

<div className="interview-header">

  <div className="header-logo">Intbar.</div>

  <div className="header-right">
    <span className="timer">{formatTime(timeLeft)}</span>
    <button className="exit-btn" onClick={handleSubmit}>Exit Test</button>
  </div>

</div>


<div className="interview-content">

  <div className="left-section">
    <div className="time-label">Time Left</div>
    <div className="timer-display">{formatTime(timeLeft)}</div>
    <div className="progress-track">
      <div className="progress-fill" style={{height:`${progressPct}%`}}/>
    </div>
  </div>

  <div className="center-section">
    <div className="question-container">

      <div className="question-tag">Behavioural Question</div>

      <div className="question-text">
        {behaviouralQuestions[currentQuestionIdx]}
      </div>

      <div className={`transcription-display ${!transcribedText ? 'empty' : ''}`}>
        {transcribedText || 'Your speech will appear here...'}
      </div>

      <div className="mic-area">

        <div
          className={`mic-ring ${isMicActive ? "active" : "idle"}`}
          onClick={handleMicToggle}
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
          </svg>
        </div>

        <div className={`mic-status ${isMicActive ? "recording" : ""}`}>
          {isMicActive ? "Recording in progress" : "Click to begin recording"}
        </div>

        <div className="action-buttons">
          {!isMicActive && !hasStopped && (
            <button className="next-btn" onClick={handleMicToggle}>
              Start Recording
            </button>
          )}
          {isMicActive && (
            <button className="stop-btn" onClick={handleMicToggle}>
              Stop
            </button>
          )}
          {hasStopped && (
            <>
              <button className="submit-answer-btn" onClick={handleSubmitAnswer}>
                Submit Answer
              </button>
              <button className="stop-btn" onClick={() => {
                setHasStopped(false)
                setTranscribedText("")
              }}>
                Re-record
              </button>
            </>
          )}
          {currentQuestionIdx < NUM_QUESTIONS_IN_INTERVIEW - 1 && answeredQuestions.has(currentQuestionIdx) && (
            <button className="next-btn" onClick={handleNextQuestion}>
              Next Question
            </button>
          )}
        </div>

      </div>

    </div>
  </div>

  <div className="right-section">

    <div className="camera-label">Your Camera</div>

    <div className="camera-container">
      <video ref={camRef} autoPlay muted playsInline/>
    </div>

    <div className="camera-indicator">
      <div className={`dot ${isMicActive ? "live" : ""}`}/>
      <span className="camera-indicator-text">{isMicActive ? "Live" : "Standby"}</span>
    </div>

    {answeredQuestions.size === NUM_QUESTIONS_IN_INTERVIEW && currentQuestionIdx === NUM_QUESTIONS_IN_INTERVIEW - 1 && !isMicActive ? (
      <button 
        className="submit-btn" 
        onClick={handleSubmit}
        title="Submit your test for evaluation"
      >
        Submit Test - All {NUM_QUESTIONS_IN_INTERVIEW} Answers Complete
      </button>
    ) : (
      <div style={{opacity: 0, pointerEvents: 'none', height: '44px'}}></div>
    )}

    <div className="questions-list">
      <div className="questions-list-title">Questions</div>
      {Array.from({length: NUM_QUESTIONS_IN_INTERVIEW}, (_, i) => (
        <div 
          key={i}
          className={`question-item ${answeredQuestions.has(i) ? 'answered' : ''} ${currentQuestionIdx === i ? 'current' : ''}`}
          title={`Q${i+1}: ${behaviouralQuestions[i]}`}
        >
          <div className="question-item-number">{i + 1}</div>
          {answeredQuestions.has(i) && (
            <div className="question-item-check">✓</div>
          )}
        </div>
      ))}
    </div>

  </div>

</div>

</div>

)
}
