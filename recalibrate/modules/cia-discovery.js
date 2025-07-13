/**
 * CIA Discovery Interface
 * Implements statement-based career discovery using CIA negotiation techniques
 * Facilitates authentic professional insights through validation rather than interrogation
 */

class CIADiscoveryInterface {
  constructor() {
    this.userProfile = {
      background: null,
      strengths: [],
      motivations: [],
      values: [],
      concerns: [],
      insights: []
    };
    
    this.discoveryStages = [
      'recognition',    // Initial validation and rapport building
      'exploration',    // Deeper skill and experience discovery
      'aspiration',     // Career goals and motivation exploration
      'decision',       // Strategic choice facilitation
      'commitment'      // Confidence building and next steps
    ];
    
    this.currentStage = 'recognition';
    this.conversationHistory = [];
    this.emotionalState = 'neutral';
    
    this.statementTemplates = {
      recognition: [
        "You seem like someone who values {value} over just {alternative}",
        "Your background suggests you're someone who {strength}",
        "People with your experience often find that {insight}",
        "You strike me as someone who {characteristic}"
      ],
      exploration: [
        "That experience shows exactly the kind of {skill} companies are looking for",
        "What you're describing demonstrates {strength} that most people don't recognize in themselves",
        "Your unique combination of {x} and {y} often leads to {opportunity}",
        "People with your background typically excel when {context}"
      ],
      aspiration: [
        "Based on what you've shared, you'd probably thrive in environments that {environment}",
        "Your values suggest you're most energized when {situation}",
        "That energy tells me this opportunity aligns with something that really matters to you",
        "Professionals like you often find fulfillment in roles that {role_characteristics}"
      ],
      decision: [
        "Your instincts about {factor} are telling you something important",
        "That hesitation often indicates you're considering opportunities that really matter",
        "People with your experience usually succeed when they trust their judgment about {aspect}",
        "Your track record suggests you're good at making strategic moves that {outcome}"
      ],
      commitment: [
        "You have exactly the combination of {skills} and {experience} that {target} needs",
        "That clarity suggests you're ready to {action}",
        "Your confidence about {decision} indicates strong alignment with your authentic goals",
        "Based on everything you've shared, this feels like the right strategic move because {reasoning}"
      ]
    };
    
    this.responsePatterns = {
      uncertain: {
        responses: [
          "That uncertainty often indicates you're considering something that really matters to you",
          "The fact that you're thinking deeply about this shows you're taking it seriously",
          "Sometimes the most important decisions require that kind of careful consideration"
        ],
        followUp: "What aspect feels most uncertain to you?"
      },
      excited: {
        responses: [
          "That energy suggests you've identified something that aligns with your authentic goals",
          "Your excitement tells me this resonates with something important to you",
          "That enthusiasm usually indicates strong values alignment"
        ],
        followUp: "What specifically generates that energy for you?"
      },
      concerned: {
        responses: [
          "Those concerns are worth exploring - they often reveal what really matters to you",
          "Your caution shows good strategic thinking about important decisions",
          "That awareness helps you make choices that serve your long-term goals"
        ],
        followUp: "Tell me more about what's driving that concern"
      },
      confident: {
        responses: [
          "That confidence suggests strong alignment between the opportunity and your values",
          "Your certainty indicates you're seeing clear connections to your goals",
          "That clarity often comes from recognizing authentic fit"
        ],
        followUp: "What gives you that confidence?"
      }
    };
    
    this.profileBuilders = {
      leadership: [
        "You seem like someone who leads through influence rather than authority",
        "Your approach suggests you build consensus rather than dictate solutions",
        "People with your style often excel at bringing teams together around shared vision"
      ],
      innovation: [
        "Your experience suggests you see solutions that traditional approaches miss",
        "People with your background often identify opportunities others overlook",
        "Your perspective brings the kind of fresh thinking organizations desperately need"
      ],
      strategic: [
        "You strike me as someone who thinks in systems rather than just individual tasks",
        "Your background suggests you naturally see the bigger picture",
        "People with your experience usually excel at connecting disparate pieces into coherent strategy"
      ],
      collaborative: [
        "Your experience suggests you're naturally good at building bridges between different groups",
        "People with your background often excel at translating between different perspectives",
        "You seem like someone who brings out the best in cross-functional teams"
      ]
    };
  }
  
