import React, { useState, useEffect } from 'react'
import aiImplementationContent from '../data/aiImplementation'
import revenueGenerationContent from '../data/revenueGeneration'
import CoverLetterGenerator from './CoverLetterGenerator'

const ResumeGenerator = ({ jobData, onBack }) => {
  const [selectedModules, setSelectedModules] = useState([])
  const [resumeContent, setResumeContent] = useState(null)
  const [generatingResume, setGeneratingResume] = useState(true)

  useEffect(() => {
    // Auto-select modules based on job analysis
    const modules = selectModulesForRole(jobData.roleType, jobData.keywords)
    setSelectedModules(modules)
    
    setTimeout(() => {
      const content = generateResumeContent(modules, jobData)
      setResumeContent(content)
      setGeneratingResume(false)
    }, 2000)
  }, [jobData])

  const selectModulesForRole = (roleType, keywords) => {
    const modules = []
    
    // Always include core modules
    modules.push('executive-summary', 'core-competencies')
    
    // Role-specific module selection
    switch(roleType) {
      case 'ai-focused':
        modules.push('ai-implementation', 'technology-leadership', 'revenue-generation')
        break
      case 'executive-leadership':
        modules.push('revenue-generation', 'organizational-transformation', 'ai-implementation')
        break
      case 'media-transformation':
        modules.push('media-transformation', 'revenue-generation', 'ai-implementation')
        break
      case 'technology-leadership':
        modules.push('technology-leadership', 'ai-implementation', 'revenue-generation')
        break
      default:
        modules.push('revenue-generation', 'organizational-transformation', 'technology-leadership')
    }
    
    return modules
  }

  const generateResumeContent = (modules, jobData) => {
    const content = {
      header: {
        name: "DEREK SIMMONS",
        title: generateTailoredTitle(jobData),
        contact: {
          location: "Minnesota / U.S.",
          phone: "213-327-5683",
          email: "simmons.derek@gmail.com",
          website: "claudewill.io",
          linkedin: "linkedin.com/in/dereksimm"
        }
      },
      summary: generateTailoredSummary(jobData),
      experience: generateTailoredExperience(modules, jobData),
      skills: generateTailoredSkills(jobData),
      education: {
        current: "MIT, Artificial Intelligence & Data Science Program (Admitted, 2025 cohort)",
        degrees: [
          "Kansas State University, Bachelor of Science in Mass Communications",
          "University of Southern California, Master of Communication Management (Admitted, 2022)"
        ]
      }
    }
    
    return content
  }

  const generateTailoredTitle = (jobData) => {
    switch(jobData.roleType) {
      case 'ai-focused':
        return "AI Strategy Leader | Innovation Evangelist | Cross-Domain Pattern Recognition Expert"
      case 'executive-leadership':
        return "Executive Leader | Digital Transformation | Revenue Generation Expert"
      case 'media-transformation':
        return "Media Innovation Leader | Digital Strategy | Cross-Platform Revenue Generation"
      default:
        return "Strategic Builder | AI Ethics & Digital Transformation Leader"
    }
  }

  const generateTailoredSummary = (jobData) => {
    // Enhanced summary for Qualtrics-type roles
    if (jobData.keywords.ai.length > 2 && jobData.roleType === 'ai-focused') {
      return "Visionary AI strategist and innovation evangelist with 15+ years leading digital transformation across enterprise organizations. Generated $20M+ in new revenue through AI-powered frameworks and strategic initiatives. Deep expertise in AI ethics, implementation frameworks, and translating emerging technologies into business value. Expert in thought leadership, executive engagement, and driving go-to-market strategies for innovative technology solutions. Proven track record building category-defining frameworks and evangelizing breakthrough technologies to C-level executives."
    }
    
    const baseSummary = "Visionary executive with 15+ years leading digital transformation, AI strategy, and ethical innovation. Generated $20M+ in new revenue by building high-performing teams and frameworks that bridge human wisdom with technology."
    
    // Customize based on role type
    switch(jobData.roleType) {
      case 'ai-focused':
        return baseSummary + " Specialized in AI implementation frameworks, with 1,500+ hours of research and development in enterprise AI adoption. Expert in ethical AI deployment and human-AI collaboration systems."
      case 'media-transformation':
        return baseSummary + " Pioneer of the Media Franchise Model, transforming traditional content verticals into revenue-generating business units. Expert in digital-first strategies and cross-platform monetization."
      default:
        return baseSummary + " Renowned for turning complex concepts into business value and fostering environments where technology amplifies human potential."
    }
  }

  const generateTailoredExperience = (modules, jobData) => {
    const experience = []
    
    // Tailor first role based on job type
    if (jobData.roleType === 'ai-focused') {
      experience.push({
        title: "AI Strategy Consultant & Innovation Evangelist",
        company: "Claude Wisdom Strategies",
        period: "Nov. 2024–Present",
        description: "Developing breakthrough AI frameworks and evangelizing ethical technology adoption across enterprise organizations.",
        achievements: [
          "Creating thought leadership content on AI ethics and implementation strategies",
          "Developing The CW Standard framework for responsible AI integration",
          "Building conversational AI systems that bridge human wisdom with machine learning",
          "Consulting with organizations on AI strategy and ethical implementation"
        ]
      })
    } else {
      experience.push({
        title: "Founder & Strategic Consultant",
        company: "Claude Wisdom Strategies",
        period: "Nov. 2024–Present",
        description: "Developing innovative frameworks for organizational transformation and strategic growth.",
        achievements: [
          "Creating methodologies for cross-domain pattern recognition and strategic planning",
          "Building systems where technology enhances rather than replaces human capability",
          "Consulting on digital transformation and revenue generation strategies"
        ]
      })
    }

    experience.push({
      title: "Executive Director, New Products & AI Strategy", 
      company: "Star Tribune Media",
      period: "March 2022–Oct. 2024",
      description: "Led enterprise-wide AI strategy development and product innovation for 1,000+ employee organization.",
      achievements: [
        "Presented comprehensive AI strategic plan leading to formation of company's first AI Task Force",
        "Generated $5M+ in new revenue through innovative AI-powered content platforms and partnerships",
        "Designed and implemented SalesGPT automation solution, reclaiming 2.5 work-years annually",
        "Led cross-departmental initiatives driving digital transformation across entire organization",
        "Developed frameworks for ethical AI implementation and liability assessment"
      ]
    })

    if (modules.includes('revenue-generation')) {
      experience.push({
        title: "Chief Creative Officer / Vice President",
        company: "Star Tribune Media", 
        period: "June 2017–March 2022",
        description: "Executive leadership driving digital transformation and revenue growth through innovation.",
        achievements: [
          "Pioneered Media Franchise Model generating $15M+ in new revenue streams",
          "Drove digital subscription growth to 100,000+ (achieving top 6 national ranking)",
          "Led organizational transformation achieving perennial Top 5 global design ranking",
          "Managed $2M+ annual budget while contributing to $1.9M positive revenue swing",
          "Built high-performing teams through hiring 50+ professionals during expansion"
        ]
      })
    }

    return experience
  }

  const generateTailoredSkills = (jobData) => {
    // Enhanced skills for AI-focused roles
    if (jobData.roleType === 'ai-focused') {
      return [
        "AI Strategy Development & Technology Evangelism",
        "Thought Leadership & Executive Communication", 
        "Cross-Domain Pattern Recognition & Innovation",
        "Revenue Generation Through Technology Solutions",
        "Strategic Consulting & Go-to-Market Strategy",
        "AI Ethics & Responsible Implementation Frameworks",
        "Enterprise Sales Support & Client Engagement",
        "Product Development & Market Positioning"
      ]
    }
    
    const coreSkills = [
      "Strategic Innovation & Cross-Domain Pattern Recognition",
      "AI Ethics & Human-Centered Technology Implementation", 
      "Revenue Generation & Business Model Innovation",
      "Executive Leadership & Organizational Transformation"
    ]
    
    // Add role-specific skills
    if (jobData.keywords.ai.length > 0) {
      coreSkills.push(
        "Large Language Models & Enterprise AI Integration",
        "AI Ethics Frameworks & Responsible Implementation"
      )
    }
    
    if (jobData.keywords.media.length > 0) {
      coreSkills.push("Media Transformation & Digital Content Strategy")
    }
    
    return coreSkills
  }

  const downloadResume = (format) => {
    if (format === 'pdf') {
      downloadPDF()
    } else if (format === 'docx') {
      downloadWord()
    } else {
      const textContent = generateTextContent(resumeContent)
      downloadFile(textContent, 'derek-simmons-resume.txt', 'text/plain')
    }
  }

  const downloadPDF = () => {
    // Create a printable HTML version
    const htmlContent = generateHTMLContent(resumeContent)
    
    // Open in new window for printing/saving as PDF
    const printWindow = window.open('', '_blank')
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    
    // Trigger print dialog (user can save as PDF)
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const downloadWord = () => {
    // Create rich text format (RTF) that Word can actually open
    const rtfContent = generateRTFContent(resumeContent)
    
    const blob = new Blob([rtfContent], { 
      type: 'application/rtf' 
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'derek-simmons-resume.rtf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateHTMLContent = (content) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Derek Simmons - Resume</title>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: 'Times New Roman', serif; 
          max-width: 8.5in; 
          margin: 0 auto; 
          padding: 0.75in 0.5in; 
          line-height: 1.5; 
          font-size: 12pt;
        }
        h1 { 
          font-size: 22pt; 
          text-align: center; 
          margin-bottom: 6pt; 
          text-transform: uppercase; 
          font-weight: bold;
        }
        .title { 
          font-size: 13pt; 
          text-align: center; 
          margin-bottom: 8pt; 
          font-weight: bold; 
          color: #333;
        }
        .contact-info { 
          text-align: center; 
          margin-bottom: 18pt; 
          font-size: 11pt; 
          line-height: 1.3;
        }
        .contact-info span { margin: 0 6px; }
        h3 { 
          font-size: 13pt; 
          font-weight: bold; 
          text-transform: uppercase; 
          border-bottom: 1.5pt solid #000; 
          margin: 16pt 0 8pt 0; 
          padding-bottom: 3pt; 
        }
        h4 { 
          font-size: 12pt; 
          font-weight: bold; 
          margin: 12pt 0 4pt 0; 
        }
        p { 
          margin: 6pt 0; 
          font-size: 11pt; 
          text-align: justify; 
          line-height: 1.4;
        }
        .company { 
          font-weight: bold; 
          font-style: italic; 
          margin: 4pt 0 6pt 0; 
          font-size: 11pt;
        }
        .period { 
          float: right; 
          font-style: italic; 
          font-size: 11pt;
        }
        .exp-header { 
          overflow: hidden; 
          margin-bottom: 4pt;
        }
        ul { 
          margin: 6pt 0 12pt 18pt; 
          padding-left: 0;
        }
        li { 
          margin: 3pt 0; 
          font-size: 11pt; 
          line-height: 1.3;
        }
        .skills-list { 
          columns: 2; 
          column-gap: 20pt;
          margin: 8pt 0;
        }
        .skills-list li { 
          margin: 4pt 0; 
          break-inside: avoid;
          font-size: 11pt;
        }
        .education-list li { 
          font-size: 11pt; 
          margin: 4pt 0; 
          line-height: 1.3;
        }
        @media print { 
          body { padding: 0.5in; }
          .page-break { page-break-before: always; }
        }
      </style>
    </head>
    <body>
      <h1>${content.header.name}</h1>
      <p class="title">${content.header.title}</p>
      <div class="contact-info">
        <span>${content.header.contact.location}</span> |
        <span>${content.header.contact.phone}</span> |
        <span>${content.header.contact.email}</span><br>
        <span>${content.header.contact.website}</span> |
        <span>${content.header.contact.linkedin}</span>
      </div>
      
      <h3>Professional Summary</h3>
      <p>${content.summary}</p>
      
      <h3>Professional Experience</h3>
      ${content.experience.map(exp => `
        <div class="exp-header">
          <h4>${exp.title}</h4>
          <span class="period">${exp.period}</span>
        </div>
        <p class="company">${exp.company}</p>
        <p>${exp.description}</p>
        <ul>
          ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
        </ul>
      `).join('')}
      
      <h3>Core Competencies</h3>
      <ul class="skills-list">
        ${content.skills.map(skill => `<li>${skill}</li>`).join('')}
      </ul>
      
      <h3>Education & Professional Development</h3>
      <ul class="education-list">
        <li><strong>${content.education.current}</strong></li>
        ${content.education.degrees.map(degree => `<li>${degree}</li>`).join('')}
      </ul>
    </body>
    </html>
    `
  }

  const generateRTFContent = (content) => {
    let rtf = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}'
    
    // Header
    rtf += '\\qc\\b\\fs36 ' + content.header.name + '\\par'
    rtf += '\\qc\\fs24 ' + content.header.title + '\\par'
    rtf += '\\qc\\fs20 ' + content.header.contact.location + ' | ' + content.header.contact.phone + ' | ' + content.header.contact.email + '\\par'
    rtf += '\\qc\\fs20 ' + content.header.contact.website + ' | ' + content.header.contact.linkedin + '\\par\\par'
    
    // Professional Summary
    rtf += '\\ql\\b\\fs24 PROFESSIONAL SUMMARY\\par'
    rtf += '\\b0\\fs22 ' + content.summary + '\\par\\par'
    
    // Experience
    rtf += '\\ql\\b\\fs24 PROFESSIONAL EXPERIENCE\\par\\par'
    content.experience.forEach(exp => {
      rtf += '\\b\\fs22 ' + exp.title + '\\par'
      rtf += '\\i ' + exp.company + ' | ' + exp.period + '\\par'
      rtf += '\\i0 ' + exp.description + '\\par'
      exp.achievements.forEach(achievement => {
        rtf += '\\bullet ' + achievement + '\\par'
      })
      rtf += '\\par'
    })
    
    // Skills
    rtf += '\\ql\\b\\fs24 CORE COMPETENCIES\\par'
    content.skills.forEach(skill => {
      rtf += '\\bullet \\b0\\fs22 ' + skill + '\\par'
    })
    rtf += '\\par'
    
    // Education
    rtf += '\\ql\\b\\fs24 EDUCATION & PROFESSIONAL DEVELOPMENT\\par'
    rtf += '\\bullet \\b0\\fs22 ' + content.education.current + '\\par'
    content.education.degrees.forEach(degree => {
      rtf += '\\bullet ' + degree + '\\par'
    })
    
    rtf += '}'
    return rtf
  }

  const generateTextContent = (content) => {
    let text = `${content.header.name}\n`
    text += `${content.header.title}\n`
    text += `${content.header.contact.location} | ${content.header.contact.phone} | ${content.header.contact.email}\n`
    text += `${content.header.contact.website} | ${content.header.contact.linkedin}\n\n`
    
    text += `PROFESSIONAL SUMMARY\n`
    text += `${content.summary}\n\n`
    
    text += `PROFESSIONAL EXPERIENCE\n`
    content.experience.forEach(exp => {
      text += `\n${exp.title}\n`
      text += `${exp.company} | ${exp.period}\n`
      text += `${exp.description}\n`
      exp.achievements.forEach(achievement => {
        text += `• ${achievement}\n`
      })
    })
    
    text += `\nCORE COMPETENCIES\n`
    content.skills.forEach(skill => {
      text += `• ${skill}\n`
    })
    
    text += `\nEDUCATION & PROFESSIONAL DEVELOPMENT\n`
    text += `• ${content.education.current}\n`
    content.education.degrees.forEach(degree => {
      text += `• ${degree}\n`
    })
    
    return text
  }

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (generatingResume) {
    return (
      <div className="resume-generating">
        <h2>Generating Your Tailored Resume</h2>
        <div className="generation-progress">
          <div className="progress-steps">
            <div className="step completed">Analyzing job requirements</div>
            <div className="step completed">Selecting experience modules</div>
            <div className="step active">Generating content</div>
            <div className="step">Formatting output</div>
          </div>
        </div>
        <p>Creating resume optimized for: {jobData.roleTitle} at {jobData.companyName}</p>
      </div>
    )
  }

  return (
    <div className="resume-generator">
      <div className="generator-header">
        <h2>Resume Generated Successfully</h2>
        <p>Tailored for: <strong>{jobData.roleTitle}</strong> at <strong>{jobData.companyName}</strong></p>
        <button onClick={onBack} className="back-button">← Generate Another Resume</button>
      </div>

      <div className="resume-preview">
        <div className="resume-content">
          {/* Header */}
          <div className="resume-header">
            <h1>{resumeContent.header.name}</h1>
            <p className="title">{resumeContent.header.title}</p>
            <div className="contact-info">
              <span>{resumeContent.header.contact.location}</span>
              <span>{resumeContent.header.contact.phone}</span>
              <span>{resumeContent.header.contact.email}</span>
              <span>{resumeContent.header.contact.website}</span>
              <span>{resumeContent.header.contact.linkedin}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="resume-section">
            <h3>PROFESSIONAL SUMMARY</h3>
            <p>{resumeContent.summary}</p>
          </div>

          {/* Experience */}
          <div className="resume-section">
            <h3>PROFESSIONAL EXPERIENCE</h3>
            {resumeContent.experience.map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="exp-header">
                  <h4>{exp.title}</h4>
                  <span className="period">{exp.period}</span>
                </div>
                <p className="company">{exp.company}</p>
                <p className="description">{exp.description}</p>
                <ul className="achievements">
                  {exp.achievements.map((achievement, i) => (
                    <li key={i}>{achievement}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="resume-section">
            <h3>CORE COMPETENCIES</h3>
            <ul className="skills-list">
              {resumeContent.skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>

          {/* Education */}
          <div className="resume-section">
            <h3>EDUCATION & PROFESSIONAL DEVELOPMENT</h3>
            <ul className="education-list">
              <li>{resumeContent.education.current}</li>
              {resumeContent.education.degrees.map((degree, index) => (
                <li key={index}>{degree}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="download-options">
        <h3>Download Resume</h3>
        <div className="download-buttons">
          <button onClick={() => downloadResume('txt')} className="download-btn">
            📄 Download TXT (ATS Optimized)
          </button>
          <button onClick={() => downloadResume('pdf')} className="download-btn">
            📕 Print/Save as PDF
          </button>
          <button onClick={() => downloadResume('docx')} className="download-btn">
            📘 Download RTF (Word Compatible)
          </button>
        </div>
      </div>

      <div className="analysis-summary">
        <h3>Analysis Summary</h3>
        <div className="analysis-details">
          <p><strong>Role Type Detected:</strong> {jobData.roleType}</p>
          <p><strong>Modules Selected:</strong> {selectedModules.join(', ')}</p>
          <p><strong>Keywords Found:</strong> {Object.values(jobData.keywords).flat().join(', ')}</p>
        </div>
      </div>

      <CoverLetterGenerator jobData={jobData} />
    </div>
  )
}

export default ResumeGenerator
