/*
 * RECALIBRATE VOICE ENGINE
 * Advanced voice interface for mobile-first career platform
 * 
 * Features:
 * - Professional vocabulary optimization
 * - Context-aware command interpretation
 * - Voice-to-text resume building
 * - Real-time confidence scoring
 * - Multi-language support preparation
 */

class VoiceEngine {
  constructor() {
    this.isSupported = this.checkSupport();
    this.isListening = false;
    this.confidence = 0;
    this.currentContext = 'general';
    this.commandHistory = [];
    
    // Professional vocabulary for better recognition
    this.professionalTerms = [
      'resume', 'curriculum vitae', 'experience', 'skills', 'education',
      'achievements', 'responsibilities', 'manager', 'director', 'analyst',
      'developer', 'engineer', 'coordinator', 'specialist', 'consultant',
      'leadership', 'collaboration', 'innovation', 'strategy', 'optimization',
      'implementation', 'management', 'development', 'analysis', 'research'
    ];

    // Context-specific commands
    this.contexts = {
      general: {
        commands: ['home', 'help', 'profile', 'settings'],
        phrases: ['take me to', 'open', 'show me', 'navigate to']
      },
      resume: {
        commands: ['name', 'email', 'phone', 'address', 'experience', 'education', 'skills'],
        phrases: ['my name is', 'I worked at', 'I studied at', 'my skills include']
      },
      coaching: {
        commands: ['practice', 'interview', 'feedback', 'improve'],
        phrases: ['help me with', 'practice my', 'give me feedback on']
      }
    };

    this.init();
  }

  checkSupport() {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  }

  init() {
    if (!this.isSupported) {
      console.warn('Voice Engine: Speech recognition not supported');
      return;
    }

    this.setupRecognition();
    this.setupSynthesis();
    console.log('🎤 Voice Engine initialized');
  }

  setupRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Optimized settings for mobile and professional use
    this.recognition.continuous = false;  // Better for mobile battery
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
    this.recognition.lang = 'en-US';

