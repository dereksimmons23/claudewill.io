const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      // Add custom rules here if needed
    },
  },
  {
    ignores: ['js/research/**', 'node_modules/**', '**/dist/**'],
  },
];
