/**
 * Email Cleanup Assistant - Client Application
 */

class EmailCleanupApp {
  constructor() {
    this.ws = null;
    this.connected = false;
    this.recipes = [];
    this.selectedSite = null;

    this.elements = {
      chatMessages: document.getElementById('chatMessages'),
      userInput: document.getElementById('userInput'),
      sendBtn: document.getElementById('sendBtn'),
      sitesList: document.getElementById('sitesList'),
      refreshSitesBtn: document.getElementById('refreshSitesBtn'),
      actionPanel: document.getElementById('actionPanel'),
      siteSelect: document.getElementById('siteSelect'),
      username: document.getElementById('username'),
      password: document.getElementById('password'),
      newEmail: document.getElementById('newEmail'),
      executeBtn: document.getElementById('executeBtn'),
      resetBtn: document.getElementById('resetBtn'),
      status: document.getElementById('status'),
      statusText: document.getElementById('statusText'),
      progressModal: document.getElementById('progressModal'),
      progressSite: document.getElementById('progressSite'),
      progressStep: document.getElementById('progressStep'),
      progressFill: document.getElementById('progressFill')
    };

    this.init();
  }

  init() {
    this.connectWebSocket();
    this.setupEventListeners();
    this.loadRecipes();
  }

  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.connected = true;
      this.updateStatus('Connected', true);
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleWebSocketMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.updateStatus('Connection error', false);
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.updateStatus('Disconnected', false);
      console.log('WebSocket disconnected');

