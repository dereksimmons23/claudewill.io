/**
 * Decision Matrix Engine
 * Integrates emotional intelligence with logical analysis for career decisions
 * Balances cognition, emotion, and intuition in professional choice-making
 */

class DecisionMatrixEngine {
  constructor() {
    this.criteria = {
      cognitive: {
        compensation: { weight: 0.2, description: 'Salary, benefits, financial package' },
        growth: { weight: 0.15, description: 'Career advancement opportunities' },
        skills: { weight: 0.15, description: 'Skill development and learning' },
        stability: { weight: 0.1, description: 'Job security and company stability' },
        location: { weight: 0.1, description: 'Geographic and commute factors' }
      },
      emotional: {
        culture: { weight: 0.2, description: 'Company culture and team dynamics' },
        mission: { weight: 0.15, description: 'Purpose and mission alignment' },
        leadership: { weight: 0.1, description: 'Leadership style and management quality' },
        worklife: { weight: 0.1, description: 'Work-life balance and flexibility' },
        energy: { weight: 0.1, description: 'Personal energy and excitement level' }
      },
      intuitive: {
        gut_feeling: { weight: 0.3, description: 'Overall intuitive sense about opportunity' },
        long_term_vision: { weight: 0.25, description: 'Instinctive sense of long-term potential' },
        red_flags: { weight: 0.25, description: 'Subconscious warning signs or concerns' },
        synchronicity: { weight: 0.2, description: 'Sense of timing and alignment' }
      }
    };
    
    this.opportunities = [];
    this.userProfile = {
      decisionStyle: 'balanced', // analytical, intuitive, balanced
      priorities: [],
      riskTolerance: 'medium', // low, medium, high
      careerStage: 'mid', // early, mid, senior, transition
      values: []
    };
    
    this.emotionalStateIndicators = {
      energized: ['excited', 'energized', 'motivated', 'inspired', 'enthusiastic'],
      drained: ['tired', 'drained', 'exhausted', 'overwhelmed', 'stressed'],
      conflicted: ['torn', 'conflicted', 'unsure', 'mixed', 'confused'],
      aligned: ['aligned', 'right', 'perfect', 'clear', 'certain'],
      concerned: ['worried', 'concerned', 'nervous', 'anxious', 'hesitant']
    };
  }
  
  /**
   * Add opportunity for evaluation
   */
  addOpportunity(opportunity) {
    const opportunityWithId = {
      id: this.generateId(),
      ...opportunity,
      scores: {
        cognitive: {},
        emotional: {},
        intuitive: {}
      },
      overallScore: 0,
      riskAssessment: null,
      recommendations: [],
      timestamp: new Date().toISOString()
    };
    
    this.opportunities.push(opportunityWithId);
    return opportunityWithId.id;
  }
  
  /**
   * Score opportunity across all dimensions
   */
  scoreOpportunity(opportunityId, scores, emotionalInput = '') {
    const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) throw new Error('Opportunity not found');
    
    // Process cognitive scores
    opportunity.scores.cognitive = this.processCognitiveScores(scores.cognitive || {});
    
    // Process emotional scores with NLP enhancement
    opportunity.scores.emotional = this.processEmotionalScores(
      scores.emotional || {}, 
      emotionalInput
    );
    
    // Process intuitive scores
    opportunity.scores.intuitive = this.processIntuitiveScores(scores.intuitive || {});
    
    // Calculate integrated score
    opportunity.overallScore = this.calculateIntegratedScore(opportunity.scores);
    
    // Assess risk factors
    opportunity.riskAssessment = this.assessRiskFactors(opportunity.scores);
    
    // Generate recommendations
    opportunity.recommendations = this.generateRecommendations(opportunity);
    
