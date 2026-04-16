import React, { useState, useEffect } from "react"
import HomePageNavbar from "../components/HomePageNavbar"
import { authService } from "../services/authService"
import { Rocket, Briefcase, Chart, Bulb, Megaphone, Phone, Laptop, ThumbsUp, ImageIcon, D } from "../components/Doodles"

export default function UpdateProfilePage(){
const [user, setUser] = useState(null)
const [formData, setFormData] = useState({
  firstName: '',
  email: '',
  domain: '',
})
const [resumeFile, setResumeFile] = useState(null)
const [resumeFileName, setResumeFileName] = useState('')
const [profileImage, setProfileImage] = useState(null)
const fileInputRef = React.useRef(null)

useEffect(() => {
  const currentUser = authService.getCurrentUser()
  if (currentUser) {
    console.log('Current user from localStorage:', currentUser)
    console.log('Profile image in localStorage:', !!currentUser.profileImage)
    console.log('Profile image length:', currentUser.profileImage?.length || 0)
    console.log('Resume in localStorage:', !!currentUser.resume)
    console.log('Resume filename in localStorage:', currentUser.resumeFileName)
    
    // Also fetch fresh user data from server
    const userId = currentUser._id || currentUser.id
    if (userId) {
      authService.getProfile(userId).then(freshUser => {
        console.log('Fresh user data from server:', freshUser)
        console.log('Fresh profileImage available:', !!freshUser.profileImage)
        console.log('Fresh profileImage length:', freshUser.profileImage?.length || 0)
        console.log('Fresh resume available:', !!freshUser.resume)
        console.log('Fresh resume filename:', freshUser.resumeFileName)
        if (freshUser.profileImage) {
          console.log('ProfileImage starts with:', freshUser.profileImage.substring(0, 50))
        }
        setUser(freshUser)
        setFormData({
          firstName: freshUser.firstName || '',
          email: freshUser.email || '',
          domain: freshUser.domain || '',
        })
        // Set the resume filename from existing data so it displays in UI
        if (freshUser.resumeFileName) {
          setResumeFileName(freshUser.resumeFileName)
        }
      }).catch(err => {
        console.error('Error fetching profile:', err)
        // Fallback to localStorage data
        setUser(currentUser)
        setFormData({
          firstName: currentUser.firstName || '',
          email: currentUser.email || '',
          domain: currentUser.domain || '',
        })
        // Set resume filename from localStorage if available
        if (currentUser.resumeFileName) {
          setResumeFileName(currentUser.resumeFileName)
        }
      })
    }
  }
}, [])

const handleInputChange = (e) => {
  const { name, value } = e.target
  setFormData(prev => ({
    ...prev,
    [name]: value
  }))
}

const handleResumeChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    console.log('Resume file selected:', file.name, 'size:', file.size);
    const reader = new FileReader()
    reader.onload = () => {
      const resumeBase64 = reader.result
      setResumeFile(resumeBase64)
      setResumeFileName(file.name)
      console.log('Resume converted to base64, size:', resumeBase64.length);
    }
    reader.onerror = () => {
      console.error('Error reading resume file');
      alert('Error reading resume file');
    }
    reader.readAsDataURL(file)
  }
}

const handleProfileImageChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    console.log('Profile image selected:', file.name, 'size:', file.size)
    const reader = new FileReader()
    reader.onload = () => {
      console.log('File read, converting to image')
      const img = new Image()
      img.onload = () => {
        console.log('Image loaded, dimensions:', img.width, 'x', img.height)
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Resize image to 300x300 max
        if (width > 300 || height > 300) {
          const ratio = Math.min(300 / width, 300 / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
        
        try {
          const compressedUrl = canvas.toDataURL('image/jpeg', 0.7)
          console.log('✅ Image compressed:', compressedUrl.length, 'bytes')
          setProfileImage(compressedUrl)
          console.log('✅ Profile image updated')
        } catch (err) {
          console.error('Canvas error:', err)
          setProfileImage(reader.result)
        }
      }
      img.onerror = () => {
        console.error('Image load error')
        setProfileImage(reader.result)
      }
      img.src = reader.result
    }
    reader.onerror = () => {
      console.error('File read error')
    }
    reader.readAsDataURL(file)
  }
}

const handleSaveChanges = async () => {
  try {
    if (user) {
      // Validate all required fields
      if (!formData.firstName.trim()) {
        alert('Please enter your name');
        return;
      }
      if (!formData.email.trim()) {
        alert('Please enter your email');
        return;
      }
      if (!formData.domain) {
        alert('Please select a domain');
        return;
      }
      
      // Check if resume is provided (either new upload or existing)
      if (!resumeFile && !user.resume) {
        alert('Please upload a resume PDF');
        return;
      }
      
      const userId = user._id || user.id
      const updateData = {
        ...formData,
        resume: resumeFile || user.resume,
        resumeFileName: resumeFileName || user.resumeFileName,
        profileImage: profileImage || user.profileImage, // Include new profile image if uploaded
      }
      console.log('Saving profile with:');
      console.log('- New profile image:', profileImage ? 'YES' : 'NO');
      console.log('- Resume:', resumeFile ? 'YES (new)' : 'NO (using existing)');
      console.log('- Resume filename:', resumeFileName || user.resumeFileName);
      
      await authService.updateProfile(userId, updateData)
      const updatedUser = authService.getCurrentUser()
      setUser(updatedUser)
      setResumeFile(null)
      setProfileImage(null) // Clear the new profile image state after saving
      alert('Profile updated successfully!')
    }
  } catch (error) {
    alert('Failed to update profile')
    console.error(error)
  }
}

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
color:#24344d;
background-color:#ffffff;
}