  /**
   * Generate contextual statement based on user input and current stage
   */
  generateStatement(userInput, context = {}) {
    const stage = this.currentStage;
    const emotionalTone = this.detectEmotionalTone(userInput);
    const userStrengths = this.identifyStrengths(userInput);
    
    // Update emotional state
    this.emotionalState = emotionalTone;
    
    // Select appropriate statement template
    const templates = this.statementTemplates[stage];
    const template = this.selectTemplate(templates, context, userStrengths);
    
    // Personalize statement with user-specific content
    const personalizedStatement = this.personalizeStatement(template, userInput, context);
    
    // Log conversation history
    this.conversationHistory.push({
      stage,
      userInput,
      statement: personalizedStatement,
      emotionalTone,
      timestamp: new Date().toISOString()
    });
    
    return {
      statement: personalizedStatement,
      followUp: this.generateFollowUp(emotionalTone, stage),
      insights: this.extractInsights(userInput),
      recommendations: this.generateRecommendations(stage, userInput)
    };
  }
  
  /**
   * Detect emotional tone from user input
   */
  detectEmotionalTone(input) {
    const text = input.toLowerCase();
    
    // Uncertainty indicators
    if (text.includes('not sure') || text.includes('maybe') || text.includes('i think') || 
        text.includes('probably') || text.includes('unsure')) {
      return 'uncertain';
    }
    
    // Excitement indicators
    if (text.includes('excited') || text.includes('love') || text.includes('amazing') ||
        text.includes('perfect') || text.includes('!')) {
      return 'excited';
    }
    
    // Concern indicators
    if (text.includes('worried') || text.includes('concerned') || text.includes('nervous') ||
        text.includes('but') || text.includes('however')) {
      return 'concerned';
    }
    
    // Confidence indicators
    if (text.includes('definitely') || text.includes('absolutely') || text.includes('confident') ||
        text.includes('clear') || text.includes('certain')) {
      return 'confident';
    }
    
    return 'neutral';
  }
  
  /**
   * Identify strengths mentioned in user input
   */
  identifyStrengths(input) {
    const text = input.toLowerCase();
    const strengths = [];
    
    // Leadership indicators
    if (text.includes('led') || text.includes('managed') || text.includes('directed') ||
        text.includes('oversaw') || text.includes('coordinated')) {
      strengths.push('leadership');
    }
    
    // Innovation indicators
    if (text.includes('created') || text.includes('developed') || text.includes('innovative') ||
        text.includes('new') || text.includes('pioneered')) {
      strengths.push('innovation');
    }
    
    // Strategic thinking indicators
    if (text.includes('strategy') || text.includes('planning') || text.includes('vision') ||
        text.includes('transformation') || text.includes('growth')) {
      strengths.push('strategic');
    }
    
    // Collaboration indicators
    if (text.includes('team') || text.includes('collaborated') || text.includes('partnership') ||
        text.includes('cross-functional') || text.includes('stakeholder')) {
      strengths.push('collaborative');
    }
    
    return strengths;
  }
  