    return opportunity;
  }
  
  /**
   * Process cognitive (logical) scoring
   */
  processCognitiveScores(cognitiveScores) {
    const processed = {};
    const criteria = this.criteria.cognitive;
    
    Object.keys(criteria).forEach(criterion => {
      const score = cognitiveScores[criterion] || 5; // Default to neutral
      const weight = criteria[criterion].weight;
      
      processed[criterion] = {
        raw: score,
        weighted: score * weight,
        impact: this.calculateImpact(score, weight)
      };
    });
    
    // Calculate cognitive total
    const total = Object.values(processed).reduce((sum, item) => sum + item.weighted, 0);
    processed.total = Math.round(total * 100) / 100;
    
    return processed;
  }
  
  /**
   * Process emotional scoring with NLP analysis
   */
  processEmotionalScores(emotionalScores, emotionalInput) {
    const processed = {};
    const criteria = this.criteria.emotional;
    
    // Analyze emotional language for automatic scoring enhancement
    const emotionalAnalysis = this.analyzeEmotionalLanguage(emotionalInput);
    
    Object.keys(criteria).forEach(criterion => {
      let score = emotionalScores[criterion] || 5;
      const weight = criteria[criterion].weight;
      
      // Enhance score based on emotional language analysis
      if (emotionalAnalysis.adjustments[criterion]) {
        score = Math.max(1, Math.min(10, score + emotionalAnalysis.adjustments[criterion]));
      }
      
      processed[criterion] = {
        raw: score,
        adjusted: score !== emotionalScores[criterion],
        weighted: score * weight,
        impact: this.calculateImpact(score, weight)
      };
    });
    
    // Add emotional state analysis
    processed.emotionalState = emotionalAnalysis.state;
    processed.confidence = emotionalAnalysis.confidence;
    
    const total = Object.values(processed)
      .filter(item => typeof item === 'object' && item.weighted)
      .reduce((sum, item) => sum + item.weighted, 0);
    processed.total = Math.round(total * 100) / 100;
    
    return processed;
  }
  
  /**
   * Process intuitive (gut feeling) scoring
   */
  processIntuitiveScores(intuitiveScores) {
    const processed = {};
    const criteria = this.criteria.intuitive;
    
    Object.keys(criteria).forEach(criterion => {
      const score = intuitiveScores[criterion] || 5;
      const weight = criteria[criterion].weight;
      
      processed[criterion] = {
        raw: score,
        weighted: score * weight,
        impact: this.calculateImpact(score, weight),
        confidence: this.assessIntuitiveConfidence(criterion, score)
      };
    });
    
    const total = Object.values(processed).reduce((sum, item) => sum + item.weighted, 0);
    processed.total = Math.round(total * 100) / 100;
    
    return processed;
  }
  
  /**
   * Analyze emotional language for automatic score adjustment
   */
  analyzeEmotionalLanguage(text) {
    const analysis = {
      state: 'neutral',
      confidence: 0.5,
      adjustments: {}
    };
    
    if (!text || text.trim().length === 0) return analysis;
    
    const lowerText = text.toLowerCase();
    
    // Detect overall emotional state
    Object.entries(this.emotionalStateIndicators).forEach(([state, indicators]) => {
      const matches = indicators.filter(indicator => lowerText.includes(indicator));
      if (matches.length > 0) {
        analysis.state = state;
        analysis.confidence = Math.min(0.9, 0.3 + (matches.length * 0.2));
      }
    });
    
    // Specific adjustments based on language patterns
    if (lowerText.includes('love the') || lowerText.includes('excited about')) {
      analysis.adjustments.culture = +2;
      analysis.adjustments.energy = +2;
    }
    
    if (lowerText.includes('mission') || lowerText.includes('purpose') || lowerText.includes('meaningful')) {
      analysis.adjustments.mission = +1.5;
    }
    
    if (lowerText.includes('leadership') || lowerText.includes('manager') || lowerText.includes('boss')) {
      if (lowerText.includes('great') || lowerText.includes('excellent') || lowerText.includes('inspiring')) {
        analysis.adjustments.leadership = +2;
      } else if (lowerText.includes('concerned') || lowerText.includes('worried')) {
        analysis.adjustments.leadership = -1.5;
      }
    }
    
    if (lowerText.includes('work life') || lowerText.includes('balance') || lowerText.includes('flexibility')) {
      if (lowerText.includes('good') || lowerText.includes('flexible') || lowerText.includes('understanding')) {
        analysis.adjustments.worklife = +1.5;
      }
    }
    
    if (lowerText.includes('gut') || lowerText.includes('feeling') || lowerText.includes('instinct')) {
      if (lowerText.includes('positive') || lowerText.includes('good') || lowerText.includes('right')) {
        analysis.adjustments.gut_feeling = +1;
      } else if (lowerText.includes('off') || lowerText.includes('wrong') || lowerText.includes('concerned')) {
        analysis.adjustments.gut_feeling = -1;
      }
    }
    
    return analysis;
  }
  
  /**
   * Calculate integrated score across all dimensions
   */
  calculateIntegratedScore(scores) {
    const weights = {
      cognitive: 0.4,
      emotional: 0.35,
      intuitive: 0.25
    };
    
    const cognitiveScore = (scores.cognitive.total / this.maxPossibleScore('cognitive')) * 10;
    const emotionalScore = (scores.emotional.total / this.maxPossibleScore('emotional')) * 10;
    const intuitiveScore = (scores.intuitive.total / this.maxPossibleScore('intuitive')) * 10;
    
    const integrated = (
      cognitiveScore * weights.cognitive +
      emotionalScore * weights.emotional +
      intuitiveScore * weights.intuitive
    );
    
    return Math.round(integrated * 100) / 100;
  }
  
  /**
   * Assess risk factors based on score patterns
   */
  assessRiskFactors(scores) {
    const risks = [];
    
    // Cognitive-Emotional misalignment
    const cognitiveAvg = scores.cognitive.total / this.maxPossibleScore('cognitive') * 10;
    const emotionalAvg = scores.emotional.total / this.maxPossibleScore('emotional') * 10;
    const gap = Math.abs(cognitiveAvg - emotionalAvg);
    
    if (gap > 3) {
      if (cognitiveAvg > emotionalAvg) {
        risks.push({
          level: 'medium',
          type: 'head_heart_conflict',
          description: 'Opportunity looks good logically but emotional factors suggest concerns',
          recommendation: 'Explore emotional concerns before proceeding'
        });
      } else {
        risks.push({
          level: 'medium',
          type: 'emotion_logic_conflict',
          description: 'Strong emotional appeal but practical factors may be challenging',
          recommendation: 'Ensure logical requirements are adequately addressed'
        });
      }
    }
    
    // Low intuitive scores with high logical scores
    const intuitiveAvg = scores.intuitive.total / this.maxPossibleScore('intuitive') * 10;
    if (cognitiveAvg > 7 && intuitiveAvg < 4) {
      risks.push({
        level: 'high',
        type: 'gut_check_warning',
        description: 'Strong logical appeal but gut instincts suggest caution',
        recommendation: 'Trust your instincts and investigate concerns further'
      });
    }
    
    // Specific red flag detection
    if (scores.intuitive.red_flags && scores.intuitive.red_flags.raw > 6) {
      risks.push({
        level: 'high',
        type: 'intuitive_warning',
        description: 'Subconscious warning signs detected',
        recommendation: 'Identify and address specific concerns before proceeding'
      });
    }
    
    // Low energy despite other positive factors
    if (scores.emotional.energy && scores.emotional.energy.raw < 4 && cognitiveAvg > 6) {
      risks.push({
        level: 'medium',
        type: 'energy_mismatch',
        description: 'Opportunity meets logical criteria but lacks personal energy',
        recommendation: 'Explore what might increase enthusiasm or consider other options'
      });
    }
    
    return risks;
  }
  
  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(opportunity) {
    const recommendations = [];
    const scores = opportunity.scores;
    
    // High score recommendations
    if (opportunity.overallScore >= 7.5) {
      recommendations.push({
        type: 'proceed',
        priority: 'high',
        title: 'Strong strategic fit',
        description: 'This opportunity shows excellent alignment across logical, emotional, and intuitive factors',
        action: 'Proceed with confidence while maintaining awareness of any identified risks'
      });
    }
    
    // Medium score recommendations
    else if (opportunity.overallScore >= 6) {
      recommendations.push({
        type: 'investigate',
        priority: 'medium',
        title: 'Promising opportunity with areas to explore',
        description: 'Good overall fit with specific areas that merit additional investigation',
        action: 'Address identified concerns and gather more information before final decision'
      });
    }
    
    // Low score recommendations
    else if (opportunity.overallScore < 5) {
      recommendations.push({
        type: 'reconsider',
        priority: 'low',
        title: 'Significant alignment concerns',
        description: 'Multiple factors suggest this opportunity may not be optimal',
        action: 'Consider whether changes could address concerns or if other opportunities might be better'
      });
    }
    
    // Specific factor recommendations
    const cognitiveAvg = scores.cognitive.total / this.maxPossibleScore('cognitive') * 10;
    const emotionalAvg = scores.emotional.total / this.maxPossibleScore('emotional') * 10;
    
    if (cognitiveAvg < 5) {
      recommendations.push({
        type: 'negotiate',
        priority: 'high',
        title: 'Address practical concerns',
        description: 'Logical factors need improvement for this to be a strong opportunity',
        action: 'Negotiate compensation, growth opportunities, or other practical elements'
      });
    }
    
    if (emotionalAvg < 5) {
      recommendations.push({
        type: 'cultural_research',
        priority: 'high',
        title: 'Investigate cultural fit',
        description: 'Emotional factors suggest potential culture or mission misalignment',
        action: 'Research company culture, interview team members, and assess value alignment'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Compare multiple opportunities
   */
  compareOpportunities() {
    if (this.opportunities.length < 2) {
      throw new Error('At least 2 opportunities required for comparison');
    }
    
    const comparison = {
      ranking: this.opportunities
        .sort((a, b) => b.overallScore - a.overallScore)
        .map((opp, index) => ({
          rank: index + 1,
          id: opp.id,
          title: opp.title,
          company: opp.company,
          overallScore: opp.overallScore,
          strengths: this.identifyStrengths(opp),
          concerns: this.identifyConcerns(opp)
        })),
      
      analysis: {
        topChoice: null,
        significantDifferences: [],
        recommendations: []
      }
    };
    
    // Identify top choice and significant differences
    const sorted = comparison.ranking;
    comparison.analysis.topChoice = sorted[0];
    
    // Check for significant score differences
    for (let i = 0; i < sorted.length - 1; i++) {
      const scoreDiff = sorted[i].overallScore - sorted[i + 1].overallScore;
      if (scoreDiff > 1.5) {
        comparison.analysis.significantDifferences.push({
          higher: sorted[i],
          lower: sorted[i + 1],
          difference: Math.round(scoreDiff * 100) / 100
        });
      }
    }
    
    // Generate comparison recommendations
    if (sorted[0].overallScore - sorted[1].overallScore < 0.5) {
      comparison.analysis.recommendations.push({
        type: 'close_decision',
        description: 'Top opportunities are very close - consider additional factors or gut feeling',
        action: 'Take time for reflection or gather additional information'
      });
    }
    
    return comparison;
  }
  
  /**
   * Helper methods
   */
  generateId() {
    return 'opp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }
  
  calculateImpact(score, weight) {
    return score * weight;
  }
  
  maxPossibleScore(dimension) {
    return Object.values(this.criteria[dimension]).reduce((sum, criteria) => sum + (10 * criteria.weight), 0);
  }
  
  assessIntuitiveConfidence(criterion, score) {
    // Extreme scores (very high or very low) typically indicate higher confidence
    const distance = Math.abs(score - 5.5);
    return Math.min(0.9, 0.3 + (distance / 5) * 0.6);
  }
  
  identifyStrengths(opportunity) {
    const strengths = [];
    const scores = opportunity.scores;
    
    Object.entries(scores.cognitive).forEach(([key, value]) => {
      if (value.raw >= 8 && key !== 'total') {
        strengths.push(`Strong ${key.replace('_', ' ')}`);
      }
    });
    
    Object.entries(scores.emotional).forEach(([key, value]) => {
      if (value.raw >= 8 && key !== 'total' && key !== 'emotionalState' && key !== 'confidence') {
        strengths.push(`Excellent ${key.replace('_', ' ')}`);
      }
    });
    
    return strengths;
  }
  
  identifyConcerns(opportunity) {
    const concerns = [];
    const scores = opportunity.scores;
    
    Object.entries(scores.cognitive).forEach(([key, value]) => {
      if (value.raw <= 3 && key !== 'total') {
        concerns.push(`Weak ${key.replace('_', ' ')}`);
      }
    });
    
    Object.entries(scores.emotional).forEach(([key, value]) => {
      if (value.raw <= 3 && key !== 'total' && key !== 'emotionalState' && key !== 'confidence') {
        concerns.push(`Poor ${key.replace('_', ' ')}`);
      }
    });
    
    return concerns;
  }
  
  /**
   * Export decision data for external use
   */
  exportDecisionData() {
    return {
      opportunities: this.opportunities,
      userProfile: this.userProfile,
      criteria: this.criteria,
      comparison: this.opportunities.length >= 2 ? this.compareOpportunities() : null,
      exportDate: new Date().toISOString()
    };
  }
}

// Export for use in Recalibrate platform
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DecisionMatrixEngine;
} else if (typeof window !== 'undefined') {
  window.DecisionMatrixEngine = DecisionMatrixEngine;
}
