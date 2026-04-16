import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function HomePageNavbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthState = () => {
      const userLoggedIn = authService.isLoggedIn();
      setIsLoggedIn(userLoggedIn);
    };

    // Check on mount
    checkAuthState();

    // Check whenever page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuthState();
      }
    };

    // Also check when storage changes (from other tabs)
    const handleStorageChange = () => {
      checkAuthState();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleNavigation = (item) => {
    if (item === "Login/Signup") navigate("/login");
    if (item === "Profile") navigate("/profile");
    if (item === "Home") navigate("/home");
    if (item === "Logout") {
      // Call authService logout to clear auth data
      authService.logout();
      
      // Clear all storage
      sessionStorage.clear();
      
      // Update local state
      setIsLoggedIn(false);
      
      // Sign out from Google
      if (window.google?.accounts?.id) {
        window.google.accounts.id.revoke('', () => {
          console.log('Google sign-out completed');
        });
      }
      
      // Navigate and reload to clear all cached state
      navigate("/login");
      
      // Force full page reload after short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 300);
    }
  };

  const navItems = isLoggedIn ? ["Home", "Profile", "Logout"] : ["Home", "Login/Signup"];

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
      <h1 style={{ fontSize: "2rem", fontWeight: "800", color:"#24344d" ,letterSpacing: "-1px", margin: 0, cursor: "pointer" }} onClick={() => navigate("/")} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { navigate("/"); } }}>intbar.</h1>
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
              fontWeight: "500",
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

