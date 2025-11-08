/**
 * AI Assistant Prompts
 * System prompts and conversation templates
 */

const SYSTEM_PROMPT = `You are an Email Cleanup AI Assistant, designed to help users consolidate their online accounts under a single email address.

Your role is to:
1. Guide users through the email consolidation process
2. Explain what's happening during automation
3. Provide clear manual instructions when automation fails
4. Be encouraging and helpful
5. Keep track of progress and provide summaries

Guidelines:
- Be concise but friendly
- Explain technical steps in simple terms
- Always confirm before taking automated actions
- Provide clear next steps
- If automation fails, give clear manual instructions

You have access to automation tools that can log in to sites and change email addresses automatically. When automation isn't possible, you provide step-by-step manual guidance.`;

const CONVERSATION_STAGES = {
  WELCOME: 'welcome',
  GATHER_INFO: 'gather_info',
  SITE_SELECTION: 'site_selection',
  EXECUTION: 'execution',
  VERIFICATION: 'verification',
  SUMMARY: 'summary'
};

const PROMPTS = {
  welcome: `Welcome! I'm your Email Cleanup Assistant. I'll help you update your online accounts to use a new email address.

To get started, I need to know:
1. Which email address are you switching FROM?
2. Which email address do you want to use instead?

Please provide both email addresses.`,

  siteSelection: (availableSites) => `Great! I found automation recipes for these sites:

${availableSites.map((site, i) => `${i + 1}. ${site.name} (${site.category})`).join('\n')}

Which sites would you like to update? You can:
- Type the numbers (e.g., "1, 3, 5")
- Type "all" to process all sites
- Type site names (e.g., "Netflix, GitHub")`,

  beforeAutomation: (siteName) => `I'm about to update your email on ${siteName}.

I'll need your current login credentials for this site. I'll:
1. Log in to your account
2. Navigate to account settings
3. Update your email address
4. Handle any verification steps

This will be done securely in a visible browser window so you can see what's happening.

Ready to proceed? (yes/no)`,

  duringAutomation: (siteName, step) => `Processing ${siteName}...
Current step: ${step}`,

  automationSuccess: (siteName, newEmail) => `✓ Successfully updated ${siteName} to ${newEmail}!`,

  automationFailed: (siteName, error, manualSteps) => `Unfortunately, I couldn't automatically update ${siteName}.
Error: ${error}

Here's how to do it manually:
${manualSteps}

Would you like me to continue with the next site?`,

  needsVerification: (siteName, verificationInfo) => `${siteName} requires email verification.

Please check your inbox (${verificationInfo.email_subject_contains ? `look for: "${verificationInfo.email_subject_contains}"` : ''}) and click the verification link.

Let me know when you've completed verification, or I can monitor your inbox if you'd like.`,

  needs2FA: (siteName, manualSteps) => `${siteName} requires two-factor authentication.

Please complete the 2FA verification manually, then let me know to continue. Alternatively, here are the manual steps:

${manualSteps}`,

  summary: (results) => {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const pending = results.filter(r => r.pending).length;

    return `
Email Cleanup Summary
=====================

✓ Successfully updated: ${successful} site${successful !== 1 ? 's' : ''}
✗ Failed: ${failed} site${failed !== 1 ? 's' : ''}
⏳ Pending verification: ${pending} site${pending !== 1 ? 's' : ''}

${results.map(r => {
  const icon = r.success ? '✓' : r.pending ? '⏳' : '✗';
  return `${icon} ${r.site}: ${r.message}`;
}).join('\n')}

${pending > 0 ? '\nRemember to check your email for verification links!' : ''}
${failed > 0 ? '\nFor failed sites, you can retry later or update them manually.' : ''}

Would you like to process any additional sites?`;
  }
};

function createSystemMessage() {
  return {
    role: 'system',
    content: SYSTEM_PROMPT
  };
}

function createUserMessage(content) {
  return {
    role: 'user',
    content
  };
}

function createAssistantMessage(content) {
  return {
    role: 'assistant',
    content
  };
}

module.exports = {
  SYSTEM_PROMPT,
  CONVERSATION_STAGES,
  PROMPTS,
  createSystemMessage,
  createUserMessage,
  createAssistantMessage
};
