# API Reference

## Core Components

### Context Classification Engine

```javascript
// Organization Type Classification
const result = ContextClassifier.classifyOrganization(
  companyName,
  roleTitle,
  jobDescription
);

// Returns:
{
  type: "CORPORATE", // or UNION, NONPROFIT, ACADEMIC, GOVERNMENT
  confidence: 0.85,
  context: {
    values: [...],
    tone: "...",
    stakeholders: [...]
  },
  alternativeContexts: [...]
}
```

### Experience Translation Engine

```javascript
// Experience Translation
const translation = ExperienceTranslator.translateExperience(
  experienceType,
  organizationContext,
  specificAccomplishment
);

// Returns:
{
  reframedAccomplishment: "...",
  emphasizedValues: "...",
  relevantMetrics: "...",
  toneGuidance: "..."
}
```

### Tone Adaptation Engine

```javascript
// Tone Adaptation
const adaptedContent = ToneAdapter.adaptTone(
  content,
  organizationContext,
  roleLevel
);

// Returns adapted content with appropriate tone and language patterns
```

## Configuration Options

### Context Classification

```javascript
const config = {
  sensitivity: 0.8, // Classification sensitivity (0-1)
  minConfidence: 0.7, // Minimum confidence threshold
  maxAlternatives: 2 // Number of alternative contexts to return
};
```

### Experience Translation

```javascript
const translationConfig = {
  preserveMetrics: true, // Keep original metrics
  emphasizeValues: true, // Highlight organizational values
  toneConsistency: 0.9 // Tone consistency threshold
};
```

## Error Handling

```javascript
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
```

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
- Optional encryption for sensitive information 