import { useEffect, useState } from "react"
import { Rocket, Briefcase, Chart, Bulb, Megaphone, Phone, Laptop, ThumbsUp } from "../components/Doodles"

const STICKERS = [
  { id: "s1", Component: Rocket,    style: { top: "8%",    left: "5%"   }, cls: "s1" },
  { id: "s2", Component: Laptop,    style: { top: "12%",   right: "6%"  }, cls: "s2" },
  { id: "s3", Component: Chart,     style: { top: "40%",   left: "9%"   }, cls: "s3" },
  { id: "s4", Component: Bulb,      style: { bottom: "18%",left: "21%"   }, cls: "s4" },
  { id: "s5", Component: Megaphone, style: { bottom: "12%",right: "5%"  }, cls: "s5" },
  { id: "s6", Component: Phone,     style: { top: "50%",   right: "19%"  }, cls: "s6" },
  { id: "s7", Component: ThumbsUp,  style: { top: "28%",   left: "30%"  }, cls: "s7" },
  { id: "s8", Component: Briefcase, style: { bottom: "82%",right: "28%"  }, cls: "s8" },
]

const TICKER_ITEMS = [
  "Back soon",
  "Improving performance",
  "Enhancing UI",
  "Bug fixes underway",
  "New features coming",
  "Thank you for waiting",
]

