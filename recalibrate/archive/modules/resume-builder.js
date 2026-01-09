/*
 * RECALIBRATE RESUME BUILDER
 * Mobile-first resume building with voice integration
 * 
 * Features:
 * - Voice-to-text resume creation
 * - Mobile-optimized form flows
 * - Real-time ATS optimization
 * - Multiple export formats
 * - Offline capability
 */

class ResumeBuilder {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 4;
    this.resumeData = this.initializeResumeData();
    this.template = 'professional';
    this.isVoiceMode = false;
    this.autosaveInterval = null;
    
    // Mobile optimization
    this.touchStartY = 0;
    this.isScrolling = false;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupVoiceIntegration();
    this.setupAutosave();
    this.loadSavedData();
    console.log('📄 Resume Builder initialized');
  }

  initializeResumeData() {
    return {
      contact: {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: ''
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      template: 'professional',
      lastModified: Date.now(),
      version: 1
    };
  }

  setupEventListeners() {
    // Step navigation
    document.addEventListener('click', (e) => {
      if (e.target.matches('.step')) {
        const stepNumber = parseInt(e.target.dataset.step);
        this.goToStep(stepNumber);
      }
    });

    // Voice activation buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.voice-start-btn, .voice-trigger-btn')) {
        this.toggleVoiceMode();
      }
    });

    // Form field handlers with mobile optimization
    document.addEventListener('input', (e) => {
      if (e.target.matches('.resume-field')) {
        this.handleFieldInput(e);
      }
    });

    // Touch events for mobile
    document.addEventListener('touchstart', (e) => {
      if (e.target.closest('.resume-builder')) {
        this.touchStartY = e.touches[0].clientY;
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (e.target.closest('.resume-builder')) {
        const touchY = e.touches[0].clientY;
        const diff = Math.abs(touchY - this.touchStartY);
        this.isScrolling = diff > 10;
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('.resume-builder')) {
        this.handleKeyboardNavigation(e);
      }
    });
  }

  setupVoiceIntegration() {
    // Listen for voice events
    document.addEventListener('voiceresult', (e) => {
      if (this.isVoiceMode) {
        this.processVoiceInput(e.detail);
      }
    });

    document.addEventListener('voiceend', () => {
      if (this.isVoiceMode) {
        this.handleVoiceEnd();
      }
    });
  }

  setupAutosave() {
    // Autosave every 30 seconds
    this.autosaveInterval = setInterval(() => {
      this.saveToLocal();
    }, 30000);

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveToLocal();
    });
  }

  // Step Navigation
  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > this.totalSteps) return;

    // Validate current step before proceeding
    if (stepNumber > this.currentStep && !this.validateCurrentStep()) {
      this.showValidationErrors();
      return;
    }

    this.currentStep = stepNumber;
    this.updateStepUI();
    this.loadStepContent();
    this.announceStepChange();
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.goToStep(this.currentStep + 1);
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  updateStepUI() {
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
      step.classList.toggle('active', index + 1 === this.currentStep);
    });

    // Update progress
    const progress = (this.currentStep / this.totalSteps) * 100;
    const progressBar = document.querySelector('.resume-progress');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }

  loadStepContent() {
    const content = this.getStepContent(this.currentStep);
    const container = document.querySelector('.builder-content');
    
    if (container) {
      container.innerHTML = content;
      this.initializeStepHandlers();
    }
  }

  getStepContent(step) {
    const templates = careerData.resumeTemplates[this.template];
    const voicePrompt = templates.voicePrompts;

    switch (step) {
      case 1:
        return this.generateContactForm(voicePrompt.contact);
      case 2:
        return this.generateExperienceForm(voicePrompt.experience);
      case 3:
        return this.generateSkillsForm(voicePrompt.skills);
      case 4:
        return this.generateReviewForm();
      default:
        return '<div class="error">Invalid step</div>';
    }
  }

  generateContactForm(voicePrompt) {
    return `
      <div class="form-step" data-step="1">
        <div class="step-header">
          <h3 class="step-title">Contact Information</h3>
          <button class="voice-field-btn" data-voice-prompt="${voicePrompt}">
            🎤 Voice Input
          </button>
        </div>
        
        <div class="form-fields">
          ${this.generateField('name', 'text', 'Full Name', this.resumeData.contact.name, true)}
          ${this.generateField('email', 'email', 'Email Address', this.resumeData.contact.email, true)}
          ${this.generateField('phone', 'tel', 'Phone Number', this.resumeData.contact.phone)}
          ${this.generateField('location', 'text', 'City, State', this.resumeData.contact.location)}
          ${this.generateField('linkedin', 'url', 'LinkedIn Profile', this.resumeData.contact.linkedin)}
        </div>

        <div class="step-actions">
          <button class="btn-secondary" disabled>Previous</button>
          <button class="btn-primary" onclick="resumeBuilder.nextStep()">Next Step</button>
        </div>
      </div>
    `;
  }

  generateExperienceForm(voicePrompt) {
    return `
      <div class="form-step" data-step="2">
        <div class="step-header">
          <h3 class="step-title">Work Experience</h3>
          <button class="voice-field-btn" data-voice-prompt="${voicePrompt}">
            🎤 Voice Input
          </button>
        </div>

        <div class="experience-list">
          ${this.resumeData.experience.map((exp, index) => 
            this.generateExperienceItem(exp, index)
          ).join('')}
          
          ${this.resumeData.experience.length === 0 ? 
            '<div class="empty-state">No experience added yet. Use voice input or tap + to add.</div>' : 
            ''
          }
        </div>

        <button class="add-experience-btn" onclick="resumeBuilder.addExperience()">
          <span class="btn-icon">+</span>
          Add Experience
        </button>

        <div class="step-actions">
          <button class="btn-secondary" onclick="resumeBuilder.previousStep()">Previous</button>
          <button class="btn-primary" onclick="resumeBuilder.nextStep()">Next Step</button>
        </div>
      </div>
    `;
  }

  generateSkillsForm(voicePrompt) {
    return `
      <div class="form-step" data-step="3">
        <div class="step-header">
          <h3 class="step-title">Skills & Expertise</h3>
          <button class="voice-field-btn" data-voice-prompt="${voicePrompt}">
            🎤 Voice Input
          </button>
        </div>

        <div class="skills-input-container">
          <input type="text" 
                 class="skills-input" 
                 placeholder="Add a skill and press Enter"
                 onkeypress="resumeBuilder.handleSkillInput(event)">
          <button class="add-skill-btn" onclick="resumeBuilder.addCurrentSkill()">Add</button>
        </div>

        <div class="skills-list">
          ${this.resumeData.skills.map((skill, index) => 
            `<div class="skill-tag">
              <span class="skill-text">${skill}</span>
              <button class="remove-skill" onclick="resumeBuilder.removeSkill(${index})">×</button>
            </div>`
          ).join('')}
        </div>

        <div class="skill-suggestions">
          <h4>Suggested Skills:</h4>
          <div class="suggestion-grid">
            ${this.getSkillSuggestions().map(skill => 
              `<button class="skill-suggestion" onclick="resumeBuilder.addSkill('${skill}')">${skill}</button>`
            ).join('')}
          </div>
        </div>

        <div class="step-actions">
          <button class="btn-secondary" onclick="resumeBuilder.previousStep()">Previous</button>
          <button class="btn-primary" onclick="resumeBuilder.nextStep()">Review</button>
        </div>
      </div>
    `;
  }

  generateReviewForm() {
    return `
      <div class="form-step" data-step="4">
        <div class="step-header">
          <h3 class="step-title">Review & Export</h3>
          <div class="template-selector">
            <select onchange="resumeBuilder.changeTemplate(this.value)">
              <option value="professional" ${this.template === 'professional' ? 'selected' : ''}>Professional</option>
              <option value="creative" ${this.template === 'creative' ? 'selected' : ''}>Creative</option>
              <option value="executive" ${this.template === 'executive' ? 'selected' : ''}>Executive</option>
            </select>
          </div>
        </div>

        <div class="resume-preview">
          ${this.generateResumePreview()}
        </div>

        <div class="ats-score">
          <div class="score-header">
            <h4>ATS Compatibility Score</h4>
            <div class="score-value">${this.calculateATSScore()}%</div>
          </div>
          <div class="score-suggestions">
            ${this.getATSSuggestions().map(suggestion => 
              `<div class="suggestion-item">💡 ${suggestion}</div>`
            ).join('')}
          </div>
        </div>

        <div class="export-options">
          <button class="export-btn btn-primary" onclick="resumeBuilder.exportPDF()">
            📄 Download PDF
          </button>
          <button class="export-btn btn-secondary" onclick="resumeBuilder.exportWord()">
            📝 Download Word
          </button>
          <button class="export-btn btn-secondary" onclick="resumeBuilder.shareResume()">
            🔗 Share Link
          </button>
        </div>

        <div class="step-actions">
          <button class="btn-secondary" onclick="resumeBuilder.previousStep()">Previous</button>
          <button class="btn-success" onclick="resumeBuilder.saveAndFinish()">Save Resume</button>
        </div>
      </div>
    `;
  }

  generateField(name, type, placeholder, value = '', required = false) {
    return `
      <div class="form-field">
        <label for="${name}" class="field-label">
          ${placeholder} ${required ? '<span class="required">*</span>' : ''}
        </label>
        <input type="${type}" 
               id="${name}" 
               name="${name}"
               class="resume-field ${required ? 'required' : ''}" 
               placeholder="${placeholder}"
               value="${value}"
               ${required ? 'required' : ''}>
        <div class="field-error" id="${name}-error"></div>
      </div>
    `;
  }

  generateExperienceItem(experience, index) {
    return `
      <div class="experience-item" data-index="${index}">
        <div class="experience-header">
          <h4 class="experience-title">${experience.position || 'Position'}</h4>
          <button class="remove-experience" onclick="resumeBuilder.removeExperience(${index})">×</button>
        </div>
        <div class="experience-company">${experience.company || 'Company'}</div>
        <div class="experience-duration">${experience.duration || 'Duration'}</div>
        <div class="experience-description">${experience.description || 'Description'}</div>
        <button class="edit-experience" onclick="resumeBuilder.editExperience(${index})">Edit</button>
      </div>
    `;
  }

  // Voice Input Processing
  toggleVoiceMode() {
    this.isVoiceMode = !this.isVoiceMode;
    
    if (this.isVoiceMode) {
      this.startVoiceForCurrentStep();
    } else {
      this.stopVoice();
    }
  }

  startVoiceForCurrentStep() {
    const templates = careerData.resumeTemplates[this.template];
    const stepNames = ['', 'contact', 'experience', 'skills', 'review'];
    const currentStepName = stepNames[this.currentStep];
    const prompt = templates.voicePrompts[currentStepName];
    
    if (window.recalibrateApp && window.recalibrateApp.recognition) {
      window.recalibrateApp.speak(prompt);
      setTimeout(() => {
        window.recalibrateApp.recognition.start();
      }, 2000);
    }
  }

  processVoiceInput(voiceData) {
    const { command, confidence } = voiceData;
    
    if (confidence < 0.6) {
      this.showLowConfidenceWarning(command.original);
      return;
    }

    switch (this.currentStep) {
      case 1:
        this.processContactVoice(command);
        break;
      case 2:
        this.processExperienceVoice(command);
        break;
      case 3:
        this.processSkillsVoice(command);
        break;
    }
  }

  processContactVoice(command) {
    const { intent, entities } = command;
    
    if (intent.type === 'resume_data') {
      const field = intent.field;
      const value = intent.value;
      
      this.resumeData.contact[field] = value;
      this.updateContactField(field, value);
      this.showVoiceConfirmation(`Added ${field}: ${value}`);
    }
  }

  processExperienceVoice(command) {
    // Parse experience from voice input
    const text = command.cleaned;
    const experience = this.parseExperienceFromText(text);
    
    if (experience) {
      this.addExperienceFromVoice(experience);
      this.showVoiceConfirmation('Added work experience');
    }
  }

  processSkillsVoice(command) {
    const text = command.cleaned;
    const skills = this.parseSkillsFromText(text);
    
    skills.forEach(skill => this.addSkill(skill));
    this.showVoiceConfirmation(`Added ${skills.length} skills`);
  }

  // Data Management
  handleFieldInput(e) {
    const field = e.target.name;
    const value = e.target.value;
    const section = this.getCurrentSection();
    
    if (section === 'contact') {
      this.resumeData.contact[field] = value;
    }
    
    this.resumeData.lastModified = Date.now();
    this.debouncedSave();
  }

  getCurrentSection() {
    const stepSections = ['', 'contact', 'experience', 'skills', 'review'];
    return stepSections[this.currentStep];
  }

  debouncedSave = this.debounce(() => {
    this.saveToLocal();
  }, 1000);

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Experience Management
  addExperience() {
    const experience = {
      company: '',
      position: '',
      duration: '',
      description: ''
    };
    
    this.resumeData.experience.push(experience);
    this.loadStepContent(); // Refresh the view
  }

  removeExperience(index) {
    this.resumeData.experience.splice(index, 1);
    this.loadStepContent();
  }

  editExperience(index) {
    // Open mobile-friendly experience editor
    this.openExperienceModal(index);
  }

  addExperienceFromVoice(experience) {
    this.resumeData.experience.push(experience);
    this.loadStepContent();
  }

  parseExperienceFromText(text) {
    // Simple parsing - could be enhanced with NLP
    const patterns = {
      company: /(?:at|for|with)\s+([A-Z][a-zA-Z\s&]+)/i,
      position: /(?:as|was)\s+(?:a|an)?\s*([a-zA-Z\s]+?)(?:\s+at|\s+for|$)/i,
      duration: /(\d{4}|\d{1,2}\/\d{4})/g
    };
    
    const experience = {};
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        experience[key] = match[1].trim();
      }
    }
    
    return Object.keys(experience).length > 0 ? experience : null;
  }

  // Skills Management
  addSkill(skill) {
    if (!this.resumeData.skills.includes(skill)) {
      this.resumeData.skills.push(skill);
      this.updateSkillsList();
    }
  }

  removeSkill(index) {
    this.resumeData.skills.splice(index, 1);
    this.updateSkillsList();
  }

  handleSkillInput(e) {
    if (e.key === 'Enter') {
      const skill = e.target.value.trim();
      if (skill) {
        this.addSkill(skill);
        e.target.value = '';
      }
    }
  }

  addCurrentSkill() {
    const input = document.querySelector('.skills-input');
    const skill = input.value.trim();
    if (skill) {
      this.addSkill(skill);
      input.value = '';
    }
  }

  parseSkillsFromText(text) {
    // Extract skills from voice input
    const skillKeywords = careerData.industryKeywords;
    const allSkills = Object.values(skillKeywords).flat();
    
    const foundSkills = allSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
    
    // Also extract comma-separated or "and" separated items
    const patterns = [
      /(?:skills?|expertise?|experience?)[:\s]+([^.!?]+)/i,
      /(?:including|like|such as)[:\s]+([^.!?]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const skillsText = match[1];
        const extractedSkills = skillsText
          .split(/,|\sand\s/)
          .map(s => s.trim())
          .filter(s => s.length > 2);
        
        foundSkills.push(...extractedSkills);
      }
    }
    
    return [...new Set(foundSkills)]; // Remove duplicates
  }

  getSkillSuggestions() {
    // Get relevant skills based on experience
    const experienceText = this.resumeData.experience
      .map(exp => `${exp.position} ${exp.description}`)
      .join(' ')
      .toLowerCase();
    
    let suggestions = [];
    
    // Find matching industry
    for (const [industry, keywords] of Object.entries(careerData.industryKeywords)) {
      const matches = keywords.filter(keyword => 
        experienceText.includes(keyword.toLowerCase())
      );
      
      if (matches.length > 0) {
        suggestions = keywords.slice(0, 8);
        break;
      }
    }
    
    return suggestions.filter(skill => !this.resumeData.skills.includes(skill));
  }

  updateSkillsList() {
    const container = document.querySelector('.skills-list');
    if (container) {
      container.innerHTML = this.resumeData.skills.map((skill, index) => 
        `<div class="skill-tag">
          <span class="skill-text">${skill}</span>
          <button class="remove-skill" onclick="resumeBuilder.removeSkill(${index})">×</button>
        </div>`
      ).join('');
    }
  }

  // ATS Optimization
  calculateATSScore() {
    let score = 0;
    const maxScore = 100;
    
    // Contact information (20 points)
    const contact = this.resumeData.contact;
    if (contact.name) score += 5;
    if (contact.email) score += 5;
    if (contact.phone) score += 5;
    if (contact.location) score += 5;
    
    // Experience (40 points)
    const expScore = Math.min(this.resumeData.experience.length * 10, 40);
    score += expScore;
    
    // Skills (25 points)
    const skillScore = Math.min(this.resumeData.skills.length * 3, 25);
    score += skillScore;
    
    // Keywords (15 points)
    const keywordScore = this.calculateKeywordScore();
    score += keywordScore;
    
    return Math.min(score, maxScore);
  }

  calculateKeywordScore() {
    const allText = JSON.stringify(this.resumeData).toLowerCase();
    const actionVerbs = careerData.atsKeywords.action_verbs;
    const technicalSkills = careerData.atsKeywords.technical_skills;
    
    let keywordCount = 0;
    
    actionVerbs.forEach(verb => {
      if (allText.includes(verb)) keywordCount++;
    });
    
    technicalSkills.forEach(skill => {
      if (allText.includes(skill)) keywordCount++;
    });
    
    return Math.min(keywordCount, 15);
  }

  getATSSuggestions() {
    const suggestions = [];
    const score = this.calculateATSScore();
    
    if (this.resumeData.experience.length < 2) {
      suggestions.push('Add more work experience entries');
    }
    
    if (this.resumeData.skills.length < 6) {
      suggestions.push('Include more relevant skills');
    }
    
    if (score < 70) {
      suggestions.push('Use more action verbs in experience descriptions');
      suggestions.push('Include industry-specific keywords');
    }
    
    return suggestions;
  }

  // Export Functions
  exportPDF() {
    // Generate PDF using resume data
    this.showToast('PDF export coming soon!', 'info');
  }

  exportWord() {
    // Generate Word document
    this.showToast('Word export coming soon!', 'info');
  }

  shareResume() {
    // Generate shareable link
    this.showToast('Share functionality coming soon!', 'info');
  }

  generateResumePreview() {
    return `
      <div class="resume-preview-content">
        <div class="preview-header">
          <h2>${this.resumeData.contact.name || 'Your Name'}</h2>
          <div class="contact-info">
            <div>${this.resumeData.contact.email}</div>
            <div>${this.resumeData.contact.phone}</div>
            <div>${this.resumeData.contact.location}</div>
          </div>
        </div>
        
        ${this.resumeData.experience.length > 0 ? `
          <div class="preview-section">
            <h3>Experience</h3>
            ${this.resumeData.experience.map(exp => `
              <div class="preview-experience">
                <div class="exp-header">
                  <strong>${exp.position}</strong> - ${exp.company}
                </div>
                <div class="exp-duration">${exp.duration}</div>
                <div class="exp-description">${exp.description}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${this.resumeData.skills.length > 0 ? `
          <div class="preview-section">
            <h3>Skills</h3>
            <div class="preview-skills">
              ${this.resumeData.skills.join(', ')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Validation
  validateCurrentStep() {
    switch (this.currentStep) {
      case 1:
        return this.validateContact();
      case 2:
        return this.validateExperience();
      case 3:
        return this.validateSkills();
      default:
        return true;
    }
  }

  validateContact() {
    const { name, email } = this.resumeData.contact;
    return name.trim() !== '' && email.trim() !== '';
  }

  validateExperience() {
    return this.resumeData.experience.length > 0;
  }

  validateSkills() {
    return this.resumeData.skills.length >= 3;
  }

  showValidationErrors() {
    let message = '';
    
    switch (this.currentStep) {
      case 1:
        message = 'Please fill in your name and email address';
        break;
      case 2:
        message = 'Please add at least one work experience';
        break;
      case 3:
        message = 'Please add at least 3 skills';
        break;
    }
    
    this.showToast(message, 'error');
  }

  // Storage
  saveToLocal() {
    try {
      localStorage.setItem('recalibrate_resume', JSON.stringify(this.resumeData));
      
      // Also save to IndexedDB if offline manager is available
      if (window.offlineManager) {
        window.offlineManager.saveResume(this.resumeData);
      }
    } catch (error) {
      console.error('Failed to save resume:', error);
    }
  }

  loadSavedData() {
    try {
      const saved = localStorage.getItem('recalibrate_resume');
      if (saved) {
        this.resumeData = { ...this.resumeData, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
  }

  saveAndFinish() {
    this.saveToLocal();
    this.showToast('Resume saved successfully!', 'success');
    
    // Navigate back to home
    if (window.recalibrateApp) {
      window.recalibrateApp.navigateToView('home');
    }
  }

  // Utility Methods
  initializeStepHandlers() {
    // Re-attach event handlers after content update
    const voiceButtons = document.querySelectorAll('.voice-field-btn');
    voiceButtons.forEach(btn => {
      btn.addEventListener('click', () => this.toggleVoiceMode());
    });
  }

  handleKeyboardNavigation(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.previousStep();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextStep();
          break;
        case 's':
          e.preventDefault();
          this.saveToLocal();
          this.showToast('Saved!', 'success');
          break;
      }
    }
  }

  announceStepChange() {
    const stepNames = ['', 'Contact Information', 'Work Experience', 'Skills', 'Review'];
    const announcement = `Step ${this.currentStep}: ${stepNames[this.currentStep]}`;
    
    // Screen reader announcement
    if (window.recalibrateApp) {
      window.recalibrateApp.announceNavigation(announcement);
    }
  }

  showToast(message, type) {
    if (window.recalibrateApp) {
      window.recalibrateApp.showToast(message, type);
    }
  }

  showVoiceConfirmation(message) {
    this.showToast(message, 'success');
    
    if (window.recalibrateApp) {
      window.recalibrateApp.speak('Got it!');
    }
  }

  showLowConfidenceWarning(transcript) {
    this.showToast(`I heard "${transcript}" but I'm not sure. Please try again or type manually.`, 'warning');
  }

  openExperienceModal(index) {
    // Mobile-friendly modal for editing experience
    this.showToast('Experience editor coming soon!', 'info');
  }

  changeTemplate(templateId) {
    this.template = templateId;
    this.resumeData.template = templateId;
    this.loadStepContent(); // Refresh with new template
  }

  // Public API
  getResumeData() {
    return { ...this.resumeData };
  }

  setResumeData(data) {
    this.resumeData = { ...this.resumeData, ...data };
    this.loadStepContent();
  }

  getCurrentStep() {
    return this.currentStep;
  }

  getProgress() {
    return (this.currentStep / this.totalSteps) * 100;
  }
}

// Initialize and export
if (typeof window !== 'undefined') {
  window.ResumeBuilder = ResumeBuilder;
  
  // Create global instance
  window.resumeBuilder = new ResumeBuilder();
}

// For module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResumeBuilder;
}