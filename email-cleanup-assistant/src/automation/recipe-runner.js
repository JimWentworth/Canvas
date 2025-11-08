/**
 * Recipe Runner
 * Coordinates recipe execution with automation engine
 */

const AutomationEngine = require('./engine');
const recipeParser = require('../utils/recipe-parser');

class RecipeRunner {
  constructor() {
    this.engine = new AutomationEngine();
    this.currentRecipe = null;
    this.status = 'idle'; // idle, running, paused, completed, failed
  }

  /**
   * Execute a recipe
   * @param {Object} recipe - Recipe to execute
   * @param {Object} credentials - User credentials
   * @param {string} newEmail - New email address
   * @param {Function} onProgress - Progress callback
   */
  async executeRecipe(recipe, credentials, newEmail, onProgress = null) {
    this.currentRecipe = recipe;
    this.status = 'running';

    try {
      // Initialize browser
      if (onProgress) {
        onProgress({
          step: 'initialize',
          message: 'Initializing browser...'
        });
      }

      await this.engine.initialize({ headless: false });

      // Login
      if (onProgress) {
        onProgress({
          step: 'login',
          message: `Logging in to ${recipe.name}...`
        });
      }

      const loginResult = await this.engine.login(recipe.login, credentials);

      if (!loginResult.success) {
        if (loginResult.needs2FA) {
          return {
            success: false,
            needs2FA: true,
            message: loginResult.message,
            manualSteps: recipe.manual_fallback
          };
        }

        throw new Error(`Login failed: ${loginResult.error}`);
      }

      // Execute profile flow
      if (onProgress) {
        onProgress({
          step: 'profile_flow',
          message: 'Updating email address...'
        });
      }

      const variables = {
        NEW_EMAIL: newEmail,
        OLD_EMAIL: credentials.username,
        PASSWORD: credentials.password
      };

      const flowResult = await this.engine.executeProfileFlow(
        recipe.profile_flow,
        variables
      );

      if (flowResult.needsVerification) {
        return {
          success: false,
          needsVerification: true,
          message: 'Email verification required',
          verificationInfo: recipe.verification,
          results: flowResult.results
        };
      }

      if (!flowResult.success) {
        const failedStep = flowResult.results.find(r => !r.success);
        throw new Error(`Step failed: ${failedStep?.description} - ${failedStep?.error}`);
      }

      // Success
      this.status = 'completed';

      if (onProgress) {
        onProgress({
          step: 'completed',
          message: `Email updated successfully on ${recipe.name}!`
        });
      }

      return {
        success: true,
        message: `Email successfully updated to ${newEmail}`,
        results: flowResult.results
      };

    } catch (error) {
      this.status = 'failed';

      if (onProgress) {
        onProgress({
          step: 'error',
          message: `Failed: ${error.message}`
        });
      }

      return {
        success: false,
        error: error.message,
        manualSteps: recipe.manual_fallback
      };
    } finally {
      // Keep browser open for debugging if there was an error
      if (this.status !== 'failed') {
        await this.engine.cleanup();
      }
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      status: this.status,
      currentRecipe: this.currentRecipe?.name || null,
      currentUrl: this.engine.getCurrentUrl()
    };
  }

  /**
   * Stop execution and cleanup
   */
  async stop() {
    this.status = 'idle';
    await this.engine.cleanup();
  }
}

module.exports = RecipeRunner;
