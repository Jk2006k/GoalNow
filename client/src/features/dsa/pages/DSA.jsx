import React, { useRef, useState } from "react"
import HomePageNavbar from "../../shared/components/HomePageNavbar"
import { useNavigate } from "react-router-dom"
import { Rocket, Briefcase, Chart, Bulb, Megaphone, Phone, Laptop, ThumbsUp, ImageIcon, D } from "../../shared/components/Doodles"

export default function DSAInstructions(){

const navigate = useNavigate()
const camRef = useRef(null)
const screenRef = useRef(null)
const [camEnabled, setCamEnabled] = useState(false)
const [screenEnabled, setScreenEnabled] = useState(false)
const [fullEnabled, setFullEnabled] = useState(false)
const [difficultySelected, setDifficultySelected] = useState(null)
const [checksCompleted, setChecksCompleted] = useState(false)

// Scroll to top on component mount
React.useEffect(() => {
  window.scrollTo(0, 0)
}, [])

React.useEffect(() => {
  if(camEnabled && screenEnabled && fullEnabled && difficultySelected && !checksCompleted){
    setChecksCompleted(true)
  }
}, [camEnabled, screenEnabled, fullEnabled, difficultySelected, checksCompleted])

React.useEffect(() => {
  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      setFullEnabled(false)
      setChecksCompleted(false)
    }
  }
  
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
}, [])

async function enableCamMic(){
  const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true })
  camRef.current.srcObject = stream
  setCamEnabled(true)
}

async function enableScreen(){
  const stream = await navigator.mediaDevices.getDisplayMedia({ video:true })
  screenRef.current.srcObject = stream
  setScreenEnabled(true)
  
  stream.getTracks().forEach(track => {
    track.addEventListener('ended', () => {
      setScreenEnabled(false)
      setChecksCompleted(false)
    })
  })
}

async function enableFull(){
  if (!screenEnabled) {
    try {
      await enableScreen()
    } catch (error) {
      console.error('Failed to enable screen share:', error)
    }
  }
  document.documentElement.requestFullscreen()
  setFullEnabled(true)
}

