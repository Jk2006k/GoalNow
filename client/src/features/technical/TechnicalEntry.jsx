import React, { useRef, useState } from "react"
import HomePageNavbar from "../shared/components/HomePageNavbar"

export default function TechnicalEntry(){

const camRef = useRef(null)
const screenRef = useRef(null)

const [camEnabled,setCamEnabled] = useState(false)
const [screenEnabled,setScreenEnabled] = useState(false)
const [fullEnabled,setFullEnabled] = useState(false)
const [checksCompleted,setChecksCompleted] = useState(false)

React.useEffect(()=>{
  if(camEnabled && screenEnabled && fullEnabled && !checksCompleted){
    setChecksCompleted(true)
  }
},[camEnabled,screenEnabled,fullEnabled,checksCompleted])

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
  const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true})
  camRef.current.srcObject = stream
  setCamEnabled(true)
}

async function enableScreen(){
  const stream = await navigator.mediaDevices.getDisplayMedia({video:true})
  screenRef.current.srcObject = stream
  setScreenEnabled(true)
}

function enableFull(){
  document.documentElement.requestFullscreen()
  setFullEnabled(true)
}

const css = `

.page-wrapper{
height:100vh;
overflow:hidden;
background:#ffffff;
font-family:'Plus Jakarta Sans', sans-serif;
color:#24344d;
padding-top:85px;
}

.assessment-wrapper{
display:grid;
grid-template-columns:380px 1fr;
height:calc(100vh - 85px);
}

/* LEFT PANEL */

.left-panel{
background:#f7f8f5;
border-right:2px solid #e4e4e4;
padding:40px 35px;
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

/* RIGHT PANEL */

.right-panel{
padding:32px 60px;
display:flex;
flex-direction:column;
overflow:hidden;
}

.page-header{
margin-bottom:16px;
}

.permission-title{
font-size:1.4rem;
font-weight:700;
margin-bottom:4px;
}

.permission-desc{
color:#6b6b6b;
font-size:0.88rem;
}

/* PRE NOTE */

.pre-note{
background:#f7f8f5;
border:1px solid #e4e4e4;
border-left:3px solid #24344d;
border-radius:8px;
padding:12px 16px;
margin-bottom:20px;
display:flex;
gap:12px;
align-items:flex-start;
}

.pre-note-icon{
flex-shrink:0;
width:30px;
height:30px;
background:#24344d;
border-radius:6px;
display:flex;
align-items:center;
justify-content:center;
}

.pre-note-icon svg{
width:15px;
height:15px;
stroke:#fff;
fill:none;
stroke-width:2;
stroke-linecap:round;
stroke-linejoin:round;
}

.pre-note-text{
display:flex;
flex-direction:column;
gap:2px;
}

.pre-note-label{
font-weight:700;
font-size:0.82rem;
color:#24344d;
text-transform:uppercase;
letter-spacing:0.04em;
}

.pre-note-body{
font-size:0.82rem;
color:#4a5568;
line-height:1.5;
}

/* PERMISSION GRID */

.permission-grid{
display:flex;
flex-direction:row;
gap:16px;
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

/* PERMISSION BUTTON */

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

/* FULLSCREEN */

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

/* BOTTOM */

.bottom-row{
display:flex;
align-items:center;
justify-content:space-between;
margin-top:auto;
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

`

return(

<div className="page-wrapper">

<style>{css}</style>

<HomePageNavbar/>

<div className="assessment-wrapper">

<div className="left-panel">

<div className="assessment-title">
Take an Assessment
</div>

<div className="assessment-card">

<div className="assessment-name">
Technical Interview | Coding Assessment
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
<strong>3</strong>
</div>

</div>

</div>

<div className="right-panel">

<div className="page-header">
<div className="permission-title">
System Check
</div>
<div className="permission-desc">
Complete all checks before starting the coding interview.
</div>
</div>

{/* PRE-INTERVIEW NOTE */}
<div className="pre-note">
<div className="pre-note-icon">
<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
</div>
<div className="pre-note-text">
<span className="pre-note-label">Before You Begin</span>
<span className="pre-note-body">
Ensure you are in a quiet, well-lit space with a stable internet connection. Once the interview starts, do not switch tabs or exit fullscreen — this will auto-submit your session.
</span>
</div>
</div>

<div className="permission-grid">

<div className={`permission-box ${camEnabled?"active":""}`}>
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
? <video ref={camRef} autoPlay muted playsInline/>
: <><video ref={camRef} autoPlay muted playsInline style={{display:"none"}}/><div className="preview-placeholder"><svg viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg><span>No feed</span></div></>
}
</div>
<button className={`permission-btn ${camEnabled ? "done-btn" : ""}`} onClick={!camEnabled ? enableCamMic : undefined}>
{camEnabled ? "Camera Enabled" : "Enable Camera & Mic"}
</button>
</div>

<div className={`permission-box ${screenEnabled?"active":""}`}>
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
? <video ref={screenRef} autoPlay muted playsInline/>
: <><video ref={screenRef} autoPlay muted playsInline style={{display:"none"}}/><div className="preview-placeholder"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><span>No feed</span></div></>
}
</div>
<button className={`permission-btn ${screenEnabled ? "done-btn" : ""}`} onClick={!screenEnabled ? enableScreen : undefined}>
{screenEnabled ? "Screen Share Active" : "Enable Screen Share"}
</button>
</div>

</div>

<div className={`fullscreen-box ${fullEnabled?"active":""}`}>
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

<div className="bottom-row">

<div className="readiness-check">
<div className={`readiness-dot ${camEnabled ? "lit" : ""}`}/>
<div className={`readiness-dot ${screenEnabled ? "lit" : ""}`}/>
<div className={`readiness-dot ${fullEnabled ? "lit" : ""}`}/>
<span>{checksCompleted && camEnabled && screenEnabled && fullEnabled ? "All checks passed — ready to begin" : `${[camEnabled,screenEnabled,fullEnabled].filter(Boolean).length} of 3 checks complete`}</span>
</div>

<button className="start-btn" disabled={!checksCompleted || !fullEnabled}>
Start Coding Round →
</button>

</div>

</div>

</div>

</div>

)

}