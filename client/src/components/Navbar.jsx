import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onAboutClick, onHowWeWorkClick }) {
  const navigate = useNavigate();

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "22px 64px",
      background: "#fff",
      borderBottom: "1px solid #f0f0f0",
      position: "relative",
      zIndex: 100,
    }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-1px", margin: 0 }}>intbar.</h1>
      <div style={{ display: "flex", gap: "2px" }}>
        {["About", "How we work", "Login/Signup"].map((item) => (
          <button
            key={item}
            style={{
              background: "transparent",
              color: "#111",
              border: "none",
              borderRadius: "5px",
              padding: "8px 15px",
              fontSize: "0.88rem",
              fontWeight: "400",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.2s ease",
            }}
            onClick={() => {
              if (item === "Login/Signup") navigate("/login");
              if (item === "About" && onAboutClick) onAboutClick();
              if (item === "How we work" && onHowWeWorkClick) onHowWeWorkClick();
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.07)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {item}
          </button>
        ))}
      </div>
    </nav>
  );
}
