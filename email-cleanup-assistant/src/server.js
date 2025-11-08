/**
 * Email Cleanup Assistant - Server
 * Main Express server handling API and WebSocket connections
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');

const config = require('../config/config');
const AIAssistant = require('./ai/assistant');
const RecipeRunner = require('./automation/recipe-runner');
const recipeParser = require('./utils/recipe-parser');
const credentialStore = require('./storage/credentials');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Global instances
let aiAssistant = null;
let recipeRunner = null;
let availableRecipes = [];

// WebSocket connections
const clients = new Set();

// Initialize
async function initialize() {
  try {
    // Load recipes
    availableRecipes = await recipeParser.loadAllRecipes(
      path.join(__dirname, 'recipes')
    );
    console.log(`Loaded ${availableRecipes.length} recipes`);

    // Initialize credential store
    if (config.security.encryptCredentials && config.security.masterPassword) {
      credentialStore.initialize(config.security.masterPassword);
    }

    // Initialize AI assistant
    aiAssistant = new AIAssistant(config.openai.apiKey);

    // Initialize recipe runner
    recipeRunner = new RecipeRunner();

    console.log('Email Cleanup Assistant initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error);
    throw error;
  }
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('New WebSocket client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      await handleWebSocketMessage(ws, data);
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket client disconnected');
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to Email Cleanup Assistant'
  }));
});

// Handle WebSocket messages
async function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case 'chat':
      const response = await aiAssistant.chat(data.message);
      ws.send(JSON.stringify({
        type: 'chat',
        message: response
      }));
      break;

    case 'get_recipes':
      const sites = recipeParser.listAvailableSites(availableRecipes);
      ws.send(JSON.stringify({
        type: 'recipes',
        sites
      }));
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Unknown message type'
      }));
  }
}

// Broadcast to all clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// REST API Routes

// Get available recipes
app.get('/api/recipes', (req, res) => {
  const sites = recipeParser.listAvailableSites(availableRecipes);
  res.json({ success: true, sites });
});

// Get specific recipe
app.get('/api/recipes/:id', (req, res) => {
  const recipe = recipeParser.getRecipeBySiteId(availableRecipes, req.params.id);
  if (recipe) {
    res.json({ success: true, recipe });
  } else {
    res.status(404).json({ success: false, error: 'Recipe not found' });
  }
});

// Chat with AI
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await aiAssistant.chat(message);
    res.json({
      success: true,
      response,
      stage: aiAssistant.getStage(),
      sessionData: aiAssistant.getSessionData()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute recipe
app.post('/api/execute', async (req, res) => {
  try {
    const { siteId, credentials, newEmail } = req.body;

    const recipe = recipeParser.getRecipeBySiteId(availableRecipes, siteId);
    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }

    // Store credentials
    credentialStore.setCredentials(siteId, credentials.username, credentials.password);

    // Execute recipe with progress updates
    const result = await recipeRunner.executeRecipe(
      recipe,
      credentials,
      newEmail,
      (progress) => {
        broadcast({
          type: 'progress',
          siteId,
          progress
        });
      }
    );

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get runner status
app.get('/api/status', (req, res) => {
  const status = recipeRunner ? recipeRunner.getStatus() : { status: 'not initialized' };
  res.json({ success: true, status });
});

// Reset session
app.post('/api/reset', (req, res) => {
  if (aiAssistant) {
    aiAssistant.reset();
  }
  credentialStore.clear();
  res.json({ success: true, message: 'Session reset' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    config: {
      aiEnabled: config.openai.enabled,
      recipesLoaded: availableRecipes.length
    }
  });
});

// Start server
async function start() {
  try {
    await initialize();

    server.listen(config.server.port, config.server.host, () => {
      console.log('═══════════════════════════════════════════════════');
      console.log('  Email Cleanup AI Assistant');
      console.log('═══════════════════════════════════════════════════');
      console.log(`  Server: http://${config.server.host}:${config.server.port}`);
      console.log(`  WebSocket: ws://${config.server.host}:${config.server.port}`);
      console.log(`  AI: ${config.openai.enabled ? 'Enabled (OpenAI)' : 'Rule-based fallback'}`);
      console.log(`  Recipes: ${availableRecipes.length} loaded`);
      console.log('═══════════════════════════════════════════════════');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  if (recipeRunner) {
    await recipeRunner.stop();
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start if run directly
if (require.main === module) {
  start();
}

module.exports = { app, start };
