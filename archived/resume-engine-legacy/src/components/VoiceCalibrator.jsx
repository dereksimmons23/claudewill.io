import React, { useState } from 'react'

const VoiceCalibrator = () => {
  const [sampleText, setSampleText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)

  const analyzeVoice = () => {
    setAnalyzing(true)
    
    // Simulate voice analysis with real pattern detection
    setTimeout(() => {
      const text = sampleText.toLowerCase()
      
      // Sales language indicators
      const salesPatterns = [
        'passionate', 'excited', 'love', 'thrilled', 'amazing', 'incredible',
        'huge fan', 'absolutely', 'totally', 'super', 'really love',
        'dream job', 'perfect fit', 'ideal candidate'
      ]
      
      // Executive language indicators  
      const executivePatterns = [
        'led', 'managed', 'directed', 'oversaw', 'implemented', 'developed',
        'generated', 'achieved', 'delivered', 'established', 'streamlined',
        'orchestrated', 'spearheaded', 'transformed'
      ]
      
      // Defensive language
      const defensivePatterns = [
        'although i don\'t have', 'even though', 'despite not having',
        'while i lack', 'i may not have', 'i don\'t have experience in'
      ]
      
      // Count patterns
      const salesCount = salesPatterns.filter(pattern => text.includes(pattern)).length
      const executiveCount = executivePatterns.filter(pattern => text.includes(pattern)).length
      const defensiveCount = defensivePatterns.filter(pattern => text.includes(pattern)).length
      
      // Determine voice type
      const isSalesHeavy = salesCount > 2 || defensiveCount > 0
      const voiceType = isSalesHeavy ? 'sales-heavy' : 'executive'
      const confidence = Math.min(95, 65 + (executiveCount * 5) - (salesCount * 8) - (defensiveCount * 15))
      
      const issues = []
      const strengths = []
      const suggestions = []
      
      // Analysis logic
      if (salesCount > 0) {
        issues.push(`Contains ${salesCount} overselling terms (${salesPatterns.filter(p => text.includes(p)).join(', ')})`)
        suggestions.push('Replace emotional language with factual achievements')
      }
      
      if (defensiveCount > 0) {
        issues.push('Contains defensive explanations that weaken your position')
        suggestions.push('Focus on what you bring rather than what you lack')
      }
      
      if (executiveCount > 3) {
        strengths.push('Strong use of executive action verbs')
      } else if (executiveCount > 0) {
        strengths.push('Some executive language detected')
        suggestions.push('Consider adding more specific action verbs')
      } else {
        issues.push('Limited use of strong action verbs')
        suggestions.push('Use verbs like "led," "generated," "implemented" instead of "worked on"')
      }
      
      // Check for quantified achievements
      const hasNumbers = /\d+%|\$\d+|\d+\s*(million|thousand|k\b)/i.test(sampleText)
      if (hasNumbers) {
        strengths.push('Contains quantified achievements')
      } else {
        issues.push('Missing specific numbers and quantified results')
        suggestions.push('Add specific metrics: "$2M revenue increase" vs "increased revenue"')
      }
      
      // Check for first person overuse
      const firstPersonCount = (text.match(/\bi\s/g) || []).length
      if (firstPersonCount > 10) {
        issues.push('Overuse of first person ("I") - consider varying sentence structure')
      }
      
      // Professional tone check
      if (!text.includes('experience') && !text.includes('background')) {
        suggestions.push('Consider framing around "experience" rather than personal preferences')
      }
      
      const mockResults = {
        voiceType,
        confidence: Math.max(0, confidence),
        issues,
        strengths,
        suggestions,
        analysis: {
          salesTerms: salesCount,
          executiveTerms: executiveCount,
          defensiveTerms: defensiveCount,
          wordCount: sampleText.split(' ').length
        }
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
            
            <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem'}}>
              Analysis: {results.analysis.executiveTerms} executive terms, {results.analysis.salesTerms} sales terms, {results.analysis.defensiveTerms} defensive phrases
            </div>
          </div>

          {results.issues.length > 0 && (
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
          )}

          {results.suggestions.length > 0 && (
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
          )}

          {results.strengths.length > 0 && (
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
          )}
        </div>
      )}
      
      <div className="result-card" style={{marginTop: '2rem', backgroundColor: 'rgba(37, 99, 235, 0.05)', border: '1px solid var(--primary)'}}>
        <h4 style={{color: 'var(--primary)', marginBottom: '1rem'}}>💡 Voice Calibration Guide</h4>
        <div style={{fontSize: '0.875rem', lineHeight: '1.5'}}>
          <p><strong>Executive Voice:</strong> Confident, factual, achievement-focused. Uses strong action verbs and quantified results.</p>
          <p><strong>Sales Voice:</strong> Emotional, enthusiastic, relationship-focused. Often oversells or uses defensive language.</p>
          <p><strong>Goal:</strong> Sound like someone who belongs in the role, not someone trying to convince you they do.</p>
        </div>
      </div>
    </div>
  )
}

export default VoiceCalibrator