      // Attempt to reconnect after 3 seconds
      setTimeout(() => this.connectWebSocket(), 3000);
    };
  }

  handleWebSocketMessage(data) {
    switch (data.type) {
      case 'connected':
        // Request initial welcome message
        this.sendWebSocketMessage({ type: 'chat', message: 'hello' });
        break;

      case 'chat':
        this.addMessage(data.message, 'assistant');
        break;

      case 'recipes':
        this.recipes = data.sites;
        this.displayRecipes();
        break;

      case 'progress':
        this.updateProgress(data.progress);
        break;

      case 'error':
        this.addMessage(`Error: ${data.message}`, 'assistant');
        this.hideProgressModal();
        break;
    }
  }

  sendWebSocketMessage(data) {
    if (this.connected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  setupEventListeners() {
    // Send message
    this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
    this.elements.userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Refresh sites
    this.elements.refreshSitesBtn.addEventListener('click', () => this.loadRecipes());

    // Execute automation
    this.elements.executeBtn.addEventListener('click', () => this.executeAutomation());

    // Reset session
    this.elements.resetBtn.addEventListener('click', () => this.resetSession());
  }

  async sendMessage() {
    const message = this.elements.userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    this.addMessage(message, 'user');

    // Clear input
    this.elements.userInput.value = '';

    // Send via WebSocket
    this.sendWebSocketMessage({ type: 'chat', message });
  }

  addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const label = document.createElement('strong');
    label.textContent = sender === 'user' ? 'You:' : 'Assistant:';

    const text = document.createElement('p');
    text.textContent = content;

    contentDiv.appendChild(label);
    contentDiv.appendChild(text);
    messageDiv.appendChild(contentDiv);

    this.elements.chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
  }

  async loadRecipes() {
    this.elements.sitesList.innerHTML = '<p class="loading">Loading recipes...</p>';

    try {
      const response = await fetch('/api/recipes');
      const data = await response.json();

      if (data.success) {
        this.recipes = data.sites;
        this.displayRecipes();
        this.populateSiteSelect();
      } else {
        this.elements.sitesList.innerHTML = '<p class="loading">Failed to load recipes</p>';
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      this.elements.sitesList.innerHTML = '<p class="loading">Error loading recipes</p>';
    }
  }

  displayRecipes() {
    if (this.recipes.length === 0) {
      this.elements.sitesList.innerHTML = '<p class="loading">No recipes available</p>';
      return;
    }

    // Group by category
    const grouped = {};
    this.recipes.forEach(site => {
      const category = site.category || 'Other';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(site);
    });

    let html = '';
    for (const [category, sites] of Object.entries(grouped)) {
      html += `<h3 style="margin: 20px 0 10px 0; color: var(--text-secondary); font-size: 0.9rem;">${category}</h3>`;
      sites.forEach(site => {
        html += `
          <div class="site-card" data-site-id="${site.id}">
            <h3>${site.name}</h3>
            <span class="category">${category}</span>
          </div>
        `;
      });
    }

    this.elements.sitesList.innerHTML = html;

    // Add click listeners
    document.querySelectorAll('.site-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const siteId = card.dataset.siteId;
        this.selectSite(siteId);
      });
    });
  }

  populateSiteSelect() {
    this.elements.siteSelect.innerHTML = this.recipes
      .map(site => `<option value="${site.id}">${site.name}</option>`)
      .join('');
  }

  selectSite(siteId) {
    this.selectedSite = this.recipes.find(r => r.id === siteId);
    this.elements.siteSelect.value = siteId;
    this.elements.actionPanel.style.display = 'block';
    this.elements.actionPanel.scrollIntoView({ behavior: 'smooth' });
  }

  async executeAutomation() {
    const siteId = this.elements.siteSelect.value;
    const username = this.elements.username.value.trim();
    const password = this.elements.password.value.trim();
    const newEmail = this.elements.newEmail.value.trim();

    if (!username || !password || !newEmail) {
      alert('Please fill in all fields');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    const site = this.recipes.find(r => r.id === siteId);

    // Show progress modal
    this.showProgressModal(site.name);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          siteId,
          credentials: { username, password },
          newEmail
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.result.success) {
          this.addMessage(`✓ Successfully updated ${site.name} to ${newEmail}!`, 'assistant');
        } else if (data.result.needs2FA) {
          this.addMessage(`${site.name} requires 2FA verification. Please complete it manually.`, 'assistant');
        } else if (data.result.needsVerification) {
          this.addMessage(`${site.name} requires email verification. Please check your inbox.`, 'assistant');
        } else {
          this.addMessage(`Failed to update ${site.name}: ${data.result.error}`, 'assistant');
          if (data.result.manualSteps) {
            this.addMessage(`Manual steps:\n${data.result.manualSteps}`, 'assistant');
          }
        }
      } else {
        this.addMessage(`Error: ${data.error}`, 'assistant');
      }

      // Clear password field
      this.elements.password.value = '';

    } catch (error) {
      console.error('Execution error:', error);
      this.addMessage(`Error executing automation: ${error.message}`, 'assistant');
    } finally {
      this.hideProgressModal();
    }
  }

  updateProgress(progress) {
    this.elements.progressStep.textContent = progress.message || 'Processing...';
    // Update progress bar (simplified - could be more sophisticated)
    const currentWidth = parseFloat(this.elements.progressFill.style.width) || 0;
    this.elements.progressFill.style.width = Math.min(currentWidth + 20, 90) + '%';
  }

  showProgressModal(siteName) {
    this.elements.progressSite.textContent = `Processing: ${siteName}`;
    this.elements.progressStep.textContent = 'Starting...';
    this.elements.progressFill.style.width = '10%';
    this.elements.progressModal.style.display = 'flex';
  }

  hideProgressModal() {
    this.elements.progressModal.style.display = 'none';
    this.elements.progressFill.style.width = '0%';
  }

  async resetSession() {
    if (!confirm('Are you sure you want to reset the session? This will clear all conversation history and credentials.')) {
      return;
    }

    try {
      const response = await fetch('/api/reset', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        // Clear chat
        this.elements.chatMessages.innerHTML = '';
        this.addMessage('Session reset. How can I help you today?', 'assistant');

        // Clear form
        this.elements.username.value = '';
        this.elements.password.value = '';
        this.elements.newEmail.value = '';
        this.elements.actionPanel.style.display = 'none';
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert('Failed to reset session');
    }
  }

  updateStatus(text, connected) {
    this.elements.statusText.textContent = text;
    if (connected) {
      this.elements.status.classList.add('connected');
    } else {
      this.elements.status.classList.remove('connected');
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new EmailCleanupApp();
});