const css = `

/* ── Reset body/html so only our panels scroll ── */
html, body {
  overflow: hidden;
  height: 100%;
  margin: 0;
  padding: 0;
}

.page-wrapper{
  height: 100vh;
  overflow: hidden;
  background:#ffffff;
  font-family:'Plus Jakarta Sans', sans-serif;
  color:#24344d;
  display: flex;
  flex-direction: column;
}

.assessment-wrapper{
  display: flex;
  flex: 1;
  overflow: hidden;
  margin-top: 85px;
}

.left-panel{
  width: 380px;
  flex-shrink: 0;
  background:#f7f8f5;
  border-right:2px solid #e4e4e4;
  padding:40px 35px;
  overflow: hidden;
  height: 100%;
}

.assessment-title{
font-size:1.7rem;
font-weight:700;
margin-bottom:30px;
}

.assessment-card{
background:#fff;
border:1px dashed #cfcfcf;
padding:28px;
border-radius:10px;
}

.assessment-name{
font-weight:600;
margin-bottom:25px;
}

.assessment-info{
display:flex;
justify-content:space-between;
margin-bottom:20px;
font-size:0.9rem;
}

.right-panel{
  flex: 1;
  overflow-y: auto;
  height: 100%;
  padding: 50px 70px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.right-panel::-webkit-scrollbar {
  display: none;
}

.section-title{
font-size:1.5rem;
font-weight:700;
margin-bottom:10px;
}

.section-desc{
color:#6b6b6b;
margin-bottom:20px;
}

.instructions{
list-style:none;
padding:0;
margin:0 0 30px 0;
display:flex;
flex-direction:column;
gap:10px;
}

.instruction-item{
display:flex;
align-items:flex-start;
gap:14px;
background:#f9fafb;
border:1px solid #eaeaea;
border-radius:10px;
padding:14px 16px;
transition:box-shadow 0.2s, border-color 0.2s;
}

.instruction-item:hover{
box-shadow:0 2px 10px rgba(36,52,77,0.08);
border-color:#c4c4c4;
}

.instruction-icon{
flex-shrink:0;
width:36px;
height:36px;
border-radius:8px;
background:#efefef;
display:flex;
align-items:center;
justify-content:center;
}

.instruction-svg{
width:17px;
height:17px;
stroke:#4a4a4a;
stroke-width:1.8;
fill:none;
}

.instruction-text{
display:flex;
flex-direction:column;
gap:3px;
}

.instruction-label{
font-weight:600;
font-size:0.88rem;
color:#24344d;
}

.instruction-sub{
font-size:0.81rem;
color:#6b7a8d;
line-height:1.5;
}

.honour-box{
background:#f1f6ff;
border:1px solid #d8e6ff;
padding:22px;
border-radius:10px;
margin-top:20px;
margin-bottom:30px;
}

.honour-title{
font-weight:600;
margin-bottom:10px;
}

/* PERMISSION GRID */
.permission-grid{
  display:flex;
  flex-direction:row;
  gap:16px;
  margin-top:30px;
  margin-bottom:14px;
  justify-content:flex-start;
}

.permission-box{
  border:1px solid #e4e4e4;
  border-radius:10px;
  padding:14px;
  background:#fff;
  transition:border-color 0.2s, box-shadow 0.2s;
  width:220px;
  flex-shrink:0;
}
.permission-box.active{
  border-color:#24344d;
  box-shadow:0 0 0 2px rgba(36,52,77,0.07);
}

.perm-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:10px;
}
.perm-title-row{
  display:flex;
  align-items:center;
  gap:8px;
}
.perm-icon{
  width:28px;
  height:28px;
  background:#f0f0f0;
  border-radius:6px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.perm-icon svg{
  width:14px;
  height:14px;
  stroke:#4a4a4a;
  fill:none;
  stroke-width:1.8;
  stroke-linecap:round;
  stroke-linejoin:round;
}
.perm-label{
  font-weight:600;
  font-size:0.82rem;
  color:#24344d;
}
.status-badge{
  font-size:0.7rem;
  font-weight:600;
  padding:3px 8px;
  border-radius:20px;
  letter-spacing:0.02em;
  white-space:nowrap;
}
.status-badge.pending{
  background:#f3f3f3;
  color:#888;
}
.status-badge.done{
  background:#e6f4ea;
  color:#1e7e34;
}

.preview{
  height:120px;
  background:#f7f8f5;
  border:1px solid #ececec;
  border-radius:7px;
  overflow:hidden;
  margin-bottom:10px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.preview-placeholder{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:5px;
}
.preview-placeholder svg{
  width:22px;
  height:22px;
  stroke:#b0b0b0;
  fill:none;
  stroke-width:1.5;
  stroke-linecap:round;
  stroke-linejoin:round;
}
.preview-placeholder span{
  font-size:0.72rem;
  color:#b0b0b0;
}
.preview video{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}

.permission-btn{
  width:100%;
  padding:8px 14px;
  border-radius:7px;
  font-size:0.78rem;
  font-weight:600;
  cursor:pointer;
  transition:all 0.2s;
  border:1.5px solid #24344d;
  background:#fff;
  color:#24344d;
}
.permission-btn:hover{
  background:#24344d;
  color:#fff;
}
.permission-btn.done-btn{
  border-color:#c8e6c9;
  background:#f1f8f1;
  color:#2e7d32;
  cursor:default;
}

/* FULLSCREEN BOX */
.fullscreen-box{
  border:1px solid #e4e4e4;
  border-radius:10px;
  padding:14px 16px;
  background:#fff;
  margin-bottom:18px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  transition:border-color 0.2s;
}
.fullscreen-box.active{
  border-color:#24344d;
  box-shadow:0 0 0 2px rgba(36,52,77,0.07);
}
.fullscreen-left{
  display:flex;
  align-items:center;
  gap:10px;
}
.fullscreen-left .perm-icon{
  width:32px;
  height:32px;
}
.fullscreen-meta{
  display:flex;
  flex-direction:column;
  gap:2px;
}
.fullscreen-title{
  font-weight:600;
  font-size:0.85rem;
  color:#24344d;
}
.fullscreen-sub{
  font-size:0.78rem;
  color:#888;
}
.fullscreen-btn{
  flex-shrink:0;
  padding:8px 16px;
  border-radius:7px;
  font-size:0.8rem;
  font-weight:600;
  cursor:pointer;
  transition:all 0.2s;
  border:1.5px solid #24344d;
  background:#fff;
  color:#24344d;
  white-space:nowrap;
}
.fullscreen-btn:hover{
  background:#24344d;
  color:#fff;
}
.fullscreen-btn.done-btn{
  border-color:#c8e6c9;
  background:#f1f8f1;
  color:#2e7d32;
  cursor:default;
}

.readiness-check{
  display:flex;
  align-items:center;
  gap:8px;
  font-size:0.82rem;
  color:#888;
}
.readiness-dot{
  width:8px;
  height:8px;
  border-radius:50%;
  background:#e0e0e0;
}
.readiness-dot.lit{
  background:#34a853;
  box-shadow:0 0 0 3px rgba(52,168,83,0.15);
}

.start-btn{
  padding:12px 28px;
  background:#24344d;
  border:none;
  border-radius:9px;
  font-weight:700;
  font-size:0.9rem;
  color:white;
  cursor:pointer;
  letter-spacing:0.02em;
  transition:background 0.2s, transform 0.15s;
  display:flex;
  align-items:center;
  gap:8px;
}
.start-btn:hover:not(:disabled){
  background:#1a2a3d;
  transform:translateY(-1px);
}
.start-btn:disabled{
  background:#c0c0c0;
  cursor:not-allowed;
  opacity:0.6;
}
.start-btn svg{
  width:15px;
  height:15px;
  stroke:#fff;
  fill:none;
  stroke-width:2.2;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.system-check-section{
  margin-top:30px;
  clear:both;
  padding-bottom: 40px;
}

.system-check-title{
  font-size:1.2rem;
  font-weight:700;
  margin-bottom:10px;
  color:#24344d;
}

/* Difficulty Selection — Black & White Theme */
.difficulty-section{
  margin-top:30px;
  margin-bottom:30px;
}

.difficulty-title{
  font-size:1.1rem;
  font-weight:700;
  margin-bottom:15px;
  color:#24344d;
}

.difficulty-subtitle{
  font-size:0.85rem;
  color:#6b7a8d;
  margin-bottom:12px;
}

.difficulty-grid{
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap:12px;
  margin-bottom:15px;
}

.difficulty-option{
  border:1.5px solid #e4e4e4;
  border-radius:10px;
  padding:16px;
  background:#fff;
  cursor:pointer;
  transition:all 0.2s ease;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:8px;
  text-align:center;
  position:relative;
}

.difficulty-option:hover{
  border-color:#9a9a9a;
  box-shadow:0 2px 10px rgba(0,0,0,0.08);
}

.difficulty-option.selected{
  border-color:#24344d;
  background:#f5f5f5;
  box-shadow:0 0 0 2px rgba(36,52,77,0.12);
}

.difficulty-badge{
  width:42px;
  height:42px;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#f0f0f0;
  color:#4a4a4a;
  border:1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.difficulty-option.selected .difficulty-badge{
  background:#24344d;
  color:#fff;
  border-color:#24344d;
}

.difficulty-name{
  font-weight:700;
  font-size:0.95rem;
  color:#24344d;
}

.difficulty-count{
  font-size:0.75rem;
  color:#888;
}

.difficulty-tag{
  font-size:0.68rem;
  font-weight:600;
  letter-spacing:0.04em;
  text-transform:uppercase;
  color:#888;
  background:#f0f0f0;
  border:1px solid #e0e0e0;
  border-radius:4px;
  padding:2px 7px;
}

.difficulty-option.selected .difficulty-tag{
  background:#24344d;
  color:#fff;
  border-color:#24344d;
}

.difficulty-checkmark{
  position:absolute;
  top:8px;
  right:8px;
  width:20px;
  height:20px;
  border-radius:50%;
  background:#24344d;
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:0.75rem;
  font-weight:700;
}

`

