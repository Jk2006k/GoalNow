import React from "react"
import HomePageNavbar from "../components/HomePageNavbar"
import { Rocket, Briefcase, Chart, Bulb, Megaphone, Phone, Laptop, ThumbsUp, ImageIcon, D } from "../components/Doodles"

export default function UpdateProfilePage(){

const css = `

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300;1,9..144,400&display=swap');

*{
box-sizing:border-box;
margin:0;
padding:0;
}

.page-wrapper{
min-height:100vh;
background:#ffffff;
font-family:'Plus Jakarta Sans', sans-serif;
position:relative;
overflow:hidden;
padding-top:85px;
}

.form-wrapper{
min-height:calc(100vh - 85px);
display:flex;
align-items:center;
justify-content:center;
padding:60px 80px;
}

/* CARD */

.profile-form-card{
width:900px;
background:#ffffff;
border-radius:20px;
padding:50px 50px;
box-shadow:0 20px 70px rgba(0,0,0,0.12);
}

/* TITLE */

.form-title{
font-family:'Fraunces', serif;
font-size:2rem;
font-weight:300;
color:#24344d;
margin-bottom:35px;
text-align:center;
}

/* GRID LAYOUT */

.form-grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:22px 26px;
}

/* INPUT GROUP */

.form-group{
display:flex;
flex-direction:column;
}

.form-group label{
font-size:0.7rem;
letter-spacing:0.08em;
text-transform:uppercase;
margin-bottom:6px;
color:#6f6f6f;
}

.form-group input,
.form-group select{
padding:12px 14px;
border-radius:8px;
border:1px solid #dcdcdc;
font-size:0.9rem;
}

/* FULL WIDTH ITEMS */

.full-width{
grid-column:1 / span 2;
}

/* BUTTON */

.save-btn{
margin-top:10px;
background:#24344d;
color:#fff;
border:none;
padding:14px;
border-radius:10px;
font-weight:600;
cursor:pointer;
width:100%;
}

.save-btn:hover{
background:#3a4f72;
}

`

return(

<div className="page-wrapper">

<style>{css}</style>

<HomePageNavbar/>

{/* DOODLES */}

<D top="340px" left="6%" rotate={-10}><Rocket/></D>
<D bottom="10px" left="14%" rotate={8}><ThumbsUp/></D>
<D top="550px" left="30%" rotate={-6}><Bulb/></D>
<D top="120px" right="6%" rotate={10}><Briefcase/></D>
<D top="420px" right="17%" rotate={-8}><Chart/></D>
<D bottom="10px" right="5%" rotate={6}><Laptop/></D>
<D top="750px" left="1%" rotate={-6}><Megaphone/></D>
<D top="80px" left="45%" rotate={6}><ImageIcon/></D>

<div className="form-wrapper">

<div className="profile-form-card">

<h2 className="form-title">
Update Your Profile
</h2>

<div className="form-grid">

<div className="form-group">
<label>Profile Image</label>
<input type="file"/>
</div>

<div className="form-group">
<label>Resume Upload</label>
<input type="file"/>
</div>

<div className="form-group">
<label>Name</label>
<input type="text" placeholder="Enter your name"/>
</div>

<div className="form-group">
<label>Email</label>
<input type="email" placeholder="Enter your email"/>
</div>

<div className="form-group">
<label>Domain</label>
<select>
<option>Software Development</option>
<option>Data Science</option>
<option>Machine Learning</option>
<option>Cyber Security</option>
<option>Cloud Computing</option>
<option>UI / UX</option>
</select>
</div>

<div className="form-group">
<label>Sub Domain</label>
<input type="text" placeholder="Example: Backend Development"/>
</div>

<div className="form-group full-width">
<button className="save-btn">
Save Changes
</button>
</div>

</div>

</div>

</div>

</div>

)

}