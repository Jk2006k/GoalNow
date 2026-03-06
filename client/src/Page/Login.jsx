import React, { useState } from "react"
import Navbar from "../components/Navbar"
import { Rocket, Briefcase, Chart, Bulb, Megaphone, Phone, Laptop, ThumbsUp, ImageIcon, D } from "../components/Doodles"

export default function LoginPage() {

const [name, setName] = useState("")
const [email, setEmail] = useState("")
const [profile, setProfile] = useState(() => `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random()}`)
const [step, setStep] = useState(1) // 1: name, 2: email

function handleImage(e) {
  const file = e.target.files[0]
  if(file) {
    const url = URL.createObjectURL(file)
    setProfile(url)
  }
}

const css = `
  * {
    box-sizing: border-box;
  }

  .login-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 85px);
    position: relative;
  }

  .login-card {
    background: #fff;
    padding: 48px 42px;
    border-radius: 16px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.08);
    animation: slideUp 0.5s ease-out;
    position: relative;
    z-index: 10;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .login-title {
    font-size: 1.6rem;
    font-weight: 800;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
    text-align: center;
  }

  .login-subtitle {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 32px;
    text-align: center;
  }

  .profile-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 28px;
  }

  .profile-image {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #111;
    margin-bottom: 14px;
    transition: transform 0.2s ease;
  }

  .profile-image:hover {
    transform: scale(1.05);
  }

  .profile-upload-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #111;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.2s ease;
  }

  .profile-upload-label:hover {
    color: #555;
  }

  .profile-upload-input {
    display: none;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .form-input {
    width: 100%;
    padding: 14px 16px;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.95rem;
    font-family: inherit;
    transition: all 0.25s ease;
    outline: none;
  }

  .form-input:focus {
    border-color: #111;
    box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.1);
  }

  .form-input::placeholder {
    color: #999;
  }

  .btn-primary {
    width: 100%;
    background: #111;
    color: #fff;
    border: none;
    padding: 15px;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.25s ease;
    font-family: inherit;
    text-transform: uppercase;
  }

  .btn-primary:hover {
    background: #000;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  .divider-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
  }

  .divider-line {
    flex: 1;
    height: 1px;
    background: #e0e0e0;
  }

  .divider-text {
    font-size: 0.8rem;
    color: #999;
    font-weight: 500;
  }

  .btn-secondary {
    width: 100%;
    border: 1.5px solid #e0e0e0;
    padding: 14px;
    background: #fff;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    border-radius: 8px;
    transition: all 0.25s ease;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-secondary:hover {
    border-color: #111;
    background: #f9f9f9;
  }

  .btn-secondary:active {
    background: #f0f0f0;
  }
`;

return (
  <div style={{
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    background: "#fff",
    minHeight: "100vh",
    color: "#111",
    position: "relative",
    overflow: "hidden"
  }}>
    <style>{css}</style>

    <Navbar />

    {/* Doodles scattered */}

<D top="130px" left="6%" rotate={-12}><Rocket /></D>

<D top="200px" left="3%" rotate={-5}><ThumbsUp /></D>

<D bottom="220px" left="6%" rotate={8}><Bulb /></D>

<D top="300px" left="22%" rotate={-10}><Megaphone /></D>

<D top="160px" right="8%" rotate={12}><Briefcase /></D>

<D top="260px" right="18%" rotate={6}><Chart /></D>

<D top="420px" right="10%" rotate={8}><ImageIcon /></D>

<D bottom="160px" right="6%" rotate={-10}><Laptop /></D>

<D bottom="60px" right="3%" rotate={5}><Phone /></D>

    {/* Login Card */}
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Start your interview preparation journey</p>

        {/* Profile Section */}
        <div className="profile-section">
          <img
            src={profile}
            alt="Profile"
            className="profile-image"
          />
          <label className="profile-upload-label">
            Change Avatar
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="profile-upload-input"
            />
          </label>
        </div>

        {step === 1 ? (
          <>
            {/* Step 1: Name Input */}
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Continue Button */}
            <button 
              className="btn-primary" 
              onClick={() => name.trim() && setStep(2)}
              disabled={!name.trim()}
              style={{ 
                marginBottom: "24px",
                opacity: name.trim() ? 1 : 0.6,
                cursor: name.trim() ? "pointer" : "not-allowed"
              }}
            >
              Continue
            </button>
          </>
        ) : (
          <>
            {/* Step 2: Email Signup */}
            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                Hello, {name}!
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Signup Button */}
            <button 
              className="btn-primary" 
              disabled={!email.trim()}
              style={{ 
                marginBottom: "16px",
                opacity: email.trim() ? 1 : 0.6,
                cursor: email.trim() ? "pointer" : "not-allowed"
              }}
            >
              Sign Up
            </button>

            {/* Divider */}
            <div className="divider-wrapper">
              <div className="divider-line"></div>
              <span className="divider-text">OR</span>
              <div className="divider-line"></div>
            </div>

            {/* Google Button */}
            <button className="btn-secondary" style={{ marginBottom: "16px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            {/* Back Button */}
            <button 
              style={{
                width: "100%",
                background: "transparent",
                border: "1.5px solid #e0e0e0",
                padding: "12px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.85rem",
                borderRadius: "8px",
                transition: "all 0.25s ease",
                fontFamily: "inherit"
              }}
              onClick={() => {
                setStep(1)
                setEmail("")
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#111"
                e.currentTarget.style.background = "#f9f9f9"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e0e0e0"
                e.currentTarget.style.background = "transparent"
              }}
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  </div>
)
}
