/**
 * ATS Intelligence Engine
 * Core module for analyzing and optimizing resumes for Applicant Tracking Systems
 * Based on live research conducted by Derek Simmons
 */

class ATSIntelligenceEngine {
  constructor() {
    this.platforms = {
      workday: {
        name: 'Workday',
        biasFactors: ['industry_experience_heavy', 'keyword_rigid', 'cross_domain_penalty'],
        optimization: {
          keywords: 'exact_match_priority',
          format: 'pdf_with_text_layer',
          sections: 'standard_order_required'
        },
        successRate: 0.23 // Based on research data
      },
      greenhouse: {
        name: 'Greenhouse',
        biasFactors: ['company_customizable', 'better_parsing', 'human_friendly'],
        optimization: {
          keywords: 'contextual_matching',
          format: 'flexible_parsing',
          sections: 'customizable_order'
        },
        successRate: 0.41
      },
      lever: {
        name: 'Lever',
        biasFactors: ['startup_friendly', 'skills_focused', 'culture_weighted'],
        optimization: {
          keywords: 'skills_priority',
          format: 'modern_design_ok',
          sections: 'skills_first'
        },
        successRate: 0.38
      }
    };
    
    this.industryKeywords = {
      technology: {
        primary: ['software', 'development', 'engineering', 'technical', 'systems', 'platform', 'architecture'],
        secondary: ['agile', 'scrum', 'deployment', 'infrastructure', 'cloud', 'API', 'database'],
        emerging: ['AI', 'machine learning', 'automation', 'digital transformation', 'DevOps']
      },
      legal: {
        primary: ['legal', 'attorney', 'counsel', 'compliance', 'regulatory', 'litigation', 'contract'],
        secondary: ['research', 'analysis', 'documentation', 'negotiation', 'risk management'],
        emerging: ['legal tech', 'AI tools', 'document automation', 'e-discovery']
      },
      healthcare: {
        primary: ['healthcare', 'medical', 'clinical', 'patient', 'treatment', 'diagnosis', 'therapy'],
        secondary: ['compliance', 'HIPAA', 'quality', 'safety', 'protocols', 'documentation'],
        emerging: ['telemedicine', 'digital health', 'health tech', 'patient experience']
      },
      finance: {
        primary: ['financial', 'investment', 'analysis', 'portfolio', 'risk', 'compliance', 'audit'],
        secondary: ['modeling', 'forecasting', 'reporting', 'regulatory', 'banking', 'insurance'],
        emerging: ['fintech', 'blockchain', 'algorithmic trading', 'robo-advisory']
      }
    };
    
    this.crossDomainTranslations = {
      'media_to_tech': {
        'content strategy': 'product strategy',
        'audience development': 'user acquisition',
        'editorial oversight': 'product management',
        'brand development': 'product marketing',
        'creative direction': 'design leadership'
      },
      'tech_to_finance': {
        'system architecture': 'infrastructure design',
        'data pipeline': 'financial modeling',
        'user experience': 'client experience',
        'product launch': 'solution deployment'
      }
    };
  }
  
  /**
   * Detect ATS platform from job posting URL or company
   */
  detectATSPlatform(jobUrl, companyName) {
    const urlIndicators = {
      'myworkdayjobs.com': 'workday',
      'greenhouse.io': 'greenhouse',
      'jobs.lever.co': 'lever',
      'workable.com': 'workable',
      'smartrecruiters.com': 'smartrecruiters'
    };
    
    // Check URL patterns
    for (const [pattern, platform] of Object.entries(urlIndicators)) {
      if (jobUrl && jobUrl.includes(pattern)) {
        return this.platforms[platform] || this.platforms.workday; // Default to workday
      }
    }
    
    // Company-specific knowledge base
    const companyPlatforms = {
      'Thomson Reuters': 'workday',
      'Microsoft': 'workday',
      'Google': 'greenhouse',
      'Facebook': 'greenhouse',
      'Uber': 'greenhouse'
    };
    
    const detectedPlatform = companyPlatforms[companyName];
    return this.platforms[detectedPlatform] || this.platforms.workday;
  }
  
  /**
   * Analyze resume against ATS requirements
   */
  analyzeResume(resumeText, targetJobDescription, targetIndustry = 'technology') {
    const analysis = {
      overallScore: 0,
      breakdown: {},
      recommendations: [],
      riskFactors: [],
      optimizations: []
    };
    
    // Keyword Analysis
    const keywordAnalysis = this.analyzeKeywords(resumeText, targetJobDescription, targetIndustry);
    analysis.breakdown.keywords = keywordAnalysis;
    
    // Format Analysis
    const formatAnalysis = this.analyzeFormat(resumeText);
    analysis.breakdown.format = formatAnalysis;
    
    // Cross-Domain Translation Analysis
    const translationAnalysis = this.analyzeCrossDomainValue(resumeText, targetIndustry);
    analysis.breakdown.translation = translationAnalysis;
    
    // ATS Compatibility Score
    analysis.overallScore = this.calculateOverallScore(analysis.breakdown);
    
    // Generate Recommendations
    analysis.recommendations = this.generateRecommendations(analysis.breakdown);
    analysis.riskFactors = this.identifyRiskFactors(analysis.breakdown);
    analysis.optimizations = this.suggestOptimizations(analysis.breakdown, targetIndustry);
    
    return analysis;
  }
  
