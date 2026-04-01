import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "./Page/LandingPage"
import LoginPage from "./Page/Login"
import HomePage from "./Page/HomePage"
import Profile from "./Page/Profile"
import Behavioural from "./Page/Behavioral"
import Technical from "./Page/Technical"
import DSA from "./Page/DSA"
import DSAInterview from "./Page/DSAInterview"
import BehavioralInterview from "./Page/BehavioralInterview"
import TechnicalInterview from "./Page/TechnicalInterview"
import EvaluationResults from "./Page/EvaluationResults"
import ScoreTracker from "./Page/ScoreTracker"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/behavioural" element={<Behavioural />} />
        <Route path="/technical" element={<Technical />} />
        <Route path="/dsa" element={<DSA />} />
        <Route path="/dsa-interview" element={<DSAInterview />} />
        <Route path="/behavioral-interview" element={<BehavioralInterview />} />
        <Route path="/technical-interview" element={<TechnicalInterview />} />
        <Route path="/evaluation-results" element={<EvaluationResults />} />
        <Route path="/score-tracker" element={<ScoreTracker />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App