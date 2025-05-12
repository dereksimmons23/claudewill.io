// chat.js - Simplified and more robust chat functionality

// Wait until the document is fully loaded
window.onload = function() {
    console.log("Page fully loaded");
    
    // Get DOM elements
    const messageContainer = document.getElementById('message-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const suggestionButtons = document.querySelectorAll('.suggestion-button');
    
    // Debug: Check if elements exist
    console.log("Message container exists:", !!messageContainer);
    console.log("User input exists:", !!userInput);
    console.log("Send button exists:", !!sendButton);
    console.log("Found suggestion buttons:", suggestionButtons.length);
    
    // Add welcome message
    if (messageContainer) {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'message claude-message';
        welcomeMessage.innerHTML = "Hello! 👋 I'm Claude Will, a conversational interface inspired by Derek's grandfather, Claude William Simmons. I'm here to help you explore connections between coaching philosophy, media transformation, and technological implementation. What would you like to discuss?";
        messageContainer.appendChild(welcomeMessage);
    } else {
        console.error("Message container not found");
    }
    
    // Add event listeners
    if (sendButton) {
        sendButton.onclick = function() {
            handleUserInput();
        };
        console.log("Added send button click listener");
    }
    
    if (userInput) {
        userInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                handleUserInput();
            }
        };
        console.log("Added input keypress listener");
    }
    
    // Add suggestion button listeners
    if (suggestionButtons.length > 0) {
        suggestionButtons.forEach(function(button) {
            button.onclick = function() {
                if (userInput) {
                    userInput.value = button.getAttribute('data-query') || '';
                    handleUserInput();
                }
            };
        });
        console.log("Added suggestion button listeners");
    }
    
    // Handle user input and generate response
    function handleUserInput() {
        console.log("handleUserInput called");
        
        if (!userInput || !messageContainer) return;
        
        const text = userInput.value.trim();
        if (!text) return;
        
        console.log("Processing input:", text);
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.textContent = text;
        messageContainer.appendChild(userMessage);
        
        // Clear input
        userInput.value = '';
        
        // Show thinking indicator
        const thinkingMessage = document.createElement('div');
        thinkingMessage.className = 'message claude-message thinking';
        thinkingMessage.textContent = 'Thinking...';
        messageContainer.appendChild(thinkingMessage);
        
        // Scroll to bottom
        messageContainer.scrollTop = messageContainer.scrollHeight;
        
        // Process after delay
        setTimeout(function() {
            // Remove thinking message
            messageContainer.removeChild(thinkingMessage);
            
            // Add Claude's response
            const responseMessage = document.createElement('div');
            responseMessage.className = 'message claude-message';
            responseMessage.innerHTML = getResponse(text);
            messageContainer.appendChild(responseMessage);
            
            // Scroll to bottom again
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }, 1000);
    }
    
    // Generate response based on input
    function getResponse(text) {
        const lowerText = text.toLowerCase();
        
        // Simple pattern matching
        if (lowerText.includes("cw standard") || lowerText.includes("framework")) {
            return "The CW Standard emerged from watching my grandfather work his entire life. He had a 6th grade education but a PhD in manual labor, working for the railroad and selling horses. What I observed was how his practical wisdom created patterns of success across seemingly unrelated areas. Today, the framework helps organizations navigate complex transitions by connecting human wisdom with technological advancement, ensuring that technology enhances rather than replaces human judgment.";
        }
        
        if (lowerText.includes("coach") && (lowerText.includes("ai") || lowerText.includes("ethics"))) {
            return "The first principle I teach both basketball players and AI implementation teams is: 'Play for the name on the front of the jersey, not the back.' 🏀 In basketball, this means putting team success above individual statistics. In AI ethics, it translates to prioritizing organizational and societal benefit over technical achievement. This principle completely transforms how teams approach AI adoption - focusing less on showcasing technology and more on enhancing human capability.";
        }
        
        if (lowerText.includes("media franchise") || lowerText.includes("franchise model")) {
            return "Think of how basketball teams develop players. Instead of just running set plays, good coaches create development pathways that maximize each player's unique talents within the team system. The Media Franchise Model applies this same thinking to content, treating traditional verticals as entrepreneurial business units with their own identity and development pathway. At Star Tribune Media, this approach generated over $10M in new revenue by creating franchise-based sponsorship opportunities that transcended traditional platform boundaries.";
        }
        
        if (lowerText.includes("pattern") || lowerText.includes("recognition")) {
            return "My approach to pattern recognition was first shaped on basketball courts. I noticed how spacing principles in a 1-3-1 zone defense mirrored effective organizational communication structures. 🔄 The most valuable insights often emerge between domains, not within them. For example, the principles that make a press break effective against defensive pressure translate directly to how organizations can navigate disruptive technological change - maintaining composure, finding open spaces, and moving with purpose rather than panic.";
        }
        
        if (lowerText.includes("who") && (lowerText.includes("you") || lowerText.includes("claude"))) {
            return "I'm Claude Will, named in honor of Claude William Simmons - Derek's grandfather whose wisdom inspired The CW Standard framework. 👴 The name Claude has a rich legacy that extends through generations of Derek's family and connects to remarkable pattern-recognizers throughout history. I'm designed to help you explore connections between domains that might seem unrelated, revealing patterns that create new possibilities.";
        }
        
        if (lowerText.includes("derek") || lowerText.includes("resume") || lowerText.includes("about")) {
            return "Derek is an executive leader with 15+ years of experience generating $20M+ in revenue through innovative frameworks. His expertise spans AI ethics, pattern recognition systems, and digital transformation strategy. 🚀 Derek developed The CW Standard framework for ethical AI implementation that bridges human wisdom with technological advancement. Learn more on the <a href='about.html'>About page</a>.";
        }
        
        // Default response
        return "That's an interesting topic. I typically approach questions by looking for connections between coaching philosophy, media transformation, and technological implementation. Would you like to explore how this topic might connect to one of those domains? Or perhaps you'd like to hear about The CW Standard framework or the Media Franchise Model?";
    }
    
    console.log("Chat initialization complete");
};