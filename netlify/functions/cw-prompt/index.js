// CW Prompt Assembler
// Reads composable prompt files and assembles them into the final system prompt

const fs = require('fs');
const path = require('path');

const promptDir = __dirname;

// Read a markdown file and return its contents
function readPromptFile(filename) {
  const filePath = path.join(promptDir, filename);
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`Warning: Could not read ${filename}:`, err.message);
    return '';
  }
}

// Read all files in a subdirectory
function readPromptDir(dirname) {
  const dirPath = path.join(promptDir, dirname);
  try {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md')).sort();
    return files.map(f => readPromptFile(path.join(dirname, f))).join('\n\n');
  } catch (err) {
    console.error(`Warning: Could not read directory ${dirname}:`, err.message);
    return '';
  }
}

// Assemble the prompt in the correct order
function assemblePrompt() {
  const sections = [
    // Core identity
    readPromptFile('persona.md'),
    readPromptFile('family.md'),

    // Values
    readPromptFile('cw-standard.md'),

    // About Derek and CW Strategies
    readPromptFile('derek.md'),

    // Behaviors and how CW operates
    readPromptFile('behaviors.md'),

    // Skills (all files in skills/)
    readPromptDir('skills'),

    // Guardrails (all files in guardrails/)
    readPromptDir('guardrails'),

    // Site knowledge
    readPromptFile('site-knowledge.md'),
  ];

  return sections.filter(s => s.trim()).join('\n\n');
}

// Export the assembled prompt
const SYSTEM_PROMPT = assemblePrompt();

module.exports = { SYSTEM_PROMPT };
