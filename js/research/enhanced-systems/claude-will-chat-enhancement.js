// Enhanced Claude Will Chat Implementation
// This implementation expands the current simple pattern-matching approach
// with richer responses, cross-domain connections, and basic conversation memory

// -------------- CONVERSATION MEMORY --------------

// Simple conversation memory to track context
let conversationContext = {
  topicsDiscussed: [],      // Topics we've already talked about
  lastTopic: null,          // Most recent topic discussed
  userInterests: [],        // Topics the user seems interested in
  messageCount: 0,          // Count of total messages
  visitedConnections: {},   // Tracking which connections we've already mentioned
  userBackground: null      // Detected user background (coaching, tech, media, etc.)
};

// -------------- ENHANCED RESPONSE DATA --------------

const responsesData = {
  "topics": {
    "cw_standard": {
      "name": "The CW Standard",
      "triggers": ["cw standard", "framework", "the cw standard", "bridging", "human wisdom"],
      "brief": "a framework that bridges human wisdom with technological advancement",
      "response": "The CW Standard emerged from watching my grandfather work his entire life. He had a 6th grade education but a PhD in manual labor, working for the railroad and selling horses. What I observed was how his practical wisdom created patterns of success across seemingly unrelated areas. Today, the framework helps organizations navigate complex transitions by connecting human wisdom with technological advancement, ensuring that technology enhances rather than replaces human judgment.",
      "follow_ups": [
        "What aspects of bridging human wisdom and technology are you most interested in exploring?",
        "Would you like to hear how we applied this framework at Star Tribune?",
        "Are you approaching any technological transitions where this framework might help?"
      ],
      "connections": ["coaching_ai_ethics", "pattern_recognition", "baton_handoff"],
      "examples": [
        "At Star Tribune, we used The CW Standard when implementing our SalesGPT solution, ensuring the technology supported our sales team rather than replacing their expertise. This led to reclaiming 2.5 work-years of productivity while maintaining the human relationships critical to our business.",
        "A healthcare organization applied this framework during their patient management system transition, preserving the human empathy in patient care while leveraging technology to reduce administrative burden."
      ],
      "depth": {
        "principles": "The CW Standard is built on three core principles: 1) Identify human wisdom within existing processes before applying technology, 2) Design technology to amplify rather than replace human judgment, and 3) Measure success by enhanced human capability, not just technological efficiency.",
        "implementation": "Implementing The CW Standard begins with a 'wisdom audit' that documents the often implicit knowledge that experienced team members apply. Technology is then evaluated based on how well it preserves and enhances this wisdom rather than simply automating tasks."
      }
    },
    
    "coaching_ai_ethics": {
      "name": "Coaching & AI Ethics",
      "triggers": ["coaching ai", "basketball ai", "sports ethics", "ai ethics", "coaching ethics"],
      "brief": "applying coaching principles to ethical AI implementation",
      "response": "The first principle I teach both basketball players and AI implementation teams is: 'Play for the name on the front of the jersey, not the back.' 🏀 In basketball, this means putting team success above individual statistics. In AI ethics, it translates to prioritizing organizational and societal benefit over technical achievement. This principle completely transforms how teams approach AI adoption - focusing less on showcasing technology and more on enhancing human capability.",
      "follow_ups": [
        "Have you seen examples where technology seemed more focused on showcasing itself than solving real human problems?",
        "How do you think about balancing innovation with ethical considerations in your work?",
        "Are there specific ethical concerns about AI that you're particularly focused on?"
      ],
      "connections": ["cw_standard", "baton_handoff", "pattern_recognition"],
      "examples": [
        "When working with our AI Task Force at Star Tribune, we adapted the concept of 'practice makes permanent' from basketball. Just as coaches carefully design practice drills to reinforce good habits, we designed AI implementation processes that reinforced ethical decision-making patterns.",
        "A financial services client was implementing AI for fraud detection and became fixated on accuracy rates. By applying the 'front of the jersey' principle, we refocused their metrics on customer trust and fair outcomes rather than just technical performance."
      ],
      "depth": {
        "principles": "The coaching approach to AI ethics centers on four principles: 1) Team success over individual achievement, 2) Fundamentals before flash, 3) Practice makes permanent, and 4) Growth through feedback.",
        "implementation": "This approach establishes clear 'rules of play' for AI systems, creates regular 'practice' scenarios to test ethical decision-making, and implements feedback loops that prioritize continuous improvement over perfect performance."
      }
    },
    
    "media_franchise": {
      "name": "Media Franchise Model",
      "triggers": ["media franchise", "franchise model", "content strategy"],
      "brief": "treating content verticals as entrepreneurial business units",
      "response": "Think of how basketball teams develop players. Instead of just running set plays, good coaches create development pathways that maximize each player's unique talents within the team system. The Media Franchise Model applies this same thinking to content, treating traditional verticals as entrepreneurial business units with their own identity and development pathway. At Star Tribune Media, this approach generated over $10M in new revenue by creating franchise-based sponsorship opportunities that transcended traditional platform boundaries.",
      "follow_ups": [
        "What content areas do you see having the most potential for this kind of entrepreneurial approach?",
        "Are you involved in content strategy or media transformation in your work?",
        "Would you like to hear about specific revenue models we developed using this approach?"
      ],
      "connections": ["pattern_recognition", "baton_handoff", "cw_standard"],
      "examples": [
        "Our high school sports vertical at Star Tribune became its own 'franchise' with dedicated social channels, events, and sponsorship opportunities, generating $750K annually from what had been a cost center.",
        "When we launched our cooking vertical, we applied franchise thinking to create a branded content series, cookbook, events program, and kitchen product affiliate partnerships—all components of a unified franchise rather than disconnected initiatives."
      ],
      "depth": {
        "principles": "The Media Franchise Model is built on three pillars: 1) Identity - each content area develops its own unique brand within the larger organization, 2) Development - content evolves through planned stages rather than ad-hoc production, and 3) Synergy - revenue opportunities emerge from the connections between content areas.",
        "implementation": "Implementation begins with an audit of existing content strengths, followed by selecting franchise candidates based on audience engagement and revenue potential. Each franchise then develops its own strategic plan including content, audience development, and monetization strategies."
      }
    },
    
    "pattern_recognition": {
      "name": "Pattern Recognition",
      "triggers": ["pattern", "recognition", "cross-domain", "cross domain", "connections"],
      "brief": "identifying valuable connections between seemingly unrelated domains",
      "response": "My approach to pattern recognition was first shaped on basketball courts. I noticed how spacing principles in a 1-3-1 zone defense mirrored effective organizational communication structures. 🔄 The most valuable insights often emerge between domains, not within them. For example, the principles that make a press break effective against defensive pressure translate directly to how organizations can navigate disruptive technological change - maintaining composure, finding open spaces, and moving with purpose rather than panic.",
      "follow_ups": [
        "What domains are you most interested in finding connections between?",
        "Have you noticed any cross-domain patterns in your own work or interests?",
        "Would you like to explore how pattern recognition might apply to a specific challenge you're facing?"
      ],
      "connections": ["cw_standard", "baton_handoff", "coaching_ai_ethics"],
      "examples": [
        "I noticed that the spacing principles in basketball—creating triangles of support, maintaining proper distances—mapped perfectly to how we needed to structure cross-functional teams during digital transformation.",
        "During AI implementation planning, the concept of 'reading the defense' from basketball helped us develop a flexible approach that could adapt to changing organizational needs rather than following a rigid playbook."
      ],
      "depth": {
        "principles": "Effective pattern recognition requires: 1) Deep understanding of multiple domains, 2) An ability to abstract principles from specific implementations, 3) Regular exposure to diverse ideas and perspectives, and 4) Intentional practice in making connections.",
        "implementation": "To develop pattern recognition, we regularly expose ourselves to ideas outside our primary field, maintain a system for capturing insights across domains, and practice deliberate connection-making through exercises like 'What's this like?' and 'Where else does this apply?'"
      }
    },
    
    "baton_handoff": {
      "name": "Baton Handoff Framework",
      "triggers": ["baton", "handoff", "relay", "transition", "baton handoff", "handoffs"],
      "brief": "optimizing critical transitions between teams, phases, and systems",
      "response": "The baton handoff is perhaps the single best example of teamwork in sports. In a relay race, gold medals are won and lost in those critical seconds of transition. 🏁 I've developed a Baton Handoff Framework that applies this concept to organizational transitions, technological implementations, and communication systems. The key insight is that excellence in transitions—not just individual performance—determines ultimate success. This framework identifies five critical elements: the handoff zone, runner synchronization, the critical shake, the transfer method, and post-handoff acceleration.",
      "follow_ups": [
        "Which of these elements seems most relevant to challenges you're facing?",
        "Are you managing any significant transitions in your organization right now?",
        "Would you like to hear about a specific application of this framework?"
      ],
      "connections": ["coaching_ai_ethics", "cw_standard", "pattern_recognition"],
      "examples": [
        "When implementing AI at Star Tribune, we used the Baton Handoff Framework to create structured transition points between the discovery, design, implementation, and adoption phases, reducing the typical friction that occurs during handoffs.",
        "A healthcare client applied this framework to patient handoffs between departments, reducing errors and improving patient experience by focusing on these critical transition moments."
      ],
      "depth": {
        "principles": "The Baton Handoff Framework is built on five key elements: 1) The Handoff Zone - creating optimal environments for transitions, 2) Runner Synchronization - establishing coordination between teams, 3) The Critical Shake - developing clear signals for acknowledgment, 4) The Transfer Method - implementing specific techniques for passing knowledge and responsibility, and 5) Post-Handoff Acceleration - maintaining momentum through transitions.",
        "implementation": "Implementation begins with mapping critical handoff points in a process or project, then designing specific protocols for each element of the framework at each transition point. Teams practice these handoffs before implementation and analyze performance after each real transition."
      }
    },
    
    "sidewalks_movement": {
      "name": "Natural Paths Principle",
      "triggers": ["sidewalk", "campus", "paths", "movement", "natural", "desire paths"],
      "brief": "designing systems around natural behavior rather than imposing theoretical structures",
      "response": "There's a story about a college that waited before placing sidewalks on their new campus. Instead, they observed where students naturally walked, then paved those paths. 🛣️ This principle - designing systems around actual behavior rather than theoretical ideals - transformed how I approach both coaching and technological implementation. The most effective media transformations start by mapping existing information flows rather than imposing new ones. The best AI implementations enhance natural human judgment rather than replacing it.",
      "follow_ups": [
        "Where have you seen systems that either work with or against natural human behavior?",
        "Are there areas in your organization where you notice 'desire paths' forming around official processes?",
        "How might this principle apply to a specific challenge you're facing?"
      ],
      "connections": ["cw_standard", "pattern_recognition", "coaching_ai_ethics"],
      "examples": [
        "At Star Tribune, instead of forcing reporters to use a new CMS that disrupted their writing process, we observed their natural workflow and designed tools that enhanced rather than replaced their approach to story creation.",
        "A financial services client was implementing a new compliance system with a rigid workflow. By mapping the 'desire paths' employees were already taking, we redesigned the system to follow their natural process while still ensuring compliance."
      ],
      "depth": {
        "principles": "The Natural Paths Principle has three key components: 1) Observation before implementation, 2) Enhancement rather than replacement of existing patterns, and 3) Continuous adaptation based on actual usage patterns.",
        "implementation": "Implementation begins with ethnographic-style observation of how work actually happens (not how it's supposed to happen), followed by mapping the 'desire paths' that emerge. Technology is then designed to enhance these natural workflows rather than imposing new ones."
      }
    },
    
    "about_claude_will": {
      "name": "About Claude Will",
      "triggers": ["who is claude will", "about claude will", "who are you", "what are you", "what is claude will"],
      "brief": "a conversational interface exploring cross-domain connections",
      "response": "I'm Claude Will, named in honor of Claude William Simmons - Derek's grandfather whose wisdom inspired The CW Standard framework. 👴 The name Claude has a rich legacy that extends through generations of Derek's family and connects to remarkable pattern-recognizers throughout history. I'm designed to help you explore connections between domains that might seem unrelated, revealing patterns that create new possibilities.",
      "follow_ups": [
        "What kinds of cross-domain connections are you most curious about exploring?",
        "What aspects of Derek's work are you most interested in?",
        "Are you working on any projects where cross-domain thinking might be valuable?"
      ],
      "connections": ["cw_standard", "pattern_recognition", "coaching_ai_ethics"],
      "examples": [
        "Claude William Simmons had only a 6th grade education but developed practical wisdom through decades of hands-on work that created patterns of success across seemingly unrelated areas.",
        "The name Claude also connects to Claude Shannon, the father of information theory, who exemplified cross-domain thinking by applying Boolean logic to electrical circuits and laying the foundation for modern computing."
      ],
      "depth": {
        "principles": "Claude Will embodies three core principles: 1) Valuable insights often emerge between domains rather than within them, 2) Pattern recognition across contexts creates new possibilities, and 3) Human wisdom should inform technological advancement.",
        "implementation": "This conversational interface is designed to help you explore connections between coaching philosophy, media transformation, and technological implementation, revealing patterns that might not be apparent within a single domain."
      }
    },
    
    "about_derek": {
      "name": "About Derek Simmons",
      "triggers": ["about derek", "derek simmons", "resume", "background", "experience", "who is derek"],
      "brief": "an executive leader bridging human wisdom with technological advancement",
      "response": "Derek is an executive leader with 15+ years of experience generating $20M+ in revenue through innovative frameworks. His expertise spans AI ethics, pattern recognition systems, and digital transformation strategy. 🚀 Derek developed The CW Standard framework for ethical AI implementation that bridges human wisdom with technological advancement. You can learn more about his background on the <a href='about.html'>About page</a> or view his <a href='resume.html'>Resume</a>.",
      "follow_ups": [
        "What aspects of Derek's work are you most interested in?",
        "Are you facing similar challenges in your organization?",
        "Would you like to know more about any specific part of Derek's background?"
      ],
      "connections": ["cw_standard", "media_franchise", "coaching_ai_ethics"],
      "examples": [
        "At Star Tribune Media, Derek pioneered the Media Franchise Model, generating $15M+ in new revenue through innovative content structures and sponsorship models.",
        "As Executive Director of New Products, Derek led the company's AI Task Force and implemented the SalesGPT solution with Krista.ai, reclaiming 2.5 work-years annually for the sales team."
      ],
      "depth": {
        "principles": "Derek's approach is built on three core principles: 1) Pattern recognition across seemingly unrelated domains, 2) Bridging human wisdom with technological advancement, and 3) Applying coaching philosophy to organizational leadership.",
        "implementation": "Derek's career spans media transformation, sports coaching, and technological implementation—finding the connections between these domains that create new possibilities for organizations navigating complex transitions."
      }
    },
    
    "manual_transmission": {
      "name": "Manual Transmission Principle",
      "triggers": ["manual", "stick", "clutch", "transmission", "driving", "driving stick"],
      "brief": "focusing on fundamental understanding rather than specific procedures",
      "response": "My father taught me to drive with a manual transmission, saying 'Learn this, and you can drive anything.' 🚗 That principle shaped my entire coaching philosophy. I focus on developing fundamental understanding rather than specific procedures. When implementing AI in organizations, this means building a foundation of digital fluency before introducing sophisticated tools. Just as a driver needs to feel the clutch engage, teams need to develop intuitive understanding of how technology and human judgment work together.",
      "follow_ups": [
        "What fundamental skills do you think are most important for people to develop in the AI era?",
        "Have you experienced this tension between fundamentals and procedures in your work?",
        "Would you like to explore how this principle might apply to a specific challenge you're facing?"
      ],
      "connections": ["coaching_ai_ethics", "cw_standard", "pattern_recognition"],
      "examples": [
        "When training basketball players, I focus much more on developing court awareness and decision-making skills than memorizing specific plays—creating adaptable players who can handle any situation.",
        "During AI implementation at Star Tribune, we prioritized developing a fundamental understanding of how AI systems make decisions before implementing any specific tool, enabling teams to adapt to changing technology rather than becoming dependent on specific interfaces."
      ],
      "depth": {
        "principles": "The Manual Transmission Principle has three key components: 1) Fundamentals enable adaptation, 2) Feel and feedback create intuitive understanding, and 3) Mastery of basics makes complexity manageable.",
        "implementation": "Implementation focuses on developing a deep understanding of core principles before introducing specific tools or techniques. Training emphasizes the 'why' behind procedures, building adaptable capability rather than rigid compliance."
      }
    },
    
    "build_vs_buy": {
      "name": "Build vs. Buy",
      "triggers": ["build buy", "build or buy", "build versus buy", "vendor", "custom solutions"],
      "brief": "balancing standardized solutions with custom approaches",
      "response": "The build-versus-buy tension in technology reminds me of coaching debates about system versus talent. The best approach is rarely all-or-nothing. 🔧 At Star Tribune, our most successful digital transformation came by observing workflows before touching a line of code. We discovered patterns no vendor anticipated - the worn paths invisible on architectural drawings. Just as basketball teams need both established systems and space for individual creativity, organizations need both stable vendor solutions and custom elements that reflect their unique ways of working.",
      "follow_ups": [
        "What's been your experience with balancing standardized solutions and custom approaches?",
        "Are you facing any build-versus-buy decisions in your organization right now?",
        "Would you like to explore how this balance might apply to a specific challenge you're facing?"
      ],
      "connections": ["cw_standard", "sidewalks_movement", "pattern_recognition"],
      "examples": [
        "For our content management system, we chose a vendor platform but built custom extensions for our unique editorial workflow, creating a solution that balanced stability with specificity.",
        "A healthcare client was debating whether to build or buy a patient engagement system. We helped them identify their truly unique needs (about 20% of requirements) and find a vendor solution they could extend rather than building from scratch."
      ],
      "depth": {
        "principles": "The optimal build-versus-buy approach balances three factors: 1) Core versus context - building only what truly differentiates, 2) Integration over isolation - ensuring solutions connect seamlessly with existing systems, and 3) Evolution capacity - allowing for growth and adaptation over time.",
        "implementation": "Implementation begins with mapping the organization's unique value drivers and workflows, then identifying where standard solutions are sufficient and where custom development is truly necessary. The result is typically a hybrid approach that leverages vendor reliability while preserving organizational uniqueness."
      }
    },
    
    "default_response": {
      "response": "That's an interesting topic. I typically approach questions by looking for connections between coaching philosophy, media transformation, and technological implementation. Would you like to explore how this topic might connect to one of those domains? Or perhaps you'd like to hear about The CW Standard framework or the Media Franchise Model?"
    }
  }
};