  /**
   * Analyze keyword matching between resume and job description
   */
  analyzeKeywords(resumeText, jobDescription, industry) {
    const resumeWords = this.extractKeywords(resumeText.toLowerCase());
    const jobWords = this.extractKeywords(jobDescription.toLowerCase());
    const industryKeywords = this.industryKeywords[industry] || this.industryKeywords.technology;
    
    // Primary keyword matching
    const primaryMatches = industryKeywords.primary.filter(keyword => 
      resumeWords.includes(keyword) && jobWords.includes(keyword)
    );
    
    // Secondary keyword matching  
    const secondaryMatches = industryKeywords.secondary.filter(keyword =>
      resumeWords.includes(keyword) && jobWords.includes(keyword)
    );
    
    // Emerging keyword matching
    const emergingMatches = industryKeywords.emerging.filter(keyword =>
      resumeWords.includes(keyword) && jobWords.includes(keyword)
    );
    
    // Missing critical keywords
    const missingPrimary = industryKeywords.primary.filter(keyword =>
      jobWords.includes(keyword) && !resumeWords.includes(keyword)
    );
    
    const matchScore = (
      (primaryMatches.length / industryKeywords.primary.length) * 0.6 +
      (secondaryMatches.length / industryKeywords.secondary.length) * 0.3 +
      (emergingMatches.length / industryKeywords.emerging.length) * 0.1
    ) * 100;
    
    return {
      score: Math.min(matchScore, 100),
      primaryMatches,
      secondaryMatches,
      emergingMatches,
      missingPrimary,
      totalMatches: primaryMatches.length + secondaryMatches.length + emergingMatches.length
    };
  }
  