  /**
   * Select appropriate statement template based on context
   */
  selectTemplate(templates, context, strengths) {
    // If user has identified strengths, use strength-specific templates
    if (strengths.length > 0) {
      const primaryStrength = strengths[0];
      if (this.profileBuilders[primaryStrength]) {
        const strengthTemplates = this.profileBuilders[primaryStrength];
        return strengthTemplates[Math.floor(Math.random() * strengthTemplates.length)];
      }
    }
    
    // Use stage-appropriate template
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  /**
   * Personalize statement with user-specific content
   */
  personalizeStatement(template, userInput, context) {
    let statement = template;
    
    // Replace placeholders with context-specific content
    const replacements = {
      '{value}': context.detectedValue || 'meaningful impact',
      '{alternative}': context.alternative || 'just following established processes',
      '{strength}': context.strength || 'brings unique perspective to complex challenges',
      '{insight}': context.insight || 'their experience translates in unexpected ways',
      '{characteristic}': context.characteristic || 'thrives when bridging different domains',
      '{skill}': context.skill || 'strategic thinking',
      '{x}': context.firstStrength || 'leadership experience',
      '{y}': context.secondStrength || 'innovative thinking',
      '{opportunity}': context.opportunity || 'breakthrough opportunities',
      '{context}': context.successContext || 'they can see the bigger picture',
      '{environment}': context.environment || 'value innovation over tradition',
      '{situation}': context.situation || 'leading transformation rather than maintaining status quo',
      '{role_characteristics}': context.roleCharacteristics || 'combine strategic thinking with hands-on execution',
      '{factor}': context.decisionFactor || 'cultural fit',
      '{aspect}': context.concernAspect || 'organizational alignment',
      '{outcome}': context.outcome || 'others might consider too ambitious',
      '{skills}': context.skills || 'strategic vision',
      '{experience}': context.experience || 'proven execution ability',
      '{target}': context.target || 'forward-thinking organizations',
      '{action}': context.action || 'make this transition',
      '{decision}': context.decision || 'this direction',
      '{reasoning}': context.reasoning || 'it honors both your logical requirements and authentic motivations'
    };
    
    Object.entries(replacements).forEach(([placeholder, value]) => {
      statement = statement.replace(placeholder, value);
    });
    
    return statement;
  }
  
  /**
   * Generate appropriate follow-up based on emotional tone and stage
   */
  generateFollowUp(emotionalTone, stage) {
    const pattern = this.responsePatterns[emotionalTone];
    if (!pattern) return "Tell me more about that.";
    
    return pattern.followUp;
  }
  
  /**
   * Extract insights from user response for profile building
   */
  extractInsights(input) {
    const insights = [];
    const text = input.toLowerCase();
    
    // Value extraction
    if (text.includes('impact') || text.includes('difference') || text.includes('meaningful')) {
      insights.push({ type: 'value', content: 'meaningful impact', confidence: 0.8 });
    }
    
    if (text.includes('growth') || text.includes('learn') || text.includes('develop')) {
      insights.push({ type: 'value', content: 'continuous learning', confidence: 0.7 });
    }
    
    if (text.includes('team') || text.includes('people') || text.includes('collaboration')) {
      insights.push({ type: 'value', content: 'collaborative environment', confidence: 0.8 });
    }
    
    // Motivation extraction
    if (text.includes('challenge') || text.includes('solve') || text.includes('problem')) {
      insights.push({ type: 'motivation', content: 'complex problem solving', confidence: 0.7 });
    }
    
    if (text.includes('create') || text.includes('build') || text.includes('design')) {
      insights.push({ type: 'motivation', content: 'creative contribution', confidence: 0.8 });
    }
    
    return insights;
  }
  
  /**
   * Generate stage-appropriate recommendations
   */
  generateRecommendations(stage, userInput) {
    const recommendations = [];
    
    switch (stage) {
      case 'recognition':
        recommendations.push({
          type: 'exploration',
          title: 'Explore your unique value proposition',
          description: 'Share a specific example of how your background created value in an unexpected way'
        });
        break;
        
      case 'exploration':
        recommendations.push({
          type: 'validation',
          title: 'Quantify your impact',
          description: 'Add specific metrics or outcomes to strengthen your examples'
        });
        break;
        
      case 'aspiration':
        recommendations.push({
          type: 'alignment',
          title: 'Research cultural fit',
          description: 'Investigate how target organizations align with your identified values'
        });
        break;
        
      case 'decision':
        recommendations.push({
          type: 'framework',
          title: 'Apply decision matrix',
          description: 'Balance logical factors with emotional and intuitive responses'
        });
        break;
        
      case 'commitment':
        recommendations.push({
          type: 'action',
          title: 'Develop implementation plan',
          description: 'Create specific next steps based on your decisions'
        });
        break;
    }
    
    return recommendations;
  }
  
  /**
   * Advance to next discovery stage
   */
  advanceStage() {
    const currentIndex = this.discoveryStages.indexOf(this.currentStage);
    if (currentIndex < this.discoveryStages.length - 1) {
      this.currentStage = this.discoveryStages[currentIndex + 1];
      return true;
    }
    return false;
  }
  
  /**
   * Generate initial statement for beginning discovery process
   */
  generateInitialStatement(userBackground) {
    const statements = [
      "You seem like someone who values meaningful work over just climbing the corporate ladder",
      "Your background suggests you're someone who thrives when bridging different domains",
      "People with your experience often find that their perspective brings unique value to organizations",
      "You strike me as someone who works best when you can see the bigger picture"
    ];
    
    const statement = statements[Math.floor(Math.random() * statements.length)];
    
    this.conversationHistory.push({
      stage: 'recognition',
      userInput: userBackground,
      statement,
      emotionalTone: 'neutral',
      timestamp: new Date().toISOString()
    });
    
    return {
      statement,
      followUp: "Tell me about a time when your unique perspective solved a problem others couldn't crack.",
      stage: this.currentStage
    };
  }
  
  /**
   * Generate comprehensive profile summary
   */
  generateProfileSummary() {
    const insights = this.conversationHistory.map(entry => entry.insights).flat().filter(Boolean);
    const strengths = [...new Set(this.conversationHistory.map(entry => 
      this.identifyStrengths(entry.userInput || '')
    ).flat())];
    
    return {
      discoveryStage: this.currentStage,
      identifiedStrengths: strengths,
      keyInsights: insights,
      emotionalPattern: this.analyzeEmotionalPattern(),
      readinessLevel: this.assessReadinessLevel(),
      recommendations: this.generateFinalRecommendations()
    };
  }
  
  /**
   * Analyze emotional patterns throughout discovery
   */
  analyzeEmotionalPattern() {
    const emotions = this.conversationHistory.map(entry => entry.emotionalTone);
    const counts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});
    
