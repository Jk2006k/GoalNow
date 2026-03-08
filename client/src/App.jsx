import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "./Page/LandingPage"
import LoginPage from "./Page/Login"
import HomePage from "./Page/HomePage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App