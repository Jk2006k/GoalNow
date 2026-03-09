import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePageNavbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const userLoggedIn = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(userLoggedIn === "true");
  }, []);

  const handleNavigation = (item) => {
    if (item === "Login/Signup") navigate("/login");
    if (item === "Profile") navigate("/profile");
    if (item === "About") navigate("/home");
    if (item === "Logout") {
      localStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
      navigate("/");
    }
  };

  const navItems = isLoggedIn ? ["About", "Profile", "Logout"] : ["About", "Login/Signup"];

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "22px 64px",
      background: "#fff",
      borderBottom: "1px solid #f0f0f0",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "800", color:"#24344d" ,letterSpacing: "-1px", margin: 0, cursor: "pointer" }} onClick={() => navigate("/")} >intbar.</h1>
      <div style={{ display: "flex", gap: "2px" }}>
        {navItems.map((item) => (
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
            onClick={() => handleNavigation(item)}
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

