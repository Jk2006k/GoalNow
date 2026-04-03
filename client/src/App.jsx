import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LandingPage, Login, HomePage, Profile, EvaluationResults, ScoreTracker } from "./pages"
import Behavioural from "./features/behavioral/pages/Behavioral"
import Technical from "./features/technical/pages/Technical"
import DSA from "./features/dsa/pages/DSA"
import DSAInterview from "./features/dsa/pages/DSAInterview"
import BehavioralInterview from "./features/behavioral/pages/BehavioralInterview"
import TechnicalInterview from "./features/technical/pages/TechnicalInterview"

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