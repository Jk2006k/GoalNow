import React, { useEffect, useState } from "react"
import HomePageNavbar from "../components/HomePageNavbar"
import { authService } from "../services/authService"
import { Rocket, Briefcase, Chart, Bulb, Megaphone, Phone, Laptop, ThumbsUp, ImageIcon, D } from "../components/Doodles"
import { useNavigate } from "react-router-dom";

export default function HomePage(){
const navigate = useNavigate();
const [user, setUser] = useState(null);

// Check authentication on component mount
useEffect(() => {
  if (!authService.isLoggedIn()) {
    navigate("/login")
    return
  }
  const currentUser = authService.getCurrentUser()
  setUser(currentUser)
}, [navigate])

const handleLogout = () => {
  authService.logout()
  navigate("/login")
}
const css = `

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300;1,9..144,400&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
}

.doodle-side {
  display: block;
}

.home-wrapper {
  min-height: calc(100vh - 85px);
  padding: 60px 80px 100px;
  padding-top: 130px;
  position: relative;
  z-index: 10;
}

.section-heading {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #777;
  margin-bottom: 26px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-heading::before {
  content: '';
  width: 20px;
  height: 2px;
  background: #a9ba82;
}

/* GRID */

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 24px;
  margin-bottom: 72px;
}

.practice-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 24px;
}

/* PROFILE CARD */

.profile-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 44px 40px;
  border: 1.5px solid #ffffff;
  box-shadow: 0 8px 40px rgba(0,0,0,0.06);
  transition: transform .25s ease, box-shadow .25s ease;
  position: relative;
}

.profile-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 50px rgba(0,0,0,0.12);
}

.profile-icon-wrap {
  width:52px;
  height:52px;
  border-radius:14px;
  background:#e9f7b3;
  border:1px solid #c8f23a;
  display:flex;
  align-items:center;
  justify-content:center;
  margin-bottom:24px;
  font-size:1.4rem;
}

.profile-card .tool-title {
  font-family:'Fraunces', serif;
  font-size:1.55rem;
  font-weight:300;
  color:#314000;
  margin-bottom:12px;
}

.profile-card .tool-title em {
  color:#6f9b00;
}

.profile-card .tool-desc {
  font-size:0.84rem;
  line-height:1.7;
  color:#667a34;
  margin-bottom:28px;
}

.profile-btn {
  background:#314000;
  color:#e8ff8a;
  border:none;
  padding:13px 24px;
  border-radius:10px;
  font-size:0.78rem;
  font-weight:600;
  cursor:pointer;
}

.profile-btn:hover {
  background:#3f5500;
}

/* SCORE CARD */

.score-card {
  background:#ffffff;
  border-radius:20px;
  padding:44px 40px;
  border:1.5px solid #ffffff;
  box-shadow:0 8px 40px rgba(0,0,0,0.08);
  transition: transform .25s ease, box-shadow .25s ease;
}

.score-card:hover{
  transform:translateY(-6px);
  box-shadow:0 20px 60px rgba(0,0,0,0.12);
}

.score-mini-bars{
  display:flex;
  gap:5px;
  align-items:flex-end;
  margin-bottom:28px;
  height:36px;
}

.score-bar{
  width:8px;
  border-radius:3px;
  background:#e0e0e0;
}

.score-bar.mid{
  background:#999999;
}

.score-bar.lit{
  background:#7bb600;
}

.score-card .tool-title{
  font-family:'Fraunces', serif;
  font-size:1.55rem;
  font-weight:300;
  color:#24344d;
  margin-bottom:12px;
}

.score-card .tool-title em{
  color:#7bb600;
}

.score-card .tool-desc{
  font-size:0.84rem;
  line-height:1.7;
  color:#5d6b85;
  margin-bottom:28px;
}

.score-btn{
  background:#24344d;
  color:#fff;
  border:none;
  padding:12px 24px;
  border-radius:10px;
  font-size:0.78rem;
  font-weight:600;
  cursor:pointer;
}

.score-btn:hover{
  background:#3a4f72;
}

/* PRACTICE CARDS */

.practice-card{
  border-radius:20px;
  padding:52px 48px;
  background:#ffffff;
  border:1px solid #ffffff;
  box-shadow:0 8px 40px rgba(0,0,0,0.08);
  transition:transform .25s ease, box-shadow .25s ease;
}

.practice-card:hover{
  transform:translateY(-6px);
  box-shadow:0 24px 64px rgba(0,0,0,0.12);
}

.practice-eyebrow{
  font-size:0.62rem;
  letter-spacing:0.2em;
  text-transform:uppercase;
  color:#8894aa;
  margin-bottom:18px;
}

.practice-title{
  font-family:'Fraunces', serif;
  font-size:2rem;
  font-weight:300;
  margin-bottom:18px;
  color:#24344d;
}

.practice-title em{
  color:#7bb600;
}

.practice-desc{
  font-size:0.84rem;
  line-height:1.7;
  color:#5d6b85;
  margin-bottom:32px;
}

.practice-btn{
  background:#24344d;
  color:#fff;
  border:none;
  padding:13px 26px;
  border-radius:10px;
  font-size:0.78rem;
  font-weight:700;
  cursor:pointer;
}

.practice-btn:hover{
  background:#3a4f72;
}

/* RESPONSIVE */

@media (max-width:1024px){
  .home-wrapper{padding:48px 48px 80px}
  .doodle-side{display:none}
}

@media (max-width:768px){
  .home-wrapper{padding:36px 24px 72px}
  .tools-grid,.practice-grid{grid-template-columns:1fr}
}

/* ORGANIZATION SECTION */

.org-section{
  width:100%;
  background:#f7f8f5;
  padding:90px 80px;
  margin-top:40px;
}

.org-container{
  max-width:1100px;
  margin:auto;
  text-align:center;
}

.org-eyebrow{
  font-size:0.65rem;
  letter-spacing:0.22em;
  text-transform:uppercase;
  color:#7c7c7c;
  margin-bottom:18px;
}

.org-title{
  font-family:'Fraunces', serif;
  font-size:2.4rem;
  font-weight:300;
  color:#24344d;
  margin-bottom:22px;
}

.org-title em{
  color:#7bb600;
}

.org-desc{
  font-size:0.95rem;
  line-height:1.8;
  color:#5d6b85;
  max-width:700px;
  margin:auto;
  margin-bottom:40px;
}

.org-btn{
  background:#24344d;
  color:#fff;
  border:none;
  padding:14px 30px;
  border-radius:10px;
  font-weight:600;
  font-size:0.85rem;
  cursor:pointer;
}

.org-btn:hover{
  background:#3a4f72;
}

`

return(
<div style={{
fontFamily:"'Plus Jakarta Sans', sans-serif",
background:"#ffffff",
minHeight:"100vh",
color:"#24344d",
position:"relative",
overflow:"hidden"
}}>

<style>{css}</style> 

<HomePageNavbar/>

<div className="doodle-side">
<D top="220px" left="2%" rotate={-10}><Rocket/></D>
<D bottom="10px" left="14%" rotate={8}><ThumbsUp/></D>
<D top="550px" left="30%" rotate={-6}><Bulb/></D>
<D top="120px" right="6%" rotate={10}><Briefcase/></D>
<D top="590px" right="12%" rotate={-8}><Chart/></D>
<D bottom="530px" right="1%" rotate={6}><Laptop/></D>
<D top="950px" left="1%" rotate={-6}><Megaphone/></D>
<D bottom="10px" right="20%" rotate={8}><Phone/></D>
<D top="80px" left="45%" rotate={6}><ImageIcon/></D>
</div>

<div className="home-wrapper">

<h2 className="section-heading">Your Dashboard</h2>

<div className="tools-grid">

<div className="profile-card">
<div className="profile-icon-wrap">👤</div>
<h3 className="tool-title" style={{ marginBottom: "6px" }}>Welcome, <em>{user?.firstName}</em></h3>
<p style={{ fontSize: "0.85rem", color: "#667a34", marginBottom: "20px" }}>{user?.email}</p>
<h3 className="tool-title">Update Your <em>Profile</em></h3>
<p className="tool-desc">
Maintain an updated profile with your skills, preferred roles and experience level. 
This helps Intbar personalise interview questions and generate realistic mock sessions tailored to your path.
</p>
<button 
className="profile-btn"
onClick={() => navigate("/profile")}
style={{ marginRight: "10px" }}
>
Update Profile ↗
</button></div>

<div className="score-card">
<div className="score-mini-bars">
<div className="score-bar" style={{height:"14px"}}></div>
<div className="score-bar mid" style={{height:"20px"}}></div>
<div className="score-bar lit" style={{height:"28px"}}></div>
<div className="score-bar mid" style={{height:"24px"}}></div>
<div className="score-bar lit" style={{height:"36px"}}></div>
<div className="score-bar" style={{height:"18px"}}></div>
<div className="score-bar mid" style={{height:"26px"}}></div>
<div className="score-bar lit" style={{height:"32px"}}></div>
</div>
<h3 className="tool-title">Score <em>Tracker</em></h3>
<p className="tool-desc">
Monitor your interview performance across practice sessions. 
Highlights strengths, weaknesses and progress so you can improve systematically.
</p>
<button className="score-btn">View Scores →</button>
</div>

</div>

<h2 className="section-heading">Prep & Conquer</h2>

<div className="practice-grid">

<div className="practice-card">
<h3 className="practice-title">Behavioural <br/><em>Interview</em></h3>
<p className="practice-desc">
Practice behavioural questions used by top companies and improve storytelling and communication with AI feedback.
</p>
<button 
className="practice-btn"
onClick={()=>navigate("/behavioural")}
>
Start Behavioural Practice →
</button>
</div>

<div className="practice-card">
<h3 className="practice-title">Technical <br/><em>Interview</em></h3>
<p className="practice-desc">
Prepare for coding and system design interviews with simulated sessions and performance analysis.
</p>
<button className="practice-btn" onClick={()=>navigate("/technical")}>Start Technical Round →</button>
</div>


</div>


{/* ORGANIZATION SECTION */}

<div className="org-section">

  <div className="org-container">

    <p className="org-eyebrow">
      For Organizations
    </p>

    <h2 className="org-title">
      Build <em>Custom Interview Paths</em>
    </h2>

    <p className="org-desc">
      Organizations and training institutes can design custom question sets
      tailored to specific industries, roles and skill requirements. Students
      can practice these curated questions and prepare for interviews that
      closely match the expectations of their target companies.
    </p>

    <button className="org-btn">
      Create Organization Workspace →
    </button>

  </div>

</div>
</div>

</div>
)

}