.form-group input::placeholder {
color:#999999;
}

.form-group input:focus,
.form-group select:focus {
outline:none;
border-color:#24344d;
box-shadow:0 0 0 3px rgba(36, 52, 77, 0.1);
}

.form-group input[type="file"],
.form-group input[type="file"]::file-selector-button {
cursor:pointer;
}

.form-group input[type="file"]::-webkit-file-upload-button {
padding:8px 16px;
background:#24344d;
color:#ffffff;
border:none;
border-radius:6px;
cursor:pointer;
font-weight:600;
font-size:0.85rem;
}

.form-group input[type="file"]::file-selector-button {
padding:8px 16px;
background:#24344d;
color:#ffffff;
border:none;
border-radius:6px;
cursor:pointer;
font-weight:600;
font-size:0.85rem;
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

.avatar-section {
display: flex;
flex-direction: column;
align-items: center;
gap: 12px;
margin-bottom: 20px;
}

.avatar-display {
width: 80px;
height: 80px;
border-radius: 50%;
border: 3px solid #24344d;
display: flex;
align-items: center;
justify-content: center;
font-size: 2.5rem;
background: #f5f5f5;
object-fit: cover;
}

.avatar-display img {
width: 100%;
height: 100%;
border-radius: 50%;
object-fit: cover;
}

.avatar-link {
text-decoration: underline;
color: #24344d;
cursor: pointer;
font-size: 0.9rem;
font-weight: 600;
}

.avatar-link:hover {
color: #3a4f72;
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

<div className="avatar-section" style={{ gridColumn: '1 / span 2' }}>
<div className="avatar-display">
  {(profileImage || user?.profileImage) && (profileImage || user?.profileImage).length > 0 ? (
    <img 
      key={profileImage || user?.profileImage}
      src={profileImage || user.profileImage}
      alt="Profile" 
      style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}
      onLoad={() => console.log('Profile image loaded successfully')}
      onError={(e) => {
        console.log('Profile image failed to load, showing initials instead')
        // On error, show avatar with initials
        e.target.style.display = 'none'
        const parent = e.target.parentElement
        if (parent && !parent.querySelector('.avatar-fallback')) {
          const span = document.createElement('span')
          span.className = 'avatar-fallback'
          const firstName = user?.firstName || 'U'
          const lastName = user?.lastName || ''
          const initials = (firstName[0] || '') + (lastName[0] || '')
          span.textContent = initials.toUpperCase()
          span.style.display = 'flex'
          span.style.alignItems = 'center'
          span.style.justifyContent = 'center'
          span.style.fontSize = '2rem'
          span.style.fontWeight = '600'
          span.style.width = '100%'
          span.style.height = '100%'
          span.style.background = '#6366f1'
          span.style.color = 'white'
          span.style.borderRadius = '50%'
          parent.appendChild(span)
        }
      }}
    />
  ) : (
    <span style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      fontWeight: '600',
      width: '100%',
      height: '100%',
      background: '#6366f1',
      color: 'white',
      borderRadius: '50%'
    }}>
      {(user?.firstName?.[0] || '') + (user?.lastName?.[0] || 'U')}
    </span>
  )}
</div>
<p 
  className="avatar-link"
  onClick={() => fileInputRef.current?.click()}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
  style={{ cursor: 'pointer' }}
>
  Change Avatar
</p>
<input 
  ref={fileInputRef}
  type="file"
  accept="image/*"
  onChange={handleProfileImageChange}
  style={{ display: 'none' }}
/>
</div>

<div className="form-group">
<label>Name</label>
<input 
  type="text" 
  name="firstName"
  value={formData.firstName}
  onChange={handleInputChange}
  placeholder="Enter your name"
  required
/>
</div>

<div className="form-group">
<label>Email</label>
<input 
  type="email" 
  name="email"
  value={formData.email}
  onChange={handleInputChange}
  placeholder="Enter your email"
  required
/>
</div>

<div className="form-group full-width">
<label>Domain</label>
<select name="domain" value={formData.domain} onChange={handleInputChange} required>
<option value="">Select a domain</option>
<option value="Software Development">Software Development</option>
<option value="Data Science">Data Science</option>
<option value="Machine Learning">Machine Learning</option>
<option value="Cyber Security">Cyber Security</option>
<option value="Cloud Computing">Cloud Computing</option>
<option value="UI / UX">UI / UX</option>
<option value="Others">Others</option>
</select>
</div>

<div className="form-group full-width">
<label>Resume Upload</label>
<input 
  type="file"
  accept=".pdf"
  onChange={handleResumeChange}
/>
{resumeFileName && (
  <div style={{ 
    marginTop: '8px', 
    padding: '8px 12px', 
    backgroundColor: '#e8f5e9', 
    borderRadius: '6px', 
    fontSize: '0.85rem',
    color: '#2e7d32',
    fontWeight: '500'
  }}>
    ✓ Current resume: <strong>{resumeFileName}</strong>
  </div>
)}
</div>

<div className="form-group full-width">
<button className="save-btn" onClick={handleSaveChanges}>
Save Changes
</button>
</div>

</div>

</div>

</div>

</div>

)

}