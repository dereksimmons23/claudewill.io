/**
 * Experience Inventory Engine
 * Comprehensive professional experience cataloging and positioning system
 * Solves the "forgotten experience" problem in high-pressure interview situations
 * 
 * @author Derek Simmons - Claude Wisdom Strategies
 * @version 1.0.0
 */

class ExperienceInventory {
    constructor(options = {}) {
        this.options = {
            voiceEnabled: options.voiceEnabled || true,
            autoSave: options.autoSave || true,
            contextualPositioning: options.contextualPositioning || true,
            starMethodTemplate: options.starMethodTemplate || true,
            metricsTracking: options.metricsTracking || true,
            ...options
        };

        this.experiences = [];
        this.contexts = new Map();
        this.metrics = new Map();
        this.starExamples = new Map();
        this.quickPrepCache = new Map();
        
        this.initializeInventory();
        this.setupEventListeners();
    }

    /**
     * Initialize the experience inventory system
     */
    async initializeInventory() {
        try {
            // Load existing experiences
            await this.loadExistingExperiences();
            
            // Initialize voice input if available
            if (this.options.voiceEnabled && window.deviceContext?.capabilities.speechRecognition) {
                await this.initializeVoiceInput();
            }
            
            // Setup contextual positioning engine
            this.initializeContextEngine();
            
            console.log('Experience Inventory initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Experience Inventory:', error);
        }
    }

    /**
     * Add new experience via voice or text input
     * @param {Object} experience - Experience details
     * @param {string} inputMethod - 'voice' or 'text'
     */
    async addExperience(experience, inputMethod = 'text') {
        const experienceItem = {
            id: this.generateId(),
            timestamp: Date.now(),
            inputMethod,
            ...experience,
            contexts: this.generateContexts(experience),
            metrics: this.extractMetrics(experience),
            starMethod: this.generateSTARMethod(experience),
            tags: this.generateTags(experience)
        };

        try {
            // Add to main collection
            this.experiences.push(experienceItem);
            
            // Update context mappings
            this.updateContextMappings(experienceItem);
            
            // Generate STAR method examples
            this.generateSTARExamples(experienceItem);
            
            // Auto-save if enabled
            if (this.options.autoSave) {
                await this.saveExperience(experienceItem);
            }
            
            // Emit event
            this.emitEvent('experienceAdded', { experience: experienceItem });
            
            return experienceItem;
        } catch (error) {
            console.error('Failed to add experience:', error);
            throw error;
        }
    }

    /**
     * Voice-powered experience input
     * @param {string} prompt - Voice prompt for experience capture
     */
    async captureExperienceByVoice(prompt = \"Tell me about a significant professional achievement\") {
        if (!window.deviceContext?.capabilities.speechRecognition) {
            throw new Error('Voice recognition not available');
        }

        try {
            const voiceInput = await this.startVoiceCapture(prompt);
            const parsedExperience = await this.parseVoiceInput(voiceInput);
            
            return await this.addExperience(parsedExperience, 'voice');
        } catch (error) {
            console.error('Voice capture failed:', error);
            throw error;
        }
    }

