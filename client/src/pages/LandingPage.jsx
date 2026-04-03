import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Rocket, Briefcase, Chart, Envelope, Bulb, Megaphone,
  Phone, Laptop, ThumbsUp, ImageIcon, PersonSilhouette, D
} from "../components/Doodles";

// ── Animation hook using IntersectionObserver ─────────────────────────────────
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const howWeWorkRef = useScrollReveal();
  const step0 = useScrollReveal();
  const step1 = useScrollReveal();
  const step2 = useScrollReveal();
  const step3 = useScrollReveal();
  const stepRefs = [step0, step1, step2, step3];

  const servicesRef = useScrollReveal();
  const svc0 = useScrollReveal();
  const svc1 = useScrollReveal();
  const svc2 = useScrollReveal();
  const svcRefs = [svc0, svc1, svc2];

  const footerRef = useScrollReveal();

  const css = `
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(38px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes slideLeft {
      from { opacity: 0; transform: translateX(40px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.88); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes numPop {
      0%   { opacity: 0; transform: scale(0.5) rotate(-8deg); }
      70%  { transform: scale(1.15) rotate(2deg); }
      100% { opacity: 1; transform: scale(1) rotate(0deg); }
    }
    @keyframes lineGrow {
      from { width: 0; }
      to   { width: 100%; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    /* -- Section headings -- */
    .reveal-heading {
      opacity: 0;
      transform: translateY(28px);
      transition: none;
    }
    .reveal-heading.revealed {
      animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
    }

    /* -- Step cards -- */
    .step-card {
      opacity: 0;
      transform: translateY(44px);
    }
    .step-card.revealed {
      animation: fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
    }
    .step-card.revealed .step-num {
      animation: numPop 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.25s both;
    }
    .step-card:hover {
      transform: translateY(-4px) !important;
      box-shadow: 0 12px 32px rgba(0,0,0,0.10);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .step-num {
      opacity: 0;
    }

    /* progress bar inside step card */
    .step-card.revealed .step-bar {
      animation: lineGrow 0.6s cubic-bezier(0.22,1,0.36,1) 0.45s both;
    }
    .step-bar {
      height: 3px;
      background: #111;
      border-radius: 2px;
      width: 0;
      margin-top: 16px;
    }

    /* -- Service cards -- */
    .svc-card {
      opacity: 0;
      transform: scale(0.92) translateY(24px);
    }
    .svc-card.revealed {
      animation: scaleUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
    }
    .svc-card:hover {
      border-color: #111 !important;
      background: #f5f5f5 !important;
      transition: border-color 0.2s, background 0.2s;
    }
    .svc-card:hover .svc-title {
      background: linear-gradient(90deg, #111 30%, #666 50%, #111 70%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 1.4s linear infinite;
    }

    /* -- Footer -- */
    .footer-reveal {
      opacity: 0;
      transform: translateY(18px);
    }
    .footer-reveal.revealed {
      animation: fadeUp 0.55s ease forwards;
    }

    /* -- Divider line animate -- */
    .divider-line {
      height: 1.5px;
      background: #e4e4e4;
      width: 0;
      margin: 0 auto 48px;
      border-radius: 1px;
    }
    .divider-line.revealed {
      animation: lineGrow 0.8s cubic-bezier(0.22,1,0.36,1) forwards;
    }
  `;

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", background: "#f5f5f5", minHeight: "100vh", color: "#111" }}>
      <style>{css}</style>

      <Navbar />

      {/* HERO */}
      <section style={{
        position: "relative", padding: "44px 64px 90px",
        minHeight: "560px", overflow: "hidden", background: "#f5f5f5",
      }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
          {["INTBAR","INTBAR","INTBAR","INTBAR","INTBAR","INTBAR"].map((t, i) => (
            <div key={i} style={{
              fontSize: "106px", fontWeight: "900",
              color: "rgba(0,0,0,0.05)", letterSpacing: "0.06em",
              lineHeight: "1.05", userSelect: "none", whiteSpace: "nowrap",
            }}>{t}</div>
          ))}
        </div>
        <D top="10px"  left="40%"  rotate={-8}><Megaphone/></D>
        <D top="46px"  right="17%" rotate={4} ><Briefcase/></D>
        <D top="4px"   right="2%"  rotate={12}><Rocket/></D>
        <D top="188px" right="34%" rotate={0} ><Chart/></D>
        <D top="235px" right="22%" rotate={-5}><Envelope/></D>
        <D top="200px" right="8%"  rotate={7} ><ImageIcon/></D>
        <D top="310px" left="52%"  rotate={9} ><ThumbsUp/></D>
        <D bottom="130px" right="18%" rotate={-9}><Phone/></D>
        <D bottom="24px"  right="2%"  rotate={2} ><Laptop/></D>
        <D top="37%"  left="1%"  rotate={-13}><Bulb/></D>
        <D bottom="10px" left="3%" rotate={0}><PersonSilhouette/></D>
        <div style={{ position: "relative", zIndex: 3, maxWidth: "660px", marginTop: "6px" }}>
          <p style={{ fontSize: "0.73rem", letterSpacing: "0.2em", fontWeight: "600", textTransform: "uppercase", marginBottom: "18px" }}>
            WELCOME TO INTBAR
          </p>
          <h1 style={{
            fontSize: "clamp(62px, 7.4vw, 108px)", fontWeight: "900",
            lineHeight: "0.98", margin: "0 0 22px", letterSpacing: "-3px",
          }}>
            Interview Practice<br/>Intelligence
          </h1>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.2em", fontWeight: "600", textTransform: "uppercase", marginBottom: "38px" }}>
            CRAFTING POWERFUL INTERVIEW PREPARATION EXPERIENCES
          </p>
          <button style={{
            background: "#111", color: "#fff", border: "none",
            padding: "18px 52px", fontSize: "0.88rem", fontWeight: "800",
            letterSpacing: "0.14em", textTransform: "uppercase",
            cursor: "pointer", fontFamily: "inherit", borderRadius: "4px",
          }}
          onClick={() => navigate("/login")}
          >
            START PRACTICE
          </button>
        </div>
      </section>

      {/* ABOUT — no animations here */}
      <section style={{ padding: "80px 64px", background: "#fff", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "2.3rem", fontWeight: "800", marginBottom: "22px", letterSpacing: "-1px" }}>About IntBar</h2>
          <p style={{ fontSize: "1rem", lineHeight: "1.8", color: "#333", marginBottom: "16px" }}>
            IntBar is an AI-powered interview preparation platform built for students preparing for placements.
            The platform presents questions one by one while recording the student's answers using the camera and microphone.
          </p>
          <p style={{ fontSize: "1rem", lineHeight: "1.8", color: "#555" }}>
            After every interview session, the system analyzes communication, confidence and answer quality and provides marks to help students improve.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "128px 128px", gap: "14px" }}>
          <img src="/AIFeedback.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px", gridRow: "span 2" }} />
          <img src="/Success.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
          <img src="/MIP.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
        </div>
      </section>

      {/* HOW WE WORK — animated */}
      <section style={{ padding: "80px 64px", background: "#f5f5f5" }}>
        <h2
          ref={howWeWorkRef}
          className="reveal-heading"
          style={{ fontSize: "2.3rem", fontWeight: "800", textAlign: "center", marginBottom: "12px", letterSpacing: "-1px" }}
        >
          How We Work
        </h2>
        {/* animated underline */}
        <div ref={useScrollReveal()} className="divider-line" style={{ maxWidth: "80px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "18px" }}>
          {[
            ["01","Select Domain","Choose your interview domain and prepare with curated questions."],
            ["02","Interview Starts","Questions appear one by one while your responses are recorded."],
            ["03","AI Analysis","The AI analyzes confidence, communication and answer quality."],
            ["04","Get Score","Receive a detailed score after completing the interview."],
          ].map(([num, title, desc], i) => (
            <div
              key={num}
              ref={stepRefs[i]}
              className="step-card"
              style={{
                background: "#fff",
                padding: "30px 22px",
                borderRadius: "10px",
                animationDelay: `${i * 0.13}s`,
                cursor: "default",
              }}
            >
              <div
                className="step-num"
                style={{
                  fontSize: "2.2rem", fontWeight: "900",
                  color: "rgba(0,0,0,0.07)", marginBottom: "6px", lineHeight: 1,
                  animationDelay: `${i * 0.13 + 0.1}s`,
                }}
              >{num}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "10px" }}>{title}</h3>
              <p style={{ fontSize: "0.86rem", lineHeight: "1.7", color: "#555", marginBottom: 0 }}>{desc}</p>
              <div className="step-bar" style={{ animationDelay: `${i * 0.13 + 0.3}s` }} />
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES — animated */}
      <section style={{ padding: "80px 64px", background: "#fff" }}>
        <h2
          ref={servicesRef}
          className="reveal-heading"
          style={{ fontSize: "2.3rem", fontWeight: "800", textAlign: "center", marginBottom: "12px", letterSpacing: "-1px" }}
        >
          What We Do
        </h2>
        <div ref={useScrollReveal()} className="divider-line" style={{ maxWidth: "60px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "18px" }}>
          {[
            ["Student Practice","Practice frequently asked interview questions and improve performance."],
            ["Premium Preparation","Access domain-specific interview preparation and detailed evaluation."],
            ["Organization Interviews","Companies can upload questions and evaluate selected students."],
          ].map(([title, desc], i) => (
            <div
              key={title}
              ref={svcRefs[i]}
              className="svc-card"
              style={{
                padding: "32px 26px",
                borderRadius: "10px",
                border: "1.5px solid #e4e4e4",
                animationDelay: `${i * 0.14}s`,
                cursor: "default",
              }}
            >
              <h3 className="svc-title" style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "10px" }}>{title}</h3>
              <p style={{ fontSize: "0.86rem", lineHeight: "1.7", color: "#555", margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER — animated */}
      <footer
        ref={footerRef}
        className="footer-reveal"
        style={{ textAlign: "center", padding: "26px", fontSize: "0.86rem", color: "#666" }}
      >
        © 2026 IntBar
      </footer>
    </div>
  );
}