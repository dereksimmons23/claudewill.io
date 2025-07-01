import React, { useState, useEffect } from 'react'

// Main Career Intelligence Platform
const CareerIntelligencePlatform = () => {
  const [activeTab, setActiveTab] = useState('resume-builder')
  const [darkMode, setDarkMode] = useState(false)

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

  const tabs = [
    { id: 'resume-builder', label: 'Resume Builder', icon: '📄' },
    { id: 'ats-decoder', label: 'ATS Decoder', icon: '🔍' },
    { id: 'voice-calibrator', label: 'Voice Calibrator', icon: '🎯' },
    { id: 'decision-matrix', label: 'Decision Matrix', icon: '⚖️' }
  ]

  return (
    <div className={`career-platform ${darkMode ? 'dark' : 'light'}`}>
      <style>{`
        :root {
          --primary: #2563eb;
          --primary-dark: #1d4ed8;
          --secondary: #64748b;
          --accent: #f59e0b;
          --success: #10b981;
          --warning: #f59e0b;
          --error: #ef4444;
          --text: #1e293b;
          --text-muted: #64748b;
          --background: #ffffff;
          --surface: #f8fafc;
          --border: #e2e8f0;
          --shadow: rgba(0, 0, 0, 0.1);
        }

        [data-theme="dark"] {
          --text: #f1f5f9;
          --text-muted: #94a3b8;
          --background: #0f172a;
          --surface: #1e293b;
          --border: #334155;
          --shadow: rgba(0, 0, 0, 0.3);
        }

        .career-platform {
          min-height: 100vh;
          background-color: var(--background);
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          transition: all 0.2s ease;
        }

        .platform-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          padding: 1rem;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 8px var(--shadow);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .logo-section h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(45deg, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-section p {
          font-size: 0.875rem;
          margin: 0;
          opacity: 0.9;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .theme-toggle {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1.25rem;
        }

        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .tab-navigation {
          background-color: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 0 1rem;
          position: sticky;
          top: 60px;
          z-index: 90;
        }

        .tab-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .tab-container::-webkit-scrollbar {
          display: none;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .tab-button:hover {
          color: var(--text);
          background-color: rgba(var(--primary), 0.05);
        }

        .tab-button.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
          background-color: rgba(var(--primary), 0.05);
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
          min-height: calc(100vh - 120px);
        }

        .tool-section {
          background-color: var(--surface);
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 1px 3px var(--shadow);
          border: 1px solid var(--border);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .section-icon {
          font-size: 2.5rem;
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          color: var(--text);
        }

        .section-description {
          font-size: 1rem;
          color: var(--text-muted);
          margin: 0.5rem 0 0 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text);
          font-size: 0.875rem;
        }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background-color: var(--background);
          color: var(--text);
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-textarea {
          min-height: 120px;
          resize: vertical;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .btn-primary {
          background-color: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background-color: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .btn-secondary {
          background-color: var(--surface);
          color: var(--text);
          border: 1px solid var(--border);
        }

        .btn-secondary:hover {
          background-color: var(--border);
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .result-card {
          background-color: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }

        .result-card:hover {
          box-shadow: 0 4px 12px var(--shadow);
          transform: translateY(-2px);
        }

        .score-display {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .score-number {
          font-size: 3rem;
          font-weight: 700;
          margin: 0;
        }

        .score-good { color: var(--success); }
        .score-warning { color: var(--warning); }
        .score-poor { color: var(--error); }

        .score-label {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0;
        }

        .analysis-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .analysis-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border);
        }

        .analysis-item:last-child {
          border-bottom: none;
        }

        .analysis-icon {
          font-size: 1.25rem;
          margin-top: 0.125rem;
        }

        .analysis-text {
          flex: 1;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .footer {
          background-color: var(--surface);
          border-top: 1px solid var(--border);
          padding: 2rem 1rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .coming-soon {
          text-align: center;
          color: var(--text-muted);
          font-style: italic;
          opacity: 0.7;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .tab-button {
            padding: 0.75rem 1rem;
            font-size: 0.8rem;
          }

          .main-content {
            padding: 1rem;
          }

          .tool-section {
            padding: 1.5rem;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .section-icon {
            font-size: 2rem;
          }

          .section-title {
            font-size: 1.5rem;
          }

          .results-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Dark mode specific adjustments */
        [data-theme="dark"] .btn-primary {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        [data-theme="dark"] .result-card {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
      `}</style>

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
        {activeTab === 'resume-builder' && <ResumeBuilder />}
        {activeTab === 'ats-decoder' && <ATSDecoder />}
        {activeTab === 'voice-calibrator' && <VoiceCalibrator />}
        {activeTab === 'decision-matrix' && <DecisionMatrix />}
      </main>

      <footer className="footer">
        <p>Built by <strong>Derek Simmons</strong> | <a href="https://claudewill.io" style={{color: 'var(--primary)'}}>claudewill.io</a> | Part of The CW Standard framework</p>
      </footer>
    </div>
  )
}

