import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "./Page/LandingPage"
import LoginPage from "./Page/Login"
import HomePage from "./Page/HomePage"
import Profile from "./Page/Profile"
import Behavioural from "./Page/Behavioral"
import BehaviouralEntry from "./assesment/behaviouralEntry"
import Technical from "./Page/Technical"
import TechnicalEntry from "./assesment/technicalEntry"
import BehavioralInterview from "./Page/BehavioralInterview"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/behavioural" element={<Behavioural />} />
        <Route path="/behavioural-entry" element={<BehaviouralEntry />} />
        <Route path="/technical" element={<Technical />} />
        <Route path="/technical-entry" element={<TechnicalEntry />} />
        <Route path="/behavioral-interview" element={<BehavioralInterview />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App