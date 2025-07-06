import React, { useState } from 'react'

const JobDescriptionInput = ({ onAnalysis }) => {
  const [jobDescription, setJobDescription] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [roleLevel, setRoleLevel] = useState('executive')
  const [loading, setLoading] = useState(false)

  const analyzeJobDescription = () => {
    if (!jobDescription.trim()) {
      alert('Please paste a job description')
      return
    }

    setLoading(true)

    // Enhanced keyword analysis
    const keywords = extractKeywords(jobDescription.toLowerCase())
    const roleType = determineRoleType(keywords, jobDescription.toLowerCase())
    const requiredSkills = extractSkills(keywords)
    
    const analysisData = {
      originalText: jobDescription,
      companyName: companyName || 'Company',
      roleTitle: roleTitle || 'Position',
      roleLevel,
      keywords,
      roleType,
      requiredSkills,
      analysisDate: new Date().toISOString()
    }

    setTimeout(() => {
      setLoading(false)
      onAnalysis(analysisData)
    }, 1500) // Simulate analysis time
  }

  const extractKeywords = (text) => {
    const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'automation', 'data science', 'innovation', 'evangelist', 'thought leadership']
    const leadershipKeywords = ['leadership', 'executive', 'director', 'vp', 'ceo', 'manage', 'lead', 'strategy', 'strategic', 'consulting']
    const techKeywords = ['technology', 'digital', 'platform', 'software', 'development', 'integration', 'saas', 'martech']
    const mediaKeywords = ['media', 'content', 'journalism', 'publishing', 'digital media', 'newsroom']
    const revenueKeywords = ['revenue', 'sales', 'growth', 'pipeline', 'subscription', 'go-to-market', 'commercial']
    
    const found = {
      ai: aiKeywords.filter(keyword => text.includes(keyword)),
      leadership: leadershipKeywords.filter(keyword => text.includes(keyword)),
      technology: techKeywords.filter(keyword => text.includes(keyword)),
      media: mediaKeywords.filter(keyword => text.includes(keyword)),
      revenue: revenueKeywords.filter(keyword => text.includes(keyword))
    }
    
    return found
  }

  const determineRoleType = (keywords, text) => {
    // Enhanced role detection for AI evangelist roles
    if ((keywords.ai.length > 2 && text.includes('evangelist')) || 
        (text.includes('innovation') && text.includes('ai') && keywords.leadership.length > 2)) {
      return 'ai-focused'
    }
    if (keywords.ai.length > 2 || text.includes('artificial intelligence')) return 'ai-focused'
    if (keywords.leadership.length > 3 && keywords.revenue.length > 1) return 'executive-leadership'
    if (keywords.media.length > 2) return 'media-transformation'
    if (keywords.technology.length > 2) return 'technology-leadership'
    return 'general-executive'
  }

  const extractSkills = (keywords) => {
    const allKeywords = [...keywords.ai, ...keywords.leadership, ...keywords.technology, ...keywords.media, ...keywords.revenue]
    return [...new Set(allKeywords)] // Remove duplicates
  }

  return (
    <div className="job-input-container">
      <div className="input-header">
        <h2>Job Description Analysis</h2>
        <p>Paste a job description to generate a tailored resume using Derek's experience modules</p>
      </div>

      <div className="job-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="companyName">Company Name</label>
            <input 
              id="companyName"
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Qualtrics, Microsoft, Mayo Clinic"
            />
          </div>
          <div className="form-group">
            <label htmlFor="roleTitle">Role Title</label>
            <input 
              id="roleTitle"
              type="text" 
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g., Principal Evangelist - AI & Innovation"
            />
          </div>
          <div className="form-group">
            <label htmlFor="roleLevel">Role Level</label>
            <select 
              id="roleLevel"
              value={roleLevel} 
              onChange={(e) => setRoleLevel(e.target.value)}
            >
              <option value="executive">Executive/C-Suite</option>
              <option value="director">Director/VP</option>
              <option value="principal">Principal/Senior Manager</option>
              <option value="manager">Manager/Senior Manager</option>
              <option value="consultant">Consultant/Advisor</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="jobDescription">Job Description</label>
          <textarea 
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here..."
            rows={12}
          />
        </div>

        <button 
          className="analyze-button"
          onClick={analyzeJobDescription}
          disabled={loading || !jobDescription.trim()}
        >
          {loading ? 'Analyzing...' : 'Generate Tailored Resume'}
        </button>
      </div>

      {loading && (
        <div className="analysis-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>Analyzing job requirements and selecting optimal experience modules...</p>
        </div>
      )}
    </div>
  )
}

export default JobDescriptionInput
