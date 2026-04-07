import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Doodle SVGs (matching LandingPage style) ──────────────────────────────────
function Rocket() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 6C24 6 34 12 34 26L24 38L14 26C14 12 24 6 24 6Z"/>
      <circle cx="24" cy="22" r="4"/>
      <path d="M14 26L8 32L14 34"/>
      <path d="M34 26L40 32L34 34"/>
      <path d="M20 38L18 44L24 42L30 44L28 38"/>
    </svg>
  );
}

function Bulb() {
  return (
    <svg width="38" height="38" viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 6a12 12 0 0 1 8 20.5V32H16v-5.5A12 12 0 0 1 24 6Z"/>
      <line x1="18" y1="36" x2="30" y2="36"/>
      <line x1="20" y1="40" x2="28" y2="40"/>
      <line x1="24" y1="2"  x2="24" y2="0"/>
      <line x1="38" y1="8"  x2="40" y2="6"/>
      <line x1="10" y1="8"  x2="8"  y2="6"/>
    </svg>
  );
}

function Chart() {
  return (
    <svg width="38" height="38" viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="36" height="36" rx="4"/>
      <polyline points="13,32 20,22 27,28 35,16"/>
      <circle cx="35" cy="16" r="2" fill="currentColor"/>
    </svg>
  );
}

function Briefcase() {
  return (
    <svg width="38" height="38" viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="18" width="36" height="24" rx="4"/>
      <path d="M16 18V14a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/>
      <line x1="6" y1="30" x2="42" y2="30"/>
    </svg>
  );
}

function Megaphone() {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18v12h8l14 10V8L14 18H6Z"/>
      <path d="M36 16a8 8 0 0 1 0 16"/>
      <line x1="14" y1="30" x2="14" y2="40"/>
    </svg>
  );
}

function Laptop() {
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="8" width="36" height="24" rx="3"/>
      <line x1="2" y1="36" x2="46" y2="36"/>
      <line x1="18" y1="36" x2="30" y2="40"/>
    </svg>
  );
}

function Envelope() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="40" height="28" rx="4"/>
      <polyline points="4,10 24,26 44,10"/>
    </svg>
  );
}

