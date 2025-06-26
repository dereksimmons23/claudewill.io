import React, { useState } from 'react';

const ATSDecoder = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [atsSystem, setATSSystem] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [email, setEmail] = useState('');

  // Industry-specific keywords database
  const industryKeywords = {
    tech: ['software', 'development', 'programming', 'agile', 'cloud', 'API', 'database', 'DevOps', 'machine learning', 'AI'],
    legal: ['litigation', 'compliance', 'regulatory', 'legal research', 'briefing', 'contract', 'analysis', 'due diligence'],
    consulting: ['strategy', 'analysis', 'client', 'project management', 'stakeholder', 'methodology', 'framework', 'transformation'],
    finance: ['financial analysis', 'budgeting', 'forecasting', 'risk management', 'compliance', 'reporting', 'modeling'],
    healthcare: ['patient care', 'clinical', 'medical', 'healthcare', 'treatment', 'diagnosis', 'protocol', 'compliance'],
    media: ['content', 'creative', 'brand', 'marketing', 'digital', 'social media', 'campaign', 'analytics'],
    retail: ['customer service', 'sales', 'inventory', 'merchandising', 'retail', 'customer experience'],
    manufacturing: ['operations', 'production', 'quality', 'safety', 'process improvement', 'lean', 'manufacturing']
  };

  const calculateATSScore = (resume, industry) => {
    let score = 70; // Base score
    
    // Check for standard sections
    if (resume.toLowerCase().includes('experience')) score += 5;
    if (resume.toLowerCase().includes('education')) score += 5;
    if (resume.toLowerCase().includes('skills')) score += 5;
    
    // Check for quantifiable achievements
    const numberMatches = resume.match(/\d+(\.\d+)?[%\+\-\$]/g);
    if (numberMatches && numberMatches.length > 3) score += 10;
    
    // Industry keyword check
    if (industry && industryKeywords[industry]) {
      const keywords = industryKeywords[industry];
      const foundKeywords = keywords.filter(keyword => 
        resume.toLowerCase().includes(keyword.toLowerCase())
      );
      score += Math.min(foundKeywords.length * 2, 15);
    }
    
    return Math.min(score, 98);
  };

  const generateRecommendations = (resume, industry) => {
    const recommendations = [];
    
    // Basic structure checks
    if (!resume.toLowerCase().includes('experience')) {
      recommendations.push({ text: 'Add a clear "Professional Experience" or "Work Experience" section', type: 'warning' });
    }
    
    if (!resume.toLowerCase().includes('skills')) {
      recommendations.push({ text: 'Include a dedicated "Skills" or "Core Competencies" section', type: 'warning' });
    }
    
    // Quantification check
    const numberMatches = resume.match(/\d+(\.\d+)?[%\+\-\$]/g);
    if (!numberMatches || numberMatches.length < 3) {
      recommendations.push({ text: 'Add more quantifiable achievements (percentages, dollar amounts, metrics)', type: 'warning' });
    }
    
    // Industry-specific recommendations
    if (industry && industryKeywords[industry]) {
      const keywords = industryKeywords[industry];
      const foundKeywords = keywords.filter(keyword => 
        resume.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (foundKeywords.length < keywords.length / 2) {
        recommendations.push({ 
          text: `Include more ${industry} industry keywords: ${keywords.slice(0, 5).join(', ')}`, 
          type: 'warning' 
        });
      }
    }
    
    // General best practices
    recommendations.push({ text: 'Use standard PDF format for best ATS compatibility', type: 'good' });
    recommendations.push({ text: 'Include exact keywords from job descriptions you\'re targeting', type: 'good' });
    recommendations.push({ text: 'Use standard fonts (Arial, Calibri, Times New Roman)', type: 'good' });
    
    return recommendations;
  };

  const analyzeResume = () => {
    if (!resumeText) {
      alert('Please paste your resume text first.');
      return;
    }

    const score = calculateATSScore(resumeText, targetIndustry);
    const recommendations = generateRecommendations(resumeText, targetIndustry);
    const keywords = targetIndustry ? industryKeywords[targetIndustry]?.slice(0, 8) : [];
    
    setAnalysisResults({
      score,
      recommendations,
      keywords,
      industry: targetIndustry
    });
  };

  const handleEmailCapture = () => {
    if (!email) {
      alert('Please enter your email address.');
      return;
    }
    
    // Here you would integrate with your email service (ConvertKit, Mailchimp, etc.)
    console.log('Email captured:', email);
    alert('Thanks! You\'ll be notified when the full ATS Decoder launches.');
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
          <h1 className="text-4xl font-bold mb-4">🔍 ATS Decoder</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Expose the hidden algorithms that filter out qualified candidates. 
            Based on 2,500+ hours of systematic job application research.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8 flex-wrap">
            <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <div className="text-3xl font-bold text-yellow-300">67%</div>
              <div className="text-sm opacity-80">Response Rate Achieved</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <div className="text-3xl font-bold text-yellow-300">15-20%</div>
              <div className="text-sm opacity-80">Industry Average</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <div className="text-3xl font-bold text-yellow-300">5 Days</div>
              <div className="text-sm opacity-80">Avg. Interview Time</div>
            </div>
          </div>
        </div>

        {/* Tool Grid */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Resume Analysis */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📄 Resume Analysis</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Paste your resume text:
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={8}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Copy and paste your complete resume here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Industry:
                  </label>
                  <select
                    value={targetIndustry}
                    onChange={(e) => setTargetIndustry(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select Industry</option>
                    <option value="tech">Technology</option>
                    <option value="legal">Legal Services</option>
                    <option value="consulting">Consulting</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="media">Media & Marketing</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                  </select>
                </div>

                <button
                  onClick={analyzeResume}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
                >
                  Analyze My Resume
                </button>
              </div>
            </div>

            {/* Job Description Matcher */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🎯 Job Description Matcher</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Paste job description:
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Copy the complete job description here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Known ATS System:
                  </label>
                  <select
                    value={atsSystem}
                    onChange={(e) => setATSSystem(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select if known</option>
                    <option value="workday">Workday</option>
                    <option value="lever">Lever</option>
                    <option value="greenhouse">Greenhouse</option>
                    <option value="jobvite">Jobvite</option>
                    <option value="other">Other/Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Size:
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select if known</option>
                    <option value="startup">Startup (&lt;100 employees)</option>
                    <option value="midsize">Mid-size (100-1000)</option>
                    <option value="large">Large (1000-5000)</option>
                    <option value="enterprise">Enterprise (5000+)</option>
                  </select>
                </div>

                <button
                  onClick={analyzeResume}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-full font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
                >
                  Match & Optimize
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {analysisResults && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 mb-8">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-green-600 mb-2">{analysisResults.score}%</div>
                <h3 className="text-2xl font-semibold text-gray-800">ATS Compatibility Score</h3>
              </div>
              
              {/* Keyword Analysis */}
              {analysisResults.keywords && analysisResults.keywords.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">📊 Keyword Analysis</h4>
                  <p className="text-gray-600 mb-4">
                    Key {analysisResults.industry} industry terms to include:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.keywords.map((keyword, index) => (
                      <span 
                        key={index}
                        className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <h4 className="text-xl font-semibold text-gray-800 mb-4">📋 Optimization Recommendations</h4>
              <ul className="space-y-3 mb-6">
                {analysisResults.recommendations.map((rec, index) => (
                  <li 
                    key={index}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${
                      rec.type === 'warning' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-green-50 border border-green-200'
                    }`}
                  >
                    <span className="text-lg">
                      {rec.type === 'warning' ? '⚠️' : '✅'}
                    </span>
                    <span className="text-gray-800">{rec.text}</span>
                  </li>
                ))}
              </ul>

              {/* Next Steps */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">🚀 Next Steps</h4>
                <p className="text-gray-600 mb-4">
                  Based on ATS Decoder research methodology. Want the complete optimization framework?
                </p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={handleEmailCapture}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Get Early Access
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Early Access CTA */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Full Platform Coming Soon</h2>
            <p className="text-xl mb-6 opacity-90">
              Be among the first to access the complete ATS Decoder methodology, advanced tools, and ongoing research insights.
            </p>
            <div className="flex max-w-md mx-auto gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 p-3 rounded-full text-gray-800 focus:outline-none"
              />
              <button
                onClick={handleEmailCapture}
                className="bg-white text-orange-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Early Access
              </button>
            </div>
            <p className="text-sm mt-4 opacity-75">
              Join the founding user community and help shape the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSDecoder;