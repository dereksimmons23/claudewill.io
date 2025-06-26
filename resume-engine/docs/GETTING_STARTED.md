# Getting Started with Resume Engine 2.0

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/resume-engine.git
cd resume-engine
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

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

```javascript
// Example of experience input
const experience = {
  role: "Team Lead",
  accomplishment: "Led team of 10 developers to deliver project 2 weeks early",
  metrics: "20% efficiency improvement, $500K cost savings"
};

// Example of context selection
const context = {
  organizationType: "CORPORATE",
  roleLevel: "MANAGER",
  industry: "TECHNOLOGY"
};

// The engine will automatically translate this to appropriate messaging
// for the selected context
```

## Next Steps

- Read the [Architecture Overview](./ARCHITECTURE.md) to understand the system design
- Check the [API Reference](./API.md) for detailed usage
- Review [Best Practices](./BEST_PRACTICES.md) for optimal results

## Troubleshooting

Common issues and solutions:

1. **Installation Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

2. **Generation Issues**
   - Ensure all required fields are filled
   - Check context selection matches your target
   - Verify experience format follows WHO methodology

## Support

For additional help:
- Open an issue on GitHub
- Check the [FAQ](./FAQ.md)
- Review the [Troubleshooting Guide](./TROUBLESHOOTING.md) 