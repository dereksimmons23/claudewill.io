import React, { useState } from 'react'

const ATSDecoder = () => {
  const [resumeText, setResumeText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)

  const analyzeResume = () => {
    setAnalyzing(true)
    
    // Simulate ATS analysis based on actual resume content
    setTimeout(() => {
      const wordCount = resumeText.split(' ').length
      const hasQuantifiedAchievements = /\d+%|\$\d+|increased|decreased|improved|generated/i.test(resumeText)
      const hasKeywords = /leadership|management|strategy|revenue|growth/i.test(resumeText)
      const hasProperSections = /experience|education|skills/i.test(resumeText)
      const hasBulletPoints = resumeText.includes('•') || resumeText.includes('-')
      
      let overallScore = 60
      const breakdown = {
        formatting: 70,
        keywords: 60,
        content: 65,
        structure: 65
      }
      
      const issues = []
      const strengths = []
      
      // Analyze content and adjust scores
      if (hasQuantifiedAchievements) {
        breakdown.content += 15
        strengths.push('Contains quantified achievements')
      } else {
        issues.push('Missing quantified achievements in key positions')
      }
      
      if (hasKeywords) {
        breakdown.keywords += 20
        strengths.push('Good keyword coverage for leadership roles')
      } else {
        issues.push('Could benefit from more industry-specific keywords')
      }
      
      if (hasProperSections) {
        breakdown.structure += 15
        strengths.push('Clear section structure detected')
      } else {
        issues.push('Standard resume sections may be missing or unclear')
      }
      
      if (hasBulletPoints) {
        breakdown.formatting += 15
        strengths.push('Proper bullet point formatting')
      } else {
        issues.push('Consider using bullet points for better readability')
      }
      
      if (wordCount < 200) {
        issues.push('Resume appears too brief for experience level')
        breakdown.content -= 10
      } else if (wordCount > 800) {
        issues.push('Resume may be too lengthy for ATS processing')
        breakdown.formatting -= 10
      } else {
        strengths.push('Appropriate length for experience level')
      }
      
      // Calculate overall score
      overallScore = Math.round((breakdown.formatting + breakdown.keywords + breakdown.content + breakdown.structure) / 4)
      
      // Add common issues and strengths
      if (!resumeText.includes('@')) {
        issues.push('Contact information may be missing or incomplete')
      } else {
        strengths.push('Contact information properly formatted')
      }
      
      const mockResults = {
        overallScore,
        breakdown,
        issues,
        strengths
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

export default ATSDecoder