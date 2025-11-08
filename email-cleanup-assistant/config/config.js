/**
 * Configuration
 */

require('dotenv').config();

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },

  // OpenAI API configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || null,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    enabled: !!process.env.OPENAI_API_KEY
  },

  // Automation configuration
  automation: {
    headless: process.env.HEADLESS === 'true',
    slowMo: parseInt(process.env.SLOW_MO || '100'),
    timeout: parseInt(process.env.TIMEOUT || '30000')
  },

  // Paths
  paths: {
    recipes: './src/recipes'
  },

  // Security
  security: {
    encryptCredentials: process.env.ENCRYPT_CREDENTIALS === 'true',
    masterPassword: process.env.MASTER_PASSWORD || null
  },

  // Development
  dev: {
    enableDebug: process.env.DEBUG === 'true',
    enableLogging: process.env.LOGGING !== 'false'
  }
};
