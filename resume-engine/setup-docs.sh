#!/bin/bash

# Create docs directory if it doesn't exist
mkdir -p docs

# Function to create a markdown file with content
create_markdown_file() {
    local file_path=$1
    local content=$2
    echo "$content" > "$file_path"
    echo "Created $file_path"
}

# Create GETTING_STARTED.md
create_markdown_file "docs/GETTING_STARTED.md" "# Getting Started with Resume Engine 2.0

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Git

## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/resume-engine.git
cd resume-engine
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Basic Usage

1. **Input Your Experience**
   - Enter your professional experience
   - Add accomplishments using the WHO (What/How/Outcome) format
   - Include relevant metrics and outcomes

2. **Select Target Context**
   - Choose the organizational type (Corporate, Union, Nonprofit, Academic, Government)
   - Specify the role level
   - Add any specific organizational context

3. **Generate Resume**
   - The engine will automatically:
     - Analyze the context
     - Translate your experience
     - Adapt the tone
     - Generate appropriate messaging

4. **Review and Export**
   - Review the generated content
   - Make any necessary adjustments
   - Export in your preferred format

## Example

\`\`\`javascript
// Example of experience input
const experience = {
  role: \"Team Lead\",
  accomplishment: \"Led team of 10 developers to deliver project 2 weeks early\",
  metrics: \"20% efficiency improvement, \$500K cost savings\"
};

// Example of context selection
const context = {
  organizationType: \"CORPORATE\",
  roleLevel: \"MANAGER\",
  industry: \"TECHNOLOGY\"
};
\`\`\`

## Next Steps

- Read the [Architecture Overview](./ARCHITECTURE.md) to understand the system design
- Check the [API Reference](./API.md) for detailed usage
- Review [Best Practices](./BEST_PRACTICES.md) for optimal results

## Troubleshooting

Common issues and solutions:

1. **Installation Issues**
   - Clear npm cache: \`npm cache clean --force\`
   - Delete node_modules and reinstall: \`rm -rf node_modules && npm install\`

2. **Generation Issues**
   - Ensure all required fields are filled
   - Check context selection matches your target
   - Verify experience format follows WHO methodology

## Support

For additional help:
- Open an issue on GitHub
- Check the [FAQ](./FAQ.md)
- Review the [Troubleshooting Guide](./TROUBLESHOOTING.md)"

# Create API.md
create_markdown_file "docs/API.md" "# API Reference

## Core Components

### Context Classification Engine

\`\`\`javascript
// Organization Type Classification
const result = ContextClassifier.classifyOrganization(
  companyName,
  roleTitle,
  jobDescription
);

// Returns:
{
  type: \"CORPORATE\", // or UNION, NONPROFIT, ACADEMIC, GOVERNMENT
  confidence: 0.85,
  context: {
    values: [...],
    tone: \"...\",
    stakeholders: [...]
  },
  alternativeContexts: [...]
}
\`\`\`

### Experience Translation Engine

\`\`\`javascript
// Experience Translation
const translation = ExperienceTranslator.translateExperience(
  experienceType,
  organizationContext,
  specificAccomplishment
);

// Returns:
{
  reframedAccomplishment: \"...\",
  emphasizedValues: \"...\",
  relevantMetrics: \"...\",
  toneGuidance: \"...\"
}
\`\`\`

### Tone Adaptation Engine

\`\`\`javascript
// Tone Adaptation
const adaptedContent = ToneAdapter.adaptTone(
  content,
  organizationContext,
  roleLevel
);

// Returns adapted content with appropriate tone and language patterns
\`\`\`

## Configuration Options

### Context Classification

\`\`\`javascript
const config = {
  sensitivity: 0.8, // Classification sensitivity (0-1)
  minConfidence: 0.7, // Minimum confidence threshold
  maxAlternatives: 2 // Number of alternative contexts to return
};
\`\`\`

### Experience Translation

\`\`\`javascript
const translationConfig = {
  preserveMetrics: true, // Keep original metrics
  emphasizeValues: true, // Highlight organizational values
  toneConsistency: 0.9 // Tone consistency threshold
};
\`\`\`

## Error Handling

\`\`\`javascript
try {
  const result = await engine.process(input);
} catch (error) {
  if (error instanceof ContextClassificationError) {
    // Handle context classification errors
  } else if (error instanceof TranslationError) {
    // Handle translation errors
  } else {
    // Handle other errors
  }
}
\`\`\`

## Best Practices

1. **Context Classification**
   - Provide detailed job descriptions
   - Include company information
   - Specify industry context

2. **Experience Translation**
   - Use clear, measurable accomplishments
   - Include relevant metrics
   - Follow WHO methodology

3. **Tone Adaptation**
   - Consider role level
   - Match organizational culture
   - Maintain consistency

## Rate Limiting

- 100 requests per hour for free tier
- 1000 requests per hour for premium tier
- Batch processing available for large datasets

## Security

- All data processed locally
- No data stored on servers
- Optional encryption for sensitive information"

# Create BEST_PRACTICES.md
create_markdown_file "docs/BEST_PRACTICES.md" "# Best Practices for Resume Engine 2.0

## Experience Input

### WHO Methodology
- **What**: Clear, specific action or achievement
- **How**: Methodology or approach used
- **Outcome**: Measurable results and impact

Example:
\`\`\`javascript
{
  what: \"Led cross-functional team\",
  how: \"Implemented agile methodology and stakeholder alignment\",
  outcome: \"Delivered project 2 weeks early, 20% under budget\"
}
\`\`\`

### Metrics and Quantification
- Always include measurable outcomes
- Use specific numbers when possible
- Include both quantitative and qualitative results

### Context Relevance
- Match experience to target role
- Consider industry-specific terminology
- Align with organizational values

## Context Selection

### Organization Type
- Corporate: Focus on revenue, efficiency, growth
- Union: Emphasis on worker protection, collective bargaining
- Nonprofit: Highlight mission impact, community benefit
- Academic: Stress research, knowledge advancement
- Government: Focus on public service, transparency

### Role Level
- Executive: Strategic impact, organizational leadership
- Director: Department/function leadership
- Manager: Team leadership, operational excellence
- Individual Contributor: Technical expertise, project delivery

## Tone and Language

### Corporate
- Results-driven
- Efficiency-focused
- Market-oriented

### Union
- Worker-focused
- Protection-oriented
- Solidarity-building

### Nonprofit
- Mission-driven
- Impact-focused
- Community-oriented

### Academic
- Knowledge-focused
- Research-oriented
- Intellectually rigorous

### Government
- Service-oriented
- Transparent
- Publicly accountable

## Common Pitfalls to Avoid

1. **Generic Language**
   - ❌ \"Responsible for team management\"
   - ✅ \"Led 10-person team to deliver \$2M project\"

2. **Missing Metrics**
   - ❌ \"Improved process efficiency\"
   - ✅ \"Reduced processing time by 40%\"

3. **Context Mismatch**
   - ❌ Using corporate metrics for nonprofit role
   - ✅ Adapting metrics to organizational values

4. **Overemphasis on Technical Details**
   - ❌ Listing every technology used
   - ✅ Focusing on business impact and outcomes

## Optimization Tips

1. **Review Generated Content**
   - Check tone consistency
   - Verify metric accuracy
   - Ensure context alignment

2. **Customize Templates**
   - Adjust for industry standards
   - Match organizational culture
   - Consider role requirements

3. **Iterate and Refine**
   - Test different phrasings
   - Compare multiple versions
   - Gather feedback

## Success Metrics

1. **Content Quality**
   - Clarity of messaging
   - Relevance to context
   - Impact demonstration

2. **Technical Accuracy**
   - Proper formatting
   - Consistent style
   - Error-free content

3. **Business Impact**
   - Response rates
   - Interview conversion
   - Offer success"

# Create FAQ.md
create_markdown_file "docs/FAQ.md" "# Frequently Asked Questions

## General Questions

### What is Resume Engine 2.0?
Resume Engine 2.0 is an AI-powered resume adaptation system that understands different organizational contexts and automatically reframes professional experience to match target environments.

### How does it work?
The system uses three core engines:
1. Context Classification Engine
2. Experience Translation Engine
3. Tone Adaptation Engine

### Is it free to use?
The basic version is free for personal use. Premium features are available for professional use.

## Technical Questions

### What are the system requirements?
- Node.js v16 or higher
- npm v7 or higher
- Modern web browser

### How do I install it?
\`\`\`bash
git clone https://github.com/yourusername/resume-engine.git
cd resume-engine
npm install
npm run dev
\`\`\`

### Can I use it offline?
Yes, the core functionality works offline. Some advanced features may require internet connection.

## Usage Questions

### How do I input my experience?
Use the WHO (What/How/Outcome) format:
- What: Action or achievement
- How: Methodology used
- Outcome: Measurable results

### How do I select the right context?
Consider:
1. Organization type
2. Role level
3. Industry context
4. Target audience

### Can I customize the output?
Yes, you can:
- Adjust tone and language
- Modify metrics
- Customize templates
- Add personal branding

## Troubleshooting

### The system isn't recognizing my context
- Check organization type selection
- Verify job description input
- Ensure role level matches

### Generated content seems off
- Review input format
- Check context selection
- Verify metrics accuracy

### Export issues
- Check file format compatibility
- Verify export settings
- Ensure proper permissions

## Privacy and Security

### Is my data secure?
- All processing is done locally
- No data is stored on servers
- Optional encryption available

### Can I use it for sensitive information?
Yes, but:
- Use encryption for sensitive data
- Review output carefully
- Follow security best practices

## Support

### How do I get help?
- Check documentation
- Open GitHub issues
- Contact support

### Can I contribute?
Yes! See [Contributing Guidelines](./CONTRIBUTING.md)"

# Create TROUBLESHOOTING.md
create_markdown_file "docs/TROUBLESHOOTING.md" "# Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### npm install fails
\`\`\`bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
\`\`\`

#### Version conflicts
\`\`\`bash
# Check Node.js version
node -v

# Update npm
npm install -g npm@latest
\`\`\`

### Runtime Issues

#### Context Classification Errors
1. Check input format
2. Verify organization type
3. Ensure job description completeness

#### Translation Errors
1. Review experience format
2. Check context selection
3. Verify metrics accuracy

#### Tone Adaptation Issues
1. Confirm role level
2. Check organizational context
3. Verify language patterns

### Export Issues

#### PDF Generation Fails
1. Check file permissions
2. Verify template format
3. Ensure proper dependencies

#### Formatting Issues
1. Review template structure
2. Check style definitions
3. Verify export settings

## Error Messages

### \"Context Classification Failed\"
- Input: Verify job description format
- Context: Check organization type
- System: Clear cache and restart

### \"Translation Error\"
- Format: Review WHO structure
- Content: Check for invalid characters
- System: Update to latest version

### \"Export Failed\"
- Format: Verify export type
- Path: Check file permissions
- System: Clear temporary files

## Performance Issues

### Slow Processing
1. Check system resources
2. Clear cache
3. Optimize input size

### Memory Issues
1. Reduce batch size
2. Clear temporary files
3. Check system memory

## Debugging

### Enable Debug Mode
\`\`\`javascript
// In config.js
const config = {
  debug: true,
  logLevel: 'verbose'
};
\`\`\`

### Check Logs
\`\`\`bash
# View debug logs
npm run debug

# Check error logs
npm run logs
\`\`\`

## Recovery Steps

### System Reset
1. Backup data
2. Clear cache
3. Reinstall dependencies

### Data Recovery
1. Check backup files
2. Restore from last save
3. Verify data integrity

## Prevention

### Regular Maintenance
1. Update dependencies
2. Clear cache
3. Check system health

### Best Practices
1. Regular backups
2. Version control
3. Error logging

## Support

### Getting Help
1. Check documentation
2. Search issues
3. Contact support

### Reporting Issues
1. Gather error logs
2. Document steps
3. Submit issue report"

# Create NAVIGATION.md
create_markdown_file "docs/NAVIGATION.md" "# Documentation Navigation

## Getting Started
- [Quick Start Guide](./GETTING_STARTED.md)
- [Installation](./GETTING_STARTED.md#installation)
- [Basic Usage](./GETTING_STARTED.md#basic-usage)

## Core Concepts
- [Architecture Overview](./ARCHITECTURE.md)
- [Context Classification](./ARCHITECTURE.md#context-classification-engine)
- [Experience Translation](./ARCHITECTURE.md#experience-translation-engine)
- [Tone Adaptation](./ARCHITECTURE.md#tone-adaptation-engine)

## API Reference
- [Core Components](./API.md#core-components)
- [Configuration Options](./API.md#configuration-options)
- [Error Handling](./API.md#error-handling)

## Best Practices
- [Experience Input](./BEST_PRACTICES.md#experience-input)
- [Context Selection](./BEST_PRACTICES.md#context-selection)
- [Tone and Language](./BEST_PRACTICES.md#tone-and-language)
- [Common Pitfalls](./BEST_PRACTICES.md#common-pitfalls-to-avoid)

## Troubleshooting
- [Common Issues](./TROUBLESHOOTING.md#common-issues-and-solutions)
- [Error Messages](./TROUBLESHOOTING.md#error-messages)
- [Debugging](./TROUBLESHOOTING.md#debugging)
- [Recovery Steps](./TROUBLESHOOTING.md#recovery-steps)

## Contributing
- [Development Process](./CONTRIBUTING.md#development-process)
- [Pull Request Process](./CONTRIBUTING.md#pull-request-process)
- [Coding Style](./CONTRIBUTING.md#use-a-consistent-coding-style)

## FAQ
- [General Questions](./FAQ.md#general-questions)
- [Technical Questions](./FAQ.md#technical-questions)
- [Usage Questions](./FAQ.md#usage-questions)
- [Privacy and Security](./FAQ.md#privacy-and-security)"

# Move existing architecture documentation
if [ -f "V2_ARCHITECTURE.md" ]; then
    cp "V2_ARCHITECTURE.md" "docs/ARCHITECTURE.md"
    echo "Moved V2_ARCHITECTURE.md to docs/ARCHITECTURE.md"
fi

# Make the script executable
chmod +x setup-docs.sh

echo "Documentation structure created successfully!" 