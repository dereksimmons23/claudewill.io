import React, { useState } from 'react'

const DecisionMatrix = () => {
  const [opportunities, setOpportunities] = useState([
    { name: '', skills: 0, trajectory: 0, market: 0, legal: 0, financial: 0, growth: 0 }
  ])

  const addOpportunity = () => {
    setOpportunities([...opportunities, 
      { name: '', skills: 0, trajectory: 0, market: 0, legal: 0, financial: 0, growth: 0 }
    ])
  }

  const removeOpportunity = (index) => {
    if (opportunities.length > 1) {
      const updated = opportunities.filter((_, i) => i !== index)
      setOpportunities(updated)
    }
  }

  const updateOpportunity = (index, field, value) => {
    const updated = [...opportunities]
    updated[index][field] = value
    setOpportunities(updated)
  }

  const calculateScore = (opp) => {
    const total = opp.skills + opp.trajectory + opp.market + opp.legal + opp.financial + opp.growth
    return Math.round((total / 30) * 100) // Convert to percentage
  }

  const getScoreOutOfFive = (opp) => {
    return Math.round((opp.skills + opp.trajectory + opp.market + opp.legal + opp.financial + opp.growth) / 6 * 10) / 10
  }

  const criteria = [
    { 
      key: 'skills', 
      label: 'Skills Leverage',
      description: 'How well does this opportunity utilize your existing strengths and expertise?'
    },
    { 
      key: 'trajectory', 
      label: 'Trajectory Alignment',
      description: 'Does this align with your long-term career vision and goals?'
    },
    { 
      key: 'market', 
      label: 'Market Position',
      description: "What's the competitive landscape and growth potential in this space?"
    },
    { 
      key: 'legal', 
      label: 'Legal Compatibility',
      description: 'Are there any conflicts with existing commitments or agreements?'
    },
    { 
      key: 'financial', 
      label: 'Financial Logic',
      description: 'Does the compensation and financial upside make strategic sense?'
    },
    { 
      key: 'growth', 
      label: 'Growth Potential',
      description: 'What opportunities exist for learning, advancement, and impact expansion?'
    }
  ]

  const getRecommendation = (score) => {
    if (score >= 80) return { text: 'Strong Opportunity', color: 'var(--success)', icon: '🚀' }
    if (score >= 60) return { text: 'Consider Carefully', color: 'var(--warning)', icon: '⚖️' }
    if (score >= 40) return { text: 'Proceed with Caution', color: 'var(--warning)', icon: '⚠️' }
    return { text: 'Not Recommended', color: 'var(--error)', icon: '❌' }
  }

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
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h4 style={{margin: 0, color: 'var(--text)'}}>
              Opportunity {index + 1}
              {opp.name && `: ${opp.name}`}
            </h4>
            {opportunities.length > 1 && (
              <button 
                onClick={() => removeOpportunity(index)}
                style={{
                  background: 'var(--error)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                ×
              </button>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Opportunity Name</label>
            <input
              type="text"
              className="form-input"
              value={opp.name}
              onChange={(e) => updateOpportunity(index, 'name', e.target.value)}
              placeholder="Enter opportunity name (e.g., 'Senior AI Director at TechCorp')"
            />
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem'}}>
            {criteria.map(criterion => (
              <div key={criterion.key} className="form-group">
                <label className="form-label" title={criterion.description}>
                  {criterion.label}
                  <span style={{color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', fontWeight: 'normal'}}>
                    {criterion.description}
                  </span>
                </label>
                <select
                  className="form-select"
                  value={opp[criterion.key]}
                  onChange={(e) => updateOpportunity(index, criterion.key, parseInt(e.target.value))}
                >
                  <option value={0}>0 - Poor Fit</option>
                  <option value={1}>1 - Below Average</option>
                  <option value={2}>2 - Average</option>
                  <option value={3}>3 - Good Fit</option>
                  <option value={4}>4 - Excellent Fit</option>
                  <option value={5}>5 - Perfect Fit</option>
                </select>
              </div>
            ))}
          </div>

          {opp.name && (
            <div style={{marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(37, 99, 235, 0.05)', borderRadius: '0.5rem', border: '1px solid var(--primary)'}}>
              <div className="score-display" style={{marginBottom: '1rem'}}>
                <h3 className={`score-number ${calculateScore(opp) >= 80 ? 'score-good' : calculateScore(opp) >= 60 ? 'score-warning' : 'score-poor'}`}>
                  {calculateScore(opp)}%
                </h3>
                <p className="score-label">Overall Opportunity Score ({getScoreOutOfFive(opp)}/5.0)</p>
              </div>
              
              <div style={{textAlign: 'center'}}>
                {(() => {
                  const rec = getRecommendation(calculateScore(opp))
                  return (
                    <div style={{color: rec.color, fontWeight: '600', fontSize: '1rem'}}>
                      {rec.icon} {rec.text}
                    </div>
                  )
                })()}
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', fontSize: '0.8rem', marginTop: '1rem', color: 'var(--text-muted)'}}>
                <div>Skills: {opp.skills}/5</div>
                <div>Trajectory: {opp.trajectory}/5</div>
                <div>Market: {opp.market}/5</div>
                <div>Legal: {opp.legal}/5</div>
                <div>Financial: {opp.financial}/5</div>
                <div>Growth: {opp.growth}/5</div>
              </div>
            </div>
          )}
        </div>
      ))}

      <button className="btn btn-secondary" onClick={addOpportunity} style={{marginBottom: '2rem'}}>
        ➕ Add Another Opportunity
      </button>

      {opportunities.filter(opp => opp.name).length > 1 && (
        <div className="result-card" style={{marginTop: '2rem'}}>
          <h3 style={{marginBottom: '1rem', color: 'var(--text)'}}>📊 Opportunity Ranking</h3>
          <ul className="analysis-list">
            {opportunities
              .filter(opp => opp.name)
              .sort((a, b) => calculateScore(b) - calculateScore(a))
              .map((opp, idx) => {
                const score = calculateScore(opp)
                const rec = getRecommendation(score)
                return (
                  <li key={idx} className="analysis-item">
                    <span className="analysis-icon">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '📊'}
                    </span>
                    <div className="analysis-text">
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem'}}>
                        <strong>{opp.name}</strong>
                        <span style={{color: rec.color, fontWeight: '600', fontSize: '0.875rem'}}>
                          {rec.icon} {score}%
                        </span>
                      </div>
                      <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                        Skills: {opp.skills} | Trajectory: {opp.trajectory} | Market: {opp.market} | 
                        Legal: {opp.legal} | Financial: {opp.financial} | Growth: {opp.growth}
                      </div>
                      <div style={{fontSize: '0.8rem', color: rec.color, marginTop: '0.25rem'}}>
                        {rec.text}
                      </div>
                    </div>
                  </li>
                )
              })}
          </ul>
        </div>
      )}

      <div className="result-card" style={{marginTop: '2rem', backgroundColor: 'rgba(37, 99, 235, 0.05)', border: '1px solid var(--primary)'}}>
        <h4 style={{color: 'var(--primary)', marginBottom: '1rem'}}>📚 The CW Strategic Framework Guide</h4>
        <ul className="analysis-list" style={{fontSize: '0.875rem'}}>
          {criteria.map((criterion, idx) => (
            <li key={idx} className="analysis-item">
              <span className="analysis-icon">
                {idx === 0 ? '🎯' : idx === 1 ? '📈' : idx === 2 ? '🏢' : idx === 3 ? '⚖️' : idx === 4 ? '💰' : '🚀'}
              </span>
              <div className="analysis-text">
                <strong>{criterion.label}:</strong> {criterion.description}
              </div>
            </li>
          ))}
        </ul>
        
        <div style={{marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '0.5rem', fontSize: '0.875rem'}}>
          <h5 style={{margin: '0 0 0.75rem 0', color: 'var(--primary)'}}>💡 Scoring Guidelines:</h5>
          <ul style={{margin: 0, paddingLeft: '1.25rem', lineHeight: '1.5'}}>
            <li><strong>5 (Perfect Fit):</strong> Exceptional alignment, major opportunity</li>
            <li><strong>4 (Excellent Fit):</strong> Strong positive indicators, highly recommended</li>
            <li><strong>3 (Good Fit):</strong> Solid opportunity with clear benefits</li>
            <li><strong>2 (Average):</strong> Mixed signals, requires careful consideration</li>
            <li><strong>1 (Below Average):</strong> Some concerns, proceed with caution</li>
            <li><strong>0 (Poor Fit):</strong> Not recommended, significant misalignment</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DecisionMatrix