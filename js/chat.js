// chat.js - Claude Will conversational interface functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log("Chat script loaded");
    
    // Get DOM elements
    const messageContainer = document.getElementById('message-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const suggestionButtons = document.querySelectorAll('.suggestion-button');
    
    // Make sure elements exist before proceeding
    if (!messageContainer || !userInput || !sendButton) {
        console.error("Required DOM elements are missing");
        return;
    }
    
    console.log("Chat elements found");
    
    // Add welcome message immediately
    addMessage("Hello! 👋 I'm Claude Will, a conversational interface inspired by Derek's grandfather, Claude William Simmons. I'm here to help you explore connections between coaching philosophy, media transformation, and technological implementation. What would you like to discuss?", 'claude');
    
    // Responses data
    const responsesData = {
        "topics": {
            "cw_standard": {
                "triggers": ["cw standard", "framework", "the cw standard"],
                "response": "The CW Standard emerged from watching my grandfather work his entire life. He had a 6th grade education but a PhD in manual labor, working for the railroad and selling horses. What I observed was how his practical wisdom created patterns of success across seemingly unrelated areas. Today, the framework helps organizations navigate complex transitions by connecting human wisdom with technological advancement, ensuring that technology enhances rather than replaces human judgment. What aspects of bridging human wisdom and technology are you most interested in exploring?"
            },
            "coaching_ai_ethics": {
                "triggers": ["coaching ai", "basketball ai", "sports ethics", "ai ethics", "coaching ethics"],
                "response": "The first principle I teach both basketball players and AI implementation teams is: 'Play for the name on the front of the jersey, not the back.' 🏀 In basketball, this means putting team success above individual statistics. In AI ethics, it translates to prioritizing organizational and societal benefit over technical achievement. This principle completely transforms how teams approach AI adoption - focusing less on showcasing technology and more on enhancing human capability. Have you seen examples where technology seemed more focused on showcasing itself than solving real human problems?"
            },
            "media_franchise": {
                "triggers": ["media franchise", "franchise model"],
                "response": "Think of how basketball teams develop players. Instead of just running set plays, good coaches create development pathways that maximize each player's unique talents within the team system. The Media Franchise Model applies this same thinking to content, treating traditional verticals as entrepreneurial business units with their own identity and development pathway. At Star Tribune Media, this approach generated over $10M in new revenue by creating franchise-based sponsorship opportunities that transcended traditional platform boundaries. What content areas do you see having the most potential for this kind of entrepreneurial approach?"
            },
            "pattern_recognition": {
                "triggers": ["pattern", "recognition", "cross-domain", "cross domain"],
                "response": "My approach to pattern recognition was first shaped on basketball courts. I noticed how spacing principles in a 1-3-1 zone defense mirrored effective organizational communication structures. 🔄 The most valuable insights often emerge between domains, not within them. For example, the principles that make a press break effective against defensive pressure translate directly to how organizations can navigate disruptive technological change - maintaining composure, finding open spaces, and moving with purpose rather than panic. What domains are you most interested in finding connections between?"
            },
            "manual_transmission": {
                "triggers": ["manual", "stick", "clutch", "transmission", "driving"],
                "response": "My father taught me to drive with a manual transmission, saying 'Learn this, and you can drive anything.' 🚗 That principle shaped my entire coaching philosophy. I focus on developing fundamental understanding rather than specific procedures. When implementing AI in organizations, this means building a foundation of digital fluency before introducing sophisticated tools. Just as a driver needs to feel the clutch engage, teams need to develop intuitive understanding of how technology and human judgment work together. What fundamental skills do you think are most important for people to develop in the AI era?"
            },
            "baton_handoff": {
                "triggers": ["baton", "handoff", "relay", "transition"],
                "response": "The baton handoff is perhaps the single best example of teamwork in sports. In a relay race, gold medals are won and lost in those critical seconds of transition. 🏁 I've developed a Baton Handoff Framework that applies this concept to organizational transitions, technological implementations, and communication systems. The key insight is that excellence in transitions—not just individual performance—determines ultimate success. This framework identifies five critical elements: the handoff zone, runner synchronization, the critical shake, the transfer method, and post-handoff acceleration. Which of these elements seems most relevant to challenges you're facing?"
            },
            "sidewalks_movement": {
                "triggers": ["sidewalk", "campus", "paths", "movement", "natural"],
                "response": "There's a story about a college that waited before placing sidewalks on their new campus. Instead, they observed where students naturally walked, then paved those paths. 🛣️ This principle - designing systems around actual behavior rather than theoretical ideals - transformed how I approach both coaching and technological implementation. The most effective media transformations start by mapping existing information flows rather than imposing new ones. The best AI implementations enhance natural human judgment rather than replacing it. Where have you seen systems that either work with or against natural human behavior?"
            },
            "build_vs_buy": {
                "triggers": ["build buy", "build or buy", "build versus buy", "vendor"],
                "response": "The build-versus-buy tension in technology reminds me of coaching debates about system versus talent. The best approach is rarely all-or-nothing. 🔧 At Star Tribune, our most successful digital transformation came by observing workflows before touching a line of code. We discovered patterns no vendor anticipated - the worn paths invisible on architectural drawings. Just as basketball teams need both established systems and space for individual creativity, organizations need both stable vendor solutions and custom elements that reflect their unique ways of working. What's been your experience with balancing standardized solutions and custom approaches?"
            },
            "about_claude_will": {
                "triggers": ["who is claude will", "about claude will", "who are you"],
                "response": "I'm Claude Will, named in honor of Claude William Simmons - Derek's grandfather whose wisdom inspired The CW Standard framework. 👴 The name Claude has a rich legacy that extends through generations of Derek's family and connects to remarkable pattern-recognizers throughout history. I'm designed to help you explore connections between domains that might seem unrelated, revealing patterns that create new possibilities. What kinds of cross-domain connections are you most curious about exploring?"
            },
            "about_derek": {
                "triggers": ["about derek", "derek simmons", "resume", "background", "experience"],
                "response": "Derek is an executive leader with 15+ years of experience generating $20M+ in revenue through innovative frameworks. His expertise spans AI ethics, pattern recognition systems, and digital transformation strategy. 🚀 Derek developed The CW Standard framework for ethical AI implementation that bridges human wisdom with technological advancement. You can learn more about his background on the <a href='about.html'>About page</a> or view his <a href='resume.html'>Resume</a>. What aspects of Derek's work are you most interested in?"
            },
            "default_response": {
                "response": "That's an interesting topic. I typically approach questions by looking for connections between coaching philosophy, media transformation, and technological implementation. Would you like to explore how this topic might connect to one of those domains? Or perhaps you'd like to hear about The CW Standard framework or the Media Franchise Model?"
            }
        }
    };
    
    // Add event listeners
    sendButton.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleUserInput();
    });
    
    // Add event listeners for suggestion buttons
    suggestionButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const query = button.getAttribute('data-query');
            userInput.value = query;
            handleUserInput();
        });
    });
    
    function handleUserInput() {
        const text = userInput.value.trim();
        if (!text) return;
        
        console.log("Handling user input:", text);
        
        // Track the chat interaction with Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'chat_message_sent', {
                'message_length': text.length,
                'contains_question': text.includes('?')
            });
        }
        
        // Add user message
        addMessage(text, 'user');
        userInput.value = '';
        
        // Show thinking indicator
        const thinkingMsg = addMessage("Thinking...", 'claude thinking');
        
        // Process response (with delay to simulate thinking)
        setTimeout(function() {
            // Remove thinking indicator
            thinkingMsg.remove();
            
            // Add Claude's response
            const response = getResponse(text);
            addMessage(response, 'claude');
            
            // Track response with Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'chat_response_generated', {
                    'response_type': determineResponseType(text),
                    'contained_follow_up': response.includes('?')
                });
            }
        }, 1000);
    }
    
    function addMessage(text, sender) {
        console.log("Adding message:", text, sender);
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        // Support multiple classes in sender (split by space)
        sender.split(' ').forEach(cls => messageDiv.classList.add(`${cls}-message`));
        messageDiv.innerHTML = text; // Using innerHTML to allow links and emojis
        messageContainer.appendChild(messageDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
        return messageDiv;
    }
    
    function getResponse(text) {
        console.log("Getting response for:", text);
        
        // Convert to lowercase for easier matching
        const lowerText = text.toLowerCase();
        
        // Check for casual greetings first
        if (lowerText.match(/^(hi|hello|hey|greetings|howdy|good morning|good afternoon|good evening)(\s|$)/) || 
            lowerText.includes("how are you") || 
            lowerText.includes("what's up") || 
            lowerText.includes("how's it going")) {
            
            return "Hello! 👋 I'm doing well, thanks for asking. I'm Claude Will, a conversational interface inspired by Derek's grandfather, Claude William Simmons. I'm here to help you explore connections between coaching philosophy, media transformation, and technological implementation. Is there a particular topic you're interested in discussing today?";
        }
        
        // Check each topic for matching triggers
        for (const [topicKey, topicData] of Object.entries(responsesData.topics)) {
            if (topicData.triggers && topicData.triggers.some(trigger => lowerText.includes(trigger))) {
                return topicData.response;
            }
        }
        
        // If no match found, return default response
        return responsesData.topics.default_response.response;
    }
    
    function determineResponseType(text) {
        // Determine what type of query this was for analytics
        const lowerText = text.toLowerCase();
        
        if (lowerText.match(/^(hi|hello|hey|greetings|howdy|good morning|good afternoon|good evening)(\s|$)/) || 
            lowerText.includes("how are you") || 
            lowerText.includes("what's up") || 
            lowerText.includes("how's it going")) {
            return 'greeting';
        }
        
        for (const [topicKey, topicData] of Object.entries(responsesData.topics)) {
            if (topicData.triggers && topicData.triggers.some(trigger => lowerText.includes(trigger))) {
                return topicKey;
            }
        }
        
        return 'default';
    }
    
    console.log("Chat script initialization complete");
});