    const dominant = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    
    return {
      dominant,
      pattern: emotions,
      stability: this.calculateEmotionalStability(emotions)
    };
  }
  
  /**
   * Assess user's readiness for decision making
   */
  assessReadinessLevel() {
    const recentEmotions = this.conversationHistory.slice(-3).map(entry => entry.emotionalTone);
    const hasConfidence = recentEmotions.includes('confident');
    const hasClarity = this.conversationHistory.some(entry => 
      (entry.userInput || '').toLowerCase().includes('clear') || 
      (entry.userInput || '').toLowerCase().includes('certain')
    );
    
    if (hasConfidence && hasClarity) {
      return 'high';
    } else if (hasConfidence || hasClarity) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  /**
   * Generate final recommendations based on discovery process
   */
  generateFinalRecommendations() {
    const readiness = this.assessReadinessLevel();
    const recommendations = [];
    
    if (readiness === 'high') {
      recommendations.push({
        priority: 'immediate',
        action: 'Proceed with application strategy',
        reasoning: 'Clear alignment between values, goals, and opportunity'
      });
    } else if (readiness === 'medium') {
      recommendations.push({
        priority: 'soon',
        action: 'Clarify remaining concerns through research',
        reasoning: 'Strong foundation with specific areas needing validation'
      });
    } else {
      recommendations.push({
        priority: 'explore',
        action: 'Continue discovery process',
        reasoning: 'Additional exploration needed for confident decision-making'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Helper method to calculate emotional stability
   */
  calculateEmotionalStability(emotions) {
    if (emotions.length < 3) return 'insufficient_data';
    
    const changes = emotions.slice(1).map((emotion, index) => 
      emotion !== emotions[index] ? 1 : 0
    ).reduce((sum, change) => sum + change, 0);
    
    const changeRate = changes / (emotions.length - 1);
    
    if (changeRate < 0.3) return 'stable';
    if (changeRate < 0.6) return 'moderate';
    return 'variable';
  }
}

// Export for use in Recalibrate platform
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CIADiscoveryInterface;
} else if (typeof window !== 'undefined') {
  window.CIADiscoveryInterface = CIADiscoveryInterface;
}
