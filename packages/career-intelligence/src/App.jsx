import React, { useState, useEffect } from 'react'
import JobDescriptionInput from './components/JobDescriptionInput'
import ResumeGenerator from './components/ResumeGenerator'
import ATSDecoder from './components/ATSDecoder'
import VoiceCalibrator from './components/VoiceCalibrator'
import DecisionMatrix from './components/DecisionMatrix'
import ProfileManager from './components/ProfileManager'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('resume-builder')
  const [darkMode, setDarkMode] = useState(false)
  const [jobData, setJobData] = useState(null)
  const [resumeGenerated, setResumeGenerated] = useState(false)

  // Theme detection and persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem('career-intelligence-theme')
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark')
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('career-intelligence-theme', darkMode ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const handleJobAnalysis = (analysisData) => {
    setJobData(analysisData)
    setResumeGenerated(true)
  }

  const tabs = [
    { id: 'resume-builder', label: 'Resume Builder', icon: '📄' },
    { id: 'ats-decoder', label: 'ATS Decoder', icon: '🔍' },
    { id: 'voice-calibrator', label: 'Voice Calibrator', icon: '🎯' },
    { id: 'decision-matrix', label: 'Decision Matrix', icon: '⚖️' },
    { id: 'profile', label: 'My Profile', icon: '👤' }
  ]

  return (
    <div className={`career-platform ${darkMode ? 'dark' : 'light'}`}>
      <header className="platform-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>Career Intelligence Platform</h1>
            <p>AI-powered career optimization tools by Derek Simmons</p>
          </div>
          <div className="header-controls">
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <nav className="tab-navigation">
        <div className="tab-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'resume-builder' && (
          <div className="tool-section">
            {!resumeGenerated ? (
              <JobDescriptionInput onAnalysis={handleJobAnalysis} />
            ) : (
              <ResumeGenerator jobData={jobData} onBack={() => setResumeGenerated(false)} />
            )}
          </div>
        )}
        {activeTab === 'ats-decoder' && <ATSDecoder />}
        {activeTab === 'voice-calibrator' && <VoiceCalibrator />}
        {activeTab === 'decision-matrix' && <DecisionMatrix />}
        {activeTab === 'profile' && <ProfileManager />}
      </main>

      <footer className="app-footer">
        <p>Built by <strong>Derek Simmons</strong> | <a href="https://claudewill.io">claudewill.io</a> | Part of The CW Standard framework</p>
      </footer>
    </div>
  )
}

export default App