    /**
     * Get experiences by context (role type, industry, etc.)
     * @param {string} context - Target context
     * @param {number} limit - Maximum number of experiences
     */
    getExperiencesByContext(context, limit = 10) {
        const contextExperiences = this.contexts.get(context) || [];
        
        return contextExperiences
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, limit)
            .map(item => ({
                ...item.experience,
                positioning: item.positioning,
                relevanceScore: item.relevanceScore
            }));
    }

    /**
     * Generate quick prep for upcoming interview/assessment
     * @param {Object} opportunity - Target opportunity details
     * @param {number} prepTime - Available prep time in minutes
     */
    generateQuickPrep(opportunity, prepTime = 10) {
        const cacheKey = this.generateCacheKey(opportunity);
        
        // Check cache first
        if (this.quickPrepCache.has(cacheKey)) {
            return this.quickPrepCache.get(cacheKey);
        }

        const prep = {
            opportunity,
            prepTime,
            relevantExperiences: this.selectRelevantExperiences(opportunity),
            starExamples: this.selectSTARExamples(opportunity),
            keyMetrics: this.selectKeyMetrics(opportunity),
            positioning: this.generatePositioning(opportunity),
            practiceQuestions: this.generatePracticeQuestions(opportunity),
            quickReference: this.generateQuickReference(opportunity)
        };

        // Cache for future use
        this.quickPrepCache.set(cacheKey, prep);
        
        return prep;
    }

    /**
     * Generate STAR method examples for experiences
     * @param {Object} experience - Experience to convert
     */
    generateSTARMethod(experience) {
        const star = {
            situation: this.extractSituation(experience),
            task: this.extractTask(experience),
            action: this.extractAction(experience),
            result: this.extractResult(experience)
        };

        return {
            ...star,
            formatted: this.formatSTARMethod(star),
            variations: this.generateSTARVariations(star)
        };
    }

    /**
     * Position same experience for different contexts
     * @param {Object} experience - Base experience
     * @param {string} targetContext - Target role/industry context
     */
    repositionForContext(experience, targetContext) {
        const positioning = {
            context: targetContext,
            leadWith: this.selectLeadElements(experience, targetContext),
            emphasize: this.selectEmphasisPoints(experience, targetContext),
            deemphasize: this.selectDeemphasisPoints(experience, targetContext),
            languageAdjustments: this.generateLanguageAdjustments(experience, targetContext),
            metricsPriority: this.prioritizeMetrics(experience, targetContext)
        };

        return {
            ...experience,
            positioning,
            contextualDescription: this.generateContextualDescription(experience, positioning)
        };
    }

    /**
     * Extract and track metrics from experiences
     * @param {Object} experience - Experience to analyze
     */
    extractMetrics(experience) {
        const metrics = {
            financial: this.extractFinancialMetrics(experience),
            team: this.extractTeamMetrics(experience),
            timeline: this.extractTimelineMetrics(experience),
            performance: this.extractPerformanceMetrics(experience),
            scale: this.extractScaleMetrics(experience)
        };

        // Update global metrics tracking
        this.updateMetricsTracking(metrics);
        
        return metrics;
    }

    /**
     * Search experiences by keyword, context, or metrics
     * @param {string} query - Search query
     * @param {Object} filters - Search filters
     */
    searchExperiences(query, filters = {}) {
        let results = this.experiences;

        // Text search
        if (query) {
            results = results.filter(exp => 
                this.searchInExperience(exp, query)
            );
        }

        // Apply filters
        if (filters.context) {
            results = results.filter(exp => 
                exp.contexts.includes(filters.context)
            );
        }

        if (filters.dateRange) {
            results = results.filter(exp => 
                this.isInDateRange(exp, filters.dateRange)
            );
        }

        if (filters.hasMetrics) {
            results = results.filter(exp => 
                this.hasSignificantMetrics(exp)
            );
        }

        // Sort by relevance
        results.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(a, query, filters);
            const scoreB = this.calculateRelevanceScore(b, query, filters);
            return scoreB - scoreA;
        });

        return results;
    }

    /**
     * Export experiences in various formats
     * @param {string} format - Export format ('pdf', 'json', 'markdown')
     * @param {Object} options - Export options
     */
    async exportExperiences(format = 'json', options = {}) {
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                totalExperiences: this.experiences.length,
                platform: 'Recalibrate Experience Inventory',
                version: '1.0.0'
            },
            experiences: this.experiences,
            contexts: Array.from(this.contexts.entries()),
            metrics: Array.from(this.metrics.entries())
        };

        switch (format) {
            case 'json':
                return JSON.stringify(exportData, null, 2);
                
            case 'markdown':
                return this.generateMarkdownExport(exportData);
                
            case 'pdf':
                return await this.generatePDFExport(exportData);
                
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    // Voice input methods

    async startVoiceCapture(prompt) {
        return new Promise((resolve, reject) => {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                reject(new Error('Speech recognition not supported'));
                return;
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            let transcript = '';

            recognition.onresult = (event) => {
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript + ' ';
                    }
                }
            };

            recognition.onend = () => {
                resolve(transcript.trim());
            };

            recognition.onerror = (event) => {
                reject(new Error(`Speech recognition error: ${event.error}`));
            };

            // Start recognition
            this.emitEvent('voicePrompt', { prompt });
            recognition.start();

            // Auto-stop after 2 minutes
            setTimeout(() => {
                recognition.stop();
            }, 120000);
        });
    }

    async parseVoiceInput(voiceInput) {
        // Parse voice input into structured experience data
        // This would use NLP/AI to extract key components
        
        return {
            title: this.extractTitle(voiceInput),
            description: voiceInput,
            company: this.extractCompany(voiceInput),
            role: this.extractRole(voiceInput),
            timeframe: this.extractTimeframe(voiceInput),
            achievements: this.extractAchievements(voiceInput),
            skills: this.extractSkills(voiceInput),
            challenges: this.extractChallenges(voiceInput)
        };
    }

    // Context generation methods

    generateContexts(experience) {
        const contexts = [];
        
        // Industry contexts
        if (experience.company) {
            contexts.push(`industry-${this.inferIndustry(experience.company)}`);
        }
        
        // Role contexts
        if (experience.role) {
            contexts.push(`role-${this.categorizeRole(experience.role)}`);
        }
        
        // Skill contexts
        if (experience.skills) {
            experience.skills.forEach(skill => {
                contexts.push(`skill-${skill.toLowerCase()}`);
            });
        }
        
        // Outcome contexts
        if (experience.achievements) {
            contexts.push(...this.categorizeAchievements(experience.achievements));
        }
        
        return contexts;
    }

    updateContextMappings(experience) {
        experience.contexts.forEach(context => {
            if (!this.contexts.has(context)) {
                this.contexts.set(context, []);
            }
            
            const contextArray = this.contexts.get(context);
            contextArray.push({
                experience,
                relevanceScore: this.calculateContextRelevance(experience, context),
                positioning: this.generateContextPositioning(experience, context)
            });
            
            // Sort by relevance
            contextArray.sort((a, b) => b.relevanceScore - a.relevanceScore);
        });
    }

    // Utility methods

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    emitEvent(eventType, data) {
        const event = new CustomEvent(`experience-${eventType}`, {
            detail: {
                ...data,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
    }

    setupEventListeners() {
        // Listen for experience-related events
        document.addEventListener('experience-request', (event) => {
            this.handleExperienceRequest(event.detail);
        });
        
        document.addEventListener('quick-prep-request', (event) => {
            this.handleQuickPrepRequest(event.detail);
        });
    }

    // Placeholder methods for future implementation

    async loadExistingExperiences() {
        // Load from IndexedDB or cloud storage
    }

    async saveExperience(experience) {
        // Save to IndexedDB and sync to cloud
    }

    initializeVoiceInput() {
        // Setup voice input system
    }

    initializeContextEngine() {
        // Setup contextual positioning engine
    }

    extractTitle(text) { return 'Experience Title'; }
    extractCompany(text) { return null; }
    extractRole(text) { return null; }
    extractTimeframe(text) { return null; }
    extractAchievements(text) { return []; }
    extractSkills(text) { return []; }
    extractChallenges(text) { return []; }
    
    inferIndustry(company) { return 'general'; }
    categorizeRole(role) { return 'general'; }
    categorizeAchievements(achievements) { return []; }
    
    calculateContextRelevance(experience, context) { return 1.0; }
    generateContextPositioning(experience, context) { return {}; }
    
    selectRelevantExperiences(opportunity) { return []; }
    selectSTARExamples(opportunity) { return []; }
    selectKeyMetrics(opportunity) { return []; }
    generatePositioning(opportunity) { return {}; }
    generatePracticeQuestions(opportunity) { return []; }
    generateQuickReference(opportunity) { return {}; }
    
    extractSituation(experience) { return experience.description || ''; }
    extractTask(experience) { return ''; }
    extractAction(experience) { return ''; }
    extractResult(experience) { return ''; }
    
    formatSTARMethod(star) { return ''; }
    generateSTARVariations(star) { return []; }
    
    extractFinancialMetrics(experience) { return {}; }
    extractTeamMetrics(experience) { return {}; }
    extractTimelineMetrics(experience) { return {}; }
    extractPerformanceMetrics(experience) { return {}; }
    extractScaleMetrics(experience) { return {}; }
    
    updateMetricsTracking(metrics) {}
    generateSTARExamples(experience) {}
    selectLeadElements(experience, context) { return []; }
    selectEmphasisPoints(experience, context) { return []; }
    selectDeemphasisPoints(experience, context) { return []; }
    generateLanguageAdjustments(experience, context) { return {}; }
    prioritizeMetrics(experience, context) { return []; }
    generateContextualDescription(experience, positioning) { return ''; }
    
    searchInExperience(experience, query) { return true; }
    isInDateRange(experience, dateRange) { return true; }
    hasSignificantMetrics(experience) { return true; }
    calculateRelevanceScore(experience, query, filters) { return 1.0; }
    
    generateCacheKey(opportunity) {
        return `${opportunity.company}-${opportunity.role}-${opportunity.type || 'general'}`;
    }
    
    generateMarkdownExport(data) { return '# Experience Inventory Export\n\n'; }
    async generatePDFExport(data) { return new Blob(['PDF content'], { type: 'application/pdf' }); }
}

// Initialize experience inventory
const experienceInventory = new ExperienceInventory();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExperienceInventory;
} else {
    window.ExperienceInventory = ExperienceInventory;
    window.experienceInventory = experienceInventory;
}
