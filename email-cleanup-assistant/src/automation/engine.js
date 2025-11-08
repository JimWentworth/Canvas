/**
 * Automation Engine
 * Executes site automation recipes using Playwright
 */

const { chromium } = require('playwright');

class AutomationEngine {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Initialize browser
   * @param {Object} options - Browser options
   */
  async initialize(options = {}) {
    this.browser = await chromium.launch({
      headless: options.headless !== false,
      slowMo: options.slowMo || 100
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    this.page = await this.context.newPage();
  }

  /**
   * Perform login based on recipe
   * @param {Object} loginConfig - Login configuration from recipe
   * @param {Object} credentials - User credentials
   */
  async login(loginConfig, credentials) {
    try {
      await this.page.goto(loginConfig.url);

      // Wait for page to load
      await this.page.waitForLoadState('networkidle');

      // Fill username
      await this.page.fill(loginConfig.username_selector, credentials.username);

      // Fill password
      await this.page.fill(loginConfig.password_selector, credentials.password);

      // Submit form
      await this.page.click(loginConfig.submit_selector);

      // Wait after login
      if (loginConfig.wait_after_login) {
        await this.page.waitForTimeout(loginConfig.wait_after_login);
      }

      // Check if 2FA is required
      if (loginConfig.may_require_2fa) {
        const currentUrl = this.page.url();
        if (currentUrl.includes('2fa') || currentUrl.includes('verify')) {
          return {
            success: false,
            needs2FA: true,
            message: '2FA verification required - manual intervention needed'
          };
        }
      }

      return {
        success: true,
        message: 'Login successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute a single step from recipe
   * @param {Object} step - Step configuration
   * @param {Object} variables - Variables to replace (e.g., {{NEW_EMAIL}})
   */
  async executeStep(step, variables = {}) {
    try {
      switch (step.action) {
        case 'navigate':
          await this.page.goto(step.url);
          await this.page.waitForLoadState('networkidle');
          break;

        case 'wait':
          if (step.selector) {
            await this.page.waitForSelector(step.selector, {
              timeout: step.timeout || 30000
            });
          } else if (step.timeout) {
            await this.page.waitForTimeout(step.timeout);
          }
          break;

        case 'click':
          await this.page.click(step.selector);
          break;

        case 'fill':
          let value = step.value;
          // Replace variables
          for (const [key, val] of Object.entries(variables)) {
            value = value.replace(`{{${key}}}`, val);
          }
          await this.page.fill(step.selector, value);
          break;

        case 'type':
          let typeValue = step.value;
          for (const [key, val] of Object.entries(variables)) {
            typeValue = typeValue.replace(`{{${key}}}`, val);
          }
          await this.page.type(step.selector, typeValue);
          break;

        case 'select':
          await this.page.selectOption(step.selector, step.value);
          break;

        case 'screenshot':
          await this.page.screenshot({
            path: step.path || 'screenshot.png'
          });
          break;

        case 'waitForEmailVerification':
          // This would be handled by email monitoring system
          return {
            needsVerification: true,
            timeout: step.timeout || 300000
          };

        default:
          throw new Error(`Unknown action: ${step.action}`);
      }

      return {
        success: true,
        description: step.description
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        description: step.description
      };
    }
  }

  /**
   * Execute full profile flow
   * @param {Object} profileFlow - Profile flow configuration from recipe
   * @param {Object} variables - Variables for replacement
   */
  async executeProfileFlow(profileFlow, variables = {}) {
    const results = [];

    for (const step of profileFlow.steps) {
      const result = await this.executeStep(step, variables);
      results.push(result);

      if (!result.success && !result.needsVerification) {
        // Stop on first error (unless it's waiting for verification)
        break;
      }

      if (result.needsVerification) {
        // Return early to allow email verification to be handled
        return {
          success: false,
          needsVerification: true,
          results,
          timeout: result.timeout
        };
      }
    }

    return {
      success: results.every(r => r.success || r.needsVerification),
      results
    };
  }

  /**
   * Take a screenshot
   * @param {string} path - Path to save screenshot
   */
  async screenshot(path = 'screenshot.png') {
    if (this.page) {
      await this.page.screenshot({ path });
    }
  }

  /**
   * Get current page URL
   */
  getCurrentUrl() {
    return this.page ? this.page.url() : null;
  }

  /**
   * Clean up and close browser
   */
  async cleanup() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

module.exports = AutomationEngine;