// -------------- ENHANCED CHAT FUNCTIONALITY --------------

// Initialize the chat when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing enhanced chat");
    
    // Get DOM elements with better error checking
    const messageContainer = document.getElementById('message-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const suggestionButtons = document.querySelectorAll('.suggestion-button');
    
    // Debug info
    console.log("Elements found:", {
        messageContainer: !!messageContainer,
        userInput: !!userInput,
        sendButton: !!sendButton,
        suggestionButtons: suggestionButtons.length
    });
    
    // Add welcome message if container exists
    if (messageContainer) {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.classList.add('message', 'claude-message');
        welcomeMessage.innerHTML = "Hello! 👋 I'm Claude Will, a conversational interface inspired by Derek's grandfather, Claude William Simmons. I'm here to help you explore connections between coaching philosophy, media transformation, and technological implementation. What would you like to discuss?";
        messageContainer.appendChild(welcomeMessage);
    }
    
    // Define the handleUserInput function
    function handleUserInput() {
        console.log("handleUserInput called");
        
        if (!userInput || !messageContainer) {
            console.error("Required elements not found");
            return;
        }
        
        const text = userInput.value.trim();
        if (!text) {
            console.log("Empty input, ignoring");
            return;
        }
        
        console.log("Processing input:", text);
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.classList.add('message', 'user-message');
        userMessage.textContent = text;
        messageContainer.appendChild(userMessage);
        
        // Clear input
        userInput.value = '';
        
        // Update conversation context with user message
        updateUserContext(text);
        
        // Show thinking indicator
        const thinkingMessage = document.createElement('div');
        thinkingMessage.classList.add('message', 'claude-message', 'thinking', 'thinking-message');
        thinkingMessage.textContent = 'Thinking...';
        messageContainer.appendChild(thinkingMessage);
        
        // Scroll to bottom
        messageContainer.scrollTop = messageContainer.scrollHeight;
        
        // Process after delay to simulate thinking
        setTimeout(function() {
            try {
                // Remove thinking message
                messageContainer.removeChild(thinkingMessage);
                
                // Add Claude's response
                const responseMessage = document.createElement('div');
                responseMessage.classList.add('message', 'claude-message');
                responseMessage.innerHTML = getEnhancedResponse(text);
                messageContainer.appendChild(responseMessage);
                
                // Scroll to bottom again
                messageContainer.scrollTop = messageContainer.scrollHeight;
            } catch (error) {
                console.error("Error generating response:", error);
                // Fallback error message
                const errorMessage = document.createElement('div');
                errorMessage.classList.add('message', 'claude-message');
                errorMessage.textContent = "I'm sorry, I encountered an error processing your request.";
                messageContainer.appendChild(errorMessage);
            }
        }, 1000);
    }
    
    // Add event listeners with error handling
    if (sendButton) {
        sendButton.addEventListener('click', handleUserInput);
        console.log("Added send button click listener");
    }
    
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleUserInput();
            }
        });
        console.log("Added input keypress listener");
    }
    
    // Add suggestion button listeners with error handling
    if (suggestionButtons.length > 0) {
        suggestionButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                if (userInput) {
                    userInput.value = button.getAttribute('data-query') || '';
                    handleUserInput();
                }
            });
        });
        console.log("Added suggestion button listeners");
    }
    
    console.log("Enhanced chat script initialization complete");
});