const icons = {
  wifi: (
    <svg className="instruction-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12.55a11 11 0 0114.08 0" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.42 9a16 16 0 0121.16 0" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.53 16.11a6 6 0 016.95 0" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="20" r="1" fill="#4a4a4a" stroke="none"/>
    </svg>
  ),
  bolt: (
    <svg className="instruction-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  monitor: (
    <svg className="instruction-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="8" y1="21" x2="16" y2="21" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12" y2="21" strokeLinecap="round"/>
    </svg>
  ),
  camera: (
    <svg className="instruction-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 7l-7 5 7 5V7z" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  edit: (
    <svg className="instruction-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

const instructions = [
  {
    icon: icons.wifi,
    label: "Stable Internet Connection",
    sub: "Ensure your connection is stable before starting. Coding sessions cannot be resumed once interrupted."
  },
  {
    icon: icons.bolt,
    label: "Single Attempt DSA Round",
    sub: "The coding challenge must be completed in one session without pausing."
  },
  {
    icon: icons.monitor,
    label: "Remain in Full Screen Mode",
    sub: "Switching tabs or leaving full screen will automatically submit your test."
  },
  {
    icon: icons.camera,
    label: "Camera Must Stay Enabled",
    sub: "Your webcam will monitor the session to maintain interview integrity."
  },
  {
    icon: icons.edit,
    label: "Write Code Independently",
    sub: "Do not use external tools, AI assistants, or outside help while solving problems."
  }
]

const difficultyOptions = [
  {
    key: "easy",
    label: "Easy",
    count: "3 Questions",
    tag: "Beginner",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    )
  },
  {
    key: "medium",
    label: "Medium",
    count: "3 Questions",
    tag: "Moderate",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    )
  },
  {
    key: "hard",
    label: "Hard",
    count: "3 Questions",
    tag: "Advanced",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    )
  },
  {
    key: "prep",
    label: "Interview Prep",
    count: "Mixed",
    tag: "Mixed",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    )
  },
]

