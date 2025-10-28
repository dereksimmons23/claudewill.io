// chat.js - Claude Will conversational interface functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing chat");
    
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
        welcomeMessage.innerHTML = "Hello! 👋 I'm Claude Will, a conversational interface inspired by Derek's grandfather, Claude William Simmons. I'm here to help you explore AI strategy, revenue generation frameworks, and executive leadership transformation. What would you like to discuss?";
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
        
        // Show thinking indicator
        const thinkingMessage = document.createElement('div');
        thinkingMessage.classList.add('message', 'claude-message', 'thinking', 'thinking-message');
        thinkingMessage.textContent = 'Thinking...';
        messageContainer.appendChild(thinkingMessage);
        
        // Scroll to bottom
        messageContainer.scrollTop = messageContainer.scrollHeight;
        
        // Process after delay
        setTimeout(function() {
            try {
                // Remove thinking message
                messageContainer.removeChild(thinkingMessage);
                
                // Add Claude's response
                const responseMessage = document.createElement('div');
                responseMessage.classList.add('message', 'claude-message');
                responseMessage.innerHTML = getResponse(text);
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
    
    // Responses data
    const responsesData = {
        "topics": {
            "ai_strategy": {
                "triggers": ["ai strategy", "ai consulting", "ai implementation"],
                "response": "AI Strategy Consulting focuses on helping organizations implement AI in ways that drive measurable business outcomes while maintaining human agency. The key is to start with clear business objectives rather than technical capabilities. What specific business challenges are you looking to address with AI?"
            },
            "revenue_frameworks": {
                "triggers": ["revenue generation", "revenue framework", "business growth"],
                "response": "Revenue Generation Frameworks help organizations identify and capitalize on new opportunities through systematic pattern recognition and strategic implementation. These frameworks have generated $20M+ in new revenue across multiple industries. What areas of your business are you looking to grow?"
            },
            "leadership_transformation": {
                "triggers": ["executive leadership", "leadership transformation", "organizational change"],
                "response": "Executive Leadership Transformation focuses on developing leadership teams that can navigate technological change while maintaining organizational resilience. The approach combines proven coaching principles with modern business strategy. What leadership challenges are you currently facing?"
            },
            "strategic_frameworks": {
                "triggers": ["strategic framework", "framework development", "business strategy"],
                "response": "Strategic Framework Development creates systematic approaches to complex business challenges, ensuring alignment between technology, people, and process. These frameworks have been successfully implemented across multiple industries. What strategic challenges are you looking to address?"
            },
            "enterprise_ai": {
                "triggers": ["enterprise ai", "ai implementation", "ai adoption"],
                "response": "Enterprise AI Implementation requires careful consideration of both technical and human factors. The key is to ensure technology enhances rather than replaces human capability. What aspects of AI implementation are you most concerned about?"
            },
            "default_response": {
                "response": "I can help you explore AI strategy, revenue generation frameworks, executive leadership transformation, strategic framework development, or enterprise AI implementation. Which area would you like to discuss?"
            }
        }
    };
    
    function getResponse(text) {
        console.log("Getting response for:", text);
        
        // Convert to lowercase for easier matching
        const lowerText = text.toLowerCase();
        
        // Check for casual greetings first
        if (lowerText.match(/^(hi|hello|hey|greetings|howdy|good morning|good afternoon|good evening)(\s|$)/) || 
            lowerText.includes("how are you") || 
            lowerText.includes("what's up") || 
            lowerText.includes("how's it going")) {
            
            return "Hello! 👋 I'm doing well, thanks for asking. I'm Claude Will, a conversational interface inspired by Derek's grandfather, Claude William Simmons. I'm here to help you explore AI strategy, revenue generation frameworks, and executive leadership transformation. Is there a particular topic you're interested in discussing today?";
        }
        
        // Check each topic for matching triggers
        for (const topicData of Object.values(responsesData.topics)) {
            if (topicData.triggers && topicData.triggers.some(trigger => lowerText.includes(trigger))) {
                return topicData.response;
            }
        }
        
        // If no match found, return default response
        return responsesData.topics.default_response.response;
    }
    
    console.log("Chat script initialization complete");
});