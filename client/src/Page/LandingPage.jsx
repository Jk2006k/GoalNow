import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileWall from "./MobileWall";
import {
  Rocket, Briefcase, Chart, Envelope, Bulb, Megaphone,
  Phone, Laptop, ThumbsUp, ImageIcon, PersonSilhouette, D
} from "../components/Doodles";

// ── Scroll reveal hook ────────────────────────────────────────────────────────
function useScrollReveal(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.unobserve(el);
        }
      },
      { threshold: options.threshold || 0.12, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();

  const howWeWorkRef = useScrollReveal();
  const stepRefs     = [useScrollReveal(), useScrollReveal(), useScrollReveal(), useScrollReveal()];
  const servicesRef  = useScrollReveal();
  const svcRefs      = [useScrollReveal(), useScrollReveal(), useScrollReveal()];
  const footerRef    = useScrollReveal();

  const css = `
    /* ── Keyframes ─────────────────────────────────── */
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(36px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes scaleUp {
      from { opacity:0; transform:scale(0.88) translateY(20px); }
      to   { opacity:1; transform:scale(1) translateY(0); }
    }
    @keyframes numPop {
      0%   { opacity:0; transform:scale(0.5) rotate(-8deg); }
      70%  { transform:scale(1.15) rotate(2deg); }
      100% { opacity:1; transform:scale(1) rotate(0deg); }
    }
    @keyframes lineGrow {
      from { width:0; }
      to   { width:100%; }
    }
    @keyframes shimmer {
      0%   { background-position:-200% center; }
      100% { background-position:200% center; }
    }
    @keyframes heroIn {
      from { opacity:0; transform:translateY(24px); }
      to   { opacity:1; transform:translateY(0); }
    }

    /* ── Hero text sequences ────────────────────────── */
    .lp-hero-label { animation: heroIn 0.6s ease 0.10s both; }
    .lp-hero-title { animation: heroIn 0.7s ease 0.25s both; }
    .lp-hero-sub   { animation: heroIn 0.6s ease 0.42s both; }
    .lp-hero-cta   { animation: heroIn 0.6s ease 0.58s both; }

    /* ── Scroll reveal ──────────────────────────────── */
    .reveal-heading { opacity:0; transform:translateY(28px); }
    .reveal-heading.revealed {
      animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
    }

    /* ── Step cards ─────────────────────────────────── */
    .lp-step { opacity:0; transform:translateY(40px); }
    .lp-step.revealed {
      animation: fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
    }
    .lp-step.revealed .lp-step-num {
      animation: numPop 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.25s both;
    }
    .lp-step.revealed .lp-step-bar {
      animation: lineGrow 0.6s cubic-bezier(0.22,1,0.36,1) 0.45s both;
    }
    .lp-step:hover {
      transform: translateY(-4px) !important;
      box-shadow: 0 12px 32px rgba(0,0,0,0.10);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .lp-step-num { opacity:0; }
    .lp-step-bar { height:3px; background:#111; border-radius:2px; width:0; margin-top:16px; }

    /* ── Service cards ──────────────────────────────── */
    .lp-svc { opacity:0; transform:scale(0.92) translateY(20px); }
    .lp-svc.revealed {
      animation: scaleUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
    }
    .lp-svc:hover {
      border-color:#111 !important;
      background:#f5f5f5 !important;
      transition: border-color 0.2s, background 0.2s;
    }
    .lp-svc:hover .lp-svc-title {
      background: linear-gradient(90deg,#111 30%,#666 50%,#111 70%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 1.4s linear infinite;
    }

    /* ── Footer reveal ──────────────────────────────── */
    .lp-footer-reveal { opacity:0; transform:translateY(16px); }
    .lp-footer-reveal.revealed { animation: fadeUp 0.5s ease forwards; }

    /* ── Divider ────────────────────────────────────── */
    .lp-divider { height:1.5px; background:#e4e4e4; width:0; margin:0 auto 48px; border-radius:1px; }
    .lp-divider.revealed { animation: lineGrow 0.8s cubic-bezier(0.22,1,0.36,1) forwards; }

    /* ── CTA button ─────────────────────────────────── */
    .lp-btn {
      background:#111; color:#fff; border:none;
      padding:16px 52px; font-size:0.88rem; font-weight:800;
      letter-spacing:0.14em; text-transform:uppercase;
      cursor:pointer; font-family:inherit; border-radius:4px;
      transition:background 0.2s;
    }
    .lp-btn:hover { background:#333; }

    /* ── Layout helpers ─────────────────────────────── */
    .lp-about-grid {
      display:grid; grid-template-columns:1fr 1fr;
      gap:64px; align-items:center;
    }
    .lp-about-imgs {
      display:grid; grid-template-columns:1fr 1fr;
      grid-template-rows:128px 128px; gap:14px;
    }
    .lp-about-imgs img:first-child { grid-row:span 2; }

    .lp-steps-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
    .lp-svc-grid   { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }

    /* ── Tablet (≤1024px) ───────────────────────────── */
    @media (max-width:1024px) {
      .lp-hero    { padding:40px 40px 80px !important; }
      .lp-section { padding:64px 40px !important; }
      .lp-steps-grid { grid-template-columns:repeat(2,1fr); }
      .lp-watermark  { font-size:80px !important; }
    }

    /* ── Mobile (≤768px) ────────────────────────────── */
    @media (max-width:768px) {
      .lp-hero       { padding:32px 20px 52px !important; min-height:unset !important; }
      .lp-section    { padding:48px 20px !important; }
      .lp-watermark  { font-size:50px !important; }

      .lp-about-grid {
        grid-template-columns: 1fr;
        gap: 28px;
      }
      .lp-about-imgs {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 120px;
        gap: 10px;
      }
      .lp-about-imgs img:first-child { grid-row: unset; }

      .lp-steps-grid { grid-template-columns:1fr 1fr; gap:12px; }
      .lp-svc-grid   { grid-template-columns:1fr; gap:12px; }

      .lp-btn { width:100%; padding:16px 24px; }

      .lp-divider { margin-bottom:32px; }
    }

    /* ── Small mobile (≤480px) ──────────────────────── */
    @media (max-width:480px) {
      .lp-hero    { padding:24px 16px 44px !important; }
      .lp-section { padding:40px 16px !important; }

      .lp-steps-grid { grid-template-columns:1fr; }
      .lp-about-imgs {
        grid-template-columns:1fr;
        grid-template-rows:unset;
      }
      .lp-about-imgs img:first-child { grid-row:unset; height:160px; }
      .lp-about-imgs img { height:120px; }
    }
  `;

  return isMobile ? (
    <MobileWall />
  ) : (
    <div style={{ fontFamily:"'Helvetica Neue',Arial,sans-serif", background:"#f5f5f5", minHeight:"100vh", color:"#111" }}>
      <style>{css}</style>
      <Navbar />

      {/* ══════════════════ HERO ══════════════════ */}
      <section
        className="lp-hero"
        style={{ position:"relative", overflow:"hidden", background:"#f5f5f5",
                 padding:"44px 64px 90px", minHeight:"560px" }}
      >
        {/* Watermark */}
        <div style={{ position:"absolute", inset:0, overflow:"hidden", zIndex:0, pointerEvents:"none" }}>
          {Array(6).fill("INTBAR").map((t, i) => (
            <div key={i} className="lp-watermark" style={{
              fontSize:"106px", fontWeight:"900",
              color:"rgba(0,0,0,0.05)", letterSpacing:"0.06em",
              lineHeight:"1.05", userSelect:"none", whiteSpace:"nowrap",
            }}>{t}</div>
          ))}
        </div>

        {/* ── Desktop doodles (all 11) ── */}
        {!isMobile && <>
          <D top="10px"     left="40%"  rotate={-8}><Megaphone /></D>
          <D top="46px"     right="17%" rotate={4}><Briefcase /></D>
          <D top="4px"      right="2%"  rotate={12}><Rocket /></D>
          <D top="188px"    right="34%" rotate={0}><Chart /></D>
          <D top="235px"    right="22%" rotate={-5}><Envelope /></D>
          <D top="200px"    right="8%"  rotate={7}><ImageIcon /></D>
          <D top="310px"    left="52%"  rotate={9}><ThumbsUp /></D>
          <D bottom="130px" right="18%" rotate={-9}><Phone /></D>
          <D bottom="24px"  right="2%"  rotate={2}><Laptop /></D>
          <D top="37%"      left="1%"   rotate={-13}><Bulb /></D>
          <D bottom="10px"  left="3%"   rotate={0}><PersonSilhouette /></D>
        </>}

        {/* ── Mobile doodles (3 only, tucked in corners) ── */}
        {isMobile && <>
          <D top="10px"    right="12px" rotate={10}><Rocket /></D>
          <D bottom="20px" right="10px" rotate={3}><Laptop /></D>
          <D bottom="20px" left="8px"   rotate={-10}><Bulb /></D>
        </>}

        {/* Hero text */}
        <div style={{ position:"relative", zIndex:3, maxWidth:"660px", marginTop:"6px" }}>
          <p className="lp-hero-label" style={{
            fontSize:"0.73rem", letterSpacing:"0.2em", fontWeight:"600",
            textTransform:"uppercase", marginBottom:"18px",
          }}>
            WELCOME TO INTBAR
          </p>

          <h1 className="lp-hero-title" style={{
            fontSize:"clamp(36px, 7.4vw, 108px)",
            fontWeight:"900", lineHeight:"0.98",
            margin:"0 0 22px",
            letterSpacing:"clamp(-1px, -0.025em, -3px)",
          }}>
            Interview Practice<br />Intelligence
          </h1>

          <p className="lp-hero-sub" style={{
            fontSize:"0.75rem", letterSpacing:"0.2em", fontWeight:"600",
            textTransform:"uppercase", marginBottom:"38px",
          }}>
            CRAFTING POWERFUL INTERVIEW PREPARATION EXPERIENCES
          </p>

          <div className="lp-hero-cta">
            <button className="lp-btn" onClick={() => navigate("/login")}>
              START PRACTICE
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════ ABOUT ══════════════════ */}
      <section className="lp-section" style={{ background:"#fff", padding:"80px 64px" }}>
        <div className="lp-about-grid">
          <div>
            <h2 style={{
              fontSize:"clamp(1.7rem,3.5vw,2.3rem)",
              fontWeight:"800", marginBottom:"22px", letterSpacing:"-1px",
            }}>
              About IntBar
            </h2>
            <p style={{ fontSize:"1rem", lineHeight:"1.8", color:"#333", marginBottom:"16px" }}>
              IntBar is an AI-powered interview preparation platform built for students preparing for placements.
              The platform presents questions one by one while recording the student's answers using the camera and microphone.
            </p>
            <p style={{ fontSize:"1rem", lineHeight:"1.8", color:"#555" }}>
              After every interview session, the system analyzes communication, confidence and answer quality and provides marks to help students improve.
            </p>
          </div>
          <div className="lp-about-imgs">
            <img src="/AIFeedback.png" alt="AI Feedback" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"10px" }} />
            <img src="/Success.png"    alt="Success"     style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"10px" }} />
            <img src="/MIP.png"        alt="MIP"         style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"10px" }} />
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW WE WORK ══════════════════ */}
      <section className="lp-section" style={{ background:"#f5f5f5", padding:"80px 64px" }}>
        <h2
          ref={howWeWorkRef}
          className="reveal-heading"
          style={{
            fontSize:"clamp(1.7rem,3.5vw,2.3rem)",
            fontWeight:"800", textAlign:"center",
            marginBottom:"12px", letterSpacing:"-1px",
          }}
        >
          How We Work
        </h2>
        <div ref={useScrollReveal()} className="lp-divider" style={{ maxWidth:"80px" }} />

        <div className="lp-steps-grid">
          {[
            ["01","Select Domain",    "Choose your interview domain and prepare with curated questions."],
            ["02","Interview Starts", "Questions appear one by one while your responses are recorded."],
            ["03","AI Analysis",      "The AI analyzes confidence, communication and answer quality."],
            ["04","Get Score",        "Receive a detailed score after completing the interview."],
          ].map(([num, title, desc], i) => (
            <div
              key={num}
              ref={stepRefs[i]}
              className="lp-step"
              style={{
                background:"#fff", padding:"28px 20px",
                borderRadius:"10px", cursor:"default",
                animationDelay:`${i * 0.13}s`,
              }}
            >
              <div
                className="lp-step-num"
                style={{
                  fontSize:"2rem", fontWeight:"900",
                  color:"rgba(0,0,0,0.07)", marginBottom:"6px", lineHeight:1,
                  animationDelay:`${i * 0.13 + 0.1}s`,
                }}
              >{num}</div>
              <h3 style={{ fontSize:"0.95rem", fontWeight:"800", marginBottom:"8px" }}>{title}</h3>
              <p style={{ fontSize:"0.84rem", lineHeight:"1.7", color:"#555", margin:0 }}>{desc}</p>
              <div className="lp-step-bar" style={{ animationDelay:`${i * 0.13 + 0.3}s` }} />
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ WHAT WE DO ══════════════════ */}
      <section className="lp-section" style={{ background:"#fff", padding:"80px 64px" }}>
        <h2
          ref={servicesRef}
          className="reveal-heading"
          style={{
            fontSize:"clamp(1.7rem,3.5vw,2.3rem)",
            fontWeight:"800", textAlign:"center",
            marginBottom:"12px", letterSpacing:"-1px",
          }}
        >
          What We Do
        </h2>
        <div ref={useScrollReveal()} className="lp-divider" style={{ maxWidth:"60px" }} />

        <div className="lp-svc-grid">
          {[
            ["Student Practice",        "Practice frequently asked interview questions and improve performance."],
            ["Premium Preparation",     "Access domain-specific interview preparation and detailed evaluation."],
            ["Organization Interviews", "Companies can upload questions and evaluate selected students."],
          ].map(([title, desc], i) => (
            <div
              key={title}
              ref={svcRefs[i]}
              className="lp-svc"
              style={{
                padding:"28px 24px", borderRadius:"10px",
                border:"1.5px solid #e4e4e4", cursor:"default",
                animationDelay:`${i * 0.14}s`,
              }}
            >
              <h3 className="lp-svc-title" style={{ fontSize:"1rem", fontWeight:"800", marginBottom:"10px" }}>{title}</h3>
              <p style={{ fontSize:"0.86rem", lineHeight:"1.7", color:"#555", margin:0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer
        ref={footerRef}
        className="lp-footer-reveal"
        style={{ textAlign:"center", padding:"26px 16px", fontSize:"0.86rem", color:"#666" }}
      >
        © 2026 IntBar
      </footer>
    </div>
  );
}