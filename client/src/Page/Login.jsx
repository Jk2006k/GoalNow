import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { authService } from "../services/authService"
import Navbar from "../components/Navbar"
import { Rocket, Briefcase, Chart, Bulb, Megaphone, Phone, Laptop, ThumbsUp, ImageIcon, D } from "../components/Doodles"

export default function LoginPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [profile, setProfile] = useState(() => `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random()}`)
  const [step, setStep] = useState(1) // 1: name, 2: email
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Helper function to log profile state
  const logProfileState = (location) => {
    console.log(`📸 [${location}] Profile state:`);
    console.log('- Length:', profile?.length);
    console.log('- Is base64:', profile?.startsWith('data:image') ? 'YES ✅' : 'NO (URL)');
    console.log('- First 80 chars:', profile?.substring(0, 80));
    return profile;
  }

  function handleImage(e) {
    const file = e.target.files[0]
    if(file) {
      console.log('=== IMAGE UPLOAD ===');
      console.log('File selected:', file.name, 'size:', file.size)
      // Compress image more aggressively before storing
      const reader = new FileReader()
      reader.onload = () => {
        console.log('File read, converting to image')
        const img = new Image()
        img.onload = () => {
          console.log('Image loaded, dimensions:', img.width, 'x', img.height)
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Resize image to smaller size
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
          
          // Compress more aggressively
          try {
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.7)
            console.log('✅ Image compressed:', compressedUrl.length, 'bytes')
            console.log('First 100 chars:', compressedUrl.substring(0, 100))
            setProfile(compressedUrl)
            console.log('✅ Profile state updated with compressed image')
            logProfileState('AFTER UPLOAD');
          } catch (err) {
            console.error('Canvas toDataURL error:', err)
            setProfile(reader.result)
          }
        }
        img.onerror = () => {
          console.error('Image load error')
          setProfile(reader.result)
        }
        img.src = reader.result
      }
      reader.onerror = () => {
        console.error('File read error')
      }
      reader.readAsDataURL(file)
    }
  }

  // Google Sign-In Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      setError("")

      logProfileState('GOOGLE SIGNIN CLICKED');

      // Decode the JWT token from Google
      const token = credentialResponse.credential
      const decodedToken = JSON.parse(atob(token.split('.')[1]))

      const currentProfile = logProfileState('BEFORE SENDING TO SERVER');

      const userData = {
        googleId: decodedToken.sub,
        firstName: decodedToken.given_name,
        lastName: decodedToken.family_name || "",
        email: decodedToken.email,
        profileImage: currentProfile, // Use uploaded image or default dicebear avatar
        googleProfileImage: decodedToken.picture,
      }

      console.log('📤 Sending userData to server with profileImage');

      // Sign up using auth service
      await authService.googleSignup(userData)
      navigate("/home")
    } catch (err) {
      console.error("Google sign-in error:", err)
      setError(err.message || "Failed to sign up with Google")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError("Failed to sign in with Google")
  }

  // Email Sign-Up Handler
  const handleEmailSignup = async () => {
    try {
      setLoading(true)
      setError("")

      if (!name.trim() || !email.trim()) {
        setError("Please fill in all fields")
        return
      }

      logProfileState('EMAIL SIGNUP CLICKED');

      const currentProfile = logProfileState('BEFORE SENDING TO SERVER');

      const userData = {
        firstName: name,
        lastName: "",
        email,
        profileImage: currentProfile, // Always send - either dicebear URL or uploaded image
      }

      console.log('📤 Sending userData to authService.emailSignup...');

      // Sign up using auth service
      const response = await authService.emailSignup(userData)
      console.log('✅ Signup successful, navigating to home')
      navigate("/home")
    } catch (err) {
      console.error("Email signup error:", err)
      setError(err.message || "Failed to sign up")
    } finally {
      setLoading(false)
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
      width: 100%;
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

    .btn-primary:hover:not(:disabled) {
      background: #000;
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

    .error-message {
      background: #fee;
      color: #c33;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.85rem;
      border: 1px solid #fcc;
    }

    .google-button-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    .google-button-wrapper > div {
      width: 100% !important;
    }

    .loading {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const isGoogleConfigured = !!googleClientId && googleClientId !== "YOUR_GOOGLE_CLIENT_ID"

  return (
    <GoogleOAuthProvider clientId={googleClientId || "YOUR_GOOGLE_CLIENT_ID"}>
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
        <D top="130px" left="16%" rotate={-12}><Rocket /></D>
        <D top="200px" left="3%" rotate={-5}><ThumbsUp /></D>
        <D bottom="220px" left="6%" rotate={8}><Bulb /></D>
        <D top="300px" left="22%" rotate={-10}><Megaphone /></D>
        <D top="80px" left="46%" rotate={8}><Bulb /></D>
        <D top="160px" right="8%" rotate={12}><Briefcase /></D>
        <D top="260px" right="18%" rotate={6}><Chart /></D>
        <D top="420px" right="25%" rotate={8}><ImageIcon /></D>
        <D bottom="220px" right="6%" rotate={-10}><Laptop /></D>
        <D bottom="60px" right="3%" rotate={5}><Phone /></D>

        {/* Login Card */}
        <div className="login-wrapper">
          <div className="login-card">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Start your interview preparation journey</p>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Profile Section - ALWAYS VISIBLE */}
            <div className="profile-section">
              <img
                src={profile}
                alt="Profile"
                className="profile-image"
                onLoad={() => console.log('Profile image loaded on page:', profile?.substring(0, 50))}
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
                    disabled={loading}
                  />
                </div>

                {/* Continue Button */}
                <button 
                  className="btn-primary" 
                  onClick={() => name.trim() && setStep(2)}
                  disabled={!name.trim() || loading}
                  style={{ marginBottom: "24px" }}
                >
                  {loading ? "Loading..." : "Continue"}
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
                    disabled={loading}
                  />
                </div>

                {/* Signup Button */}
                <button 
                  className="btn-primary" 
                  disabled={!email.trim() || loading}
                  onClick={handleEmailSignup}
                  style={{ marginBottom: "16px" }}
                >
                  {loading ? "Signing up..." : "Sign Up"}
                </button>

                {/* Divider */}
                <div className="divider-wrapper">
                  <div className="divider-line"></div>
                  <span className="divider-text">OR</span>
                  <div className="divider-line"></div>
                </div>

                {/* Google Button */}
                <div className="google-button-wrapper">
                  {isGoogleConfigured ? (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                    />
                  ) : (
                    <div className="error-message" style={{ width: "100%", marginBottom: 0 }}>
                      Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID in client/.env.local.
                    </div>
                  )}
                </div>

                {/* Back Button */}
                <button 
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "1.5px solid #e0e0e0",
                    padding: "12px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    borderRadius: "8px",
                    transition: "all 0.25s ease",
                    fontFamily: "inherit",
                    opacity: loading ? 0.6 : 1,
                  }}
                  onClick={() => {
                    setStep(1)
                    setEmail("")
                  }}
                  disabled={loading}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.borderColor = "#111"
                      e.currentTarget.style.background = "#f9f9f9"
                    }
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
    </GoogleOAuthProvider>
  )
}