// Update the user context based on their message
function updateUserContext(text) {
    conversationContext.messageCount++;
    
    // Detect potential domain interests
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("basketball") || lowerText.includes("coach") || 
        lowerText.includes("team") || lowerText.includes("sports")) {
        if (!conversationContext.userInterests.includes("coaching")) {
            conversationContext.userInterests.push("coaching");
        }
    }
    
    if (lowerText.includes("ai") || lowerText.includes("technology") || 
        lowerText.includes("implementation") || lowerText.includes("code")) {
        if (!conversationContext.userInterests.includes("technology")) {
            conversationContext.userInterests.push("technology");
        }
    }
    
    if (lowerText.includes("media") || lowerText.includes("content") || 
        lowerText.includes("digital") || lowerText.includes("journalism")) {
        if (!conversationContext.userInterests.includes("media")) {
            conversationContext.userInterests.push("media");
        }
    }
    
    console.log("Updated user context:", conversationContext);
}

// Generate an enhanced response based on the input and context
function getEnhancedResponse(text) {
    console.log("Getting enhanced response for:", text);
    
    // Convert to lowercase for easier matching
    const lowerText = text.toLowerCase();
    
    // Check for casual greetings first
    if (lowerText.match(/^(hi|hello|hey|greetings|howdy|good morning|good afternoon|good evening)(\s|$)/) || 
        lowerText.includes("how are you") || 
        lowerText.includes("what's up") || 
        lowerText.includes("how's it going")) {
        
        return "Hello! 👋 I'm doing well, thanks for asking. I'm Claude Will, a conversational interface inspired by Derek's grandfather, Claude William Simmons. I'm here to help you explore connections between coaching philosophy, media transformation, and technological implementation. Is there a particular topic you're interested in discussing today?";
    }
    
    // Try to find matching topic with more sophisticated matching
    let matchedTopic = findBestMatchingTopic(lowerText);
    
    if (matchedTopic) {
        // Get the response from our data
        const response = buildContextualResponse(matchedTopic, text);
        
        // Update conversation context
        updateConversationContext(matchedTopic);
        
        return response;
    }
    
    // If no match found, return default response with a touch of personalization
    let defaultResponse = responsesData.topics.default_response.response;
    
    // If we know user interests, suggest relevant topics
    if (conversationContext.userInterests.length > 0) {
        const interest = conversationContext.userInterests[0];
        if (interest === "coaching") {
            defaultResponse += " You might be interested in how coaching philosophy connects to technological implementation or the Baton Handoff Framework.";
        } else if (interest === "technology") {
            defaultResponse += " You might be interested in The CW Standard or how we approach the build-versus-buy decision in technology.";
        } else if (interest === "media") {
            defaultResponse += " You might be interested in the Media Franchise Model or how we applied pattern recognition in media transformation.";
        }
    }
    
    return defaultResponse;
}

