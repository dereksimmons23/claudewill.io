import React, { useState } from 'react'
import JobDescriptionInput from './components/JobDescriptionInput'
import ResumeGenerator from './components/ResumeGenerator'
import './App.css'

function App() {
  const [jobData, setJobData] = useState(null)
  const [resumeGenerated, setResumeGenerated] = useState(false)

  const handleJobAnalysis = (analysisData) => {
    setJobData(analysisData)
    setResumeGenerated(true)
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Resume CI/CD Engine</h1>
        <p>Transform job descriptions into tailored resumes with AI-powered analysis</p>
      </header>

      <main className="app-main">
        {!resumeGenerated ? (
          <JobDescriptionInput onAnalysis={handleJobAnalysis} />
        ) : (
          <ResumeGenerator jobData={jobData} onBack={() => setResumeGenerated(false)} />
        )}
      </main>

      <footer className="app-footer">
        <p>Built by Derek Simmons | <a href="https://claudewill.io">claudewill.io</a></p>
      </footer>
    </div>
  )
}

export default App