// Resume Builder Component (Enhanced from existing)
const ResumeBuilder = () => {
  const [jobDescription, setJobDescription] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)

  const analyzeJob = () => {
    setAnalyzing(true)
    
    // Simulate analysis
    setTimeout(() => {
      const mockResults = {
        roleType: 'ai-focused',
        keywords: {
          ai: ['artificial intelligence', 'machine learning', 'AI strategy'],
          leadership: ['leadership', 'strategic', 'vision'],
          business: ['revenue', 'growth', 'transformation']
        },
        atsScore: 85,
        recommendations: [
          'Add quantified achievements in AI implementation',
          'Include specific technology stack experience',
          'Emphasize leadership and strategic planning',
          'Highlight revenue generation results'
        ]
      }
      setResults(mockResults)
      setAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="tool-section">
      <div className="section-header">
        <div className="section-icon">📄</div>
        <div>
          <h2 className="section-title">Resume Builder</h2>
          <p className="section-description">Generate tailored resumes optimized for specific roles and ATS systems</p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Company Name</label>
        <input
          type="text"
          className="form-input"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter company name"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Role Title</label>
        <input
          type="text"
          className="form-input"
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          placeholder="Enter role title"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Job Description</label>
        <textarea
          className="form-textarea"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={8}
        />
      </div>

      <button 
        className="btn btn-primary"
        onClick={analyzeJob}
        disabled={!jobDescription.trim() || analyzing}
      >
        {analyzing ? '🔄 Analyzing...' : '🚀 Generate Resume'}
      </button>

      {results && (
        <div className="results-grid">
          <div className="result-card">
            <div className="score-display">
              <h3 className={`score-number ${results.atsScore >= 80 ? 'score-good' : results.atsScore >= 60 ? 'score-warning' : 'score-poor'}`}>
                {results.atsScore}%
              </h3>
              <p className="score-label">ATS Compatibility Score</p>
            </div>
            <ul className="analysis-list">
              {results.recommendations.map((rec, idx) => (
                <li key={idx} className="analysis-item">
                  <span className="analysis-icon">💡</span>
                  <span className="analysis-text">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="result-card">
            <h3 style={{marginBottom: '1rem', color: 'var(--text)'}}>Detected Keywords</h3>
            <ul className="analysis-list">
              <li className="analysis-item">
                <span className="analysis-icon">🤖</span>
                <span className="analysis-text">AI/Tech: {results.keywords.ai.join(', ')}</span>
              </li>
              <li className="analysis-item">
                <span className="analysis-icon">👥</span>
                <span className="analysis-text">Leadership: {results.keywords.leadership.join(', ')}</span>
              </li>
              <li className="analysis-item">
                <span className="analysis-icon">💼</span>
                <span className="analysis-text">Business: {results.keywords.business.join(', ')}</span>
              </li>
            </ul>
            <button className="btn btn-primary" style={{marginTop: '1rem', width: '100%'}}>
              📄 Download Tailored Resume
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ATS Decoder Component (Enhanced)
const ATSDecoder = () => {
  const [resumeText, setResumeText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)

  const analyzeResume = () => {
    setAnalyzing(true)
    
    // Simulate ATS analysis
    setTimeout(() => {
      const mockResults = {
        overallScore: 73,
        breakdown: {
          formatting: 85,
          keywords: 68,
          content: 75,
          structure: 70
        },
        issues: [
          'Missing quantified achievements in leadership roles',
          'Inconsistent date formatting detected',
          'Could benefit from more industry-specific keywords',
          'Professional summary could be more impactful'
        ],
        strengths: [
          'Strong technical keyword coverage',
          'Clear section structure',
          'Appropriate length for experience level',
          'Contact information properly formatted'
        ]
      }
      setResults(mockResults)
      setAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="tool-section">
      <div className="section-header">
        <div className="section-icon">🔍</div>
        <div>
          <h2 className="section-title">ATS Decoder</h2>
          <p className="section-description">Analyze your resume for ATS compatibility and optimization opportunities</p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Resume Content</label>
        <textarea
          className="form-textarea"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here for analysis..."
          rows={12}
        />
      </div>

      <button 
        className="btn btn-primary"
        onClick={analyzeResume}
        disabled={!resumeText.trim() || analyzing}
      >
        {analyzing ? '🔍 Analyzing...' : '🎯 Analyze ATS Score'}
      </button>

      {results && (
        <div className="results-grid">
          <div className="result-card">
            <div className="score-display">
              <h3 className={`score-number ${results.overallScore >= 80 ? 'score-good' : results.overallScore >= 60 ? 'score-warning' : 'score-poor'}`}>
                {results.overallScore}%
              </h3>
              <p className="score-label">Overall ATS Score</p>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem'}}>
              <div>Formatting: <strong>{results.breakdown.formatting}%</strong></div>
              <div>Keywords: <strong>{results.breakdown.keywords}%</strong></div>
              <div>Content: <strong>{results.breakdown.content}%</strong></div>
              <div>Structure: <strong>{results.breakdown.structure}%</strong></div>
            </div>
          </div>

          <div className="result-card">
            <h3 style={{marginBottom: '1rem', color: 'var(--text)'}}>Issues to Fix</h3>
            <ul className="analysis-list">
              {results.issues.map((issue, idx) => (
                <li key={idx} className="analysis-item">
                  <span className="analysis-icon">⚠️</span>
                  <span className="analysis-text">{issue}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="result-card">
            <h3 style={{marginBottom: '1rem', color: 'var(--text)'}}>Strengths</h3>
            <ul className="analysis-list">
              {results.strengths.map((strength, idx) => (
                <li key={idx} className="analysis-item">
                  <span className="analysis-icon">✅</span>
                  <span className="analysis-text">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// NEW: Voice Calibrator Component
const VoiceCalibrator = () => {
  const [sampleText, setSampleText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)

  const analyzeVoice = () => {
    setAnalyzing(true)
    
    // Simulate voice analysis
    setTimeout(() => {
      const overselling = sampleText.toLowerCase().includes('passionate') || 
                         sampleText.toLowerCase().includes('excited') ||
                         sampleText.toLowerCase().includes('love')
      
      const mockResults = {
        voiceType: overselling ? 'sales-heavy' : 'executive',
        confidence: 78,
        issues: overselling ? [
          'Contains overselling language ("passionate", "excited")',
          'Consider more measured, confident tone',
          'Focus on results rather than enthusiasm'
        ] : [
          'Could add more specific quantified achievements',
          'Consider stronger action verbs for impact'
        ],
        strengths: [
          'Professional tone maintained',
          'Clear communication style',
          'Appropriate business language'
        ],
        suggestions: [
          'Replace "passionate about" with "specialized in"',
          'Use "achieved" instead of "excited to share"',
          'Quantify achievements with specific numbers'
        ]
      }
      setResults(mockResults)
      setAnalyzing(false)
    }, 1500)
  }

  return (
    <div className="tool-section">
      <div className="section-header">
        <div className="section-icon">🎯</div>
        <div>
          <h2 className="section-title">Voice Calibrator</h2>
          <p className="section-description">Detect and optimize professional voice vs. sales language patterns</p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Sample Text (Cover Letter, Resume Summary, etc.)</label>
        <textarea
          className="form-textarea"
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          placeholder="Paste a sample of your professional writing for voice analysis..."
          rows={8}
        />
      </div>

      <button 
        className="btn btn-primary"
        onClick={analyzeVoice}
        disabled={!sampleText.trim() || analyzing}
      >
        {analyzing ? '🎯 Analyzing...' : '🗣️ Analyze Voice'}
      </button>

      {results && (
        <div className="results-grid">
          <div className="result-card">
            <div className="score-display">
              <h3 className={`score-number ${results.voiceType === 'executive' ? 'score-good' : 'score-warning'}`}>
                {results.voiceType === 'executive' ? '👔' : '🏪'}
              </h3>
              <p className="score-label">
                {results.voiceType === 'executive' ? 'Executive Voice' : 'Sales Voice Detected'}
              </p>
            </div>
            <p style={{textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)'}}>
              Confidence: {results.confidence}%
            </p>
          </div>

          <div className="result-card">
            <h3 style={{marginBottom: '1rem', color: 'var(--text)'}}>Areas for Improvement</h3>
            <ul className="analysis-list">
              {results.issues.map((issue, idx) => (
                <li key={idx} className="analysis-item">
                  <span className="analysis-icon">⚠️</span>
                  <span className="analysis-text">{issue}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="result-card">
            <h3 style={{marginBottom: '1rem', color: 'var(--text)'}}>Suggestions</h3>
            <ul className="analysis-list">
              {results.suggestions.map((suggestion, idx) => (
                <li key={idx} className="analysis-item">
                  <span className="analysis-icon">💡</span>
                  <span className="analysis-text">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// NEW: Decision Matrix Component
const DecisionMatrix = () => {
  const [opportunities, setOpportunities] = useState([
    { name: '', skills: 0, trajectory: 0, market: 0, legal: 0, financial: 0, growth: 0 }
  ])

  const addOpportunity = () => {
    setOpportunities([...opportunities, 
      { name: '', skills: 0, trajectory: 0, market: 0, legal: 0, financial: 0, growth: 0 }
    ])
  }

  const updateOpportunity = (index, field, value) => {
    const updated = [...opportunities]
    updated[index][field] = value
    setOpportunities(updated)
  }

  const calculateScore = (opp) => {
    return Math.round((opp.skills + opp.trajectory + opp.market + opp.legal + opp.financial + opp.growth) / 6)
  }

  const criteria = [
    { key: 'skills', label: 'Skills Leverage' },
    { key: 'trajectory', label: 'Trajectory Alignment' },
    { key: 'market', label: 'Market Position' },
    { key: 'legal', label: 'Legal Compatibility' },
    { key: 'financial', label: 'Financial Logic' },
    { key: 'growth', label: 'Growth Potential' }
  ]

  return (
    <div className="tool-section">
      <div className="section-header">
        <div className="section-icon">⚖️</div>
        <div>
          <h2 className="section-title">Strategic Decision Matrix</h2>
          <p className="section-description">Evaluate career opportunities using Derek's 6-criteria framework</p>
        </div>
      </div>

      {opportunities.map((opp, index) => (
        <div key={index} className="result-card" style={{marginBottom: '1.5rem'}}>
          <div className="form-group">
            <label className="form-label">Opportunity Name</label>
            <input
              type="text"
              className="form-input"
              value={opp.name}
              onChange={(e) => updateOpportunity(index, 'name', e.target.value)}
              placeholder="Enter opportunity