return(

<div className="page-wrapper">

<style>{css}</style>

<HomePageNavbar/>

<D top="80px" left="24%" rotate={-160}><Rocket/></D>
<D bottom="150px" left="14%" rotate={8}><ThumbsUp/></D>
<D top="450px" right="20%" rotate={-6}><Bulb/></D>
<D top="120px" right="6%" rotate={10}><Briefcase/></D>
<D top="800px" left="20%" rotate={6}><ImageIcon/></D>

<div className="assessment-wrapper">

  <div className="left-panel">

    <div className="assessment-title">
      Take an Assessment
    </div>

    <div className="assessment-card">

      <div className="assessment-name">
        DSA Interview | Coding Assessment
      </div>

      <div className="assessment-info">
        <span>Proctoring</span>
        <strong>Online</strong>
      </div>

      <div className="assessment-info">
        <span>Duration</span>
        <strong>45-60 min</strong>
      </div>

      <div className="assessment-info">
        <span>Total Questions</span>
        <strong>5</strong>
      </div>

    </div>

  </div>

  <div className="right-panel">

    <div className="section-title">
      Instructions
    </div>

    <div className="section-desc">
      Read the following guidelines carefully before beginning the DSA interview.
    </div>

    <ul className="instructions">
      {instructions.map((item, i) => (
        <li className="instruction-item" key={i}>
          <div className="instruction-icon">
            {item.icon}
          </div>
          <div className="instruction-text">
            <span className="instruction-label">{item.label}</span>
            <span className="instruction-sub">{item.sub}</span>
          </div>
        </li>
      ))}
    </ul>

    <div className="honour-box">

      <div className="honour-title">
        Intbar Honour Code
      </div>

      <p>
        All solutions submitted must be your own work. Use of external code repositories,
        AI tools, or collaboration with others during the test is strictly prohibited.
        Violation of this code may lead to disqualification.
      </p>

    </div>

    {/* SYSTEM CHECK SECTION */}
    <div className="system-check-section">

      <div className="system-check-title">System Check</div>

      {/* DIFFICULTY SELECTION */}
      <div className="difficulty-section">
        <div className="difficulty-title">Select Difficulty Level</div>
        <div className="difficulty-subtitle">Choose the difficulty level for your coding challenge</div>

        <div className="difficulty-grid">
          {difficultyOptions.map(({ key, icon, label, count, tag }) => (
            <div
              key={key}
              className={`difficulty-option ${difficultySelected === key ? 'selected' : ''}`}
              onClick={() => setDifficultySelected(key)}
            >
              {difficultySelected === key && <div className="difficulty-checkmark">✓</div>}
              <div className="difficulty-badge">{icon}</div>
              <div className="difficulty-name">{label}</div>
              <div className="difficulty-count">{count}</div>
              <div className="difficulty-tag">{tag}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CAMERA + SCREEN */}
      <div className="permission-grid">

        <div className={`permission-box ${camEnabled ? "active" : ""}`}>
          <div className="perm-header">
            <div className="perm-title-row">
              <div className="perm-icon">
                <svg viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              </div>
              <span className="perm-label">Camera & Mic</span>
            </div>
            <span className={`status-badge ${camEnabled ? "done" : "pending"}`}>{camEnabled ? "✓ Active" : "Pending"}</span>
          </div>
          <div className="preview">
            {camEnabled
              ? <video ref={camRef} autoPlay muted playsInline onContextMenu={(e) => e.preventDefault()} disablePictureInPicture controlsList="nofullscreen nodownload"/>
              : <><video ref={camRef} autoPlay muted playsInline style={{display:"none"}} onContextMenu={(e) => e.preventDefault()} disablePictureInPicture controlsList="nofullscreen nodownload"/><div className="preview-placeholder"><svg viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg><span>No feed</span></div></>
            }
          </div>
          <button className={`permission-btn ${camEnabled ? "done-btn" : ""}`} onClick={!camEnabled ? enableCamMic : undefined}>
            {camEnabled ? "Camera Enabled" : "Enable Camera & Mic"}
          </button>
        </div>

        <div className={`permission-box ${screenEnabled ? "active" : ""}`}>
          <div className="perm-header">
            <div className="perm-title-row">
              <div className="perm-icon">
                <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <span className="perm-label">Screen Share</span>
            </div>
            <span className={`status-badge ${screenEnabled ? "done" : "pending"}`}>{screenEnabled ? "✓ Active" : "Pending"}</span>
          </div>
          <div className="preview">
            {screenEnabled
              ? <video ref={screenRef} autoPlay muted playsInline onContextMenu={(e) => e.preventDefault()} disablePictureInPicture controlsList="nofullscreen nodownload"/>
              : <><video ref={screenRef} autoPlay muted playsInline style={{display:"none"}} onContextMenu={(e) => e.preventDefault()} disablePictureInPicture controlsList="nofullscreen nodownload"/><div className="preview-placeholder"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><span>No feed</span></div></>
            }
          </div>
          <button className={`permission-btn ${screenEnabled ? "done-btn" : ""}`} onClick={!screenEnabled ? enableScreen : undefined}>
            {screenEnabled ? "Screen Share Active" : "Enable Screen Share"}
          </button>
        </div>

      </div>

      {/* FULLSCREEN */}
      <div className={`fullscreen-box ${fullEnabled ? "active" : ""}`}>
        <div className="fullscreen-left">
          <div className="perm-icon" style={{width:"32px",height:"32px"}}>
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="#4a4a4a" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
            </svg>
          </div>
          <div className="fullscreen-meta">
            <span className="fullscreen-title">Full Screen Mode</span>
            <span className="fullscreen-sub">Required throughout — exiting will auto-submit your test.</span>
          </div>
        </div>
        <button className={`fullscreen-btn ${fullEnabled ? "done-btn" : ""}`} onClick={!fullEnabled ? enableFull : undefined}>
          {fullEnabled ? "✓ Fullscreen Active" : "Enable Full Screen"}
        </button>
      </div>

      {/* READINESS & START BUTTON */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"20px"}}>
        <div className="readiness-check">
          <div className={`readiness-dot ${camEnabled ? "lit" : ""}`}/>
          <div className={`readiness-dot ${screenEnabled ? "lit" : ""}`}/>
          <div className={`readiness-dot ${fullEnabled ? "lit" : ""}`}/>
          <div className={`readiness-dot ${difficultySelected ? "lit" : ""}`}/>
          <span>{checksCompleted && camEnabled && screenEnabled && fullEnabled && difficultySelected ? "All checks passed — ready to begin" : `${[camEnabled,screenEnabled,fullEnabled,difficultySelected].filter(Boolean).length} of 4 checks complete`}</span>
        </div>
        <button
          className="start-btn"
          disabled={!checksCompleted || !fullEnabled || !difficultySelected}
          onClick={async () => {
            if (camRef.current?.srcObject) {
              camRef.current.srcObject.getTracks().forEach(t => t.stop())
              camRef.current.srcObject = null
            }

            const screenStream = screenRef.current?.srcObject || null
            const hasLiveScreen = !!screenStream?.getTracks?.().some(t => t.readyState === 'live')

            if (!hasLiveScreen) {
              alert('Screen share is required. Please enable screen share before starting the interview.')
              return
            }

            if (!document.fullscreenElement) {
              try {
                await document.documentElement.requestFullscreen()
                setFullEnabled(true)
              } catch {
                alert('Please enable full screen before starting the interview.')
                return
              }
            }

            window.__goalnowScreenStream = screenStream
            window.__goalnowDifficulty = difficultySelected
            navigate("/dsa-interview")
          }}
        >
          Start DSA Round
          <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>

    </div>

  </div>

</div>

</div>

)

}