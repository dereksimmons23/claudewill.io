class ClaudeWillWidget {
  constructor() {
    this.isOpen = false;
    // Enhanced context with proactive logic
    this.pageContexts = {
      '/pages/services.html': {
        context: 'services',
        proactiveMessage: "I see you're looking at my services. I can help you identify which offering best fits your needs. Would you like to start a quick assessment?",
        suggestedActions: [
          { text: "Yes, start the assessment", action: "start_assessment" },
          { text: "Just browsing", action: "close" }
        ]
      },
      '/pages/about.html': {
        context: 'about',
        proactiveMessage: "This page is about the Claude Will project and its founder. What are you most curious about?",
        suggestedActions: [
          { text: "The project's origin", action: "ask_origin" },
          { text: "The founder's background", action: "ask_founder_background" }
        ]
      },
      '/pages/projects.html': {
        context: 'projects',
        proactiveMessage: "This page highlights some key projects. Are you interested in a specific one, or would you like to know about the philosophy behind them?",
        suggestedActions: [
          { text: "Tell me about The CW Standard", action: "ask_cw_standard" },
          { text: "Explain the project philosophy", action: "ask_project_philosophy" }
        ]
      },
      'default': {
        context: 'general',
        proactiveMessage: "Welcome! I'm here to help you navigate the site. What can I assist you with today?",
        suggestedActions: []
      }
    };
    this.currentContext = this.pageContexts.default;
    this.init();
  }

  init() {
    // Create widget container
    this.container = document.createElement('div');
    this.container.className = 'claude-will-widget';
    this.container.innerHTML = `
      <div class="widget-toast">
        <p>Hello! I'm the Claude Will agent. Ask me anything!</p>
      </div>
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
          <div class="suggested-actions"></div>
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

    // Show welcome toast on first visit
    this.showWelcomeToast();

    // Add mobile-specific event listeners
    this.setupMobileEventListeners();
  }

  determineContext() {
    const path = window.location.pathname;
    this.currentContext = this.pageContexts[path] || this.pageContexts.default;
  }

  setupEventListeners() {
    // Toggle widget
    this.container.querySelector('.widget-toggle').addEventListener('click', () => {
      this.toggleWidget();
    });

    this.container.querySelector('.widget-toggle').addEventListener('click', () => {
      // Hide toast if it's open when widget is toggled
      const toast = this.container.querySelector('.widget-toast');
      if (toast.classList.contains('visible')) {
        toast.classList.remove('visible');
      }
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

    // Delegated event listener for suggested actions
    this.container.querySelector('.suggested-actions').addEventListener('click', (e) => {
        if (e.target && e.target.nodeName === 'BUTTON') {
            const action = e.target.dataset.action;
            this.handleSuggestedAction(action);
        }
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
    
    // Add welcome message based on context
    this.displayProactiveMessage();
  }

  toggleWidget() {
    this.isOpen = !this.isOpen;
    this.container.classList.toggle('open', this.isOpen);

    if (this.isOpen) {
      this.displayProactiveMessage();
    }
  }

  closeWidget() {
    this.isOpen = false;
    this.container.classList.remove('open');
  }

  displayProactiveMessage() {
    const messagesContainer = this.container.querySelector('.chat-messages');
    // Display proactive message only if chat is empty
    if (messagesContainer.children.length === 0) {
      this.addMessage('claude', this.currentContext.proactiveMessage);
      this.displaySuggestedActions();
    }
  }

  displaySuggestedActions() {
    const actionsContainer = this.container.querySelector('.suggested-actions');
    actionsContainer.innerHTML = '';
    if (this.currentContext.suggestedActions.length > 0) {
      this.currentContext.suggestedActions.forEach(action => {
        const button = document.createElement('button');
        button.innerText = action.text;
        button.dataset.action = action.action;
        actionsContainer.appendChild(button);
      });
      actionsContainer.style.display = 'flex';
    } else {
      actionsContainer.style.display = 'none';
    }
  }

  handleSuggestedAction(action) {
    // Hide suggested actions after one is clicked
    this.container.querySelector('.suggested-actions').style.display = 'none';

    switch (action) {
        case 'start_assessment':
            this.addMessage('user', "Let's start the assessment.");
            this.startAssessment();
            break;
        case 'assessment_ai':
            this.addMessage('user', "We're focused on AI Implementation.");
            this.addMessage('claude', "Understood. The AI Strategy & Executive Education service is likely the best fit. It's designed to help leadership teams integrate AI effectively. Would you like to learn more about the specific deliverables?");
            this.currentContext.suggestedActions = [
                { text: "Yes, tell me more", action: "learn_more_ai" },
                { text: "Start over", action: "start_assessment" }
            ];
            this.displaySuggestedActions();
            break;
        case 'assessment_org_change':
            this.addMessage('user', "We're dealing with organizational change.");
            this.addMessage('claude', "That can be challenging. The Transition Management Consulting service is designed to help navigate complex organizational shifts while keeping your culture intact. Would you like to hear about the methodology?");
            this.currentContext.suggestedActions = [
                { text: "Yes, explain the methodology", action: "learn_more_org_change" },
                { text: "Start over", action: "start_assessment" }
            ];
            this.displaySuggestedActions();
            break;
        case 'assessment_planning':
            this.addMessage('user', "We need help with strategic planning.");
            this.addMessage('claude', "Excellent. The Framework Development & Strategic Planning service helps create custom frameworks to scale leadership and build a sustainable competitive advantage. Would you like to know how it works?");
            this.currentContext.suggestedActions = [
                { text: "How does it work?", action: "learn_more_planning" },
                { text: "Start over", action: "start_assessment" }
            ];
            this.displaySuggestedActions();
            break;
        case 'learn_more_ai':
            this.addMessage('user', "Yes, tell me more.");
            this.addMessage('claude', "The AI Strategy service includes four key deliverables: 1) Executive readiness assessments, 2) Strategic frameworks to align AI with your values, 3) Leadership education on human-AI collaboration, and 4) Implementation roadmaps. This ensures you adopt AI as a strategic advantage. Would you like to schedule a consultation?");
            this.currentContext.suggestedActions = [
                { text: "Schedule Consultation", action: "go_to_contact" },
                { text: "Explore other services", action: "start_assessment" }
            ];
            this.displaySuggestedActions();
            break;
        case 'learn_more_org_change':
            this.addMessage('user', "Yes, explain the methodology.");
            this.addMessage('claude', "Our Transition Management methodology is built on four pillars: 1) Applying The CW Standard for transitions, 2) Using change frameworks that strengthen teams, 3) Leveraging cross-domain pattern recognition, and 4) Providing leadership coaching through uncertainty. Would you like to book a call to see if this is right for you?");
            this.currentContext.suggestedActions = [
                { text: "Book a Consultation", action: "go_to_contact" },
                { text: "Explore other services", action: "start_assessment" }
            ];
            this.displaySuggestedActions();
            break;
        case 'learn_more_planning':
            this.addMessage('user', "How does it work?");
            this.addMessage('claude', "Our Framework Development service is a collaborative process where we help you: 1) Develop a proprietary methodology for your challenges, 2) Align your executive team, 3) Integrate the framework across functions, and 4) Plan for adaptive, long-term implementation. Ready to discuss how this could apply to your organization?");
            this.currentContext.suggestedActions = [
                { text: "Schedule a Consultation", action: "go_to_contact" },
                { text: "Look at other options", action: "start_assessment" }
            ];
            this.displaySuggestedActions();
            break;
        case 'go_to_contact':
            this.addMessage('user', "Let's schedule a consultation.");
            this.addMessage('claude', "Excellent. The best way to move forward is to book a 30-minute consultation on the next page. This will allow us to discuss your specific needs in detail. I'm redirecting you now.");
            setTimeout(() => {
                window.location.href = '/pages/contact.html';
            }, 2500); // Wait 2.5 seconds before redirecting
            break;
        case 'ask_origin':
            this.addMessage('user', "Tell me about the project's origin.");
            this.addMessage('claude', "The Claude Will project is named after Derek's grandfather, Claude William Simmons (CW), whose practical wisdom and pattern recognition inspired the core philosophy. It's designed to blend that human wisdom with advanced AI capabilities. What else would you like to know?");
            this.currentContext.suggestedActions = [
                { text: "The founder's background", action: "ask_founder_background" },
                { text: "Back to services", action: "go_to_services" }
            ];
            this.displaySuggestedActions();
            break;
        case 'ask_founder_background':
            this.addMessage('user', "Tell me about the founder's background.");
            this.addMessage('claude', "Derek Simmons has 20+ years of experience in media, technology, and leadership. He specializes in ethical AI and digital transformation. His work is all about bridging human wisdom and technological advancement. Can I answer anything else?");
             this.currentContext.suggestedActions = [
                { text: "The project's origin", action: "ask_origin" },
                { text: "Contact Derek", action: "go_to_contact" }
            ];
            this.displaySuggestedActions();
            break;
        case 'go_to_services':
            window.location.href = '/pages/services.html';
            break;
        case 'ask_cw_standard':
            this.addMessage('user', "Tell me about The CW Standard.");
            this.addMessage('claude', "The CW Standard is a set of frameworks for navigating complex transitions, like AI implementation or organizational change. It's based on a coach-first approach that prioritizes human judgment, systematic thinking, and authentic leadership. Would you like to see the services based on this standard?");
            this.currentContext.suggestedActions = [
                { text: "Yes, show me the services", action: "go_to_services" },
                { text: "What's the project philosophy?", action: "ask_project_philosophy" }
            ];
            this.displaySuggestedActions();
            break;
        case 'ask_project_philosophy':
            this.addMessage('user', "What's the project philosophy?");
            this.addMessage('claude', "The core philosophy is that technology should enhance, not replace, human capability. Every project is an exploration of how to blend human wisdom with technological advancement to make complicated things less painful and more authentic.");
            this.currentContext.suggestedActions = [
                { text: "Tell me about The CW Standard", action: "ask_cw_standard" },
                { text: "View all services", action: "go_to_services" }
            ];
            this.displaySuggestedActions();
            break;
        case 'close':
            this.closeWidget();
            break;
        default:
            // Do nothing
            break;
    }
  }

  startAssessment() {
    this.addMessage('claude', "Great! To start, which of these best describes your current challenge?");
    // Replace placeholder with a real assessment flow
    this.currentContext.suggestedActions = [
        { text: "AI Implementation", action: "assessment_ai" },
        { text: "Organizational Change", action: "assessment_org_change" },
        { text: "Strategic Planning", action: "assessment_planning" }
    ];
    this.displaySuggestedActions();
  }

  async handleUserInput(predefinedMessage = null) {
    const input = this.container.querySelector('input');
    const message = predefinedMessage || input.value.trim();
    
    if (message) {
      // Add user message to chat
      this.addMessage('user', message);
      
      // Clear input if it wasn't a predefined message
      if (!predefinedMessage) {
        input.value = '';
      }
      
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
    const formattedMessage = `[Context: ${this.currentContext.context}] ${message}`;
    
    // Get response from Claude Will
    try {
      const response = await window.ClaudeWill.getResponse(formattedMessage);
      return response;
    } catch (error) {
      console.error('Failed to get response:', error);
      return 'I apologize, but I encountered an error. Please try again.';
    }
  }

  showWelcomeToast() {
    const toast = this.container.querySelector('.widget-toast');
    if (!sessionStorage.getItem('claudeWillWelcomeShown')) {
      setTimeout(() => {
        toast.classList.add('visible');
      }, 1000); // Show after 1 second

      setTimeout(() => {
        toast.classList.remove('visible');
      }, 6000); // Hide after 5 seconds

      sessionStorage.setItem('claudeWillWelcomeShown', 'true');
    }
  }
}

// Initialize widget
document.addEventListener('DOMContentLoaded', () => {
  window.claudeWillWidget = new ClaudeWillWidget();
}); 