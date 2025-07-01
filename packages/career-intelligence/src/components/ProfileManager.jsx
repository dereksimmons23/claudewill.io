import React, { useState } from 'react';
import { Download, Print, ExternalLink, Mail, Phone, MapPin, Globe, Briefcase } from 'lucide-react';

const ProfileManager = () => {
  const [activeSection, setActiveSection] = useState('experience');

  const professionalProfile = {
    name: "DEREK SIMMONS",
    tagline: "Transformative Executive | Founder @ CWS | Ethical AI & Digital Strategy",
    contact: {
      location: "Minnesota / U.S.",
      phone: "213-327-5683",
      email: "simmons.derek@gmail.com",
      websites: ["dcs.bio", "claudewill.io"],
      portfolio: "claudewill.io/portfolio",
      linkedin: "linkedin.com/in/dereksimm"
    },
    summary: "Visionary executive and founder with 15+ years leading digital transformation, AI strategy, and ethical innovation. Generated $20M+ in new revenue by building high-performing teams and frameworks that bridge human wisdom with technology. Renowned for turning complex concepts into business value and fostering environments where technology amplifies, not replaces, human potential. Passionate about coaching leaders and championing ethical AI for sustainable growth.",
    experience: [
      {
        title: "Founder (Part-Time, In Development)",
        company: "Claude Wisdom Strategies",
        period: "Nov. 2024–Present",
        achievements: [
          "Developing innovative conversational AI and strategy frameworks as a personal R&D initiative, with a focus on ethical, human-centered technology.",
          "Exploring methodologies for knowledge management and creative flow, applying insights to consulting projects and future full-time roles.",
          "Building systems and tools that enhance decision-making and productivity, with the goal of translating these learnings to enterprise environments."
        ],
        note: "This project is a part-time, exploratory initiative while seeking full-time executive opportunities."
      },
      {
        title: "Executive Director, New Products",
        company: "Star Tribune Media",
        period: "March 2022–Oct. 2024",
        achievements: [
          "Presented a comprehensive AI strategic plan, leading to the formation of the company's first AI Task Force.",
          "Conceived the \"Minnesota Star Tribune\" rebrand and played a key role in the eight-month digital relaunch, elevating brand recognition and digital engagement.",
          "Led enterprise-wide initiatives impacting 1,000+ employees, driving digital transformation and operational efficiency.", 
          "Designed and implemented the SalesGPT solution with Krista.ai, reclaiming up to 2.5 work-years annually for the sales team.",
          "Generated $5M+ in new revenue through innovative content platforms, including a successful sports betting launch, sponsored content, and affiliate marketing.",
          "Directed cross-departmental product development and established standards for cohesive, ethical implementation."
        ]
      },
      {
        title: "Chief Creative Officer / Vice President",
        company: "Star Tribune Media",
        period: "June 2017–March 2022",
        achievements: [
          "Led design innovation as the company's first CCO, driving digital subscription growth to 100,000+ (top 6 nationally) and enhancing audience engagement.",
          "Conceived and executed the \"Minnesota Star Tribune\" rebrand and led the eight-month digital relaunch, elevating brand recognition and digital engagement.",
          "Pioneered the Media Franchise Model, generating $15M+ in new revenue through innovative content structures.",
          "Managed $2M+ annual budget and cross-functional teams, including newsroom, product, and business operations.",
          "Contributed to a revenue turnaround in 2021, shifting from a $900K deficit to a $1M surplus in a single fiscal year.",
          "Drove the Star Tribune's 150th anniversary campaign, including statewide events, media partnerships, and award-winning brand activations."
        ]
      }
    ]
  };

  const handleExport = (format) => {
    if (format === 'pdf') {
      window.print();
    } else if (format === 'txt') {
      const textContent = generateTextResume();
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'derek-simmons-resume.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const generateTextResume = () => {
    let text = `${professionalProfile.name}\n`;
    text += `${professionalProfile.tagline}\n\n`;
    text += `Contact Information:\n`;
    text += `Location: ${professionalProfile.contact.location}\n`;
    text += `Phone: ${professionalProfile.contact.phone}\n`;
    text += `Email: ${professionalProfile.contact.email}\n`;
    text += `LinkedIn: ${professionalProfile.contact.linkedin}\n\n`;
    text += `Professional Summary:\n${professionalProfile.summary}\n\n`;
    text += `Professional Experience:\n\n`;
    
    professionalProfile.experience.forEach(job => {
      text += `${job.title}\n`;
      text += `${job.company} | ${job.period}\n`;
      job.achievements.forEach(achievement => {
        text += `• ${achievement}\n`;
      });
      if (job.note) {
        text += `Note: ${job.note}\n`;
      }
      text += `\n`;
    });
    
    return text;
  };

  const styles = {
    profileManager: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      background: 'var(--color-background)',
      color: 'var(--color-text)'
    },
    profileHeader: {
      textAlign: 'center',
      marginBottom: '2rem',
      paddingBottom: '2rem',
      borderBottom: '2px solid var(--color-border)'
    },
    profileName: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
      color: 'var(--color-primary)'
    },
    profileTagline: {
      fontSize: '1.2rem',
      color: 'var(--color-text-secondary)',
      marginBottom: '2rem'
    },
    contactGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem'
    },
    exportActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginBottom: '2rem'
    },
    exportBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: 'var(--color-primary)',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'all 0.2s ease'
    },
    profileSummary: {
      background: 'var(--color-background-secondary)',
      padding: '2rem',
      borderRadius: '0.5rem',
      marginBottom: '2rem',
      lineHeight: '1.6'
    },
    sectionNav: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      borderBottom: '1px solid var(--color-border)'
    },
    sectionBtn: {
      padding: '1rem 1.5rem',
      background: 'none',
      border: 'none',
      color: 'var(--color-text-secondary)',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s ease'
    },
    sectionBtnActive: {
      color: 'var(--color-primary)',
      borderBottom: '2px solid var(--color-primary)'
    },
    jobEntry: {
      marginBottom: '2rem',
      paddingBottom: '2rem',
      borderBottom: '1px solid var(--color-border)'
    },
    jobTitle: {
      fontSize: '1.3rem',
      fontWeight: '600',
      color: 'var(--color-primary)',
      marginBottom: '0.5rem'
    },
    jobCompanyPeriod: {
      color: 'var(--color-text-secondary)',
      marginBottom: '1rem',
      fontWeight: '500'
    },
    achievementsList: {
      listStyle: 'none',
      padding: '0'
    },
    achievementItem: {
      marginBottom: '0.75rem',
      paddingLeft: '1.5rem',
      position: 'relative',
      lineHeight: '1.5'
    },
    jobNote: {
      fontStyle: 'italic',
      color: 'var(--color-text-secondary)',
      marginTop: '1rem',
      fontSize: '0.9rem'
    }
  };

  return (
    <div style={styles.profileManager}>
      <div style={styles.profileHeader}>
        <h1 style={styles.profileName}>{professionalProfile.name}</h1>
        <p style={styles.profileTagline}>{professionalProfile.tagline}</p>
        
        <div style={styles.contactGrid}>
          <div style={styles.contactItem}>
            <MapPin size={16} color="var(--color-primary)" />
            <span>{professionalProfile.contact.location}</span>
          </div>
          <div style={styles.contactItem}>
            <Phone size={16} color="var(--color-primary)" />
            <a href={`tel:${professionalProfile.contact.phone}`} style={{color: 'var(--color-primary)', textDecoration: 'none'}}>{professionalProfile.contact.phone}</a>
          </div>
          <div style={styles.contactItem}>
            <Mail size={16} color="var(--color-primary)" />
            <a href={`mailto:${professionalProfile.contact.email}`} style={{color: 'var(--color-primary)', textDecoration: 'none'}}>{professionalProfile.contact.email}</a>
          </div>
          <div style={styles.contactItem}>
            <Globe size={16} color="var(--color-primary)" />
            <a href={`https://${professionalProfile.contact.websites[0]}`} target="_blank" rel="noopener" style={{color: 'var(--color-primary)', textDecoration: 'none'}}>{professionalProfile.contact.websites[0]}</a>
          </div>
          <div style={styles.contactItem}>
            <Globe size={16} color="var(--color-primary)" />
            <a href={`https://${professionalProfile.contact.websites[1]}`} target="_blank" rel="noopener" style={{color: 'var(--color-primary)', textDecoration: 'none'}}>{professionalProfile.contact.websites[1]}</a>
          </div>
          <div style={styles.contactItem}>
            <Briefcase size={16} color="var(--color-primary)" />
            <a href={`https://${professionalProfile.contact.linkedin}`} target="_blank" rel="noopener" style={{color: 'var(--color-primary)', textDecoration: 'none'}}>{professionalProfile.contact.linkedin}</a>
          </div>
        </div>
      </div>

      <div style={styles.exportActions}>
        <button style={styles.exportBtn} onClick={() => handleExport('pdf')}>
          <Print size={16} />
          Print / Save as PDF
        </button>
        <button style={styles.exportBtn} onClick={() => handleExport('txt')}>
          <Download size={16} />
          Download as Text
        </button>
      </div>

      <div style={styles.profileSummary}>
        <p>{professionalProfile.summary}</p>
      </div>

      <div style={styles.sectionNav}>
        <button 
          style={{...styles.sectionBtn, ...(activeSection === 'experience' ? styles.sectionBtnActive : {})}}
          onClick={() => setActiveSection('experience')}
        >
          Professional Experience
        </button>
        <button 
          style={{...styles.sectionBtn, ...(activeSection === 'skills' ? styles.sectionBtnActive : {})}}
          onClick={() => setActiveSection('skills')}
        >
          Core Competencies
        </button>
        <button 
          style={{...styles.sectionBtn, ...(activeSection === 'education' ? styles.sectionBtnActive : {})}}
          onClick={() => setActiveSection('education')}
        >
          Education & Recognition
        </button>
      </div>

      {activeSection === 'experience' && (
        <div>
          {professionalProfile.experience.map((job, index) => (
            <div key={index} style={{...styles.jobEntry, ...(index === professionalProfile.experience.length - 1 ? {borderBottom: 'none'} : {})}}>
              <h3 style={styles.jobTitle}>{job.title}</h3>
              <p style={styles.jobCompanyPeriod}>{job.company} | {job.period}</p>
              <ul style={styles.achievementsList}>
                {job.achievements.map((achievement, achievementIndex) => (
                  <li key={achievementIndex} style={styles.achievementItem}>
                    <span style={{position: 'absolute', left: '0', color: 'var(--color-primary)', fontWeight: 'bold'}}>•</span>
                    {achievement}
                  </li>
                ))}
              </ul>
              {job.note && <p style={styles.jobNote}>{job.note}</p>}
            </div>
          ))}
        </div>
      )}

      {activeSection === 'skills' && (
        <div>
          <h3>Core Competencies</h3>
          <p>Strategic Leadership • AI & Digital Transformation • Revenue Generation • Team Building • Ethical Innovation</p>
        </div>
      )}

      {activeSection === 'education' && (
        <div>
          <h3>Education & Recognition</h3>
          <p>Details coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default ProfileManager; 