// ── Floating doodle wrapper ───────────────────────────────────────────────────
function FloatDoodle({ style, duration = 3, delay = 0, children }) {
  return (
    <div
      style={{
        position: "absolute",
        color: "#111",
        opacity: 0.1,
        animation: `mwFloat ${duration}s ease-in-out ${delay}s infinite`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Blinking cursor ───────────────────────────────────────────────────────────
function Cursor() {
  return (
    <span
      style={{
        display: "inline-block",
        width: "2px",
        height: "16px",
        background: "#111",
        verticalAlign: "middle",
        marginLeft: "2px",
        animation: "mwBlink 1s step-end infinite",
      }}
    />
  );
}

// ── Monitor illustration ──────────────────────────────────────────────────────
function MonitorIllo() {
  return (
    <div style={{ marginBottom: "20px" }}>
      {/* Screen bezel */}
      <div style={{
        width: "130px", height: "96px", margin: "0 auto",
        background: "#fff", border: "3px solid #111",
        borderRadius: "10px", position: "relative", overflow: "hidden",
        boxShadow: "4px 4px 0 #111",
      }}>
        {/* Screen */}
        <div style={{
          position: "absolute", inset: "6px",
          background: "#f5f5f5", borderRadius: "6px",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: "4px",
          overflow: "hidden",
        }}>
          {/* Scanline */}
          <div style={{
            position: "absolute", left: 0, right: 0,
            height: "2px", background: "#111", opacity: 0.15,
            animation: "mwScan 2s linear infinite",
          }} />
          {/* Fake UI bars */}
          <div style={{ width: "70%", height: "3px", background: "#ddd", borderRadius: "2px" }} />
          <div style={{ width: "50%", height: "3px", background: "#ddd", borderRadius: "2px" }} />
          {/* Logo text */}
          <div style={{
            fontSize: "11px", fontWeight: 900,
            letterSpacing: "-0.04em", color: "#111",
            marginTop: "6px", display: "flex", alignItems: "center",
          }}>
            INTBAR<Cursor />
          </div>
        </div>
      </div>
      {/* Stand */}
      <div style={{
        width: "36px", height: "12px", margin: "0 auto",
        background: "#111", borderRadius: "0 0 4px 4px",
      }} />
      {/* Base */}
      <div style={{
        width: "68px", height: "6px", margin: "0 auto 4px",
        background: "#111", borderRadius: "4px",
      }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MobileWall() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const css = `
    @keyframes mwFloat {
      0%,100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
      50%      { transform: translateY(-10px) rotate(calc(var(--r, 0deg) + 3deg)); }
    }
    @keyframes mwBlink {
      0%,100% { opacity: 1; }
      50%      { opacity: 0; }
    }
    @keyframes mwScan {
      0%   { top: 4px; }
      100% { top: 88px; }
    }
    @keyframes mwFadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes mwPulse {
      0%,100% { transform: scale(1); }
      50%     { transform: scale(1.03); }
    }
    @keyframes mwLineGrow {
      from { width: 0; }
      to   { width: 48px; }
    }

    .mw-card        { animation: mwFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
    .mw-brand       { animation: mwFadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.22s both, mwPulse 3.5s ease-in-out 1s infinite; }
    .mw-tagline     { animation: mwFadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.32s both; }
    .mw-divider     { animation: mwLineGrow 0.7s cubic-bezier(0.22,1,0.36,1) 0.44s both; }
    .mw-headline    { animation: mwFadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.50s both; }
    .mw-body        { animation: mwFadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.60s both; }
    .mw-cta         { animation: mwFadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.70s both; }
    .mw-hint        { animation: mwFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.82s both; }

    .mw-btn {
      background: #111; color: #fff; border: none;
      padding: 15px 36px; font-size: 0.78rem; font-weight: 800;
      letter-spacing: 0.16em; text-transform: uppercase;
      cursor: pointer; font-family: inherit; border-radius: 4px;
      width: 100%; transition: background 0.2s;
    }
    .mw-btn:hover  { background: #333; }
    .mw-btn:active { background: #000; transform: scale(0.98); }

    .mw-link {
      background: none; border: none; cursor: pointer;
      font-size: 0.75rem; color: #999; font-family: inherit;
      letter-spacing: 0.08em; text-decoration: underline;
      margin-top: 14px; padding: 4px 0; transition: color 0.2s;
    }
    .mw-link:hover { color: #555; }

    /* Watermark rows */
    .mw-watermark-row {
      font-size: 72px; font-weight: 900;
      color: rgba(0,0,0,0.04); letter-spacing: 0.06em;
      white-space: nowrap; line-height: 1.05;
      user-select: none; pointer-events: none;
    }

    @media (max-width: 360px) {
      .mw-watermark-row { font-size: 52px; }
    }
  `;

  return (
    <div style={{
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      background: "#f5f5f5",
      minHeight: "100vh",
      color: "#111",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <style>{css}</style>

      {/* ── Watermark background ── */}
      <div style={{
        position: "absolute", inset: 0,
        overflow: "hidden", zIndex: 0, pointerEvents: "none",
      }}>
        {Array(7).fill("INTBAR").map((t, i) => (
          <div key={i} className="mw-watermark-row">{t}</div>
        ))}
      </div>

      {/* ── Floating doodles ── */}
      <FloatDoodle style={{ top: "14px",  left: "12px",  "--r": "-10deg" }} duration={3.4} delay={0}>
        <Rocket />
      </FloatDoodle>
      <FloatDoodle style={{ top: "10px",  right: "14px", "--r": "8deg"  }} duration={2.9} delay={0.4}>
        <Megaphone />
      </FloatDoodle>
      <FloatDoodle style={{ top: "42%",   right: "8px",  "--r": "12deg" }} duration={3.8} delay={0.2}>
        <Chart />
      </FloatDoodle>
      <FloatDoodle style={{ bottom: "80px", left: "10px", "--r": "-6deg" }} duration={3.1} delay={0.6}>
        <Bulb />
      </FloatDoodle>
      <FloatDoodle style={{ bottom: "60px", right: "10px","--r": "5deg" }} duration={4.0} delay={0.1}>
        <Briefcase />
      </FloatDoodle>
      <FloatDoodle style={{ top: "38%",   left: "6px",  "--r": "-14deg" }} duration={3.6} delay={0.8}>
        <Envelope />
      </FloatDoodle>
      <FloatDoodle style={{ bottom: "20px", left: "40%", "--r": "2deg"  }} duration={3.2} delay={0.3}>
        <Laptop />
      </FloatDoodle>

      {/* ── Card ── */}
      <div
        className="mw-card"
        style={{
          position: "relative", zIndex: 2,
          background: "#fff",
          borderRadius: "16px",
          border: "1.5px solid #e4e4e4",
          padding: "40px 28px 32px",
          margin: "24px 20px",
          maxWidth: "360px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.07)",
        }}
      >
        {/* Monitor */}
        <MonitorIllo />

        {/* Brand */}
        <h1
          className="mw-brand"
          style={{
            fontSize: "clamp(28px, 8vw, 38px)",
            fontWeight: 900,
            letterSpacing: "-2px",
            margin: "0 0 6px",
            lineHeight: 1,
          }}
        >
          INTBAR
        </h1>

        <p
          className="mw-tagline"
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#999",
            margin: "0 0 22px",
          }}
        >
          Interview Practice Intelligence
        </p>

        {/* Divider */}
        <div
          className="mw-divider"
          style={{
            height: "2px",
            background: "#111",
            borderRadius: "2px",
            width: 0,
            margin: "0 auto 24px",
          }}
        />

        {/* Headline */}
        <h2
          className="mw-headline"
          style={{
            fontSize: "clamp(1.1rem, 4.5vw, 1.3rem)",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            margin: "0 0 12px",
            lineHeight: 1.3,
          }}
        >
          Switch to Desktop<br />for the Full Experience
        </h2>

        {/* Body */}
        <p
          className="mw-body"
          style={{
            fontSize: "0.86rem",
            lineHeight: 1.75,
            color: "#555",
            margin: "0 0 28px",
          }}
        >
          IntBar uses your <strong style={{ color: "#111" }}>camera&nbsp;&amp;&nbsp;microphone</strong> to
          record and analyze your interview session. These features work best on a
          <strong style={{ color: "#111" }}> PC or laptop</strong>. Open IntBar on your desktop to get started.
        </p>

        {/* Steps */}
        <div style={{
          background: "#f5f5f5",
          borderRadius: "10px",
          padding: "16px 18px",
          marginBottom: "28px",
          textAlign: "left",
        }}>
          {[
            ["01", "Open your browser on PC"],
            ["02", "Visit intbar.app"],
            ["03", "Log in & start practicing"],
          ].map(([n, t]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "6px 0" }}>
              <span style={{
                fontSize: "0.65rem", fontWeight: 900,
                color: "rgba(0,0,0,0.18)", minWidth: "20px",
              }}>{n}</span>
              <span style={{ fontSize: "0.82rem", color: "#333", fontWeight: 600 }}>{t}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mw-cta">
          <button
            className="mw-btn"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "IntBar", url: window.location.origin });
              } else {
                navigator.clipboard?.writeText(window.location.origin);
                alert("Link copied! Open it on your PC.");
              }
            }}
          >
            Share Link to Desktop
          </button>
        </div>

        {/* Continue anyway */}
        <div className="mw-hint">
          <button
            className="mw-link"
            onClick={() => navigate("/home")}
          >
            Continue on mobile anyway →
          </button>
        </div>
      </div>
    </div>
  );
}