    // Event handlers
    this.recognition.onstart = () => this.handleStart();
    this.recognition.onresult = (event) => this.handleResult(event);
    this.recognition.onerror = (event) => this.handleError(event);
    this.recognition.onend = () => this.handleEnd();
  }

  setupSynthesis() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      
      // Handle voice loading
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    this.voices = this.synthesis.getVoices();
    
    // Prefer natural-sounding voices
    this.preferredVoice = this.voices.find(voice => 
      voice.name.includes('Natural') || 
      voice.name.includes('Neural') ||
      voice.name.includes('Premium')
    ) || this.voices.find(voice => voice.lang.startsWith('en'));
  }

  // Start listening with context awareness
  startListening(context = 'general') {
    if (!this.isSupported || this.isListening) return false;

    this.currentContext = context;
    this.isListening = true;
    
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Voice Engine: Failed to start listening', error);
      this.isListening = false;
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.isListening = false;
  }

  handleStart() {
    console.log('🎤 Voice listening started');
    this.dispatchEvent('voicestart', { context: this.currentContext });
  }

  handleResult(event) {
    let interimTranscript = '';
    let finalTranscript = '';
    let maxConfidence = 0;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      if (result.isFinal) {
        finalTranscript += transcript;
        maxConfidence = Math.max(maxConfidence, confidence);
      } else {
        interimTranscript += transcript;
      }
    }

    // Dispatch interim results for real-time feedback
    if (interimTranscript) {
      this.dispatchEvent('voiceinterim', {
        transcript: interimTranscript,
        confidence: 0.5 // Interim results don't have confidence
      });
    }

    // Process final results
    if (finalTranscript) {
      this.confidence = maxConfidence;
      const processedCommand = this.processTranscript(finalTranscript, maxConfidence);
      
      this.commandHistory.push({
        transcript: finalTranscript,
        confidence: maxConfidence,
        context: this.currentContext,
        timestamp: Date.now()
      });

      this.dispatchEvent('voiceresult', {
        transcript: finalTranscript,
        confidence: maxConfidence,
        command: processedCommand
      });
    }
  }

  handleError(event) {
    console.error('Voice Engine error:', event.error);
    this.isListening = false;
    
    const errorMessages = {
      'no-speech': 'No speech detected. Please try again.',
      'audio-capture': 'Microphone not accessible. Check permissions.',
      'not-allowed': 'Microphone permission denied.',
      'network': 'Network error. Check your connection.',
      'aborted': 'Speech recognition was aborted.',
      'language-not-supported': 'Language not supported.'
    };

    this.dispatchEvent('voiceerror', {
      error: event.error,
      message: errorMessages[event.error] || 'Voice recognition error occurred.'
    });
  }

  handleEnd() {
    console.log('🎤 Voice listening ended');
    this.isListening = false;
    this.dispatchEvent('voiceend', { context: this.currentContext });
  }

  // Advanced transcript processing with context awareness
  processTranscript(transcript, confidence) {
    const cleaned = transcript.toLowerCase().trim();
    const context = this.contexts[this.currentContext] || this.contexts.general;
    
    // Extract intent and entities
    const intent = this.extractIntent(cleaned, context);
    const entities = this.extractEntities(cleaned);
    
    return {
      original: transcript,
      cleaned: cleaned,
      intent: intent,
      entities: entities,
      confidence: confidence,
      context: this.currentContext,
      isReliable: confidence > 0.7
    };
  }

  extractIntent(text, context) {
    // Check for direct commands
    for (const command of context.commands) {
      if (text.includes(command)) {
        return { type: 'command', value: command };
      }
    }

    // Check for action phrases
    for (const phrase of context.phrases) {
      if (text.includes(phrase)) {
        const action = text.replace(phrase, '').trim();
        return { type: 'action', phrase: phrase, value: action };
      }
    }

    // Resume building specific intents
    if (this.currentContext === 'resume') {
      return this.extractResumeIntent(text);
    }

    return { type: 'unknown', value: text };
  }

  extractResumeIntent(text) {
    const patterns = {
      name: /my name is (.*)/i,
      email: /my email is (.*)/i,
      phone: /my (?:phone|number) is (.*)/i,
      address: /I live (?:at|in) (.*)/i,
      experience: /I worked (?:at|for) (.*)/i,
      education: /I (?:studied|graduated) (?:at|from) (.*)/i,
      skills: /my skills (?:include|are) (.*)/i,
      position: /I was (?:a|an) (.*)/i
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        return {
          type: 'resume_data',
          field: type,
          value: match[1].trim()
        };
      }
    }

    return { type: 'resume_general', value: text };
  }

  extractEntities(text) {
    const entities = {};
    
    // Extract professional terms
    const foundTerms = this.professionalTerms.filter(term => 
      text.includes(term.toLowerCase())
    );
    if (foundTerms.length > 0) {
      entities.professionalTerms = foundTerms;
    }

    // Extract dates
    const datePattern = /\b(\d{4}|\d{1,2}\/\d{4}|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4})\b/gi;
    const dates = text.match(datePattern);
    if (dates) {
      entities.dates = dates;
    }

    // Extract companies/organizations (capitalized words)
    const orgPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const organizations = text.match(orgPattern);
    if (organizations) {
      entities.organizations = organizations.filter(org => 
        !this.professionalTerms.includes(org.toLowerCase())
      );
    }

    return entities;
  }

  // Text-to-speech with professional voice settings
  speak(text, options = {}) {
    if (!this.synthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Professional voice settings
    utterance.voice = this.preferredVoice;
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.8;

    // Handle events
    utterance.onstart = () => {
      this.dispatchEvent('speakstart', { text });
    };
    
    utterance.onend = () => {
      this.dispatchEvent('speakend', { text });
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.dispatchEvent('speakerror', { error: event.error });
    };

    this.synthesis.speak(utterance);
  }

  // Contextual help for voice commands
  getContextHelp(context = this.currentContext) {
    const helpTexts = {
      general: "You can say 'home', 'build resume', 'voice coach', or 'help me decide'",
      resume: "Try saying 'my name is...', 'I worked at...', or 'my skills include...'",
      coaching: "Say 'practice interview', 'give me feedback', or 'help me improve'"
    };

    return helpTexts[context] || helpTexts.general;
  }

  // Voice command confidence analysis
  analyzeCommand(command) {
    const analysis = {
      confidence: command.confidence,
      reliability: command.confidence > 0.7 ? 'high' : command.confidence > 0.4 ? 'medium' : 'low',
      suggestions: []
    };

    if (command.confidence < 0.7) {
      analysis.suggestions.push('Try speaking more clearly');
      if (command.entities && command.entities.professionalTerms) {
        analysis.suggestions.push('Professional terms detected - good!');
      }
    }

    return analysis;
  }

  // Event system for integration with main app
  dispatchEvent(type, detail) {
    const event = new CustomEvent(`voice${type}`, { detail });
    document.dispatchEvent(event);
  }

  // Utility methods
  isActive() {
    return this.isListening;
  }

  getConfidence() {
    return this.confidence;
  }

  getContext() {
    return this.currentContext;
  }

  setContext(context) {
    this.currentContext = context;
  }

  getHistory() {
    return this.commandHistory;
  }

  clearHistory() {
    this.commandHistory = [];
  }

  // Professional resume dictation helper
  startResumeDictation(field) {
    this.setContext('resume');
    this.currentField = field;
    
    const prompts = {
      name: "Please state your full name",
      email: "Please provide your email address",
      phone: "Please provide your phone number", 
      experience: "Describe your work experience",
      education: "Tell me about your education",
      skills: "List your key skills"
    };

    const prompt = prompts[field] || "Please provide the information";
    this.speak(prompt);
    
    setTimeout(() => {
      this.startListening('resume');
    }, 2000);
  }

  // Performance metrics
  getMetrics() {
    return {
      totalCommands: this.commandHistory.length,
      averageConfidence: this.commandHistory.reduce((sum, cmd) => sum + cmd.confidence, 0) / this.commandHistory.length || 0,
      successRate: this.commandHistory.filter(cmd => cmd.confidence > 0.7).length / this.commandHistory.length || 0,
      contexts: [...new Set(this.commandHistory.map(cmd => cmd.context))]
    };
  }
}

// Initialize and export
if (typeof window !== 'undefined') {
  window.VoiceEngine = VoiceEngine;
}

// For module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceEngine;
}