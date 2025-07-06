import React, { useState, useEffect } from 'react'

const CoverLetterGenerator = ({ jobData }) => {
  const [coverLetter, setCoverLetter] = useState('')
  const [generating, setGenerating] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      const letter = generateCoverLetter(jobData)
      setCoverLetter(letter)
      setGenerating(false)
    }, 1500)
  }, [jobData])

  const generateCoverLetter = (jobData) => {
    const { companyName, roleTitle, roleType, keywords } = jobData
    
    // Custom letter for Qualtrics-style roles
    if (roleType === 'ai-focused' && keywords.ai.length > 2) {
      return generateAIEvangelistLetter(companyName, roleTitle)
    }
    
    return generateStandardLetter(companyName, roleTitle, roleType)
  }

  const generateAIEvangelistLetter = (company, role) => {
    return `Dear ${company} Hiring Team,

The intersection of AI innovation and thought leadership is where transformative business value is created. Your ${role} position represents exactly the kind of opportunity where my unique combination of technical AI expertise, executive communication skills, and proven revenue generation can drive meaningful impact.

At Star Tribune Media, I didn't just develop AI strategies—I evangelized them across a 1,000+ employee organization. My comprehensive AI strategic plan led to our first enterprise AI Task Force and the implementation of automation solutions that reclaimed 2.5 work-years annually. This experience taught me that successful AI adoption requires more than technical knowledge; it demands the ability to translate complex capabilities into compelling business narratives.

My approach to AI evangelism is grounded in three core principles: ethical implementation, measurable business impact, and human-AI collaboration. I've developed The CW Standard framework specifically to address the gap between AI potential and practical deployment. This methodology has proven effective in helping organizations navigate the complex landscape of AI adoption while maintaining focus on sustainable business outcomes.

What sets me apart is my ability to bridge technical depth with executive-level strategic thinking. I've generated $20M+ in new revenue through innovative frameworks and strategic initiatives, demonstrating that AI implementation must deliver tangible business results. My cross-domain pattern recognition allows me to identify applications and opportunities that others might miss.

I'm particularly drawn to ${company} because of your leadership in experience management and innovation. The opportunity to help evangelize AI solutions that enhance human experiences while driving business growth aligns perfectly with my passion for technology that amplifies human potential rather than replacing it.

I would welcome the opportunity to discuss how my proven track record in AI strategy, thought leadership, and revenue generation can contribute to ${company}'s continued innovation and market leadership.

Sincerely,
Derek Simmons
213-327-5683
simmons.derek@gmail.com`
  }

  const generateStandardLetter = (company, role, roleType) => {
    let opening, body, closing
    
    switch(roleType) {
      case 'executive-leadership':
        opening = `The ${role} position at ${company} represents the perfect convergence of strategic leadership and transformational impact. My 15+ years of executive experience driving digital transformation and generating $20M+ in new revenue aligns directly with your organization's growth objectives.`
        
        body = `Throughout my tenure as Chief Creative Officer at Star Tribune Media, I pioneered frameworks that transformed traditional media operations into innovation engines. The Media Franchise Model I developed generated $15M+ in new revenue by reimagining content verticals as entrepreneurial business units. This experience demonstrated my ability to see patterns across domains and create scalable solutions that drive measurable results.

My leadership philosophy centers on building systems where technology enhances human capability rather than replacing it. Whether leading AI implementation strategies, managing $2M+ budgets, or hiring 50+ professionals during organizational expansion, I focus on creating environments where teams can achieve breakthrough performance.`
        break
        
      case 'technology-leadership':
        opening = `The opportunity to drive technological innovation at ${company} as ${role} directly aligns with my passion for bridging cutting-edge technology with practical business impact. My unique combination of technical expertise, executive leadership, and proven revenue generation creates exceptional value for organizations navigating complex digital transformations.`
        
        body = `My recent work developing AI implementation frameworks and leading enterprise-wide technology adoption demonstrates my ability to translate emerging technologies into competitive advantages. At Star Tribune Media, I led the formation of our first AI Task Force and implemented automation solutions that delivered immediate ROI while positioning the organization for future growth.

What distinguishes my approach is the ability to recognize patterns across seemingly unrelated domains. This cross-domain thinking enabled me to develop The CW Standard framework for ethical AI implementation and create revenue-generating strategies that others overlooked.`
        break
        
      default:
        opening = `The ${role} opportunity at ${company} represents exactly the kind of challenge where my cross-domain expertise and pattern recognition capabilities can drive transformational results. My track record of generating $20M+ in new revenue through innovative frameworks positions me to deliver immediate impact.`
        
        body = `My experience spans AI strategy development, media transformation, and executive leadership, creating a unique perspective on how emerging technologies can solve complex business challenges. Whether developing the Media Franchise Model that generated $15M+ in growth or leading AI implementation strategies across enterprise organizations, I focus on creating sustainable competitive advantages.

The ability to see connections between seemingly unrelated fields has been the foundation of my success. This pattern recognition enables me to identify opportunities and develop solutions that traditional approaches might miss.`
    }
    
    closing = `I'm particularly drawn to ${company} because of your commitment to innovation and excellence. The opportunity to contribute my strategic thinking, proven implementation abilities, and passion for transformational leadership to your team is exactly the kind of challenge I'm seeking.

I would welcome the opportunity to discuss how my unique combination of technical expertise, executive experience, and results-driven approach can contribute to ${company}'s continued success.`
    
    return `Dear ${company} Hiring Team,

${opening}

${body}

${closing}

Sincerely,
Derek Simmons
213-327-5683
simmons.derek@gmail.com`
  }

  const downloadCoverLetter = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `derek-simmons-cover-letter-${jobData.companyName.toLowerCase().replace(/\s+/g, '-')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (generating) {
    return (
      <div className="cover-letter-generating">
        <h3>Generating Cover Letter</h3>
        <p>Creating personalized cover letter for {jobData.roleTitle} at {jobData.companyName}...</p>
      </div>
    )
  }

  return (
    <div className="cover-letter-generator">
      <h3>Generated Cover Letter</h3>
      
      <div className="cover-letter-preview">
        <pre className="cover-letter-content">{coverLetter}</pre>
      </div>
      
      <div className="cover-letter-actions">
        <button onClick={downloadCoverLetter} className="download-btn">
          📄 Download Cover Letter
        </button>
      </div>
    </div>
  )
}

export default CoverLetterGenerator