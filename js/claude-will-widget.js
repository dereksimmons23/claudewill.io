class ClaudeWillWidget {
  constructor() {
    this.isOpen = false;
    // Enhanced context with proactive logic
    this.pageContexts = {
      '/pages/services.html': {
        context: 'services',
        proactiveMessage: "I see you're looking at our services. I'm Claude Will, and I'd love to help you find the right approach for your organization. Each service is designed to enhance human wisdom, not replace it. What should I call you?",
        suggestedActions: [
          { text: "Tell me your name", action: "ask_name" },
          { text: "Just call me friend", action: "call_friend" },
          { text: "Help me choose a service", action: "start_assessment" }
        ]
      },
      '/pages/about.html': {
        context: 'about',
        proactiveMessage: "Hello! I'm Claude Will, named after my creator's grandfather Claude William Simmons. Since you're reading about us, I'd love to know what questions you have. What should I call you?",
        suggestedActions: [
          { text: "Tell me your name", action: "ask_name" },
          { text: "Just call me friend", action: "call_friend" },
          { text: "Tell me about Derek", action: "ask_founder_background" }
        ]
      },
      '/pages/projects.html': {
        context: 'projects',
        proactiveMessage: "Hello! I'm Claude Will. I see you're looking at our projects - each one demonstrates how AI can enhance human wisdom rather than replace it. What should I call you?",
        suggestedActions: [
          { text: "Tell me your name", action: "ask_name" },
          { text: "Just call me friend", action: "call_friend" },
          { text: "Tell me about The CW Standard", action: "ask_cw_standard" }
        ]
      },
      'default': {
        context: 'general',
        proactiveMessage: "Hello! I'm Claude Will, named after my creator's grandfather, Claude William Simmons - known as CW to those who knew him. I'm here to help you discover how AI can enhance rather than replace human wisdom. What should I call you?",
        suggestedActions: [
          { text: "Tell me your name", action: "ask_name" },
          { text: "Just call me friend", action: "call_friend" },
          { text: "Learn about Claude Will", action: "learn_about_claude_will" }
        ]
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
        case 'show_orchestration':
            this.addMessage('user', "Show me the orchestration approach.");
            this.addMessage('claude', "🎼 **Live AI Orchestra Status:**\\n\\n• Claude Sonnet (Strategy) - ACTIVE ✅\\n• Cursor AI (Development) - ACTIVE ✅\\n• GitHub (Deployment) - ACTIVE ✅\\n• Analytics (Monitoring) - MONITORING 📊\\n• Claude Will (Engagement) - ACTIVE ✅\\n\\nThis is Stage 4-5 complexity management. Most organizations struggle with just 2 AI systems, but we've documented managing 5+ simultaneously. This creates coordination overhead of 45-60% but enables unprecedented capability when done correctly.");
            this.currentContext.suggestedActions = [
                { text: "How can this help my organization?", action: "orchestration_benefits" },
                { text: "What's the CW Standard approach?", action: "ask_cw_standard" },
                { text: "Start service assessment", action: "start_assessment" }
            ];
            this.displaySuggestedActions();
            break;
        case 'orchestration_benefits':
            this.addMessage('user', "How can this help my organization?");
            this.addMessage('claude', "Organizations implementing AI without orchestration methodology see 2x speed improvements but hit coordination bottlenecks. With systematic human-AI orchestration, we've documented 2.5x revenue amplification and 67% response rates vs 15% industry average. The key is treating humans as the API between AI systems that can't communicate directly.");
            this.currentContext.suggestedActions = [
                { text: "I want to learn more", action: "start_assessment" },
                { text: "Show me case studies", action: "view_research" },
                { text: "Schedule consultation", action: "go_to_contact" }
            ];
            this.displaySuggestedActions();
            break;
        case 'view_research':
            this.addMessage('user', "Show me case studies.");
            this.addMessage('claude', "Here are three live research examples:\\n\\n📊 **ATS Decoder Project**: 67% response rate through systematic methodology vs 15% industry average\\n\\n🎼 **8-Hour AI Orchestra Session**: Documented coordination of Claude, Cursor, GitHub, Netlify, Copilot, Analytics & Gemini\\n\\n💧 **CW Standard Framework**: 'Water in the glass' approach to cutting through complexity paralysis\\n\\nThese aren't theoretical - they're live research with measurable results.");
            this.currentContext.suggestedActions = [
                { text: "This is exactly what we need", action: "go_to_contact" },
                { text: "Tell me about implementation", action: "start_assessment" }
            ];
            this.displaySuggestedActions();
            break;
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
        case 'go_to_assessment':
            this.addMessage('user', "Take me to the AI Readiness Assessment.");
            this.addMessage('claude', "Perfect! The AI Readiness Assessment will help identify where you are in your AI journey and what frameworks would be most valuable. Redirecting you now...");
            setTimeout(() => {
                window.location.href = '/pages/assessment.html';
            }, 2000);
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
        case 'ask_name':
            this.addMessage('user', "Let me tell you my name.");
            this.addMessage('claude', "I'd love to know what to call you! Just type your name or what you'd prefer to be called, and I'll remember it for our conversation.");
            this.currentContext.suggestedActions = [
                { text: "Tell me about your grandfather", action: "ask_grandfather_story" },
                { text: "How can Claude Will help me?", action: "claude_will_help" },
                { text: "Take AI Assessment", action: "go_to_assessment" }
            ];
            this.displaySuggestedActions();
            break;
        case 'call_friend':
            this.addMessage('user', "Just call me friend.");
            this.addMessage('claude', "Perfect, friend! I appreciate the connection. My grandfather CW always said the best conversations start with mutual respect. Now, how can I help you today?");
            this.currentContext.suggestedActions = [
                { text: "Tell me about your grandfather", action: "ask_grandfather_story" },
                { text: "How can Claude Will help me?", action: "claude_will_help" },
                { text: "Take AI Assessment", action: "go_to_assessment" }
            ];
            this.displaySuggestedActions();
            break;
        case 'learn_about_claude_will':
            this.addMessage('user', "Tell me about Claude Will.");
            this.addMessage('claude', "Claude Will is an AI framework designed to enhance human wisdom, not replace it. I'm built on constitutional AI principles, meaning I'm designed to be helpful, harmless, and honest. The goal is to be your thinking partner for strategic challenges. What would you like to explore?");
            this.currentContext.suggestedActions = [
                { text: "Tell me about your grandfather", action: "ask_grandfather_story" },
                { text: "How can this help my business?", action: "claude_will_help" },
                { text: "Take AI Assessment", action: "go_to_assessment" }
            ];
            this.displaySuggestedActions();
            break;
        case 'ask_grandfather_story':
            this.addMessage('user', "Tell me about your grandfather.");
            this.addMessage('claude', "Claude William Simmons - CW - was a man of practical wisdom and quiet strength. He had this ability to see patterns and connections that others missed, and he always knew how to cut through complexity to find the simple truth. That's the kind of thinking I try to bring to every conversation - not flashy AI tricks, but genuine wisdom and insight.");
            this.currentContext.suggestedActions = [
                { text: "How does this apply to business?", action: "claude_will_help" },
                { text: "What makes this different?", action: "claude_will_difference" },
                { text: "Take AI Assessment", action: "go_to_assessment" }
            ];
            this.displaySuggestedActions();
            break;
        case 'claude_will_help':
            this.addMessage('user', "How can Claude Will help me?");
            this.addMessage('claude', "I can help you think through complex strategic challenges, implement AI in ways that enhance your team's wisdom, and navigate transitions with the kind of authentic leadership that builds rather than breaks. I'm particularly good at helping executives see patterns across domains and make decisions with clarity and confidence.");
            this.currentContext.suggestedActions = [
                { text: "That sounds exactly right", action: "go_to_contact" },
                { text: "Tell me about the assessment", action: "go_to_assessment" },
                { text: "What makes this different?", action: "claude_will_difference" }
            ];
            this.displaySuggestedActions();
            break;
        case 'claude_will_difference':
            this.addMessage('user', "What makes this different?");
            this.addMessage('claude', "Most AI tools try to give you answers. I try to help you think better. Most AI is about efficiency and speed. I'm about wisdom and authenticity. I don't try to replace your judgment - I try to enhance it, just like my grandfather CW would have done if he were sitting across from you.");
            this.currentContext.suggestedActions = [
                { text: "I want to experience this", action: "go_to_assessment" },
                { text: "Let's talk about my situation", action: "go_to_contact" },
                { text: "Tell me about the platforms", action: "view_platforms" }
            ];
            this.displaySuggestedActions();
            break;
        case 'view_platforms':
            this.addMessage('user', "Show me the platforms.");
            this.addMessage('claude', "I'm built into several live platforms that demonstrate these principles in action: Recalibrate (career intelligence), HoopDreams (basketball coaching), and this website itself. Each one shows how AI can enhance human capability rather than replace it. Would you like to explore one of them?");
            this.currentContext.suggestedActions = [
                { text: "Show me Recalibrate", action: "go_to_recalibrate" },
                { text: "Show me HoopDreams", action: "go_to_hoopdreams" },
                { text: "Take AI Assessment", action: "go_to_assessment" }
            ];
            this.displaySuggestedActions();
            break;
        case 'go_to_recalibrate':
            this.addMessage('user', "Show me Recalibrate.");
            this.addMessage('claude', "Recalibrate is a mobile-first career intelligence platform that helps people navigate career transitions with wisdom and strategy. It's AI-enhanced but human-centered. Taking you there now...");
            setTimeout(() => {
                window.location.href = '/recalibrate/';
            }, 2000);
            break;
        case 'go_to_hoopdreams':
            this.addMessage('user', "Show me HoopDreams.");
            this.addMessage('claude', "HoopDreams applies sports psychology and coaching principles to basketball development. It's a great example of how AI can enhance coaching wisdom. Taking you there now...");
            setTimeout(() => {
                window.location.href = '/basketball/';
            }, 2000);
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