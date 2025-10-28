/*
 * RECALIBRATE CAREER DATA
 * Professional career development data structures and templates
 * 
 * Optimized for mobile-first voice and touch interactions
 */

const careerData = {
  // Resume Template Structure
  resumeTemplates: {
    professional: {
      id: 'professional',
      name: 'Professional',
      description: 'Clean, modern design for corporate roles',
      sections: ['contact', 'summary', 'experience', 'education', 'skills'],
      voicePrompts: {
        contact: 'Tell me your name, email, phone, and location',
        summary: 'Describe yourself professionally in 2-3 sentences',
        experience: 'Walk me through your work experience, starting with your most recent job',
        education: 'Tell me about your education background',
        skills: 'What are your key professional skills?'
      }
    },
    creative: {
      id: 'creative',
      name: 'Creative',
      description: 'Visually engaging for design and creative roles',
      sections: ['contact', 'portfolio', 'experience', 'skills', 'education'],
      voicePrompts: {
        contact: 'Please provide your contact information',
        portfolio: 'Describe your portfolio or creative work',
        experience: 'Tell me about your creative experience',
        skills: 'What creative skills and tools do you use?',
        education: 'Share your educational background'
      }
    },
    executive: {
      id: 'executive',
      name: 'Executive',
      description: 'Leadership-focused for senior positions',
      sections: ['contact', 'summary', 'achievements', 'experience', 'education', 'board'],
      voicePrompts: {
        contact: 'State your contact details',
        summary: 'Provide your executive summary and leadership philosophy',
        achievements: 'Highlight your key achievements and impact',
        experience: 'Detail your leadership experience',
        education: 'Mention your educational credentials',
        board: 'List any board positions or advisory roles'
      }
    }
  },

  // Industry-Specific Keywords
  industryKeywords: {
    technology: [
      'software development', 'agile', 'scrum', 'DevOps', 'cloud computing',
      'artificial intelligence', 'machine learning', 'data analysis', 'cybersecurity',
      'mobile development', 'web development', 'database management', 'API',
      'programming', 'coding', 'automation', 'digital transformation'
    ],
    healthcare: [
      'patient care', 'clinical experience', 'HIPAA compliance', 'medical records',
      'healthcare administration', 'quality improvement', 'patient safety',
      'electronic health records', 'clinical research', 'medical terminology',
      'healthcare technology', 'regulatory compliance', 'patient outcomes'
    ],
    finance: [
      'financial analysis', 'risk management', 'investment banking', 'portfolio management',
      'financial modeling', 'regulatory compliance', 'auditing', 'accounting',
      'budgeting', 'forecasting', 'due diligence', 'financial reporting',
      'capital markets', 'derivatives', 'credit analysis'
    ],
    marketing: [
      'digital marketing', 'content marketing', 'social media', 'SEO', 'SEM',
      'brand management', 'campaign management', 'marketing analytics',
      'lead generation', 'customer acquisition', 'market research',
      'marketing automation', 'CRM', 'conversion optimization'
    ],
    education: [
      'curriculum development', 'lesson planning', 'student assessment',
      'classroom management', 'educational technology', 'differentiated instruction',
      'student engagement', 'learning outcomes', 'professional development',
      'educational research', 'special education', 'literacy development'
    ]
  },

  // Voice Command Templates
  voiceCommands: {
    navigation: {
      patterns: [
        'go to {section}',
        'open {feature}',
        'show me {page}',
        'navigate to {location}'
      ],
      responses: [
        'Opening {target}',
        'Navigating to {target}',
        'Loading {target} for you'
      ]
    },
    resumeBuilding: {
      patterns: [
        'my name is {name}',
        'I work at {company}',
        'my email is {email}',
        'I have {years} years of experience',
        'my skills include {skills}',
        'I studied {field} at {school}'
      ],
      confirmations: [
        'Got it, I\'ve added that information',
        'Perfect, that\'s saved',
        'Thanks, I\'ve updated your resume'
      ]
    },
    coaching: {
      patterns: [
        'help me with {topic}',
        'practice {skill}',
        'I need advice on {situation}',
        'how do I {action}'
      ],
      responses: [
        'I\'d be happy to help with {topic}',
        'Let\'s work on {skill} together',
        'Here\'s some guidance on {situation}'
      ]
    }
  },

  // Career Decision Framework
  decisionMatrix: {
    criteria: [
      { id: 'salary', name: 'Salary & Benefits', weight: 0.3 },
      { id: 'growth', name: 'Growth Opportunities', weight: 0.25 },
      { id: 'culture', name: 'Company Culture', weight: 0.2 },
      { id: 'worklife', name: 'Work-Life Balance', weight: 0.15 },
      { id: 'impact', name: 'Impact & Purpose', weight: 0.1 }
    ],
    ratingScale: {
      1: 'Poor',
      2: 'Below Average',
      3: 'Average',
      4: 'Good',
      5: 'Excellent'
    },
    voicePrompts: {
      intro: 'Let\'s evaluate your career options. I\'ll ask about different factors.',
      salary: 'How would you rate the salary and benefits? Say a number from 1 to 5.',
      growth: 'What about growth opportunities? Rate from 1 to 5.',
      culture: 'How do you feel about the company culture? 1 to 5.',
      worklife: 'What about work-life balance? Rate from 1 to 5.',
      impact: 'How meaningful is the work? Rate the impact from 1 to 5.'
    }
  },

  // ATS Keywords Database
  atsKeywords: {
    action_verbs: [
      'achieved', 'administered', 'analyzed', 'collaborated', 'created',
      'developed', 'established', 'evaluated', 'implemented', 'improved',
      'increased', 'led', 'managed', 'optimized', 'organized',
      'planned', 'reduced', 'resolved', 'spearheaded', 'streamlined'
    ],
    technical_skills: [
      'project management', 'data analysis', 'strategic planning',
      'process improvement', 'team leadership', 'client relations',
      'budget management', 'quality assurance', 'risk assessment',
      'performance metrics', 'stakeholder management', 'vendor relations'
    ],
    soft_skills: [
      'communication', 'leadership', 'problem-solving', 'teamwork',
      'adaptability', 'creativity', 'time management', 'critical thinking',
      'attention to detail', 'customer service', 'negotiation',
      'presentation skills', 'emotional intelligence', 'conflict resolution'
    ]
  },

  // Career Development Paths
  careerPaths: {
    technology: {
      entry: ['Junior Developer', 'IT Support', 'Data Analyst'],
      mid: ['Senior Developer', 'Product Manager', 'Systems Architect'],
      senior: ['Engineering Manager', 'VP of Engineering', 'CTO'],
      skills_progression: [
        'Programming fundamentals',
        'Framework expertise',
        'System design',
        'Team leadership',
        'Strategic planning'
      ]
    },
    business: {
      entry: ['Business Analyst', 'Coordinator', 'Associate'],
      mid: ['Manager', 'Senior Analyst', 'Project Manager'],
      senior: ['Director', 'VP', 'C-Level Executive'],
      skills_progression: [
        'Business fundamentals',
        'Process optimization',
        'Team management',
        'Strategic thinking',
        'Executive leadership'
      ]
    }
  },

  // Interview Question Bank
  interviewQuestions: {
    behavioral: [
      'Tell me about a time when you overcame a significant challenge',
      'Describe a situation where you had to work with a difficult team member',
      'Give me an example of when you had to learn something new quickly',
      'Tell me about a time you failed and what you learned from it',
      'Describe your greatest professional achievement'
    ],
    technical: [
      'Walk me through your approach to solving complex problems',
      'How do you stay current with industry trends and technologies?',
      'Describe a project you\'re particularly proud of',
      'How do you handle competing priorities and deadlines?',
      'What\'s your experience with [specific technology/tool]?'
    ],
    situational: [
      'How would you handle a situation where you disagree with your manager?',
      'What would you do if you discovered a significant error in your work?',
      'How would you approach building relationships with a new team?',
      'What would you do if you were given an impossible deadline?',
      'How would you handle receiving constructive criticism?'
    ]
  },

  // Salary Benchmarking Data (simplified)
  salaryBenchmarks: {
    technology: {
      'Software Engineer': { entry: 75000, mid: 110000, senior: 150000 },
      'Product Manager': { entry: 85000, mid: 130000, senior: 180000 },
      'Data Scientist': { entry: 80000, mid: 120000, senior: 160000 }
    },
    business: {
      'Business Analyst': { entry: 60000, mid: 85000, senior: 110000 },
      'Project Manager': { entry: 70000, mid: 95000, senior: 125000 },
      'Marketing Manager': { entry: 65000, mid: 90000, senior: 120000 }
    }
  },

  // Mobile-Optimized Form Fields
  formFields: {
    contact: {
      name: { type: 'text', placeholder: 'Full Name', voice: true, required: true },
      email: { type: 'email', placeholder: 'Email Address', voice: true, required: true },
      phone: { type: 'tel', placeholder: 'Phone Number', voice: true, required: false },
      location: { type: 'text', placeholder: 'City, State', voice: true, required: false },
      linkedin: { type: 'url', placeholder: 'LinkedIn Profile', voice: false, required: false }
    },
    experience: {
      company: { type: 'text', placeholder: 'Company Name', voice: true, required: true },
      position: { type: 'text', placeholder: 'Job Title', voice: true, required: true },
      duration: { type: 'text', placeholder: 'Start - End Date', voice: true, required: true },
      description: { type: 'textarea', placeholder: 'Key responsibilities...', voice: true, required: true }
    },
    education: {
      school: { type: 'text', placeholder: 'School/University', voice: true, required: true },
      degree: { type: 'text', placeholder: 'Degree & Major', voice: true, required: true },
      year: { type: 'text', placeholder: 'Graduation Year', voice: true, required: false },
      gpa: { type: 'text', placeholder: 'GPA (optional)', voice: false, required: false }
    }
  },

  // Gesture Shortcuts for Mobile
  gestureActions: {
    swipeUp: {
      context: 'global',
      action: 'voice_activation',
      description: 'Swipe up from bottom to activate voice assistant'
    },
    swipeRight: {
      context: 'cards',
      action: 'quick_action',
      description: 'Swipe right on cards for quick actions'
    },
    longPress: {
      context: 'cards',
      action: 'context_menu',
      description: 'Long press for additional options'
    },
    doubleTap: {
      context: 'fab',
      action: 'voice_shortcut',
      description: 'Double tap FAB for voice shortcuts'
    }
  },

  // Analytics Events for Career Progress
  analyticsEvents: {
    resume_created: { category: 'career', action: 'resume_created' },
    voice_command_used: { category: 'interaction', action: 'voice_command' },
    decision_matrix_completed: { category: 'tools', action: 'decision_completed' },
    interview_practiced: { category: 'coaching', action: 'interview_practice' },
    skill_added: { category: 'profile', action: 'skill_added' }
  },

  // Default User Preferences
  defaultPreferences: {
    voice_enabled: true,
    haptic_feedback: true,
    offline_mode: true,
    notification_reminders: false,
    dark_mode: 'auto',
    voice_language: 'en-US',
    resume_template: 'professional',
    coaching_level: 'intermediate'
  }
};

// Export for both browser and module environments
if (typeof window !== 'undefined') {
  window.careerData = careerData;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = careerData;
}