import React from "react"
import HomePageNavbar from "../components/HomePageNavbar"
import { useNavigate } from "react-router-dom"
import { Rocket, Briefcase, Chart, Bulb, Megaphone, Phone, Laptop, ThumbsUp, ImageIcon, D } from "../components/Doodles"

export default function TechnicalInstructions(){

const navigate = useNavigate()

const css = `

.page-wrapper{
min-height:100vh;
background:#ffffff;
font-family:'Plus Jakarta Sans', sans-serif;
color:#24344d;
padding-top:85px;
}

.assessment-wrapper{
display:grid;
grid-template-columns:380px 1fr;
min-height:calc(100vh - 85px);
}

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

.right-panel{
padding:50px 70px;
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

.next-btn{
background:#24344d;
color:#fff;
border:none;
padding:14px 28px;
border-radius:10px;
font-weight:600;
cursor:pointer;
float:right;
}

.next-btn:hover{
background:#3a4f72;
}

`

const icons = {
  wifi: (
    <svg className="instruction-svg" viewBox="0 0 24 24">
      <path d="M5 12.55a11 11 0 0114.08 0"/>
      <path d="M1.42 9a16 16 0 0121.16 0"/>
      <path d="M8.53 16.11a6 6 0 016.95 0"/>
      <circle cx="12" cy="20" r="1" fill="#4a4a4a"/>
    </svg>
  ),
  bolt: (
    <svg className="instruction-svg" viewBox="0 0 24 24">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  monitor: (
    <svg className="instruction-svg" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  camera: (
    <svg className="instruction-svg" viewBox="0 0 24 24">
      <path d="M23 7l-7 5 7 5V7z"/>
      <rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  ),
  edit: (
    <svg className="instruction-svg" viewBox="0 0 24 24">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

const instructions = [
{
icon:icons.wifi,
label:"Stable Internet Connection",
sub:"Ensure your connection is stable before starting. Coding sessions cannot be resumed once interrupted."
},
{
icon:icons.bolt,
label:"Single Attempt Coding Round",
sub:"The coding challenge must be completed in one session without pausing."
},
{
icon:icons.monitor,
label:"Remain in Full Screen Mode",
sub:"Switching tabs or leaving full screen will automatically submit your test."
},
{
icon:icons.camera,
label:"Camera Must Stay Enabled",
sub:"Your webcam will monitor the session to maintain interview integrity."
},
{
icon:icons.edit,
label:"Write Code Independently",
sub:"Do not use external tools, AI assistants, or outside help while solving problems."
}
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

<div className="section-title">
Instructions
</div>

<div className="section-desc">
Read the following guidelines carefully before beginning the technical interview.
</div>

<ul className="instructions">
{instructions.map((item,i)=>(
<li className="instruction-item" key={i}>
<div className="instruction-icon">{item.icon}</div>
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

<button className="next-btn" onClick={()=>navigate("/technical-entry")}>
  Next →
</button>

</div>

</div>

</div>

)

}