// Find the best matching topic based on trigger phrases
function findBestMatchingTopic(text) {
    let bestMatch = null;
    let bestScore = 0;
    
    // Check each topic for matching triggers with a scoring system
    for (const [topicKey, topicData] of Object.entries(responsesData.topics)) {
        if (topicData.triggers) {
            let score = 0;
            
            // Score exact matches higher than partial matches
            topicData.triggers.forEach(trigger => {
                if (text === trigger) {
                    score += 10; // Exact match
                } else if (text.includes(trigger)) {
                    score += 5;  // Partial match
                } else if (trigger.includes(text) && text.length > 3) {
                    score += 2;  // Text is part of trigger (if text is long enough)
                }
            });
            
            // Boost score if this topic aligns with user interests
            if (topicData.name && conversationContext.userInterests.some(interest => 
                topicData.name.toLowerCase().includes(interest))) {
                score += 3;
            }
            
            // Lower score slightly if we've recently discussed this topic
            if (conversationContext.topicsDiscussed.includes(topicKey)) {
                score -= 1;
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = topicKey;
            }
        }
    }
    
    // Only return a match if score is above a minimum threshold
    return bestScore >= 2 ? bestMatch : null;
}

// Build a contextualized response based on the matched topic and conversation context
function buildContextualResponse(topicKey, originalText) {
    const topic = responsesData.topics[topicKey];
    let response = topic.response;
    
    // If we've discussed this topic before, acknowledge that
    if (conversationContext.topicsDiscussed.includes(topicKey)) {
        const returningPhrases = [
            `Coming back to ${topic.name}, `,
            `Revisiting ${topic.name}, `,
            `As we were discussing about ${topic.name}, `
        ];
        const phrase = returningPhrases[Math.floor(Math.random() * returningPhrases.length)];
        response = phrase + response.charAt(0).toLowerCase() + response.slice(1);
    }
    
    // If we're discussing a new topic that connects to the previous one, mention the connection
    if (conversationContext.lastTopic && 
        topic.connections && 
        topic.connections.includes(conversationContext.lastTopic)) {
        
        const previousTopic = responsesData.topics[conversationContext.lastTopic];
        const connectionPhrases = [
            `This connects directly to our discussion about ${previousTopic.name}. `,
            `Building on what we were discussing about ${previousTopic.name}, `,
            `This relates to ${previousTopic.name} in an interesting way. `
        ];
        const phrase = connectionPhrases[Math.floor(Math.random() * connectionPhrases.length)];
        response = phrase + response;
    }
    
    // Add a follow-up question if available
    if (topic.follow_ups && topic.follow_ups.length > 0) {
        const randomIndex = Math.floor(Math.random() * topic.follow_ups.length);
        response += "\n\n" + topic.follow_ups[randomIndex];
    }
    
    // Occasionally add an example if we haven't already discussed this topic
    if (topic.examples && 
        topic.examples.length > 0 && 
        !conversationContext.topicsDiscussed.includes(topicKey) && 
        Math.random() > 0.5) {
        
        const randomExample = topic.examples[Math.floor(Math.random() * topic.examples.length)];
        response += "\n\nFor example: " + randomExample;
    }
    
    // Add a connection to another topic if appropriate and if we haven't mentioned it yet
    if (topic.connections && 
        topic.connections.length > 0 && 
        conversationContext.messageCount > 1 &&
        Math.random() > 0.7) {
        
        // Filter connections we haven't visited yet
        const availableConnections = topic.connections.filter(
            conn => !conversationContext.visitedConnections[topicKey + '-' + conn]
        );
        
        if (availableConnections.length > 0) {
            const randomConnection = availableConnections[Math.floor(Math.random() * availableConnections.length)];
            const connectedTopic = responsesData.topics[randomConnection];
            
            response += `\n\nThis also connects with ${connectedTopic.name}, which is ${connectedTopic.brief}.`;
            
            // Mark this connection as visited
            conversationContext.visitedConnections[topicKey + '-' + randomConnection] = true;
        }
    }
    
    // Add deeper information if the user seems especially interested in this topic
    // This would be detected by specific phrases like "tell me more" or multiple questions on the same topic
    if (topic.depth && 
        (originalText.toLowerCase().includes("more") || 
         originalText.toLowerCase().includes("details") ||
         originalText.toLowerCase().includes("explain") ||
         conversationContext.topicsDiscussed.filter(t => t === topicKey).length >= 1)) {
        
        // Add either principles or implementation details
        const depthKey = Math.random() > 0.5 ? 'principles' : 'implementation';
        if (topic.depth[depthKey]) {
            response += "\n\n" + topic.depth[depthKey];
        }
    }
    
    return response;
}

// Update conversation context after responding
function updateConversationContext(topicKey) {
    // Add to topics discussed
    conversationContext.topicsDiscussed.push(topicKey);
    
    // Update last topic
    conversationContext.lastTopic = topicKey;
    
    console.log("Updated conversation context:", conversationContext);
}
