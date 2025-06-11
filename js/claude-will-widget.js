class ClaudeWillWidget {
  constructor() {
    this.isOpen = false;
    this.currentContext = null;
    this.init();
  }

  init() {
    // Create widget container
    this.container = document.createElement('div');
    this.container.className = 'claude-will-widget';
    this.container.innerHTML = `
      <button class="widget-toggle" aria-label="Toggle Claude Will">
        <span class="material-icons">chat</span>
      </button>
      <div class="widget-content">
        <div class="widget-header">
          <h3>Claude Will</h3>
          <button class="close-button" aria-label="Close">×</button>
        </div>
        <div class="widget-body">
          <div class="chat-messages"></div>
          <form class="chat-input">
            <input type="text" placeholder="Ask me anything...">
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(this.container);

    // Set up event listeners
    this.setupEventListeners();

    // Determine context
    this.determineContext();

    // Add mobile-specific event listeners
    this.setupMobileEventListeners();
  }

  determineContext() {
    // Get current page context
    const path = window.location.pathname;
    if (path.includes('resume-engine')) {
      this.currentContext = 'resume-engine';
    } else if (path.includes('documentation')) {
      this.currentContext = 'documentation';
    } else if (path.includes('about')) {
      this.currentContext = 'about';
    }
    // etc.
  }

  setupEventListeners() {
    // Toggle widget
    this.container.querySelector('.widget-toggle').addEventListener('click', () => {
      this.toggleWidget();
    });

    // Close widget
    this.container.querySelector('.close-button').addEventListener('click', () => {
      this.closeWidget();
    });

    // Handle chat input
    this.container.querySelector('.chat-input').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleUserInput();
    });
  }

  setupMobileEventListeners() {
    // Handle virtual keyboard
    const input = this.container.querySelector('input');
    input.addEventListener('focus', () => {
      if (window.innerWidth <= 768) {
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          const messagesContainer = this.container.querySelector('.chat-messages');
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 300);
      }
    });

    // Handle pull-to-refresh
    let touchStartY = 0;
    const messagesContainer = this.container.querySelector('.chat-messages');
    
    messagesContainer.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    });

    messagesContainer.addEventListener('touchmove', (e) => {
      const touchY = e.touches[0].clientY;
      const diff = touchY - touchStartY;
      
      // Only allow pull-to-refresh when at the top
      if (messagesContainer.scrollTop === 0 && diff > 0) {
        e.preventDefault();
        messagesContainer.style.transform = `translateY(${diff * 0.3}px)`;
      }
    });

    messagesContainer.addEventListener('touchend', (e) => {
      const touchY = e.changedTouches[0].clientY;
      const diff = touchY - touchStartY;
      
      if (diff > 100) {
        // Trigger refresh
        this.refreshChat();
      }
      
      messagesContainer.style.transform = '';
    });

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.adjustForOrientation();
      }, 100);
    });
  }

  adjustForOrientation() {
    const messagesContainer = this.container.querySelector('.chat-messages');
    const isLandscape = window.innerHeight < window.innerWidth;
    
    if (isLandscape) {
      messagesContainer.style.maxHeight = 'calc(100vh - 120px)';
    } else {
      messagesContainer.style.maxHeight = 'calc(100vh - 160px)';
    }
  }

  refreshChat() {
    // Clear chat history
    const messagesContainer = this.container.querySelector('.chat-messages');
    messagesContainer.innerHTML = '';
    
    // Add welcome message
    this.addMessage('claude', 'Welcome! How can I help you today?');
  }

  toggleWidget() {
    this.isOpen = !this.isOpen;
    this.container.classList.toggle('open', this.isOpen);
  }

  closeWidget() {
    this.isOpen = false;
    this.container.classList.remove('open');
  }

  async handleUserInput() {
    const input = this.container.querySelector('input');
    const message = input.value.trim();
    
    if (message) {
      // Add user message to chat
      this.addMessage('user', message);
      
      // Clear input
      input.value = '';
      
      // Get response from Claude Will
      const response = await this.getClaudeWillResponse(message);
      
      // Add response to chat
      this.addMessage('claude', response);
    }
  }

  addMessage(type, content) {
    const messagesContainer = this.container.querySelector('.chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}-message`;
    messageElement.innerHTML = `
      <div class="message-content">${content}</div>
      <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async getClaudeWillResponse(message) {
    // Format message with context
    const formattedMessage = `[Context: ${this.currentContext}] ${message}`;
    
    // Get response from Claude Will
    try {
      const response = await window.ClaudeWill.getResponse(formattedMessage);
      return response;
    } catch (error) {
      console.error('Failed to get response:', error);
      return 'I apologize, but I encountered an error. Please try again.';
    }
  }
}

// Initialize widget
document.addEventListener('DOMContentLoaded', () => {
  window.claudeWillWidget = new ClaudeWillWidget();
}); 