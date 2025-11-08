# Email Cleanup AI Assistant

**Automate and simplify the process of consolidating online accounts under a single email address.**

## Overview

The Email Cleanup AI Assistant is a local-first, privacy-focused tool that helps you update email addresses across multiple online accounts. It combines browser automation with conversational AI to make the email migration process efficient and user-friendly.

### Key Features

- **Automated Email Updates**: Automatically log in and change email addresses on supported sites
- **AI-Guided Process**: Conversational AI assistant guides you through the entire workflow
- **Local & Secure**: All operations run locally on your machine; credentials never leave your system
- **Recipe System**: Extensible YAML-based recipes for site-specific automation
- **Manual Fallback**: Step-by-step instructions when automation isn't possible
- **Real-time Progress**: Visual feedback and progress tracking
- **Browser Visibility**: See exactly what's happening during automation

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install chromium
   ```

3. **Configure environment (optional):**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key if you want AI features
   ```

### Running the Application

```bash
npm start
```

Then open your browser to: `http://localhost:3000`

## Usage

### Basic Workflow

1. Open the application in your browser
2. Chat with the AI assistant or use the direct automation panel
3. Select sites you want to update
4. Provide credentials for each site
5. Watch the automation run in a visible browser
6. Complete verification steps when required

### Using the Web Interface

**Chat Interface:**
- Type messages to the AI assistant
- Get guidance through the email migration process
- Ask questions about specific sites

**Direct Automation:**
1. Select a site from the "Available Sites" panel
2. Fill in your current credentials
3. Enter your new email address
4. Click "Execute" to start automation

## Supported Sites

Currently includes automation recipes for:

- **Netflix** (Streaming)
- **GitHub** (Developer)
- **Demo Site** (Testing)

### Adding New Sites

Create a new YAML file in `src/recipes/`:

```yaml
id: example-site
name: Example Site
category: Social
difficulty: easy

login:
  url: "https://example.com/login"
  username_selector: "#email"
  password_selector: "#password"
  submit_selector: "button[type=submit]"
  wait_after_login: 2000

profile_flow:
  steps:
    - action: navigate
      url: "https://example.com/settings/email"
      description: "Navigate to email settings"
    
    - action: fill
      selector: "#new-email"
      value: "{{NEW_EMAIL}}"
      description: "Enter new email"
    
    - action: click
      selector: "#save-button"
      description: "Save changes"

verification:
  required: true
  email_subject_contains: "Verify your email"

manual_fallback: |
  1. Log in to Example Site
  2. Go to Settings > Email
  3. Update your email address
  4. Check for verification email
```

## Configuration

### Environment Variables

Create a `.env` file from `.env.example`:

```env
# Server
PORT=3000
HOST=localhost

# OpenAI (optional - enables AI features)
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4

# Automation
HEADLESS=false          # Set to true for headless browser
SLOW_MO=100            # Slow down automation (ms)
TIMEOUT=30000          # Default timeout (ms)

# Security
ENCRYPT_CREDENTIALS=false
MASTER_PASSWORD=
```

## API Endpoints

### REST API

- `GET /api/recipes` - List all available site recipes
- `GET /api/recipes/:id` - Get specific recipe
- `POST /api/chat` - Send message to AI assistant
- `POST /api/execute` - Execute automation for a site
- `GET /api/status` - Get automation status
- `POST /api/reset` - Reset session
- `GET /api/health` - Health check

### WebSocket

Connect to `ws://localhost:3000` for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle messages: chat, progress, recipes, etc.
};
```

## Architecture

```
email-cleanup-assistant/
├── src/
│   ├── automation/
│   │   ├── engine.js           # Playwright automation engine
│   │   └── recipe-runner.js    # Recipe execution coordinator
│   ├── ai/
│   │   ├── assistant.js        # AI conversation manager
│   │   └── prompts.js          # AI prompts and templates
│   ├── recipes/
│   │   ├── netflix.yaml        # Site-specific recipes
│   │   ├── github.yaml
│   │   └── demo-site.yaml
│   ├── storage/
│   │   └── credentials.js      # Secure credential storage
│   ├── utils/
│   │   └── recipe-parser.js    # YAML parser and validator
│   └── server.js               # Express + WebSocket server
├── public/
│   ├── index.html              # Web interface
│   ├── styles.css              # Styling
│   └── app.js                  # Client-side JavaScript
└── config/
    └── config.js               # Configuration management
```

## Security & Privacy

### Local-First Design

- All automation runs on your local machine
- Credentials stored in memory only (not persisted to disk)
- No data sent to external servers (except OpenAI if configured)
- Browser automation is visible so you can see what's happening

### Best Practices

1. **Use a test account first** to verify automation works
2. **Enable 2FA after migration** for added security
3. **Review recipes** before running them on important accounts
4. **Keep old email active** until migration is fully complete
5. **Use a strong master password** if enabling credential encryption

### Warning

This tool automates login and account modification. Use responsibly:

- Only use on your own accounts
- Respect site Terms of Service
- Be aware that automation may break if sites change their UI
- Some sites may flag automated logins as suspicious

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses `nodemon` for auto-restart on file changes.

### Project Structure

**Core Components:**

1. **Automation Engine** (`src/automation/engine.js`)
   - Playwright-based browser automation
   - Handles login, navigation, form filling
   - Screenshot and error capture

2. **Recipe System** (`src/utils/recipe-parser.js`)
   - YAML-based recipe definitions
   - Validation and parsing
   - Recipe discovery

3. **AI Assistant** (`src/ai/assistant.js`)
   - Conversational interface
   - OpenAI integration (optional)
   - Rule-based fallback

4. **Web Server** (`src/server.js`)
   - Express REST API
   - WebSocket for real-time updates
   - Static file serving

## Troubleshooting

### Common Issues

**Browser not opening:**
- Run `npx playwright install chromium`
- Check that `HEADLESS=false` in .env

**OpenAI errors:**
- Verify your API key is correct
- The app will work without OpenAI using rule-based responses

**Recipe fails:**
- Website UI may have changed
- Check selector accuracy using browser DevTools
- Review recipe YAML syntax

**Credentials not working:**
- Verify username and password are correct
- Some sites may require 2FA (manual step required)
- Check for CAPTCHA or bot detection

## Roadmap

### MVP (Current)
- [x] Basic automation engine
- [x] Recipe system
- [x] AI conversational interface
- [x] Web UI
- [x] 3 example recipes

### Future Enhancements
- [ ] Email monitoring for verification links
- [ ] Password manager integration
- [ ] Bulk processing mode
- [ ] Recipe marketplace/repository
- [ ] Desktop app (Electron/Tauri)
- [ ] Enhanced security (OS keychain)
- [ ] Progress persistence
- [ ] Scheduled reminders
- [ ] Import accounts from inbox scan
- [ ] Multi-language support

## License

MIT License - See LICENSE file for details

## Disclaimer

This tool is provided as-is for personal use. The authors are not responsible for:
- Account lockouts or bans
- Data loss
- Terms of Service violations
- Any damages resulting from use of this software

Always review what the automation is doing and use at your own risk.

## Contributing

Contributions welcome! Areas of interest:

- New site recipes
- UI/UX improvements
- Security enhancements
- Bug fixes
- Documentation

## Support

For issues, questions, or feature requests, please open an issue on the repository.

---

**Email Cleanup AI Assistant v0.1.0** | Built with Playwright, Express, and OpenAI
