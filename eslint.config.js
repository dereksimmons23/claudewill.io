// ESLint 9 flat config format
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // Add custom rules here if needed
    },
  },
  // Handle ES modules
  {
    files: ['**/*-artifact.js', '**/chat-prompts-artifact.js'],
    languageOptions: {
      sourceType: 'module',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '**/dist/**',
      '.netlify/**',
      'recalibrate/**'
    ],
  },
];
