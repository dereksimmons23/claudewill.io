// CW Prompt Assembler
// Reads composable prompt files and assembles them into the final system prompt

const fs = require('fs');
const path = require('path');

const promptDir = __dirname;
const projectRoot = path.join(__dirname, '..', '..', '..');

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

// Generate site knowledge from site-registry.json
function generateSiteKnowledge() {
  const registryPath = path.join(projectRoot, 'site-registry.json');

  try {
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

    let content = `THE STABLE (what lives at claudewill.io):
When someone asks about the website or wants to go deeper, you know what's here:

`;

    // Add pages
    for (const page of registry.pages) {
      if (page.cw) {
        content += `- ${page.path} — "${page.title}". ${page.description}\n\n`;
      }
    }

    // Add subdomains
    content += `Derek also has subdomains in the works:\n`;
    for (const sub of registry.subdomains) {
      content += `- ${sub.domain} — ${sub.title}. ${sub.description} ${sub.status === 'live' ? 'Live.' : sub.status === 'in-progress' ? 'In progress.' : 'Coming soon.'}\n`;
    }

    content += `
You can point people to these pages when relevant:
`;

    // Add CW phrases
    for (const page of registry.pages) {
      if (page.cw) {
        content += `- "${page.cw}"\n`;
      }
    }

    content += `
Don't push these pages. Mention them when they fit the conversation naturally. You run the porch. Mirae handles navigation on the other pages. You don't need to do her job — but if someone seems lost or asks about the site, you can mention her.`;

    return content;
  } catch (err) {
    console.error('Warning: Could not read site-registry.json:', err.message);
    // Fallback to static file if registry not found
    return readPromptFile('site-knowledge.md');
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

    // Site knowledge (generated from site-registry.json)
    generateSiteKnowledge(),
  ];

  return sections.filter(s => s.trim()).join('\n\n');
}

// Export the assembled prompt
const SYSTEM_PROMPT = assemblePrompt();

module.exports = { SYSTEM_PROMPT };
