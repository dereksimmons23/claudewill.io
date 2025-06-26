// package.json
{
  "name": "quantum-kitchen",
  "version": "1.0.0",
  "description": "Quantum Kitchen - Content Creation and Management System",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "test": "jest",
    "test:integration": "jest --config jest.integration.config.js",
    "lint": "eslint src/",
    "docs": "jsdoc -c jsdoc.config.json",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "googleapis": "^128.0.0",
    "lodash": "^4.17.21",
    "mathjs": "^12.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.22.20",
    "eslint": "^8.50.0",
    "jest": "^29.7.0",
    "jsdoc": "^4.0.2",
    "nodemon": "^3.0.1"
  }
}

// .eslintrc.json
{
  "env": {
    "node": true,
    "es2022": true,
    "jest": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}

// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['js'],
  testMatch: ['**/test/unit/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  verbose: true
};

// jest.integration.config.js
export default {
  ...config,
  testMatch: ['**/test/integration/**/*.test.js'],
  setupFilesAfterEnv: ['./test/setup.js']
};

// jsdoc.config.json
{
  "source": {
    "include": ["src"],
    "includePattern": ".js$",
    "excludePattern": "(node_modules/|docs)"
  },
  "plugins": ["plugins/markdown"],
  "templates": {
    "cleverLinks": true,
    "monospaceLinks": true
  },
  "opts": {
    "destination": "./docs",
    "recurse": true,
    "readme": "README.md"
  }
}

// .gitignore
node_modules/
coverage/
docs/
.env
*.log
.DS_Store

// src/index.js
import { QuantumKitchen } from './core/QuantumKitchen.js';

async function main() {
  try {
    const kitchen = new QuantumKitchen();
    await kitchen.initialize();
    console.log('Quantum Kitchen initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Quantum Kitchen:', error);
    process.exit(1);
  }
}

main();