export default function MaintenancePage() {
  const [progressWidth, setProgressWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setProgressWidth(10), 1600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="mp-page">
      <style>{CSS}</style>

      <div className="mp-grid" />

      {STICKERS.map(({ id, Component, style, cls }) => (
        <div key={id} className={`mp-sticker ${cls}`} style={style}>
          <Component />
        </div>
      ))}

      <div className="mp-hero">
        <h1 className="mp-wordmark">
          int<em>bar</em>
        </h1>

        <div className="mp-divider" />

        <div className="mp-badge">
          <span className="mp-badge-dot" />
          Under Maintenance
        </div>

        <p className="mp-headline">
          We&rsquo;re making things better<span className="mp-cursor" />
        </p>

        <p className="mp-sub">
          Our team is hard at work improving your experience.
          We&rsquo;ll be back online shortly&nbsp;&mdash;&nbsp;hang tight.
        </p>

        <div className="mp-progress-wrap">
          <div className="mp-progress-labels">
            <span>Progress</span>
            <span>10%</span>
          </div>
          <div className="mp-progress-track">
            <div
              className="mp-progress-fill"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mp-ticker-wrap">
        <div className="mp-ticker-inner">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="mp-ticker-item">
              <span className="mp-ticker-dot" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes mp-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes mp-scaleIn {
    from { opacity: 0; transform: scaleX(0); }
    to   { opacity: 1; transform: scaleX(1); }
  }
  @keyframes mp-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.25; }
  }
  @keyframes mp-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes mp-marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes mp-stickerIn {
    from { opacity: 0; transform: scale(0.4); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes mp-float1 { 0%,100%{transform:translateY(0) rotate(-6deg);}  50%{transform:translateY(-10px) rotate(-6deg);} }
  @keyframes mp-float2 { 0%,100%{transform:translateY(0) rotate(8deg);}   50%{transform:translateY(-14px) rotate(8deg);} }
  @keyframes mp-float3 { 0%,100%{transform:translateY(0) rotate(-12deg);} 50%{transform:translateY(-8px) rotate(-12deg);} }
  @keyframes mp-float4 { 0%,100%{transform:translateY(0) rotate(5deg);}   50%{transform:translateY(-12px) rotate(5deg);} }
  @keyframes mp-float5 { 0%,100%{transform:translateY(0) rotate(-4deg);}  50%{transform:translateY(-10px) rotate(-4deg);} }
  @keyframes mp-float6 { 0%,100%{transform:translateY(0) rotate(10deg);}  50%{transform:translateY(-8px) rotate(10deg);} }
  @keyframes mp-float7 { 0%,100%{transform:translateY(0) rotate(-8deg);}  50%{transform:translateY(-13px) rotate(-8deg);} }
  @keyframes mp-float8 { 0%,100%{transform:translateY(0) rotate(14deg);}  50%{transform:translateY(-9px) rotate(14deg);} }

  .mp-page {
    min-height: 100vh;
    background: #ffffff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 60px 24px 80px;
  }

  .mp-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(#e8e8e8 1px, transparent 1px),
      linear-gradient(90deg, #e8e8e8 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.5;
    pointer-events: none;
  }

  .mp-sticker {
    position: absolute;
    pointer-events: none;
  }
  .mp-sticker.s1 { animation: mp-stickerIn 0.5s 0.3s ease both, mp-float1 3.5s 0.8s ease-in-out infinite; }
  .mp-sticker.s2 { animation: mp-stickerIn 0.5s 0.5s ease both, mp-float2 3.8s 1.0s ease-in-out infinite; }
  .mp-sticker.s3 { animation: mp-stickerIn 0.5s 0.7s ease both, mp-float3 4.0s 1.2s ease-in-out infinite; }
  .mp-sticker.s4 { animation: mp-stickerIn 0.5s 0.4s ease both, mp-float4 3.6s 0.9s ease-in-out infinite; }
  .mp-sticker.s5 { animation: mp-stickerIn 0.5s 0.6s ease both, mp-float5 3.4s 1.1s ease-in-out infinite; }
  .mp-sticker.s6 { animation: mp-stickerIn 0.5s 0.9s ease both, mp-float6 3.7s 1.4s ease-in-out infinite; }
  .mp-sticker.s7 { animation: mp-stickerIn 0.5s 0.2s ease both, mp-float7 3.5s 0.7s ease-in-out infinite; }
  .mp-sticker.s8 { animation: mp-stickerIn 0.5s 0.8s ease both, mp-float8 3.9s 1.3s ease-in-out infinite; }

  .mp-hero {
    position: relative;
    z-index: 10;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .mp-wordmark {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-size: clamp(3.4rem, 9vw, 6rem);
    color: #111;
    letter-spacing: -0.03em;
    line-height: 1;
    animation: mp-fadeUp 0.7s ease 0.15s both;
  }
  .mp-wordmark em {
    font-style: italic;
    color: #555;
  }

  .mp-divider {
    width: 44px;
    height: 2px;
    background: #111;
    margin: 20px auto 18px;
    transform-origin: left;
    animation: mp-scaleIn 0.5s ease 0.55s both;
  }

  .mp-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #111;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 7px 16px;
    border-radius: 100px;
    animation: mp-fadeUp 0.6s ease 0.75s both;
    margin-bottom: 22px;
  }

  .mp-badge-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #fff;
    flex-shrink: 0;
    animation: mp-pulse 1.6s ease-in-out infinite;
  }

  .mp-headline {
    font-size: clamp(1.05rem, 2.8vw, 1.4rem);
    font-weight: 700;
    color: #111;
    letter-spacing: -0.01em;
    margin-bottom: 10px;
    animation: mp-fadeUp 0.6s ease 0.95s both;
  }

  .mp-cursor {
    display: inline-block;
    width: 2px;
    height: 1em;
    background: #111;
    margin-left: 3px;
    vertical-align: middle;
    animation: mp-blink 1s step-end infinite;
  }

  .mp-sub {
    font-size: 0.9rem;
    color: #888;
    font-weight: 400;
    line-height: 1.75;
    max-width: 380px;
    margin-bottom: 36px;
    animation: mp-fadeUp 0.6s ease 1.1s both;
  }

  .mp-progress-wrap {
    width: 280px;
    animation: mp-fadeUp 0.6s ease 1.3s both;
  }

  .mp-progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    font-weight: 700;
    color: #aaa;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .mp-progress-track {
    height: 5px;
    background: #ebebeb;
    border-radius: 10px;
    overflow: hidden;
  }

  .mp-progress-fill {
    height: 100%;
    background: #111;
    border-radius: 10px;
    transition: width 1.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .mp-ticker-wrap {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 1px solid #ebebeb;
    background: #fafafa;
    padding: 13px 0;
    overflow: hidden;
    z-index: 20;
    animation: mp-fadeUp 0.5s ease 2s both;
  }

  .mp-ticker-inner {
    display: flex;
    white-space: nowrap;
    width: max-content;
    animation: mp-marquee 20s linear infinite;
  }

  .mp-ticker-item {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 0.72rem;
    font-weight: 600;
    color: #999;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0 36px;
  }

  .mp-ticker-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #ccc;
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    .mp-sticker.s3,
    .mp-sticker.s7 { display: none; }
    .mp-progress-wrap { width: 240px; }
  }
`