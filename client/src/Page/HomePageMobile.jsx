import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import HomePageNavbar from "../components/HomePageNavbar"
import { authService } from "../services/authService"

export default function HomePageMobile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate("/login")
      return
    }
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
  }, [navigate])

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    * { box-sizing: border-box; }

    .hpm-wrapper {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      padding: 80px 16px 40px;
      color: #111;
    }

    .hpm-header {
      margin-bottom: 32px;
    }

    .hpm-greeting {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 8px;
    }

    .hpm-title {
      font-size: 1.8rem;
      font-weight: 900;
      margin: 0;
      line-height: 1.1;
    }

    .hpm-subtitle {
      font-size: 0.9rem;
      color: #777;
      margin: 8px 0 0 0;
    }

    .hpm-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
      margin-bottom: 24px;
    }

    .hpm-card {
      background: #fff;
      border: 1.5px solid #e4e4e4;
      border-radius: 12px;
      padding: 20px 18px;
      cursor: pointer;
      transition: all 0.2s ease;
      animation: hpmFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
      opacity: 0;
    }

    .hpm-card:nth-child(1) { animation-delay: 0.1s; }
    .hpm-card:nth-child(2) { animation-delay: 0.2s; }
    .hpm-card:nth-child(3) { animation-delay: 0.3s; }
    .hpm-card:nth-child(4) { animation-delay: 0.4s; }
    .hpm-card:nth-child(5) { animation-delay: 0.5s; }

    .hpm-card:active {
      transform: scale(0.98);
      border-color: #111;
    }

    .hpm-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .hpm-card-icon {
      width: 40px;
      height: 40px;
      background: #f0f0f0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
      color: #111;
    }

    .hpm-card-titles {
      flex: 1;
    }

    .hpm-card-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 2px;
    }

    .hpm-card-name {
      font-size: 1rem;
      font-weight: 700;
      color: #111;
      margin: 0;
    }

    .hpm-card-badge {
      font-size: 0.65rem;
      font-weight: 600;
      background: #f1f1f1;
      color: #666;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .hpm-card-desc {
      font-size: 0.8rem;
      color: #666;
      line-height: 1.5;
      margin: 0;
      margin-bottom: 12px;
    }

    .hpm-card-meta {
      display: flex;
      gap: 12px;
      font-size: 0.7rem;
      color: #999;
    }

    .hpm-card-meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .hpm-section {
      margin-top: 28px;
    }

    .hpm-section-title {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hpm-section-title::before {
      content: '';
      width: 18px;
      height: 2px;
      background: #111;
      border-radius: 1px;
    }

    .hpm-org-card {
      background: #fff;
      border: 1.5px solid #e4e4e4;
      border-radius: 12px;
      padding: 20px 18px;
      cursor: pointer;
      transition: all 0.2s ease;
      animation: hpmFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.6s forwards;
      opacity: 0;
    }

    .hpm-org-card:active {
      transform: scale(0.98);
      border-color: #111;
    }

    .hpm-org-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 8px;
    }

    .hpm-org-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #111;
      margin: 0 0 8px 0;
    }

    .hpm-org-desc {
      font-size: 0.8rem;
      color: #666;
      line-height: 1.5;
      margin: 0;
    }

    @keyframes hpmFadeUp {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 360px) {
      .hpm-wrapper {
        padding: 70px 12px 32px;
      }

      .hpm-title {
        font-size: 1.4rem;
      }

      .hpm-card-name {
        font-size: 0.9rem;
      }

      .hpm-card-desc {
        font-size: 0.75rem;
      }
    }
  `

  const practices = [
    {
      id: "behavioral",
      icon: "💬",
      label: "Practice",
      name: "Behavioral Interview",
      desc: "Prepare for behavioral questions with confidence",
      meta: ["15-30 min", "Online"],
      path: "/behavioural",
    },
    {
      id: "technical",
      icon: "💻",
      label: "Practice",
      name: "Technical Interview",
      desc: "Master technical questions and coding challenges",
      meta: ["30-45 min", "Online"],
      path: "/technical",
    },
    {
      id: "dsa",
      icon: "🔢",
      label: "Practice",
      name: "DSA Interview",
      desc: "Sharpen your data structures and algorithms skills",
      meta: ["45-60 min", "Proctored"],
      path: "/dsa",
    },
    {
      id: "profile",
      icon: "👤",
      label: "Account",
      name: "My Profile",
      desc: "Update your profile, resume, and interview history",
      meta: ["Quick", "Private"],
      path: "/profile",
    },
    {
      id: "tracker",
      icon: "📊",
      label: "Progress",
      name: "Score Tracker",
      desc: "View your performance and improvement over time",
      meta: ["Analytics", "Detailed"],
      path: "/score-tracker",
    },
  ]

  return (
    <div className="hpm-wrapper">
      <style>{css}</style>
      <HomePageNavbar />

      {/* Header */}
      <div className="hpm-header">
        <p className="hpm-greeting">Welcome back</p>
        <h1 className="hpm-title">
          {user?.name ? `Hi, ${user.name.split(" ")[0]}` : "Ready to Practice?"}
        </h1>
        <p className="hpm-subtitle">Choose an interview type to get started</p>
      </div>

      {/* Practice Cards */}
      <div className="hpm-grid">
        {practices.map((practice) => (
          <div
            key={practice.id}
            className="hpm-card"
            onClick={() => navigate(practice.path)}
          >
            <div className="hpm-card-header">
              <div className="hpm-card-icon">{practice.icon}</div>
              <div className="hpm-card-titles">
                <div className="hpm-card-label">{practice.label}</div>
                <h3 className="hpm-card-name">{practice.name}</h3>
              </div>
              <span className="hpm-card-badge">→</span>
            </div>
            <p className="hpm-card-desc">{practice.desc}</p>
            <div className="hpm-card-meta">
              {practice.meta.map((item, i) => (
                <div key={i} className="hpm-card-meta-item">
                  <span>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Organizations Section */}
      <div className="hpm-section">
        <div className="hpm-section-title">For Organizations</div>
        <div
          className="hpm-org-card"
          onClick={() => navigate("/create-organization")}
        >
          <p className="hpm-org-label">Setup</p>
          <h3 className="hpm-org-title">Create Organization Workspace</h3>
          <p className="hpm-org-desc">
            Build custom interview paths and evaluate selected candidates with your tailored questions
          </p>
        </div>
      </div>
    </div>
  )
}
