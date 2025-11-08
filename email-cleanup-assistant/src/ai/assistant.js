/**
 * AI Assistant
 * Manages conversational flow and AI interactions
 */

const OpenAI = require('openai');
const {
  SYSTEM_PROMPT,
  CONVERSATION_STAGES,
  PROMPTS,
  createSystemMessage,
  createUserMessage,
  createAssistantMessage
} = require('./prompts');

class AIAssistant {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    this.client = this.apiKey ? new OpenAI({ apiKey: this.apiKey }) : null;
    this.conversationHistory = [createSystemMessage()];
    this.currentStage = CONVERSATION_STAGES.WELCOME;
    this.sessionData = {
      oldEmail: null,
      newEmail: null,
      selectedSites: [],
      results: []
    };
  }

  /**
   * Send a message and get AI response
   * @param {string} userMessage - User's message
   * @returns {string} AI response
   */
  async chat(userMessage) {
    // Add user message to history
    this.conversationHistory.push(createUserMessage(userMessage));

    if (!this.client) {
      // Fallback to rule-based responses if no API key
      return this.getRuleBasedResponse(userMessage);
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: this.conversationHistory,
        temperature: 0.7,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content;

      // Add assistant response to history
      this.conversationHistory.push(createAssistantMessage(response));

      return response;
    } catch (error) {
      console.error('AI error:', error.message);
      return this.getRuleBasedResponse(userMessage);
    }
  }

  /**
   * Rule-based fallback responses (when no AI API available)
   * @param {string} userMessage - User's message
   * @returns {string} Response
   */
  getRuleBasedResponse(userMessage) {
    const lower = userMessage.toLowerCase();

    // Extract emails from message
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = userMessage.match(emailRegex) || [];

    switch (this.currentStage) {
      case CONVERSATION_STAGES.WELCOME:
        if (emails.length >= 2) {
          this.sessionData.oldEmail = emails[0];
          this.sessionData.newEmail = emails[1];
          this.currentStage = CONVERSATION_STAGES.SITE_SELECTION;
          return `Perfect! I'll help you change from ${emails[0]} to ${emails[1]}.\n\nNext, I need to know which sites you'd like to update. You can tell me specific sites, or I can show you all available automated recipes.`;
        } else if (emails.length === 1) {
          if (!this.sessionData.oldEmail) {
            this.sessionData.oldEmail = emails[0];
            return `Got it! Old email: ${emails[0]}\n\nNow, what's the NEW email address you want to use?`;
          } else {
            this.sessionData.newEmail = emails[0];
            this.currentStage = CONVERSATION_STAGES.SITE_SELECTION;
            return `Perfect! I'll help you change from ${this.sessionData.oldEmail} to ${emails[0]}.\n\nNext, I need to know which sites you'd like to update.`;
          }
        }
        return PROMPTS.welcome;

      case CONVERSATION_STAGES.SITE_SELECTION:
        // User selected sites
        return `Great! I'll process those sites for you.\n\nTo proceed, I'll need your login credentials for each site. Don't worry - everything stays on your local machine and is only used for automation.`;

      case CONVERSATION_STAGES.EXECUTION:
        if (lower.includes('yes') || lower.includes('proceed') || lower.includes('continue')) {
          return `Starting automation...`;
        }
        if (lower.includes('no') || lower.includes('skip') || lower.includes('cancel')) {
          return `Okay, skipping this site. Let me know if you'd like to try another one.`;
        }
        return `I'm ready to proceed with the automation. Say "yes" to continue or "no" to skip.`;

      default:
        return `I'm here to help! You can ask me to:\n- Start the email update process\n- Show available sites\n- Get manual instructions for a site\n- See a summary of results`;
    }
  }

  /**
   * Get current conversation stage
   */
  getStage() {
    return this.currentStage;
  }

  /**
   * Set conversation stage
   */
  setStage(stage) {
    this.currentStage = stage;
  }

  /**
   * Get session data
   */
  getSessionData() {
    return this.sessionData;
  }

  /**
   * Update session data
   */
  updateSessionData(data) {
    this.sessionData = { ...this.sessionData, ...data };
  }

  /**
   * Add a system message (for automation updates)
   */
  addSystemUpdate(message) {
    this.conversationHistory.push({
      role: 'system',
      content: `[Automation Update] ${message}`
    });
  }

  /**
   * Generate a prompt for specific scenario
   */
  getPrompt(scenario, ...args) {
    const prompt = PROMPTS[scenario];
    if (typeof prompt === 'function') {
      return prompt(...args);
    }
    return prompt;
  }

  /**
   * Reset conversation
   */
  reset() {
    this.conversationHistory = [createSystemMessage()];
    this.currentStage = CONVERSATION_STAGES.WELCOME;
    this.sessionData = {
      oldEmail: null,
      newEmail: null,
      selectedSites: [],
      results: []
    };
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }
}

module.exports = AIAssistant;