  /**
   * Analyze resume format for ATS compatibility
   */
  analyzeFormat(resumeText) {
    const analysis = {
      score: 100,
      issues: [],
      strengths: []
    };
    
    // Check for problematic formatting
    if (resumeText.includes('│') || resumeText.includes('┌') || resumeText.includes('█')) {
      analysis.issues.push('Complex ASCII art or tables detected - may confuse ATS parsing');
      analysis.score -= 15;
    }
    
    // Check for standard sections
    const standardSections = ['experience', 'education', 'skills', 'summary'];
    const hasStandardSections = standardSections.filter(section => 
      resumeText.toLowerCase().includes(section)
    );
    
    if (hasStandardSections.length >= 3) {
      analysis.strengths.push('Contains standard resume sections');
    } else {
      analysis.issues.push('Missing standard resume sections');
      analysis.score -= 10;
    }
    
    // Check for consistent formatting
    const bulletPoints = (resumeText.match(/[•·‣▪▫‒–—]/g) || []).length;
    if (bulletPoints > 5) {
      analysis.strengths.push('Uses consistent bullet point formatting');
    }
    
    // Check for contact information
    const hasEmail = /@/.test(resumeText);
    const hasPhone = /\d{3}[-.)]\d{3}[-.)]\d{4}/.test(resumeText);
    
    if (hasEmail && hasPhone) {
      analysis.strengths.push('Contains complete contact information');
    } else {
      analysis.issues.push('Missing complete contact information');
      analysis.score -= 5;
    }
    
    return analysis;
  }
  
  /**
   * Analyze cross-domain value translation
   */
  analyzeCrossDomainValue(resumeText, targetIndustry) {
    const analysis = {
      score: 0,
      translations: [],
      opportunities: [],
      warnings: []
    };
    
    // Detect current industry experience
    const currentIndustry = this.detectCurrentIndustry(resumeText);
    const translationKey = `${currentIndustry}_to_${targetIndustry}`;
    
    if (this.crossDomainTranslations[translationKey]) {
      const translations = this.crossDomainTranslations[translationKey];
      
      Object.entries(translations).forEach(([originalTerm, translatedTerm]) => {
        if (resumeText.toLowerCase().includes(originalTerm)) {
          analysis.translations.push({
            original: originalTerm,
            translated: translatedTerm,
            impact: 'high'
          });
          analysis.score += 15;
        }
      });
      
      if (analysis.translations.length === 0) {
        analysis.warnings.push(`Cross-domain transition detected but no experience translation applied`);
        analysis.opportunities.push(`Consider translating ${currentIndustry} experience using ${targetIndustry} terminology`);
      }
    }
    
    return analysis;
  }
  
  /**
   * Calculate overall ATS compatibility score
   */
  calculateOverallScore(breakdown) {
    const weights = {
      keywords: 0.5,
      format: 0.3,
      translation: 0.2
    };
    
    return Math.round(
      breakdown.keywords.score * weights.keywords +
      breakdown.format.score * weights.format +
      breakdown.translation.score * weights.translation
    );
  }
  
  /**
   * Generate optimization recommendations
   */
  generateRecommendations(breakdown) {
    const recommendations = [];
    
    // Keyword recommendations
    if (breakdown.keywords.score < 60) {
      recommendations.push({
        priority: 'high',
        category: 'keywords',
        title: 'Improve keyword matching',
        description: `Add missing primary keywords: ${breakdown.keywords.missingPrimary.join(', ')}`,
        impact: 'Significantly increases ATS score and interview likelihood'
      });
    }
    
    // Format recommendations
    if (breakdown.format.issues.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'format',
        title: 'Fix formatting issues',
        description: breakdown.format.issues.join('; '),
        impact: 'Prevents ATS parsing errors and content loss'
      });
    }
    
    // Translation recommendations
    if (breakdown.translation.opportunities.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'translation',
        title: 'Translate cross-domain experience',
        description: breakdown.translation.opportunities[0],
        impact: 'Helps ATS recognize transferable skills and experience value'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Identify risk factors for ATS rejection
   */
  identifyRiskFactors(breakdown) {
    const risks = [];
    
    if (breakdown.keywords.score < 40) {
      risks.push({
        level: 'critical',
        factor: 'Insufficient keyword matching',
        probability: 0.85,
        description: 'Very high likelihood of automatic rejection due to poor keyword alignment'
      });
    }
    
    if (breakdown.translation.warnings.length > 0) {
      risks.push({
        level: 'high',
        factor: 'Cross-domain experience not translated',
        probability: 0.70,
        description: 'ATS likely to miss transferable skills without industry-specific terminology'
      });
    }
    
    if (breakdown.format.score < 70) {
      risks.push({
        level: 'medium',
        factor: 'Format compatibility issues',
        probability: 0.45,
        description: 'ATS parsing errors may result in incomplete or corrupted resume content'
      });
    }
    
    return risks;
  }
  
  /**
   * Suggest specific optimizations
   */
  suggestOptimizations(breakdown, targetIndustry) {
    const optimizations = [];
    
    // Platform-specific optimizations
    const platform = this.platforms.workday; // Default to most common
    
    optimizations.push({
      type: 'keyword_integration',
      title: 'Strategic keyword integration',
      instructions: [
        'Include primary keywords in summary section',
        'Use exact keyword phrases from job description',
        'Distribute keywords naturally throughout experience descriptions',
        'Include industry-specific terminology in skills section'
      ]
    });
    
    optimizations.push({
      type: 'format_optimization',
      title: 'ATS-friendly formatting',
      instructions: [
        'Use standard section headers (Experience, Education, Skills)',
        'Maintain consistent bullet point style',
        'Avoid complex tables or multi-column layouts',
        'Include clear contact information at top'
      ]
    });
    
    if (breakdown.translation.translations.length > 0) {
      optimizations.push({
        type: 'experience_translation',
        title: 'Cross-domain experience translation',
        instructions: breakdown.translation.translations.map(t => 
          `Replace "${t.original}" with "${t.translated}" in relevant contexts`
        )
      });
    }
    
    return optimizations;
  }
  
  /**
   * Helper methods
   */
  extractKeywords(text) {
    return text.split(/\s+/)
      .filter(word => word.length > 2)
      .map(word => word.replace(/[^\w]/g, ''));
  }
  
  detectCurrentIndustry(resumeText) {
    const text = resumeText.toLowerCase();
    
    if (text.includes('media') || text.includes('newspaper') || text.includes('publishing')) {
      return 'media';
    } else if (text.includes('software') || text.includes('engineering') || text.includes('developer')) {
      return 'tech';
    } else if (text.includes('healthcare') || text.includes('medical') || text.includes('clinical')) {
      return 'healthcare';
    } else if (text.includes('finance') || text.includes('banking') || text.includes('investment')) {
      return 'finance';
    }
    
    return 'general';
  }
  
  /**
   * Get success probability based on ATS platform and score
   */
  getSuccessProbability(atsScore, platform = 'workday') {
    const basePlatformRate = this.platforms[platform]?.successRate || 0.25;
    const scoreMultiplier = atsScore / 100;
    
    return Math.min(basePlatformRate * scoreMultiplier * 2, 0.95);
  }
}

// Export for use in Recalibrate platform
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ATSIntelligenceEngine;
} else if (typeof window !== 'undefined') {
  window.ATSIntelligenceEngine = ATSIntelligenceEngine;
}
